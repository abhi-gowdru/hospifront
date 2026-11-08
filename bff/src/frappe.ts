import type { Config } from './config.js';

/**
 * Minimal client for the documented Frappe REST API.
 * Only stable endpoints are used:
 *   GET  /api/resource/{doctype}            (list with fields/filters)
 *   GET  /api/resource/{doctype}/{name}     (single document)
 *   POST /api/resource/{doctype}            (create document)
 * Auth: `Authorization: token <api_key>:<api_secret>`.
 */
export class FrappeError extends Error {
  constructor(
    public status: number,
    message: string,
    public frappeMessages?: string[],
  ) {
    super(message);
    this.name = 'FrappeError';
  }
}

export class FrappeUnavailable extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FrappeUnavailable';
  }
}

export class FrappeClient {
  constructor(private config: Config) {}

  private url(path: string, params?: Record<string, string>): string {
    const u = new URL(`${this.config.frappeBaseUrl}${path}`);
    if (params) for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
    return u.toString();
  }

  async request<T>(method: 'GET' | 'POST', path: string, opts: { params?: Record<string, string>; body?: unknown } = {}): Promise<T> {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), this.config.upstreamTimeoutMs);
    try {
      const res = await fetch(this.url(path, opts.params), {
        method,
        signal: ctrl.signal,
        headers: {
          Authorization: `token ${this.config.frappeApiKey}:${this.config.frappeApiSecret}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      });
      const text = await res.text();
      let json: any = undefined;
      try {
        json = text ? JSON.parse(text) : undefined;
      } catch {
        /* non-JSON error page */
      }
      if (!res.ok) {
        const messages = extractFrappeMessages(json);
        throw new FrappeError(res.status, messages[0] ?? `Frappe returned ${res.status}`, messages);
      }
      return json as T;
    } catch (err) {
      if (err instanceof FrappeError) throw err;
      if (err instanceof Error && err.name === 'AbortError') {
        throw new FrappeUnavailable(`Frappe did not respond within ${this.config.upstreamTimeoutMs}ms`);
      }
      throw new FrappeUnavailable(`Cannot reach Frappe at ${this.config.frappeBaseUrl}: ${(err as Error).message}`);
    } finally {
      clearTimeout(timer);
    }
  }

  listDocs<T = Record<string, unknown>>(doctype: string, args: { fields: string[]; filters?: unknown[][]; orFilters?: unknown[][]; limit?: number; orderBy?: string }): Promise<T[]> {
    const params: Record<string, string> = {
      fields: JSON.stringify(args.fields),
      limit_page_length: String(args.limit ?? 20),
    };
    if (args.filters) params.filters = JSON.stringify(args.filters);
    if (args.orFilters) params.or_filters = JSON.stringify(args.orFilters);
    if (args.orderBy) params.order_by = args.orderBy;
    return this.request<{ data: T[] }>('GET', `/api/resource/${encodeURIComponent(doctype)}`, { params }).then((r) => r.data);
  }

  getDoc<T = Record<string, unknown>>(doctype: string, name: string): Promise<T> {
    return this.request<{ data: T }>('GET', `/api/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`).then((r) => r.data);
  }

  createDoc<T = Record<string, unknown>>(doctype: string, doc: Record<string, unknown>): Promise<T> {
    return this.request<{ data: T }>('POST', `/api/resource/${encodeURIComponent(doctype)}`, { body: doc }).then((r) => r.data);
  }

  /** Cheap liveness probe: fetch one Patient name (any). */
  async ping(): Promise<void> {
    await this.listDocs('Patient', { fields: ['name'], limit: 1 });
  }
}

/** Frappe embeds validation messages as a JSON string array in _server_messages. */
function extractFrappeMessages(json: any): string[] {
  const out: string[] = [];
  if (json?._server_messages) {
    try {
      const msgs = JSON.parse(json._server_messages) as string[];
      for (const m of msgs) {
        try {
          const parsed = JSON.parse(m);
          if (parsed?.message) out.push(stripHtml(parsed.message));
        } catch {
          out.push(stripHtml(m));
        }
      }
    } catch {
      /* ignore */
    }
  }
  if (json?.exception) out.push(String(json.exception).split(':').slice(-1)[0].trim());
  return out.filter(Boolean);
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, '').trim();
}
