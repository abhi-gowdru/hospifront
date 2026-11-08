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
import { BackendProvider } from '@/hooks/useBackend';
import { cn } from '@/lib/utils';

const routes: Record<string, { title: string; element: (helpers: { openPatient: (u: string) => void; navigate: (id: string) => void }) => React.ReactNode }> = {
  dashboard: { title: 'Dashboard', element: (h) => <Dashboard onOpenPatient={h.openPatient} onNavigate={h.navigate} /> },
  registration: { title: 'Registration', element: (h) => <Registration onOpenPatient={h.openPatient} /> },
  opd: { title: 'OPD · Consultation', element: () => <EmrConsult /> },
  ipd: { title: 'IPD & Beds', element: () => <IpdBeds /> },
  lab: { title: 'Lab & Radiology', element: () => <LabPage /> },
  pharmacy: { title: 'Pharmacy', element: () => <PharmacyPage /> },
  billing: { title: 'Billing', element: () => <BillingPage /> },
  insurance: { title: 'Insurance & TPA', element: () => <InsurancePage /> },
  nursing: { title: 'Nursing', element: () => <NursingPage /> },
  calendar: { title: 'Appointments', element: () => <AppointmentsPage /> },
  reports: { title: 'Reports', element: () => <ReportsPage /> },
  settings: { title: 'Settings', element: () => <SettingsPage /> },
};

const readHash = () => {
  const h = window.location.hash.replace(/^#\/?/, '');
  return routes[h] ? h : 'dashboard';
};

export default function App() {
  const [route, setRoute] = useState<string>(readHash);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const onHash = () => setRoute(readHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = useCallback((id: string) => {
    window.location.hash = `/${id}`;
    setRoute(id);
    setSidebarOpen(false);
  }, []);

  const openPatient = useCallback(
    (_uhid: string) => {
      navigate('opd');
    },
    [navigate],
  );

  const helpers = { openPatient, navigate };

  return (
    <BackendProvider>
      <div className="flex min-h-dvh bg-background">
      {/* Desktop sidebar */}
      <div className="sticky top-0 hidden h-dvh lg:block">
        <AppSidebar active={route} onNavigate={navigate} onNewPatient={() => navigate('registration')} collapsed={false} />
      </div>

      {/* Mobile off-canvas sidebar */}
      <div className={cn('fixed inset-0 z-50 lg:hidden', sidebarOpen ? '' : 'pointer-events-none')}>
        <div
          className={cn('absolute inset-0 bg-slate-900/40 transition-opacity', sidebarOpen ? 'opacity-100' : 'opacity-0')}
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
        <div className={cn('absolute inset-y-0 left-0 transition-transform duration-200', sidebarOpen ? 'translate-x-0' : '-translate-x-full')}>
          <AppSidebar active={route} onNavigate={navigate} onNewPatient={() => navigate('registration')} collapsed={false} />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={routes[route].title} onOpenPatient={openPatient} onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="nice-scroll flex-1 overflow-y-auto">{routes[route].element(helpers)}</main>
      </div>

      <Toaster position="bottom-right" richColors closeButton />
      </div>
    </BackendProvider>
  );
}
