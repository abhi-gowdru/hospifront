import { useMemo, useState } from 'react';
import { ArrowRight, BedDouble, IndianRupee, Stethoscope, UserRound } from 'lucide-react';
import { appointmentList, inr, patients, wards } from '@/data/mock';
import { StatusPill } from '@/components/StatusPill';
import { cn } from '@/lib/utils';

function Sparkline({ points, className }: { points: number[]; className?: string }) {
  const d = useMemo(() => {
    const max = Math.max(...points);
    const min = Math.min(...points);
    const w = 120;
    const h = 36;
    const step = w / (points.length - 1);
    return points
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(h - 4 - ((p - min) / (max - min || 1)) * (h - 8)).toFixed(1)}`)
      .join(' ');
  }, [points]);
  return (
    <svg viewBox="0 0 120 36" className={cn('h-9 w-full', className)} aria-hidden>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const kpis = [
  { label: 'OPD visits today', value: '142', icon: UserRound, data: [22, 30, 28, 41, 38, 52, 60, 74, 96, 118, 142], tone: 'text-blue-600 bg-blue-50' },
  { label: 'IPD admissions', value: '18', icon: BedDouble, data: [4, 6, 5, 8, 7, 10, 12, 11, 14, 16, 18], tone: 'text-indigo-600 bg-indigo-50' },
  { label: 'Bed occupancy · 130 beds', value: '76%', icon: Stethoscope, data: [61, 63, 66, 64, 69, 71, 70, 73, 74, 75, 76], tone: 'text-teal-600 bg-teal-50' },
  { label: 'Collections today', value: inr(480000).replace(',00,000', '.0L').replace('₹4,80,000', '₹4.8L'), icon: IndianRupee, data: [0.8, 1.4, 1.9, 2.2, 2.6, 3.1, 3.4, 3.9, 4.2, 4.6, 4.8], tone: 'text-emerald-600 bg-emerald-50' },
];

const ranges = ['Today', 'This week', 'This month'] as const;

export default function Dashboard({ onOpenPatient, onNavigate }: { onOpenPatient: (uhid: string) => void; onNavigate: (id: string) => void }) {
  const [range, setRange] = useState<(typeof ranges)[number]>('Today');

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-5 p-4 lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[22px] font-extrabold tracking-tight">Good morning, Anita</h2>
          <p className="text-[13px] text-muted-foreground">Sun, 8 Nov · 9:02 AM</p>
        </div>
        <div className="flex rounded-xl border border-input bg-card p-1" role="tablist" aria-label="Date range">
          {ranges.map((r) => (
            <button
              key={r}
              role="tab"
              aria-selected={range === r}
              onClick={() => setRange(r)}
              className={cn(
                'focus-ring rounded-lg px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors',
                range === r ? 'bg-primary text-primary-foreground shadow-sm' : 'text-slate-500 hover:text-foreground',
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="card-surface p-5">
              <div className="flex items-center justify-between">
                <span className={cn('grid h-10 w-10 place-items-center rounded-xl', k.tone)}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-semibold text-emerald-600">▲ {range === 'Today' ? '8%' : range === 'This week' ? '4%' : '12%'}</span>
              </div>
              <p className="mt-3 text-[28px] font-extrabold leading-none tracking-tight">{k.value}</p>
              <p className="mt-1.5 text-[12.5px] font-medium text-muted-foreground">{k.label}</p>
              <div className="mt-3 text-primary/70">
                <Sparkline points={k.data} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="card-surface overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h3 className="text-[15px] font-bold">Today&rsquo;s patients</h3>
              <p className="text-xs text-muted-foreground">OPD &amp; IPD · live</p>
            </div>
            <button
              onClick={() => onNavigate('opd')}
              className="focus-ring flex items-center gap-1 text-[13px] font-semibold text-primary hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="th-cell">UHID</th>
                  <th className="th-cell">Patient</th>
                  <th className="th-cell">Department</th>
                  <th className="th-cell">Doctor</th>
                  <th className="th-cell">Status</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr
                    key={p.uhid}
                    onClick={() => onOpenPatient(p.uhid)}
                    className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-accent/40"
                  >
                    <td className="td-cell font-mono text-[12.5px] text-slate-500">{p.uhid}</td>
                    <td className="td-cell font-semibold">{p.name}</td>
                    <td className="td-cell text-slate-600">{p.department}</td>
                    <td className="td-cell text-slate-600">{p.doctor}</td>
                    <td className="td-cell">
                      <StatusPill value={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card-surface p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-bold">Bed occupancy</h3>
                <p className="text-xs text-muted-foreground">All wards · live</p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Live
              </span>
            </div>
            <div className="mt-4 space-y-4">
              {wards.map((w) => {
                const pct = Math.round((w.occupied / w.total) * 100);
                return (
                  <div key={w.name}>
                    <div className="flex items-baseline justify-between">
                      <p className="text-[13px] font-semibold">{w.name}</p>
                      <p className="text-[13px] font-bold tabular-nums">
                        {w.occupied} <span className="font-medium text-muted-foreground">/ {w.total}</span>
                      </p>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn('h-full rounded-full transition-all', pct > 85 ? 'bg-rose-500' : pct > 70 ? 'bg-primary' : 'bg-teal-500')}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">{w.total - w.occupied} beds free</p>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => onNavigate('ipd')}
              className="focus-ring mt-4 w-full rounded-xl border border-input py-2 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-muted"
            >
              Open bed board
            </button>
          </div>

          <div className="card-surface p-5">
            <h3 className="text-[15px] font-bold">Upcoming appointments</h3>
            <ul className="mt-3 space-y-2.5">
              {appointmentList.slice(0, 4).map((a) => (
                <li key={a.token} className="flex items-center gap-3">
                  <span className="w-11 shrink-0 rounded-lg bg-muted px-1.5 py-1 text-center text-[11px] font-bold text-slate-600">{a.time}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold">{a.patient}</p>
                    <p className="truncate text-[11.5px] text-muted-foreground">
                      {a.type} · {a.doctor}
                    </p>
                  </div>
                  <span className="rounded-md bg-accent px-1.5 py-0.5 font-mono text-[10.5px] font-bold text-accent-foreground">{a.token}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
