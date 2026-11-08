import { Hono } from 'hono';
import { z } from 'zod';
import { FrappeClient, FrappeError, FrappeUnavailable } from './frappe.js';

/** Public patient contract — the only shape the frontend ever sees. */
export interface PatientSummary {
  uhid: string;
  name: string;
  sex: 'M' | 'F' | 'O' | null;
  dob: string | null;
  age: number | null;
  mobile: string | null;
  email: string | null;
  bloodGroup: string | null;
  status: string | null;
}

const PATIENT_FIELDS = ['name', 'patient_name', 'first_name', 'last_name', 'sex', 'dob', 'mobile', 'email', 'blood_group', 'status', 'uid'];

const sexFromFrappe = (s: unknown): PatientSummary['sex'] => (s === 'Male' ? 'M' : s === 'Female' ? 'F' : s ? 'O' : null);
const sexToFrappe = (s: 'M' | 'F' | 'O') => (s === 'M' ? 'Male' : s === 'F' ? 'Female' : 'Other');

function ageFromDob(dob: string | null): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age >= 0 && age < 130 ? age : null;
}

function toSummary(doc: Record<string, any>): PatientSummary {
  return {
    uhid: doc.name,
    name: doc.patient_name ?? [doc.first_name, doc.last_name].filter(Boolean).join(' '),
    sex: sexFromFrappe(doc.sex),
    dob: doc.dob ?? null,
    age: ageFromDob(doc.dob ?? null),
    mobile: doc.mobile ?? null,
    email: doc.email ?? null,
    bloodGroup: doc.blood_group ?? null,
    status: doc.status ?? null,
  };
}

const createSchema = z.object({
  name: z.string().trim().min(2).max(140),
  sex: z.enum(['M', 'F', 'O']),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  age: z.number().int().min(0).max(130).optional(),
  mobile: z.string().trim().min(7).max(20),
  email: z.string().email().optional(),
  bloodGroup: z.string().max(10).optional(),
}).refine((v) => v.dob || v.age !== undefined, { message: 'Either dob or age is required' });

export function patientsRoutes(frappe: FrappeClient) {
  const app = new Hono();

  /** GET /search?q=...&limit=... — duplicate-safe lookup by name / UHID / mobile. */
  app.get('/search', async (c) => {
    const q = (c.req.query('q') ?? '').trim();
    const limit = Math.min(Number(c.req.query('limit') ?? 20) || 20, 50);
    const like = `%${q}%`;
    const docs = q
      ? await frappe.listDocs('Patient', {
          fields: PATIENT_FIELDS,
          orFilters: [
            ['Patient', 'patient_name', 'like', like],
            ['Patient', 'name', 'like', like],
            ['Patient', 'mobile', 'like', like],
            ['Patient', 'uid', 'like', like],
          ],
          limit,
          orderBy: 'modified desc',
        })
      : await frappe.listDocs('Patient', { fields: PATIENT_FIELDS, limit, orderBy: 'modified desc' });
    return c.json({ data: docs.map(toSummary) });
  });

  /** GET /:uhid — single patient. */
  app.get('/:uhid', async (c) => {
    const doc = await frappe.getDoc('Patient', c.req.param('uhid'));
    return c.json({ data: toSummary(doc) });
  });

  /** POST / — register a new patient; mobile-based duplicate check first. */
  app.post('/', async (c) => {
    const parsed = createSchema.safeParse(await c.req.json().catch(() => undefined));
    if (!parsed.success) {
      return c.json({ error: { code: 'VALIDATION', message: parsed.error.issues[0]?.message ?? 'Invalid payload' } }, 422);
    }
    const input = parsed.data;

    // Duplicate check on mobile (exact match) — mobile is the strongest dedupe signal we collect.
    const dupes = await frappe.listDocs('Patient', {
      fields: PATIENT_FIELDS,
      filters: [['Patient', 'mobile', '=', input.mobile]],
      limit: 1,
    });
    if (dupes.length > 0) {
      return c.json(
        { error: { code: 'DUPLICATE', message: `A patient with this mobile already exists (${dupes[0].name})`, uhid: dupes[0].name } },
        409,
      );
    }

    const [first, ...rest] = input.name.split(/\s+/);
    const doc: Record<string, unknown> = {
      first_name: first,
      sex: sexToFrappe(input.sex),
      mobile: input.mobile,
    };
    if (rest.length) doc.last_name = rest.join(' ');
    if (input.dob) doc.dob = input.dob;
    if (input.email) doc.email = input.email;
    if (input.bloodGroup) doc.blood_group = input.bloodGroup;

    const created = await frappe.createDoc('Patient', doc);
    return c.json({ data: toSummary(created) }, 201);
  });

  return app;
}

/** Normalize upstream errors into the public error contract. */
export function onRouteError(err: unknown, c: import('hono').Context) {
  if (err instanceof FrappeUnavailable) {
    return c.json({ error: { code: 'BACKEND_DOWN', message: err.message } }, 502);
  }
  if (err instanceof FrappeError) {
    const status = err.status === 403 || err.status === 401 ? 502 : err.status;
    const code = err.status === 403 || err.status === 401 ? 'FRAPPE_AUTH' : err.status === 404 ? 'NOT_FOUND' : 'FRAPPE_ERROR';
    return c.json({ error: { code, message: err.message } }, status as 400);
  }
  return c.json({ error: { code: 'INTERNAL', message: 'Unexpected BFF error' } }, 500);
}
