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
  Stethoscope,
  Syringe,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: Array<'Admin' | 'Doctor' | 'Nurse' | 'Reception'>;
}

export const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, roles: ['Admin', 'Doctor', 'Nurse', 'Reception'] },
  { id: 'registration', label: 'Patient Management', icon: UserPlus, roles: ['Admin', 'Reception'] },
  { id: 'opd', label: 'Outpatient', icon: HeartPulse, roles: ['Admin', 'Doctor'] },
  { id: 'ipd', label: 'Inpatient Management', icon: BedDouble, roles: ['Admin', 'Doctor', 'Nurse', 'Reception'] },
  { id: 'lab', label: 'Laboratory', icon: FlaskConical, roles: ['Admin', 'Doctor', 'Nurse'] },
  { id: 'pharmacy', label: 'Pharmacy', icon: Pill, roles: ['Admin', 'Doctor', 'Nurse'] },
  { id: 'billing', label: 'Billing & Payments', icon: CreditCard, roles: ['Admin', 'Reception'] },
  { id: 'insurance', label: 'Insurance', icon: ShieldCheck, roles: ['Admin', 'Reception'] },
  { id: 'nursing', label: 'Nursing Care', icon: Activity, roles: ['Admin', 'Doctor', 'Nurse'] },
  { id: 'calendar', label: 'Appointments', icon: CalendarDays, roles: ['Admin', 'Doctor', 'Reception'] },
  { id: 'doctors', label: 'Doctor Management', icon: Stethoscope, roles: ['Admin', 'Reception', 'Doctor'] },
  { id: 'ot', label: 'Surgical Services', icon: Syringe, roles: ['Admin', 'Doctor'] },
  { id: 'nurses', label: 'Nurse Management', icon: Users, roles: ['Admin', 'Nurse'] },
  { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, roles: ['Admin', 'Doctor', 'Nurse', 'Reception'] },
  { id: 'settings', label: 'System Settings', icon: Settings, roles: ['Admin'] },
];

export function AppSidebar({
  active,
  onNavigate,
  onNewPatient,
  collapsed,
  role,
}: {
  active: string;
  onNavigate: (id: string) => void;
  onNewPatient: () => void;
  collapsed: boolean;
  role?: 'Admin' | 'Doctor' | 'Nurse' | 'Reception';
}) {
  const visibleNavItems = navItems.filter((item) => !item.roles || !role || item.roles.includes(role));
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
            <p className="text-[15px] font-extrabold tracking-tight text-foreground">Sanmaya</p>
            <p className="text-[11px] font-medium text-muted-foreground">Hospital IMS</p>
          </div>
        )}
      </div>

      {role !== 'Doctor' && role !== 'Nurse' && (
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
      )}

      <nav className="nice-scroll mt-4 flex-1 space-y-0.5 overflow-y-auto px-3 pb-4" aria-label="Modules">
        {visibleNavItems.map((item) => {
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


    </aside>
  );
}
