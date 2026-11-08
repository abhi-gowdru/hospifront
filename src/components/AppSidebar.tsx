import {
  Activity,
  BedDouble,
  CalendarDays,
  CreditCard,
  FlaskConical,
  HeartPulse,
  LayoutGrid,
  Pill,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'registration', label: 'Registration', icon: UserPlus },
  { id: 'opd', label: 'OPD · Doctor', icon: HeartPulse },
  { id: 'ipd', label: 'IPD & Beds', icon: BedDouble },
  { id: 'lab', label: 'Lab & Radiology', icon: FlaskConical },
  { id: 'pharmacy', label: 'Pharmacy', icon: Pill },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'insurance', label: 'Insurance & TPA', icon: ShieldCheck },
  { id: 'nursing', label: 'Nursing', icon: Activity },
  { id: 'calendar', label: 'Appointments', icon: CalendarDays },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function AppSidebar({
  active,
  onNavigate,
  onNewPatient,
  collapsed,
}: {
  active: string;
  onNavigate: (id: string) => void;
  onNewPatient: () => void;
  collapsed: boolean;
}) {
  return (
    <aside
      className={cn(
        'flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200',
        collapsed ? 'w-[68px]' : 'w-[228px]',
      )}
    >
      <div className={cn('flex items-center gap-2.5 px-4 pb-4 pt-5', collapsed && 'justify-center px-0')}>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
          <HeartPulse className="h-5 w-5" strokeWidth={2.2} />
        </span>
        {!collapsed && (
          <div className="leading-tight">
            <p className="text-[15px] font-extrabold tracking-tight text-foreground">Aarogya</p>
            <p className="text-[11px] font-medium text-muted-foreground">Hospital IMS</p>
          </div>
        )}
      </div>

      <div className={cn('px-3', collapsed && 'px-2')}>
        <button
          onClick={onNewPatient}
          className={cn(
            'focus-ring flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-blue-700 active:bg-blue-800',
            collapsed && 'px-0',
          )}
          aria-label="Register new patient"
        >
          <Users className="h-4 w-4" />
          {!collapsed && <span>New patient</span>}
        </button>
      </div>

      <nav className="nice-scroll mt-4 flex-1 space-y-0.5 overflow-y-auto px-3 pb-4" aria-label="Modules">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? 'page' : undefined}
              title={item.label}
              className={cn(
                'focus-ring group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors',
                collapsed && 'justify-center px-0',
                isActive
                  ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-muted',
              )}
            >
              <Icon
                className={cn(
                  'h-[18px] w-[18px] shrink-0 transition-colors',
                  isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600',
                )}
              />
              {!collapsed && item.label}
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="mx-3 mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-emerald-800">
            <ShieldCheck className="h-3.5 w-3.5" /> ABDM ready
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-emerald-700/90">ABHA creation &amp; linking at registration (sandbox).</p>
        </div>
      )}
    </aside>
  );
}
