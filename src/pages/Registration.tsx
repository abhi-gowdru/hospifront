import { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, CloudOff, Link2, Search, UserPlus, Wifi } from 'lucide-react';
import { patients as mockPatients } from '@/data/mock';
import { StatusPill } from '@/components/StatusPill';
import { toast } from 'sonner';
import { useBackend } from '@/hooks/useBackend';
import { ApiError, createPatient, searchPatients, type PatientSummary } from '@/lib/api';

export default function Registration({ onOpenPatient }: { onOpenPatient: (uhid: string) => void }) {
  const backend = useBackend();
  const live = backend === 'live';

  const [q, setQ] = useState('');
  const [form, setForm] = useState({ name: '', dob: '', age: '', sex: 'M', mobile: '', email: '', bloodGroup: '' });
  const [abhaState, setAbhaState] = useState<'idle' | 'checking' | 'verified'>('idle');
  const [submitting, setSubmitting] = useState(false);
  const [liveRows, setLiveRows] = useState<PatientSummary[] | null>(null);
  const [searching, setSearching] = useState(false);

  // Live lookup (debounced) — only when the BFF reports Frappe is up.
  useEffect(() => {
    if (!live) return;
    setSearching(true);
    const t = setTimeout(() => {
      searchPatients(q)
        .then(setLiveRows)
        .catch(() => setLiveRows([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(t);
  }, [q, live]);

  const mockRows = useMemo(
    () => (q ? mockPatients.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.uhid.includes(q)) : mockPatients),
    [q],
  );

  const verifyAbha = () => {
    setAbhaState('checking');
    setTimeout(() => {
      setAbhaState('verified');
      toast.success('ABHA verified (sandbox)', { description: 'Demographics matched via ABDM sandbox OTP flow.' });
    }, 1200);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.mobile.trim()) {
      toast.warning('Name and mobile are required.');
      return;
    }
    if (!form.dob && !form.age) {
      toast.warning('Enter the date of birth or age.');
      return;
    }

    if (!live) {
      toast.success('Patient registered (demo data)', {
        description: `UHID 2000856 issued for ${form.name}. Connect the BFF to write to Frappe Health.`,
      });
      setForm({ name: '', dob: '', age: '', sex: 'M', mobile: '', email: '', bloodGroup: '' });
      setAbhaState('idle');
      return;
    }

    setSubmitting(true);
    try {
      const created = await createPatient({
        name: form.name.trim(),
        sex: form.sex as 'M' | 'F' | 'O',
        mobile: form.mobile.trim(),
        ...(form.dob ? { dob: form.dob } : { age: Number(form.age) }),
        ...(form.email ? { email: form.email } : {}),
        ...(form.bloodGroup ? { bloodGroup: form.bloodGroup } : {}),
      });
      toast.success('Patient registered in Frappe Health', {
        description: `UHID ${created.uhid} issued for ${created.name}.`,
      });
      setForm({ name: '', dob: '', age: '', sex: 'M', mobile: '', email: '', bloodGroup: '' });
      setAbhaState('idle');
      searchPatients(q).then(setLiveRows).catch(() => {});
    } catch (err) {
      if (err instanceof ApiError && err.code === 'DUPLICATE') {
        toast.warning('Possible duplicate', { description: err.message });
      } else {
        toast.error('Registration failed', { description: err instanceof Error ? err.message : 'Unknown error' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const field = (label: string, node: React.ReactNode) => (
    <label className="block">
      <span className="text-[12px] font-semibold text-muted-foreground">{label}</span>
      <div className="mt-1">{node}</div>
    </label>
  );

  const input = 'focus-ring w-full rounded-xl border border-input px-3 py-2.5 text-[14px] placeholder:text-slate-400';

  return (
    <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-4 p-4 lg:grid-cols-5 lg:p-6">
      {/* Lookup */}
      <div className="card-surface h-fit lg:col-span-3">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-[16px] font-bold">Patient lookup</h2>
            <p className="text-xs text-muted-foreground">Search before registering — duplicate detection by name, mobile and ABHA.</p>
          </div>
          <BackendBadge live={live} checking={backend === 'checking'} />
        </div>
        <div className="p-5">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, UHID or mobile" className={`${input} pl-10`} aria-label="Search patients" />
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="th-cell">UHID</th>
                  <th className="th-cell">Patient</th>
                  <th className="th-cell">Mobile</th>
                  <th className="th-cell">Blood</th>
                  <th className="th-cell">Status</th>
                </tr>
              </thead>
              <tbody>
                {live
                  ? (liveRows ?? []).map((p) => (
                      <tr key={p.uhid} onClick={() => onOpenPatient(p.uhid)} className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-accent/40">
                        <td className="td-cell font-mono text-[12.5px] text-slate-500">{p.uhid}</td>
                        <td className="td-cell">
                          <span className="font-semibold">{p.name}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {p.age ?? '—'}
                            {p.sex ?? ''}
                          </span>
                        </td>
                        <td className="td-cell text-slate-600">{p.mobile ?? '—'}</td>
                        <td className="td-cell text-slate-600">{p.bloodGroup ?? '—'}</td>
                        <td className="td-cell"><StatusPill value={p.status ?? '—'} /></td>
                      </tr>
                    ))
                  : mockRows.map((p) => (
                      <tr key={p.uhid} onClick={() => onOpenPatient(p.uhid)} className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-accent/40">
                        <td className="td-cell font-mono text-[12.5px] text-slate-500">{p.uhid}</td>
                        <td className="td-cell">
                          <span className="font-semibold">{p.name}</span>
                          <span className="ml-2 text-xs text-muted-foreground">{p.age}{p.sex}</span>
                        </td>
                        <td className="td-cell text-slate-600">{p.mobile}</td>
                        <td className="td-cell text-slate-600">—</td>
                        <td className="td-cell"><StatusPill value={p.status} /></td>
                      </tr>
                    ))}
              </tbody>
            </table>
            {live && liveRows !== null && liveRows.length === 0 && !searching && (
              <p className="py-4 text-center text-[13px] text-muted-foreground">No patients found in Frappe Health{q ? ` for “${q}”` : ''}.</p>
            )}
            {live && searching && <p className="py-4 text-center text-[13px] text-muted-foreground">Searching…</p>}
          </div>
        </div>
      </div>

      {/* New registration */}
      <form onSubmit={submit} className="card-surface h-fit lg:col-span-2">
        <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
          <UserPlus className="h-4.5 w-4.5 text-primary" />
          <div>
            <h2 className="text-[16px] font-bold">New registration</h2>
            <p className="text-xs text-muted-foreground">UHID is issued automatically on save.</p>
          </div>
        </div>
        <div className="space-y-4 p-5">
          {field('Full name', <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Lakshmi Narayanan" className={input} />)}
          <div className="grid grid-cols-2 gap-3">
            {field('Date of birth', <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} className={input} />)}
            {field('…or age', <input value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="54" inputMode="numeric" className={input} />)}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field(
              'Sex',
              <select value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })} className={input}>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>,
            )}
            {field(
              'Blood group',
              <select value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} className={input}>
                <option value="">—</option>
                {['A Positive', 'A Negative', 'B Positive', 'B Negative', 'O Positive', 'O Negative', 'AB Positive', 'AB Negative'].map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>,
            )}
          </div>
          {field('Mobile', <input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="+91 …" inputMode="tel" className={input} />)}
          {field('Email (optional)', <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@example.com" className={input} />)}

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
            <p className="flex items-center gap-1.5 text-[12.5px] font-bold text-emerald-800">
              <Link2 className="h-3.5 w-3.5" /> ABHA linking (ABDM sandbox)
            </p>
            <div className="mt-2 flex gap-2">
              <input
                onChange={() => setAbhaState('idle')}
                placeholder="ABHA number or linked mobile"
                aria-label="ABHA number or linked mobile"
                className="focus-ring w-full rounded-xl border border-emerald-300/70 bg-card px-3 py-2 text-[13px]"
              />
              <button
                type="button"
                onClick={verifyAbha}
                disabled={abhaState === 'checking'}
                className="focus-ring shrink-0 rounded-xl bg-emerald-600 px-3.5 py-2 text-[12.5px] font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {abhaState === 'checking' ? 'Verifying…' : 'Verify'}
              </button>
            </div>
            {abhaState === 'verified' && (
              <p className="mt-2 flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700" role="status">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified · will link to the new UHID
              </p>
            )}
            <p className="mt-2 text-[11px] leading-snug text-emerald-700/80">Placeholder flow — ABDM adapter arrives in the integration phase; stable Marley has no ABHA fields yet.</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="focus-ring w-full rounded-xl bg-primary py-3 text-[14px] font-bold text-primary-foreground shadow-sm hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60"
          >
            {submitting ? 'Saving…' : live ? 'Register in Frappe Health' : 'Register & issue UHID (demo)'}
          </button>
          <p className="text-center text-[11.5px] text-muted-foreground">Consent capture and identity documents follow in the admission step.</p>
        </div>
      </form>
    </div>
  );
}

export function BackendBadge({ live, checking }: { live: boolean; checking: boolean }) {
  if (checking) return <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-slate-500">Checking backend…</span>;
  return live ? (
    <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/25">
      <Wifi className="h-3 w-3" /> Live · Frappe Health
    </span>
  ) : (
    <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 ring-1 ring-inset ring-amber-600/25">
      <CloudOff className="h-3 w-3" /> Demo data
    </span>
  );
}
