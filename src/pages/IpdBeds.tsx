import { useMemo, useState } from 'react';
import { bedBoard, type Bed, type BedState } from '@/data/mock';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Brush, DoorOpen, Hammer, KeyRound, Snowflake, UserRound, XCircle } from 'lucide-react';

const stateStyle: Record<BedState, { cls: string; dot: string; icon: React.ComponentType<{ className?: string }> }> = {
  Available: { cls: 'border-emerald-300 bg-emerald-50/70 hover:border-emerald-500', dot: 'bg-emerald-500', icon: DoorOpen },
  Reserved: { cls: 'border-blue-300 bg-blue-50/70 hover:border-blue-500', dot: 'bg-blue-500', icon: KeyRound },
  Occupied: { cls: 'border-slate-300 bg-card hover:border-slate-500', dot: 'bg-slate-700', icon: UserRound },
  'Discharge pending': { cls: 'border-amber-300 bg-amber-50/70 hover:border-amber-500', dot: 'bg-amber-500', icon: DoorOpen },
  Cleaning: { cls: 'border-cyan-300 bg-cyan-50/70 hover:border-cyan-500', dot: 'bg-cyan-500', icon: Brush },
  Maintenance: { cls: 'border-orange-300 bg-orange-50/70 hover:border-orange-500', dot: 'bg-orange-500', icon: Hammer },
  Blocked: { cls: 'border-slate-300 bg-slate-100 hover:border-slate-500', dot: 'bg-slate-400', icon: XCircle },
  Isolation: { cls: 'border-violet-300 bg-violet-50/70 hover:border-violet-500', dot: 'bg-violet-500', icon: Snowflake },
};

const legend: BedState[] = ['Available', 'Reserved', 'Occupied', 'Discharge pending', 'Cleaning', 'Maintenance', 'Blocked', 'Isolation'];

export default function IpdBeds() {
  const [filter, setFilter] = useState<BedState | 'All'>('All');
  const [selected, setSelected] = useState<Bed | null>(null);

  const counts = useMemo(() => {
    const all = bedBoard.flatMap((w) => w.beds);
    return {
      total: all.length,
      occupied: all.filter((b) => b.state === 'Occupied' || b.state === 'Isolation').length,
      free: all.filter((b) => b.state === 'Available').length,
      held: all.filter((b) => ['Reserved', 'Cleaning', 'Maintenance', 'Blocked'].includes(b.state)).length,
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-5 p-4 lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-extrabold tracking-tight">Ward &amp; bed board</h2>
          <p className="text-[13px] text-muted-foreground">
            {counts.occupied} occupied · {counts.free} available · {counts.held} on hold — of {counts.total} beds
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter beds by state">
          {(['All', ...legend] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              aria-pressed={filter === s}
              className={cn(
                'focus-ring flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-semibold ring-1 ring-inset transition-colors',
                filter === s ? 'bg-slate-800 text-white ring-slate-800' : 'bg-card text-slate-600 ring-input hover:bg-muted',
              )}
            >
              {s !== 'All' && <span className={cn('h-1.5 w-1.5 rounded-full', stateStyle[s].dot)} />}
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          {bedBoard.map((ward) => (
            <section key={ward.name} className="card-surface p-5" aria-label={ward.name}>
              <div className="flex items-baseline justify-between">
                <h3 className="text-[15px] font-bold">{ward.name}</h3>
                <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-bold text-slate-500">{ward.category}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
                {ward.beds
                  .filter((b) => filter === 'All' || b.state === filter)
                  .map((b) => {
                    const st = stateStyle[b.state];
                    const Icon = st.icon;
                    const isSel = selected?.id === b.id;
                    return (
                      <button
                        key={b.id}
                        onClick={() => setSelected(b)}
                        aria-pressed={isSel}
                        className={cn(
                          'focus-ring rounded-xl border-2 p-3 text-left transition-all',
                          st.cls,
                          isSel && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold text-slate-500">{b.id}</span>
                          <span className={cn('h-2 w-2 rounded-full', st.dot)} />
                        </div>
                        <p className="mt-2 flex items-center gap-1.5 text-[12.5px] font-bold leading-tight">
                          <Icon className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                          {b.patient ?? b.state}
                        </p>
                        <p className="mt-0.5 text-[10.5px] font-medium text-muted-foreground">
                          {b.patient ? `${b.doctor} · ${b.since}` : b.state}
                        </p>
                      </button>
                    );
                  })}
              </div>
            </section>
          ))}
        </div>

        {/* Detail / actions panel */}
        <aside className="card-surface h-fit p-5 xl:sticky xl:top-6">
          {selected ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-[15px] font-bold">{selected.id}</h3>
                <span className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset', stateStyle[selected.state].cls, 'border-0')}>
                  <span className={cn('h-1.5 w-1.5 rounded-full', stateStyle[selected.state].dot)} />
                  {selected.state}
                </span>
              </div>
              <dl className="mt-4 space-y-2.5 text-[13px]">
                <div className="flex justify-between"><dt className="text-muted-foreground">Room</dt><dd className="font-semibold">{selected.room}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Patient</dt><dd className="font-semibold">{selected.patient ?? '—'}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Doctor</dt><dd className="font-semibold">{selected.doctor ?? '—'}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Occupied for</dt><dd className="font-semibold">{selected.since ?? '—'}</dd></div>
              </dl>
              <div className="mt-5 space-y-2">
                {selected.state === 'Available' && (
                  <button
                    onClick={() => toast.success(`Bed ${selected.id} reserved`, { description: 'Hard-constraint checks passed: readiness, staffing, isolation rules.' })}
                    className="focus-ring w-full rounded-xl bg-primary py-2.5 text-[13px] font-bold text-primary-foreground hover:bg-blue-700"
                  >
                    Reserve for admission
                  </button>
                )}
                {selected.state === 'Occupied' && (
                  <>
                    <button
                      onClick={() => toast.info('Transfer workflow started (mock).', { description: 'Pick a destination bed on the board.' })}
                      className="focus-ring w-full rounded-xl border border-input py-2.5 text-[13px] font-bold text-slate-700 hover:bg-muted"
                    >
                      Transfer patient
                    </button>
                    <button
                      onClick={() => toast.info('Discharge planning opened (mock).')}
                      className="focus-ring w-full rounded-xl border border-amber-300 bg-amber-50 py-2.5 text-[13px] font-bold text-amber-700 hover:bg-amber-100"
                    >
                      Mark discharge pending
                    </button>
                  </>
                )}
                {selected.state === 'Discharge pending' && (
                  <button
                    onClick={() => toast.success(`Bed ${selected.id} released to cleaning`, { description: 'Housekeeping notified · SLA 45 min.' })}
                    className="focus-ring w-full rounded-xl bg-emerald-600 py-2.5 text-[13px] font-bold text-white hover:bg-emerald-700"
                  >
                    Release bed → cleaning
                  </button>
                )}
                {selected.state === 'Cleaning' && (
                  <button
                    onClick={() => toast.success(`Bed ${selected.id} marked available.`)}
                    className="focus-ring w-full rounded-xl bg-emerald-600 py-2.5 text-[13px] font-bold text-white hover:bg-emerald-700"
                  >
                    Housekeeping done → available
                  </button>
                )}
                {['Maintenance', 'Blocked', 'Reserved', 'Isolation'].includes(selected.state) && (
                  <button
                    onClick={() => toast.info('State change requires ward-in-charge authorization (mock).')}
                    className="focus-ring w-full rounded-xl border border-input py-2.5 text-[13px] font-bold text-slate-700 hover:bg-muted"
                  >
                    Change state
                  </button>
                )}
              </div>
              <p className="mt-4 text-[11.5px] leading-snug text-muted-foreground">
                Allocation respects hard constraints first — clinical suitability, occupancy conflicts, infection control, staffing and equipment readiness.
              </p>
            </>
          ) : (
            <div className="py-8 text-center">
              <p className="text-[14px] font-semibold text-slate-500">Select a bed</p>
              <p className="mt-1 text-[12px] text-muted-foreground">Click any bed on the board to see occupancy details and actions.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
