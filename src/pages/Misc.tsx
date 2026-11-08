import { useMemo, useState } from 'react';
import { Activity, ArrowRightLeft, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, ClipboardList, Droplets, HandMetal, ShieldCheck, Syringe, TrendingUp } from 'lucide-react';
import { appointmentList, inr, patients } from '@/data/mock';
import { StatusPill } from '@/components/StatusPill';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { StaffRole } from '@/pages/Login';

export function NursingPage() {
  const [done, setDone] = useState<string[]>([]);
  const tasks = [
    { id: 't1', time: '10:00', patient: 'R. Iyer · GA-10101', task: 'Vitals — BP, pulse, SpO₂', icon: Activity, kind: 'Vitals' },
    { id: 't2', time: '10:30', patient: 'A. Khan · GA-10202', task: 'Medication — Metoprolol 25 mg PO', icon: Syringe, kind: 'MAR' },
    { id: 't3', time: '11:00', patient: 'M. Das · ICU-03', task: 'Intake/output charting', icon: Droplets, kind: 'I/O' },
    { id: 't4', time: '11:30', patient: 'P. Rao · TB-20101', task: 'Nursing assessment — admission', icon: ClipboardList, kind: 'Assessment' },
    { id: 't5', time: '12:00', patient: 'Shift A → Shift B', task: 'Handover — 14 patients, 2 escalations', icon: ArrowRightLeft, kind: 'Handover' },
  ];
  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-5 p-4 lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-extrabold tracking-tight">Nursing worklist — Shift A</h2>
          <p className="text-[13px] text-muted-foreground">14 assigned patients · Ward A, Twin B · {done.length}/{tasks.length} tasks charted</p>
        </div>
        <button
          onClick={() => toast.info('Escalation sent (mock)', { description: 'Duty doctor paged for ICU-03.' })}
          className="focus-ring rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-[13px] font-bold text-rose-700 hover:bg-rose-100"
        >
          Escalate to doctor
        </button>
      </div>
      <div className="card-surface divide-y divide-border/60">
        {tasks.map((t) => {
          const Icon = t.icon;
          const isDone = done.includes(t.id);
          return (
            <div key={t.id} className="flex items-center gap-4 px-5 py-4">
              <span className="w-12 shrink-0 rounded-lg bg-muted px-1.5 py-1 text-center text-[11.5px] font-bold text-slate-600">{t.time}</span>
              <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl', isDone ? 'bg-emerald-50 text-emerald-600' : 'bg-accent text-primary')}>
                <Icon className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn('truncate text-[14px] font-semibold', isDone && 'text-slate-400 line-through')}>{t.task}</p>
                <p className="truncate text-[12px] text-muted-foreground">{t.patient} · {t.kind}</p>
              </div>
              <button
                onClick={() => {
                  setDone((d) => (isDone ? d.filter((x) => x !== t.id) : [...d, t.id]));
                  if (!isDone) toast.success('Charted with timestamp and your initials.', { description: 'Signed entries cannot be silently edited — corrections create an amendment.' });
                }}
                aria-pressed={isDone}
                className={cn(
                  'focus-ring flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12.5px] font-bold',
                  isDone ? 'bg-emerald-50 text-emerald-700' : 'bg-primary text-primary-foreground hover:bg-blue-700',
                )}
              >
                <CheckCircle2 className="h-4 w-4" /> {isDone ? 'Charted' : 'Chart'}
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-[12.5px] text-muted-foreground">All entries are time-stamped and attributable; amendments preserve the original record.</p>
    </div>
  );
}

export function InsurancePage() {
  const claims = [
    { id: 'CLM-7712', patient: 'Kavya Reddy', payer: 'Star Health (TPA: Medi Assist)', amount: 48250, stage: 'Pre-auth approved', tone: 'bg-blue-50 text-blue-700 ring-blue-600/20' },
    { id: 'CLM-7708', patient: 'Arjun Pillai', payer: 'PMJAY · Ayushman Bharat', amount: 86400, stage: 'Submitted · NHCX', tone: 'bg-amber-50 text-amber-700 ring-amber-600/25' },
    { id: 'CLM-7690', patient: 'Suresh Babu', payer: 'HDFC Ergo', amount: 23500, stage: 'Settled', tone: 'bg-emerald-50 text-emerald-700 ring-emerald-600/25' },
  ];
  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-5 p-4 lg:p-6">
      <div>
        <h2 className="text-[20px] font-extrabold tracking-tight">Insurance &amp; TPA claims</h2>
        <p className="text-[13px] text-muted-foreground">TPA, private insurance and government schemes (PMJAY) — tracked from pre-auth to settlement.</p>
      </div>
      <div className="card-surface divide-y divide-border/60">
        {claims.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-primary">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold">{c.patient} <span className="ml-1 font-mono text-[11px] font-medium text-slate-400">{c.id}</span></p>
              <p className="text-[12px] text-muted-foreground">{c.payer}</p>
            </div>
            <p className="text-[15px] font-extrabold tabular-nums">{inr(c.amount)}</p>
            <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset', c.tone)}>{c.stage}</span>
            <button onClick={() => toast.info(`Claim ${c.id} workspace opened (mock).`)} className="focus-ring rounded-xl border border-input px-3.5 py-2 text-[12.5px] font-bold text-slate-700 hover:bg-muted">
              Open
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AppointmentsPage({ session }: { session: { name: string; role: StaffRole } | null }) {
  const dateKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  const today = dateKey(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [patientUhid, setPatientUhid] = useState(patients[0]?.uhid ?? '');
  const [doctorId, setDoctorId] = useState('');
  const [time, setTime] = useState('09:30');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [savedAppointments, setSavedAppointments] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('Sanmaya_appointments') ?? '[]');
      return Array.isArray(parsed) ? parsed as Array<{ doctor: string; patient: string; time: string; token: string; status?: string; date?: string }> : [];
    } catch {
      return [];
    }
  });
  const [doctors] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('Sanmaya_doctors') ?? 'null');
      return Array.isArray(stored) ? stored as Array<{ id: string; name: string; department: string; timings: string }> : [
        { id: 'DR-KARTHIK', name: 'Dr. Karthik Rao', department: 'Cardiology', timings: '09:00-13:00, 16:00-18:00' },
        { id: 'DR-SURESH', name: 'Dr. Suresh Iyer', department: 'General Medicine', timings: '08:30-12:30, 15:00-17:00' },
        { id: 'DR-VIKRAM', name: 'Dr. Vikram Nair', department: 'Orthopaedics', timings: '10:00-14:00' },
        { id: 'DR-ANITHA', name: 'Dr. Anitha Das', department: 'Dermatology', timings: '09:30-14:30' },
      ];
    } catch {
      return [];
    }
  });

  const ownDoctor = useMemo(() => {
    if (session?.role !== 'Doctor') return null;
    const search = session.name.toLowerCase();
    return doctors.find((doctor) => doctor.id.toLowerCase().includes(search) || doctor.name.toLowerCase().includes(search)) ?? null;
  }, [doctors, session]);

  const selectedDoctor = doctors.find((doctor) => doctor.id === doctorId) ?? doctors[0];
  const selectedPatient = patients.find((patient) => patient.uhid === patientUhid);

  const addDays = (date: string, amount: number) => {
    const next = new Date(`${date}T12:00:00`);
    next.setDate(next.getDate() + amount);
    return dateKey(next);
  };

  const moveDate = (amount: number) => setSelectedDate((value) => addDays(value, amount));

  const issueToken = () => {
    if (!selectedDoctor || !selectedPatient) {
      toast.warning('Select a patient and doctor.');
      return;
    }
    const available = selectedDoctor.timings.split(',').some((range) => {
      const [start, end] = range.trim().split('-');
      return start && end && time >= start && time <= end;
    });
    if (!available) {
      toast.error('Outside doctor availability', { description: `${selectedDoctor.name} is scheduled ${selectedDoctor.timings}.` });
      return;
    }
    if (savedAppointments.some((item) => item.doctor === selectedDoctor.id && item.time === time && (item.date ?? today) === selectedDate)) {
      toast.error('That doctor already has an appointment at this time.');
      return;
    }
    const prefix = selectedDoctor.department === 'General Medicine' ? 'GM' : selectedDoctor.department.slice(0, 2).toUpperCase();
    const token = `${prefix}-${String(savedAppointments.filter((item) => item.doctor === selectedDoctor.id && (item.date ?? today) === selectedDate).length + 1).padStart(2, '0')}`;
    const next = [...savedAppointments, { doctor: selectedDoctor.id, patient: selectedPatient.uhid, time, token, status: 'Waiting', date: selectedDate }];
    localStorage.setItem('Sanmaya_appointments', JSON.stringify(next));
    setSavedAppointments(next);
    selectedPatient.doctor = selectedDoctor.name;
    selectedPatient.status = 'Waiting';
    toast.success(`OPD token ${token} issued`, { description: `${selectedPatient.name} queued with ${selectedDoctor.name}.` });
    setBookingOpen(false);
  };

  const liveQueue = savedAppointments.map((item) => {
    const patient = patients.find((entry) => entry.uhid === item.patient);
    const doctor = doctors.find((entry) => entry.id === item.doctor);
    return {
      date: item.date ?? today,
      time: item.time,
      patient: patient?.name ?? item.patient,
      doctor: doctor?.name ?? item.doctor,
      doctorId: item.doctor,
      token: item.token,
      type: 'OPD',
      status: item.status ?? 'Waiting',
    };
  });

  const mockAppointments = appointmentList.map((item) => ({
    ...item,
    date: today,
    doctorId: doctors.find((doctor) => doctor.name === item.doctor)?.id ?? item.doctor,
    status: item.type === 'New' ? 'In consult' : 'Waiting',
  }));
  const displayedAppointments = [
    ...mockAppointments.filter((item) => !liveQueue.some((live) => live.token === item.token)),
    ...liveQueue,
  ];

  const appointmentsForDate = displayedAppointments.filter((item) => item.date === selectedDate);
  const visibleAppointments = appointmentsForDate.filter((item) => {
    if (session?.role === 'Doctor') return ownDoctor ? item.doctorId === ownDoctor.id || item.doctor === ownDoctor.name : false;
    return doctorFilter === 'all' || item.doctorId === doctorFilter || item.doctor === doctorFilter;
  }).sort((a, b) => a.time.localeCompare(b.time));

  const visibleDoctors = session?.role === 'Doctor'
    ? (ownDoctor ? [ownDoctor] : [])
    : doctors;

  const dateLabel = new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const quickDates = [
    { label: 'Yesterday', date: addDays(today, -1) },
    { label: 'Today', date: today },
    { label: 'Tomorrow', date: addDays(today, 1) },
  ];
  const stripDates = Array.from({ length: 7 }, (_, index) => addDays(addDays(selectedDate, -3), index));

  return (
    <div className="mx-auto w-full max-w-[1180px] space-y-4 p-4 lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-extrabold tracking-tight">Appointments</h2>
          <p className="text-[13px] text-muted-foreground">{session?.role === 'Doctor' ? 'Your patient schedule' : 'Hospital-wide doctor schedule and bookings'}</p>
        </div>
        {session?.role !== 'Doctor' && (
          <button onClick={() => setBookingOpen((value) => !value)} className="focus-ring flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-bold text-primary-foreground hover:bg-blue-700">
            <CalendarDays className="h-4 w-4" /> Book appointment
          </button>
        )}
      </div>

      {bookingOpen && session?.role !== 'Doctor' && (
        <div className="card-surface grid gap-3 p-5 md:grid-cols-5">
          <label className="text-xs font-bold text-muted-foreground">Patient
            <select value={patientUhid} onChange={(event) => setPatientUhid(event.target.value)} className="mt-1 w-full rounded-xl border border-input px-3 py-2 text-sm text-foreground">
              {patients.map((patient) => <option key={patient.uhid} value={patient.uhid}>{patient.name} · {patient.uhid}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold text-muted-foreground">Doctor
            <select value={doctorId || selectedDoctor?.id || ''} onChange={(event) => setDoctorId(event.target.value)} className="mt-1 w-full rounded-xl border border-input px-3 py-2 text-sm text-foreground">
              {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold text-muted-foreground">Date
            <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="mt-1 w-full rounded-xl border border-input px-3 py-2 text-sm text-foreground" />
          </label>
          <label className="text-xs font-bold text-muted-foreground">Time
            <input type="time" value={time} onChange={(event) => setTime(event.target.value)} className="mt-1 w-full rounded-xl border border-input px-3 py-2 text-sm text-foreground" />
          </label>
          <button onClick={issueToken} className="mt-auto rounded-xl bg-primary py-2.5 text-sm font-bold text-white">Check & issue token</button>
          {selectedDoctor && <p className="md:col-span-5 text-[11px] text-muted-foreground">Available: {selectedDoctor.timings}</p>}
        </div>
      )}

      <div className="card-surface overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div className="flex items-center gap-1.5">
            {quickDates.map((item) => (
              <button key={item.label} onClick={() => setSelectedDate(item.date)} className={cn('focus-ring rounded-full px-3 py-1.5 text-xs font-bold', selectedDate === item.date ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Previous day" onClick={() => moveDate(-1)} className="grid size-8 place-items-center rounded-lg border border-border hover:bg-muted"><ChevronLeft className="size-4" /></button>
            <p className="min-w-[210px] text-center text-sm font-bold">{dateLabel}</p>
            <button aria-label="Next day" onClick={() => moveDate(1)} className="grid size-8 place-items-center rounded-lg border border-border hover:bg-muted"><ChevronRight className="size-4" /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-border">
          {stripDates.map((date) => {
            const parsed = new Date(`${date}T12:00:00`);
            const count = displayedAppointments.filter((item) => item.date === date).length;
            return (
              <button key={date} onClick={() => setSelectedDate(date)} className={cn('relative border-r border-border px-2 py-3 text-center last:border-r-0 hover:bg-muted/60', selectedDate === date && 'bg-blue-50')}>
                <span className="block text-[10px] font-bold uppercase text-muted-foreground">{parsed.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                <span className={cn('mx-auto mt-1 grid size-8 place-items-center rounded-full text-sm font-extrabold', selectedDate === date && 'bg-primary text-white', date === today && selectedDate !== date && 'text-primary')}>{parsed.getDate()}</span>
                {count > 0 && <span className="mt-1 block text-[10px] font-bold text-muted-foreground">{count} booked</span>}
              </button>
            );
          })}
        </div>

        {session?.role !== 'Doctor' && (
          <div className="flex gap-2 overflow-x-auto border-b border-border px-4 py-3">
            <button onClick={() => setDoctorFilter('all')} className={cn('focus-ring shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold', doctorFilter === 'all' ? 'border-primary bg-primary text-white' : 'border-border bg-white text-slate-600')}>All doctors <span className="ml-1 opacity-75">{appointmentsForDate.length}</span></button>
            {doctors.map((doctor) => {
              const count = appointmentsForDate.filter((item) => item.doctorId === doctor.id || item.doctor === doctor.name).length;
              return (
                <button key={doctor.id} onClick={() => setDoctorFilter(doctor.id)} className={cn('focus-ring shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold', doctorFilter === doctor.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-border bg-white text-slate-600')}>
                  {doctor.name.replace('Dr. ', '')} <span className="ml-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px]">{count}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="min-h-[420px] p-4">
          {visibleDoctors.length > 1 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {visibleDoctors.map((doctor) => {
                const doctorAppointments = visibleAppointments.filter((item) => item.doctorId === doctor.id || item.doctor === doctor.name);
                if (doctorFilter !== 'all' && doctorFilter !== doctor.id) return null;
                return (
                  <section key={doctor.id} className="rounded-2xl border border-border bg-white">
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                      <div><p className="text-sm font-extrabold">{doctor.name}</p><p className="text-[11px] text-muted-foreground">{doctor.department}</p></div>
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-extrabold text-blue-700">{doctorAppointments.length} patients</span>
                    </div>
                    <div className="space-y-2 p-3">
                      {doctorAppointments.map((appointment) => (
                        <article key={appointment.token} className="rounded-xl border-l-4 border-l-blue-500 bg-slate-50 px-3 py-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div><p className="text-sm font-bold">{appointment.patient}</p><p className="text-[11px] text-muted-foreground">{appointment.type ?? 'OPD'} · {appointment.token}</p></div>
                            <span className="text-xs font-extrabold text-slate-700">{appointment.time}</span>
                          </div>
                        </article>
                      ))}
                      {!doctorAppointments.length && <p className="py-8 text-center text-xs text-muted-foreground">No appointments</p>}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-2">
              {visibleAppointments.map((appointment) => (
                <div key={appointment.token} className="flex items-center gap-4 rounded-xl border border-border bg-white px-4 py-3">
                  <span className="w-14 shrink-0 rounded-lg bg-blue-50 px-2 py-1.5 text-center text-xs font-extrabold text-blue-700">{appointment.time}</span>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{appointment.patient}</p><p className="text-[11px] text-muted-foreground">{appointment.type ?? 'OPD'} · {appointment.token}</p></div>
                  <StatusPill value={appointment.status} />
                </div>
              ))}
              {!visibleAppointments.length && <div className="grid min-h-[280px] place-items-center text-sm text-muted-foreground">No appointments scheduled for this day</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ReportsPage() {
  const rows = [
    { label: 'OPD footfall (7d avg)', value: '486 / day', delta: '+6.2%' },
    { label: 'Average waiting time', value: '18 min', delta: '-12%' },
    { label: 'Bed occupancy rate', value: '76%', delta: '+3 pts' },
    { label: 'Avg. length of stay', value: '4.1 days', delta: '-0.4 d' },
    { label: 'Lab turnaround (TAT)', value: '2.4 h', delta: '-18%' },
    { label: 'Pharmacy dispensing time', value: '7 min', delta: '-9%' },
    { label: 'Collection efficiency', value: '94.2%', delta: '+1.1 pts' },
    { label: 'Discharge turnaround', value: '3.2 h', delta: '-22%' },
  ];
  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-5 p-4 lg:p-6">
      <div>
        <h2 className="text-[20px] font-extrabold tracking-tight">Operations dashboard</h2>
        <p className="text-[13px] text-muted-foreground">Hospital administration — volumes, utilization and turnaround metrics.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((r) => (
          <div key={r.label} className="card-surface p-5">
            <p className="text-[12px] font-semibold text-muted-foreground">{r.label}</p>
            <p className="mt-1.5 text-[22px] font-extrabold tracking-tight">{r.value}</p>
            <p className="mt-1 flex items-center gap-1 text-[11.5px] font-bold text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" /> {r.delta}
            </p>
          </div>
        ))}
      </div>
      <div className="card-surface p-5">
        <div className="flex items-center gap-2">
          <HandMetal className="h-4 w-4 text-amber-500" />
          <p className="text-[13.5px] font-semibold">Operational alerts</p>
        </div>
        <ul className="mt-3 space-y-2 text-[13px] text-slate-600">
          <li>· ICU occupancy at 75% — 1 escalation pending bed assignment.</li>
          <li>· Troponin-T analyzer QC due today before 2 PM.</li>
          <li>· 3 discharge summaries awaiting consultant sign-off (&gt; 4 h).</li>
        </ul>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const [toggles, setToggles] = useState({ abdm: true, sms: true, whatsapp: true, audit: true, mfa: false });
  const items = [
    { key: 'abdm' as const, label: 'ABDM integration (sandbox)', desc: 'ABHA creation, verification and care-context linking at registration.' },
    { key: 'sms' as const, label: 'SMS reminders', desc: 'Appointment, report-ready and discharge notifications.' },
    { key: 'whatsapp' as const, label: 'WhatsApp notifications', desc: 'Prescription and bill sharing with patient consent.' },
    { key: 'audit' as const, label: 'Clinical audit trail', desc: 'Immutable log of record access, amendments and sign-offs.' },
    { key: 'mfa' as const, label: 'MFA for privileged roles', desc: 'Required for administrators and record-merge authorization.' },
  ];
  return (
    <div className="mx-auto w-full max-w-[760px] space-y-5 p-4 lg:p-6">
      <div>
        <h2 className="text-[20px] font-extrabold tracking-tight">Settings</h2>
        <p className="text-[13px] text-muted-foreground">Facility-level configuration — backend enforces these regardless of UI state.</p>
      </div>
      <div className="card-surface divide-y divide-border/60">
        {items.map((it) => (
          <div key={it.key} className="flex items-center gap-4 px-5 py-4">
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold">{it.label}</p>
              <p className="text-[12px] text-muted-foreground">{it.desc}</p>
            </div>
            <button
              role="switch"
              aria-checked={toggles[it.key]}
              aria-label={it.label}
              onClick={() => {
                setToggles((t) => ({ ...t, [it.key]: !t[it.key] }));
                toast.success(`${it.label} ${toggles[it.key] ? 'disabled' : 'enabled'} (mock).`);
              }}
              className={cn('focus-ring relative h-6 w-11 shrink-0 rounded-full transition-colors', toggles[it.key] ? 'bg-primary' : 'bg-slate-300')}
            >
              <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', toggles[it.key] ? 'left-[22px]' : 'left-0.5')} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
