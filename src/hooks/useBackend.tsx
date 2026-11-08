import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getBackendHealth } from '@/lib/api';

export type BackendStatus = 'checking' | 'live' | 'demo';

const BackendContext = createContext<BackendStatus>('checking');

export function BackendProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<BackendStatus>('checking');
  useEffect(() => {
    let cancelled = false;
    const check = () =>
      getBackendHealth().then((s) => {
        if (!cancelled) setStatus(s);
      });
    check();
    const t = setInterval(check, 30000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);
  return <BackendContext.Provider value={status}>{children}</BackendContext.Provider>;
}

export const useBackend = () => useContext(BackendContext);
