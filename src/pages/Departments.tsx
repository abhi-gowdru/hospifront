import { useState } from 'react';
import { labOrders, rxQueue, invoices, inr, type LabOrder, type RxQueueItem } from '@/data/mock';
import { StatusPill } from '@/components/StatusPill';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { CheckCircle2, FlaskConical, Pill, AlertTriangle } from 'lucide-react';

const stages: LabOrder['stage'][] = ['Ordered', 'Sample collected', 'Processing', 'Validation', 'Reported'];

export function LabPage() {
  const [orders, setOrders] = useState(labOrders);
  const advance = (id: string) => {
    setOrders((os) =>
      os.map((o) => {
        if (o.id !== id) return o;
        const next = stages[Math.min(stages.indexOf(o.stage) + 1, stages.length - 1)];
        if (next === 'Reported') {
          toast.success(`${o.test} reported for ${o.patient}`, { description: 'Result is now visible in the patient chart.' });
        }
        return { ...o, stage: next, eta: next === 'Reported' ? 'Done' : o.eta };
      }),
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-5 p-4 lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-extrabold tracking-tight">Lab &amp; radiology worklist</h2>
          <p className="text-[13px] text-muted-foreground">Orders from OPD/IPD flow here automatically · critical results escalate to the treating doctor.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-[12.5px] font-semibold text-rose-700">
          <AlertTriangle className="h-4 w-4" /> 1 critical pending acknowledgment
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="th-cell">Order</th>
                <th className="th-cell">Patient</th>
                <th className="th-cell">Test</th>
                <th className="th-cell">Doctor</th>
                <th className="th-cell">Priority</th>
                <th className="th-cell">Stage</th>
                <th className="th-cell">ETA</th>
                <th className="th-cell text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
                  <td className="td-cell font-mono text-[12.5px] text-slate-500">{o.id}</td>
                  <td className="td-cell">
                    <span className="font-semibold">{o.patient}</span>
                    <span className="ml-2 font-mono text-[11px] text-slate-400">{o.uhid}</span>
                  </td>
                  <td className="td-cell">
                    <span className="flex items-center gap-2 font-medium">
                      <FlaskConical className="h-3.5 w-3.5 text-indigo-500" /> {o.test}
                    </span>
                  </td>
                  <td className="td-cell text-slate-600">{o.doctor}</td>
                  <td className="td-cell"><StatusPill value={o.priority} /></td>
                  <td className="td-cell"><StatusPill value={o.stage} /></td>
                  <td className="td-cell text-slate-600">{o.eta}</td>
                  <td className="td-cell text-right">
                    {o.stage !== 'Reported' ? (
                      <button
                        onClick={() => advance(o.id)}
                        className="focus-ring rounded-lg border border-input px-3 py-1.5 text-[12px] font-bold text-slate-700 hover:bg-muted"
                      >
                        {o.stage === 'Ordered' ? 'Collect sample' : o.stage === 'Sample collected' ? 'Start processing' : o.stage === 'Processing' ? 'Enter result' : 'Validate & release'}
                      </button>
                    ) : (
                      <span className="flex items-center justify-end gap-1 text-[12px] font-bold text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" /> Reported
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[12.5px] text-muted-foreground">
        Analyzer integration via HL7/FHIR adapter (planned) — orders and results reconcile by order ID with idempotent retries.
      </p>
    </div>
  );
}

const rxStages: RxQueueItem['stage'][] = ['Pending verification', 'Verified', 'Dispensing', 'Dispensed'];

export function PharmacyPage() {
  const [queue, setQueue] = useState(rxQueue);
  const advance = (id: string) => {
    setQueue((qs) =>
      qs.map((r) => {
        if (r.id !== id) return r;
        const next = rxStages[Math.min(rxStages.indexOf(r.stage === 'Partially dispensed' ? 'Dispensing' : r.stage) + 1, rxStages.length - 1)];
        if (next === 'Dispensed') toast.success(`${r.id} dispensed to ${r.patient}`, { description: 'Stock deducted · batch & expiry recorded.' });
        return { ...r, stage: next };
      }),
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-5 p-4 lg:p-6">
      <div>
        <h2 className="text-[20px] font-extrabold tracking-tight">Pharmacy queue</h2>
        <p className="text-[13px] text-muted-foreground">Prescribe → verify → dispense → administer. Prescriptions arrive directly from the doctor&rsquo;s EMR.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {queue.map((r) => (
          <div key={r.id} className="card-surface p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[12px] font-bold text-slate-400">{r.id}</p>
                <p className="mt-0.5 text-[15px] font-bold">
                  {r.patient} <span className="ml-1 font-mono text-[11px] font-medium text-slate-400">{r.uhid}</span>
                </p>
                <p className="text-[12px] text-muted-foreground">{r.doctor}</p>
              </div>
              <StatusPill value={r.stage} />
            </div>
            <ul className="mt-4 space-y-2">
              {r.items.map((it) => (
                <li key={it.name} className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 px-3.5 py-2.5 text-[13px]">
                  <span className="flex items-center gap-2 font-semibold">
                    <Pill className="h-3.5 w-3.5 text-primary" /> {it.name}
                    <span className="font-normal text-muted-foreground">· {it.dose}</span>
                  </span>
                  <span className="font-bold tabular-nums">×{it.qty}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-[14px] font-bold">{inr(r.amount)}</p>
              {r.stage !== 'Dispensed' ? (
                <button
                  onClick={() => advance(r.id)}
                  className={cn(
                    'focus-ring rounded-xl px-4 py-2 text-[12.5px] font-bold',
                    r.stage === 'Pending verification'
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'bg-primary text-primary-foreground hover:bg-blue-700',
                  )}
                >
                  {r.stage === 'Pending verification' ? 'Verify prescription' : r.stage === 'Verified' ? 'Start dispensing' : 'Complete dispensing'}
                </button>
              ) : (
                <span className="flex items-center gap-1.5 text-[12.5px] font-bold text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" /> Added to bill
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BillingPage() {
  const totals = invoices.reduce(
    (acc, i) => ({ billed: acc.billed + i.amount, collected: acc.collected + i.paid }),
    { billed: 0, collected: 0 },
  );

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-5 p-4 lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-extrabold tracking-tight">Billing &amp; payments</h2>
          <p className="text-[13px] text-muted-foreground">Lab and pharmacy charges land on the bill automatically — nothing typed twice.</p>
        </div>
        <div className="flex gap-3">
          <div className="card-surface px-4 py-2.5">
            <p className="text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">Billed today</p>
            <p className="text-[17px] font-extrabold">{inr(totals.billed)}</p>
          </div>
          <div className="card-surface px-4 py-2.5">
            <p className="text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">Collected</p>
            <p className="text-[17px] font-extrabold text-emerald-600">{inr(totals.collected)}</p>
          </div>
          <div className="card-surface px-4 py-2.5">
            <p className="text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">Outstanding</p>
            <p className="text-[17px] font-extrabold text-rose-600">{inr(totals.billed - totals.collected)}</p>
          </div>
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="th-cell">Invoice</th>
                <th className="th-cell">Patient</th>
                <th className="th-cell">Department</th>
                <th className="th-cell">Items</th>
                <th className="th-cell">Amount</th>
                <th className="th-cell">Paid</th>
                <th className="th-cell">Mode</th>
                <th className="th-cell">Status</th>
                <th className="th-cell text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
                  <td className="td-cell font-mono text-[12.5px] text-slate-500">{inv.id}</td>
                  <td className="td-cell">
                    <span className="font-semibold">{inv.patient}</span>
                    <span className="ml-2 font-mono text-[11px] text-slate-400">{inv.uhid}</span>
                  </td>
                  <td className="td-cell text-slate-600">{inv.department}</td>
                  <td className="td-cell tabular-nums text-slate-600">{inv.items}</td>
                  <td className="td-cell font-bold tabular-nums">{inr(inv.amount)}</td>
                  <td className="td-cell tabular-nums text-slate-600">{inr(inv.paid)}</td>
                  <td className="td-cell text-slate-600">{inv.mode}</td>
                  <td className="td-cell"><StatusPill value={inv.status} /></td>
                  <td className="td-cell text-right">
                    {inv.status === 'Paid' || inv.status === 'Refunded' ? (
                      <button onClick={() => toast.info(`Receipt for ${inv.id} opened (mock).`)} className="focus-ring rounded-lg border border-input px-3 py-1.5 text-[12px] font-bold text-slate-700 hover:bg-muted">
                        Receipt
                      </button>
                    ) : (
                      <button onClick={() => toast.success(`Payment recorded against ${inv.id} (mock).`)} className="focus-ring rounded-lg bg-primary px-3 py-1.5 text-[12px] font-bold text-primary-foreground hover:bg-blue-700">
                        Collect
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[12.5px] text-muted-foreground">TPA / insurance and PMJAY claim workflows live under Insurance &amp; TPA. GST treatment configured per service category.</p>
    </div>
  );
}
