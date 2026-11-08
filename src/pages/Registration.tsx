import { useState } from 'react';
import { BadgeCheck, Link2, Search, UserPlus } from 'lucide-react';
import { patients } from '@/data/mock';
import { StatusPill } from '@/components/StatusPill';
import { toast } from 'sonner';

export default function Registration({ onOpenPatient }: { onOpenPatient: (uhid: string) => void }) {
  const [q, setQ] = useState('');
  const [form, setForm] = useState({ name: '', age: '', sex: 'M', mobile: '', abha: '', address: '' });
  const [abhaState, setAbhaState] = useState<'idle' | 'checking' | 'verified'>('idle');

  const results = q
    ? patients.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.uhid.includes(q))
    : patients;

  const verifyAbha = () => {
    if (!form.abha.trim()) {
      toast.warning('Enter an ABHA number or mobile to verify.');
      return;
    }
    setAbhaState('checking');
    setTimeout(() => {
      setAbhaState('verified');
      toast.success('ABHA verified (sandbox)', { description: 'Demographics matched via ABDM sandbox OTP flow.' });
    }, 1200);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.mobile.trim()) {
      toast.warning('Name and mobile are required.');
      return;
    }
    toast.success('Patient registered (mock)', {
      description: `UHID 2000856 issued for ${form.name}. Duplicate check passed against 18,432 records.`,
    });
    setForm({ name: '', age: '', sex: 'M', mobile: '', abha: '', address: '' });
    setAbhaState('idle');
  };

  const field = (label: string, node: React.ReactNode) => (
    <label className="block">
      <span className="text-[12px] font-semibold text-muted-foreground">{label}</span>
      <div className="mt-1">{node}</div>
    </label>
  );

  const input =
    'focus-ring w-full rounded-xl border border-input px-3 py-2.5 text-[14px] placeholder:text-slate-400';

  return (
    <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-4 p-4 lg:grid-cols-5 lg:p-6">
      {/* Lookup */}
      <div className="card-surface h-fit lg:col-span-3">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-[16px] font-bold">Patient lookup</h2>
          <p className="text-xs text-muted-foreground">Search before registering — duplicate detection by name, mobile and ABHA.</p>
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
                  <th className="th-cell">ABHA</th>
                  <th className="th-cell">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((p) => (
                  <tr key={p.uhid} onClick={() => onOpenPatient(p.uhid)} className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-accent/40">
                    <td className="td-cell font-mono text-[12.5px] text-slate-500">{p.uhid}</td>
                    <td className="td-cell">
                      <span className="font-semibold">{p.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{p.age}{p.sex}</span>
                    </td>
                    <td className="td-cell text-slate-600">{p.mobile}</td>
                    <td className="td-cell">
                      {p.abha ? (
                        <span className="flex items-center gap-1 text-[12px] font-bold text-emerald-700">
                          <BadgeCheck className="h-3.5 w-3.5" /> Linked
                        </span>
                      ) : (
                        <span className="text-[12px] text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="td-cell"><StatusPill value={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            {field('Age', <input value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="54" inputMode="numeric" className={input} />)}
            {field(
              'Sex',
              <select value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })} className={input}>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>,
            )}
          </div>
          {field('Mobile', <input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="+91 …" inputMode="tel" className={input} />)}
          {field('Address', <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Area, city" className={input} />)}

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
            <p className="flex items-center gap-1.5 text-[12.5px] font-bold text-emerald-800">
              <Link2 className="h-3.5 w-3.5" /> ABHA linking (ABDM sandbox)
            </p>
            <div className="mt-2 flex gap-2">
              <input
                value={form.abha}
                onChange={(e) => {
                  setForm({ ...form, abha: e.target.value });
                  setAbhaState('idle');
                }}
                placeholder="ABHA number or linked mobile"
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
          </div>

          <button type="submit" className="focus-ring w-full rounded-xl bg-primary py-3 text-[14px] font-bold text-primary-foreground shadow-sm hover:bg-blue-700 active:bg-blue-800">
            Register &amp; issue UHID
          </button>
          <p className="text-center text-[11.5px] text-muted-foreground">Consent capture and identity documents follow in the admission step.</p>
        </div>
      </form>
    </div>
  );
}
