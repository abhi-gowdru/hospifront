import { Bell, Building2, Menu, Search } from 'lucide-react';
import { patients } from '@/data/mock';
import { useEffect, useRef, useState } from 'react';

export function Topbar({
  title,
  onOpenPatient,
  onToggleSidebar,
}: {
  title: string;
  onOpenPatient: (uhid: string) => void;
  onToggleSidebar: () => void;
}) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  const results = q.trim()
    ? patients.filter(
        (p) =>
          p.name.toLowerCase().includes(q.toLowerCase()) ||
          p.uhid.includes(q) ||
          p.mobile.replace(/\s/g, '').includes(q.replace(/\s/g, '')),
      )
    : [];

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setNotifyOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-4 lg:px-6">
      <button
        onClick={onToggleSidebar}
        className="focus-ring grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-muted lg:hidden"
        aria-label="Toggle navigation"
      >
        <Menu className="h-5 w-5" />
      </button>
      <h1 className="text-[17px] font-bold tracking-tight">{title}</h1>

      <div className="relative ml-auto hidden w-full max-w-md md:block" ref={boxRef}>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
          }}
          placeholder="Search patient, UHID or mobile"
          className="focus-ring h-10 w-full rounded-xl border border-input bg-muted/60 pl-10 pr-4 text-sm placeholder:text-slate-400"
          aria-label="Search patient by name, UHID or mobile"
        />
        {open && q.trim() && (
          <div className="absolute left-0 right-0 top-11 z-40 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
            {results.length === 0 ? (
              <p className="px-4 py-3 text-sm text-muted-foreground">No patients match “{q}”.</p>
            ) : (
              results.map((p) => (
                <button
                  key={p.uhid}
                  onClick={() => {
                    onOpenPatient(p.uhid);
                    setOpen(false);
                    setQ('');
                  }}
                  className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-muted"
                >
                  <span>
                    <span className="font-semibold">{p.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {p.age}{p.sex} · {p.department}
                    </span>
                  </span>
                  <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-slate-500">UHID {p.uhid}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <button className="focus-ring ml-auto hidden items-center gap-2 rounded-xl border border-input px-3 py-2 text-[13px] font-medium text-slate-600 hover:bg-muted md:ml-0 md:flex">
        <Building2 className="h-4 w-4 text-slate-400" />
        Chennai · Main
      </button>

      <div className="relative" ref={bellRef}>
        <button
          onClick={() => setNotifyOpen((v) => !v)}
          className="focus-ring relative grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-muted"
          aria-label="Notifications"
          aria-expanded={notifyOpen}
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-card" />
        </button>
        {notifyOpen && (
          <div className="absolute right-0 top-12 z-40 w-80 rounded-xl border border-border bg-card p-2 shadow-lg">
            {[
              ['Critical lab result', 'Troponin-T high for UHID 2000846 · acknowledge', '2m ago', 'text-rose-600'],
              ['Bed request', 'ICU escalation requested for Arjun Pillai', '14m ago', 'text-amber-600'],
              ['Discharge ready', 'Suresh Babu cleared by billing', '38m ago', 'text-emerald-600'],
            ].map(([t, d, time, c]) => (
              <div key={t} className="rounded-lg px-3 py-2.5 hover:bg-muted">
                <p className={`text-[13px] font-semibold ${c}`}>{t}</p>
                <p className="text-xs text-muted-foreground">{d}</p>
                <p className="mt-0.5 text-[10.5px] font-medium text-slate-400">{time}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-[13px] font-bold text-primary-foreground">AN</span>
        <div className="hidden leading-tight xl:block">
          <p className="text-[13px] font-semibold">Anita Nair</p>
          <p className="text-[11px] text-muted-foreground">Front office</p>
        </div>
      </div>
    </header>
  );
}
