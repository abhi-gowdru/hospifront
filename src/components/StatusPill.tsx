import { cn } from '@/lib/utils';

const styles: Record<string, string> = {
  'In consult': 'bg-blue-50 text-blue-700 ring-blue-600/20',
  Waiting: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  Admitted: 'bg-slate-800 text-white ring-slate-800',
  Billing: 'bg-amber-50 text-amber-700 ring-amber-600/25',
  Discharged: 'bg-emerald-50 text-emerald-700 ring-emerald-600/25',
  'Report ready': 'bg-teal-50 text-teal-700 ring-teal-600/25',
  Paid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/25',
  Partial: 'bg-amber-50 text-amber-700 ring-amber-600/25',
  Pending: 'bg-rose-50 text-rose-700 ring-rose-600/25',
  Refunded: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  STAT: 'bg-rose-600 text-white ring-rose-600',
  Urgent: 'bg-orange-50 text-orange-700 ring-orange-600/25',
  Routine: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  Ordered: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  'Sample collected': 'bg-blue-50 text-blue-700 ring-blue-600/20',
  Processing: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  Validation: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  Reported: 'bg-emerald-50 text-emerald-700 ring-emerald-600/25',
  'Pending verification': 'bg-amber-50 text-amber-700 ring-amber-600/25',
  Verified: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  Dispensing: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  Dispensed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/25',
  'Partially dispensed': 'bg-orange-50 text-orange-700 ring-orange-600/25',
};

export function StatusPill({ value, className }: { value: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ring-1 ring-inset',
        styles[value] ?? 'bg-slate-100 text-slate-600 ring-slate-500/20',
        className,
      )}
    >
      {value}
    </span>
  );
}
