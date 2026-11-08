import { useCallback, useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { AppSidebar } from '@/components/AppSidebar';
import { Topbar } from '@/components/Topbar';
import Dashboard from '@/pages/Dashboard';
import Registration from '@/pages/Registration';
import EmrConsult from '@/pages/EmrConsult';
import IpdBeds from '@/pages/IpdBeds';
import { LabPage, PharmacyPage, BillingPage } from '@/pages/Departments';
import { NursingPage, InsurancePage, AppointmentsPage, ReportsPage, SettingsPage } from '@/pages/Misc';
import { cn } from '@/lib/utils';
import Login from '@/pages/Login';
import { loadRegisteredPatients } from '@/data/mock';
import { DoctorsPage, OTPage, NurseManagementPage } from '@/pages/ClinicalWorkflow';
import type { StaffRole } from '@/pages/Login';
import PatientRecord from '@/pages/PatientRecord';

loadRegisteredPatients();

interface StaffSession {
  name: string;
  role: StaffRole;
}

type RouteDefinition = {
  title: string;
  roles: StaffRole[];
  element: (helpers: { openPatient: (u: string) => void; navigate: (id: string) => void; selectedPatientUhid: string | null; session: StaffSession | null }) => React.ReactNode;
};

const allRoles: StaffRole[] = ['Admin', 'Doctor', 'Nurse', 'Reception'];

const routes: Record<string, RouteDefinition> = {
  dashboard: { title: 'Dashboard', roles: allRoles, element: (h) => <Dashboard onOpenPatient={h.openPatient} onNavigate={h.navigate} /> },
  registration: { title: 'Patient Management', roles: ['Admin', 'Reception'], element: (h) => <Registration onOpenPatient={h.openPatient} /> },
  patient: { title: 'Patient Record', roles: allRoles, element: (h) => h.selectedPatientUhid ? <PatientRecord uhid={h.selectedPatientUhid} session={h.session} onNavigate={h.navigate} /> : null },
  opd: { title: 'Outpatient', roles: ['Admin', 'Doctor'], element: (h) => <EmrConsult key={`${h.selectedPatientUhid ?? 'default-patient'}-${h.session?.role}-${h.session?.name}`} uhid={h.selectedPatientUhid} session={h.session} /> },
  ipd: { title: 'Inpatient Management', roles: ['Admin', 'Doctor', 'Nurse', 'Reception'], element: () => <IpdBeds /> },
  lab: { title: 'Laboratory & Radiology', roles: ['Admin', 'Doctor', 'Nurse'], element: () => <LabPage /> },
  pharmacy: { title: 'Pharmacy', roles: ['Admin', 'Doctor', 'Nurse'], element: () => <PharmacyPage /> },
  billing: { title: 'Billing & Payments', roles: ['Admin', 'Reception'], element: () => <BillingPage /> },
  insurance: { title: 'Insurance Management', roles: ['Admin', 'Reception'], element: () => <InsurancePage /> },
  nursing: { title: 'Nursing Care', roles: ['Admin', 'Doctor', 'Nurse'], element: () => <NursingPage /> },
  calendar: { title: 'Appointments', roles: ['Admin', 'Doctor', 'Reception'], element: () => <AppointmentsPage /> },
  reports: { title: 'Reports & Analytics', roles: allRoles, element: () => <ReportsPage /> },
  settings: { title: 'System Settings', roles: ['Admin'], element: () => <SettingsPage /> },
  doctors: { title: 'Doctor Management', roles: ['Admin', 'Reception', 'Doctor'], element: (h) => <DoctorsPage onOpenPatient={h.openPatient} /> },
  ot: { title: 'Surgical Services', roles: ['Admin', 'Doctor'], element: () => <OTPage /> },
  nurses: { title: 'Nurse Management', roles: ['Admin', 'Nurse'], element: () => <NurseManagementPage /> },
};

const readHash = () => {
  const h = window.location.hash.replace(/^#\/?/, '');
  return routes[h] ? h : 'dashboard';
};

export default function App() {
  const [route, setRoute] = useState<string>(readHash);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPatientUhid, setSelectedPatientUhid] = useState<string | null>(null);
  const [session, setSession] = useState<StaffSession | null>(() => {
    const saved = localStorage.getItem('Sanmaya_session');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved) as StaffSession;
      return allRoles.includes(parsed.role) ? parsed : null;
    } catch {
      localStorage.removeItem('Sanmaya_session');
      return null;
    }
  });

  useEffect(() => {
    if (!session) return;
    const onHash = () => {
      const requestedRoute = readHash();
      if (!routes[requestedRoute].roles.includes(session.role)) {
        window.history.replaceState(null, '', '#/dashboard');
        setRoute('dashboard');
      } else {
        setRoute(requestedRoute);
      }
    };
    onHash();
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [session]);

  const navigate = useCallback((id: string) => {
    if (!session || !routes[id]?.roles.includes(session.role)) return;
    window.location.hash = `/${id}`;
    setRoute(id);
    setSidebarOpen(false);
  }, [session]);

  const openPatient = useCallback(
    (uhid: string) => {
      setSelectedPatientUhid(uhid);
      navigate('patient');
    },
    [navigate],
  );

  const helpers = { openPatient, navigate, selectedPatientUhid, session };

  const login = (staffId: string, role: StaffRole) => {
    const nextSession = { name: staffId.trim(), role };
    localStorage.setItem('Sanmaya_session', JSON.stringify(nextSession));
    setSession(nextSession);
  };

  const logout = () => {
    localStorage.removeItem('Sanmaya_session');
    setSession(null);
    window.location.hash = '/dashboard';
  };

  if (!session) {
    return (
      <>
        <Login onLogin={login} />
        <Toaster position="bottom-right" richColors closeButton />
      </>
    );
  }

  if (!routes[route].roles.includes(session.role)) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background p-6">
        <div className="card-surface max-w-md p-8 text-center">
          <p className="text-lg font-extrabold text-slate-900">Access restricted</p>
          <p className="mt-2 text-sm text-muted-foreground">
            This module is not available to the {session.role} role.
          </p>
        </div>
        <Toaster position="bottom-right" richColors closeButton />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Desktop sidebar */}
      <div className="sticky top-0 hidden h-dvh lg:block">
        <AppSidebar active={route} onNavigate={navigate} onNewPatient={() => navigate('registration')} collapsed={false} role={session.role} />
      </div>

      {/* Mobile off-canvas sidebar */}
      <div className={cn('fixed inset-0 z-50 lg:hidden', sidebarOpen ? '' : 'pointer-events-none')}>
        <div
          className={cn('absolute inset-0 bg-slate-900/40 transition-opacity', sidebarOpen ? 'opacity-100' : 'opacity-0')}
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
        <div className={cn('absolute inset-y-0 left-0 transition-transform duration-200', sidebarOpen ? 'translate-x-0' : '-translate-x-full')}>
          <AppSidebar active={route} onNavigate={navigate} onNewPatient={() => navigate('registration')} collapsed={false} role={session.role} />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={routes[route].title}
          user={session}
          onOpenPatient={openPatient}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          onLogout={logout}
        />
        <main className="nice-scroll flex-1 overflow-y-auto">{routes[route].element(helpers)}</main>
      </div>

      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}
