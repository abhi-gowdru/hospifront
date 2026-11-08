import { Fragment, useState } from 'react';
import { Clock3, Plus, Stethoscope, UserRound } from 'lucide-react';
import { patients, type Patient } from '@/data/mock';
import { toast } from 'sonner';

interface Doctor {
  id: string;
  name: string;
  department: string;
  timings: string;
  slots: number;
}

const initialDoctors: Doctor[] = [
  { id: 'DR-KARTHIK', name: 'Dr. Karthik Rao', department: 'Cardiology', timings: '09:00-13:00, 16:00-18:00', slots: 12 },
  { id: 'DR-SURESH', name: 'Dr. Suresh Iyer', department: 'General Medicine', timings: '08:30-12:30, 15:00-17:00', slots: 16 },
  { id: 'DR-VIKRAM', name: 'Dr. Vikram Nair', department: 'Orthopaedics', timings: '10:00-14:00', slots: 10 },
];

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

export function DoctorsPage({ onOpenPatient }: { onOpenPatient?: (uhid: string) => void }) {
  const [doctors, setDoctors] = useState<Doctor[]>(() => readStorage('Sanmaya_doctors', initialDoctors));
  const [selected, setSelected] = useState(initialDoctors[0].id);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: '', department: '', timings: '' });
  const [appointment, setAppointment] = useState({ patientUhid: patients[0]?.uhid ?? '', time: '09:30' });
  const [queue, setQueue] = useState(() => readStorage<Array<{ doctor: string; patient: string; time: string; token?: string; status?: string }>>('Sanmaya_appointments', []));

  const saveDoctors = (next: Doctor[]) => {
    setDoctors(next);
    localStorage.setItem('Sanmaya_doctors', JSON.stringify(next));
  };

  const doctor = doctors.find((item) => item.id === selected) ?? doctors[0];
  const patient = patients.find((item) => item.uhid === appointment.patientUhid);
  const selectedQueue = queue
    .filter((item) => item.doctor === doctor?.id)
    .sort((a, b) => a.time.localeCompare(b.time));

  const isWithinDoctorAvailability = (timings: string, time: string) => {
    if (!timings || !time) return false;
    return timings.split(',').some((range) => {
      const [start, end] = range.trim().split('-').map((value) => value.trim());
      return Boolean(start && end && time >= start && time <= end);
    });
  };

  const submitDoctor = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim() || !draft.department.trim() || !draft.timings.trim()) {
      toast.warning('Enter doctor name, department, and scheduled timings.');
      return;
    }
    const next = [...doctors, {
      id: `DR-${Date.now()}`,
      name: draft.name.trim(),
      department: draft.department.trim(),
      timings: draft.timings.trim(),
      slots: 8,
    }];
    saveDoctors(next);
    setDraft({ name: '', department: '', timings: '' });
    setAdding(false);
    toast.success('Doctor schedule added.');
  };

  const bookAppointment = () => {
    if (!doctor || !patient) return;
    if (!isWithinDoctorAvailability(doctor.timings, appointment.time)) {
      toast.error('Outside doctor availability', { description: `${doctor.name} is scheduled ${doctor.timings}.` });
      return;
    }
    const appointments = readStorage<Array<{ doctor: string; patient: string; time: string; token: string; status: string }>>('Sanmaya_appointments', []);
    const conflict = appointments.find((item) => item.doctor === doctor.id && item.time === appointment.time);
    if (conflict) {
      toast.error('This appointment slot is already booked.', { description: `${doctor.name} is unavailable at ${appointment.time}.` });
      return;
    }
    const prefix = doctor.department === 'General Medicine' ? 'GM' : doctor.department.slice(0, 2).toUpperCase();
    const departmentQueue = appointments.filter((item) => item.doctor === doctor.id);
    const token = `${prefix}-${String(departmentQueue.length + 1).padStart(2, '0')}`;
    const next = [...appointments, { doctor: doctor.id, patient: patient.uhid, time: appointment.time, token, status: 'Waiting' }];
    localStorage.setItem('Sanmaya_appointments', JSON.stringify(next));
    setQueue(next);
    patient.doctor = doctor.name;
    try {
      const stored = JSON.parse(localStorage.getItem('Sanmaya_registered_patients') ?? '[]') as Patient[];
      localStorage.setItem(
        'Sanmaya_registered_patients',
        JSON.stringify(stored.map((item) => item.uhid === patient.uhid ? { ...item, doctor: doctor.name } : item)),
      );
    } catch {
      // The in-memory appointment remains available for this demo session.
    }
    toast.success('Appointment booked', { description: `Token issued for ${patient.name} with ${doctor.name} at ${appointment.time}.` });
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-5 p-4 lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold">Doctors & schedules</h2>
          <p className="text-sm text-muted-foreground">Assign appointments only within published doctor availability.</p>
        </div>
        <button onClick={() => setAdding((value) => !value)} className="focus-ring flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white">
          <Plus className="h-4 w-4" /> Add doctor
        </button>
      </div>

      {adding && (
        <form onSubmit={submitDoctor} className="card-surface grid gap-3 p-5 sm:grid-cols-3">
          {[
            ['Doctor name', 'name'],
            ['Department', 'department'],
            ['Timings', 'timings'],
          ].map(([label, key]) => (
            <label key={key} className="text-xs font-bold text-muted-foreground">
              {label}
              <input
                value={draft[key as keyof typeof draft]}
                onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
                className="focus-ring mt-1 w-full rounded-xl border border-input px-3 py-2 text-sm text-foreground"
              />
            </label>
          ))}
          <button className="sm:col-span-3 rounded-xl bg-primary py-2.5 text-sm font-bold text-white">Save doctor schedule</button>
        </form>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {doctors.map((item) => (
            <button key={item.id} onClick={() => setSelected(item.id)} className={`card-surface p-4 text-left ${selected === item.id ? 'ring-2 ring-primary' : ''}`}>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-primary"><Stethoscope className="h-5 w-5" /></span>
              <p className="mt-3 font-bold">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.department}</p>
              <p className="mt-3 flex items-center gap-1 text-xs font-semibold"><Clock3 className="h-3.5 w-3.5" /> {item.timings}</p>
            </button>
          ))}
        </div>

        <div className="card-surface h-fit p-5">
          <h3 className="font-bold">Book appointment</h3>
          <label className="mt-4 block text-xs font-bold text-muted-foreground">
            Patient
            <select value={appointment.patientUhid} onChange={(event) => setAppointment({ ...appointment, patientUhid: event.target.value })} className="mt-1 w-full rounded-xl border border-input px-3 py-2 text-sm text-foreground">
              {patients.map((item) => <option key={item.uhid} value={item.uhid}>{item.name} · {item.uhid}</option>)}
            </select>
          </label>
          <label className="mt-3 block text-xs font-bold text-muted-foreground">
            Time
            <input type="time" value={appointment.time} onChange={(event) => setAppointment({ ...appointment, time: event.target.value })} className="mt-1 w-full rounded-xl border border-input px-3 py-2 text-sm text-foreground" />
          </label>
          <button onClick={bookAppointment} className="mt-4 w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white">Check & book</button>
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="font-bold">OPD queue — {doctor?.name}</h3>
            <p className="text-xs text-muted-foreground">{selectedQueue.filter((item) => item.status !== 'Completed').length} patient(s) waiting or in consultation</p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-primary">{selectedQueue.length} booked</span>
        </div>
        <div className="divide-y divide-border/60">
          {selectedQueue.map((item, index) => {
            const queuedPatient = patients.find((entry) => entry.uhid === item.patient);
            const status = item.status ?? 'Waiting';
            return (
              <div key={`${item.patient}-${item.time}-${index}`} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                <span className="w-14 rounded-lg bg-muted px-2 py-1.5 text-center text-xs font-bold">{item.time}</span>
                <span className="min-w-16 rounded-lg bg-primary/10 px-2 py-1 text-center font-mono text-xs font-bold text-primary">{item.token ?? 'GM-' + (index + 1)}</span>
                <div className="min-w-[180px] flex-1">
                  <p className="text-sm font-bold">{queuedPatient?.name ?? item.patient}</p>
                  <p className="text-xs text-muted-foreground">UHID {item.patient}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${status === 'In consult' ? 'bg-amber-100 text-amber-700' : status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-primary'}`}>{status}</span>
                <button
                  type="button"
                  disabled={status === 'Completed'}
                  onClick={() => {
                    const next = queue.map((entry) =>
                      entry.doctor === item.doctor && entry.patient === item.patient && entry.time === item.time
                        ? { ...entry, status: entry.status === 'In consult' ? 'Completed' : 'In consult' }
                        : entry,
                    );
                    localStorage.setItem('Sanmaya_appointments', JSON.stringify(next));
                    setQueue(next);
                    if (status === 'Waiting' && onOpenPatient && queuedPatient) onOpenPatient(queuedPatient.uhid);
                    else toast.success(status === 'In consult' ? 'Visit marked complete.' : 'Patient called to consultation.');
                  }}
                  className="focus-ring rounded-lg border border-border px-3 py-2 text-xs font-bold hover:bg-muted disabled:opacity-50"
                >
                  {status === 'Waiting' ? 'Call next' : status === 'In consult' ? 'Complete' : 'Completed'}
                </button>
              </div>
            );
          })}
          {!selectedQueue.length && <p className="p-8 text-center text-sm text-muted-foreground">No OPD appointments in this doctor queue.</p>}
        </div>
      </div>
    </div>
  );
}

export function OTPage() {
  const rooms = ['OT-1', 'OT-2', 'OT-3'];
  const times = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
  const [selected, setSelected] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Record<string, string>>(() => readStorage('Sanmaya_ot_bookings', {}));

  const toggleBooking = (slot: string) => {
    if (selected && bookings[slot]) {
      toast.error('OT slot unavailable', { description: `${slot} is already scheduled.` });
      return;
    }
    const next = { ...bookings };
    if (next[slot]) delete next[slot];
    else next[slot] = 'Procedure pending';
    setBookings(next);
    localStorage.setItem('Sanmaya_ot_bookings', JSON.stringify(next));
    toast.success(next[slot] ? 'OT slot scheduled.' : 'OT slot released.');
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-5 p-4 lg:p-6">
      <div>
        <h2 className="text-xl font-extrabold">Operation Theatre calendar</h2>
        <p className="text-sm text-muted-foreground">Book against surgeon, anesthesia team, OT room, and time availability.</p>
      </div>
      <div className="card-surface overflow-x-auto p-5">
        <div className="grid min-w-[700px] grid-cols-7 gap-2">
          <div />
          {times.map((time) => <div key={time} className="text-center text-xs font-bold text-muted-foreground">{time}</div>)}
          {rooms.map((room) => (
            <Fragment key={room}>
              <div key={`${room}-label`} className="flex items-center text-sm font-bold">{room}</div>
              {times.map((time) => {
                const slot = `${room}-${time}`;
                const booked = bookings[slot];
                return (
                  <button key={slot} onClick={() => { setSelected(slot); toggleBooking(slot); }} className={`min-h-16 rounded-xl border p-2 text-xs font-bold ${booked ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:ring-2 hover:ring-primary'}`}>
                    {booked ? 'Booked' : 'Available'}
                  </button>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

export function NurseManagementPage() {
  const [nurses, setNurses] = useState(() => readStorage<{ name: string; shift: string; ward: string }[]>('Sanmaya_nurses', [
    { name: 'Nurse Anita', shift: 'Shift A · 06:00-14:00', ward: 'General Ward' },
    { name: 'Nurse Meera', shift: 'Shift B · 14:00-22:00', ward: 'ICU' },
  ]));
  const [done, setDone] = useState<string[]>(() => readStorage('Sanmaya_nursing_tasks', []));
  const [draft, setDraft] = useState({ name: '', shift: '', ward: '' });

  const saveNurses = (next: typeof nurses) => {
    setNurses(next);
    localStorage.setItem('Sanmaya_nurses', JSON.stringify(next));
  };

  const chartTask = (id: string, label: string) => {
    const next = done.includes(id) ? done.filter((item) => item !== id) : [...done, id];
    setDone(next);
    localStorage.setItem('Sanmaya_nursing_tasks', JSON.stringify(next));
    toast.success(done.includes(id) ? 'Task unmarked.' : `${label} charted with timestamp.`);
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-5 p-4 lg:p-6">
      <div>
        <h2 className="text-xl font-extrabold">Nurse management</h2>
        <p className="text-sm text-muted-foreground">Register nurses, manage rotational shifts, and chart patient care.</p>
      </div>
      <form onSubmit={(event) => {
        event.preventDefault();
        if (!draft.name || !draft.shift || !draft.ward) return toast.warning('Complete all nurse fields.');
        saveNurses([...nurses, draft]);
        setDraft({ name: '', shift: '', ward: '' });
        toast.success('Nurse registered.');
      }} className="card-surface grid gap-3 p-5 md:grid-cols-4">
        <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Nurse name" className="rounded-xl border border-input px-3 py-2 text-sm" />
        <input value={draft.shift} onChange={(e) => setDraft({ ...draft, shift: e.target.value })} placeholder="Shift timing" className="rounded-xl border border-input px-3 py-2 text-sm" />
        <input value={draft.ward} onChange={(e) => setDraft({ ...draft, ward: e.target.value })} placeholder="Ward" className="rounded-xl border border-input px-3 py-2 text-sm" />
        <button className="rounded-xl bg-primary text-sm font-bold text-white">Register nurse</button>
      </form>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-surface p-5">
          <h3 className="font-bold">Rotational roster</h3>
          <div className="mt-3 divide-y divide-border">
            {nurses.map((nurse, index) => (
              <div key={`${nurse.name}-${index}`} className="flex items-center gap-3 py-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-teal-50 text-teal-700"><UserRound className="h-4 w-4" /></span>
                <div className="flex-1"><p className="text-sm font-bold">{nurse.name}</p><p className="text-xs text-muted-foreground">{nurse.ward} · {nurse.shift}</p></div>
                <button onClick={() => {
                  if (nurses.length < 2) return toast.warning('Register another nurse to perform a shift swap.');
                  const next = nurses.map((item) => ({ ...item }));
                  const partnerIndex = index === 0 ? 1 : index - 1;
                  const currentShift = next[index].shift;
                  next[index].shift = next[partnerIndex].shift;
                  next[partnerIndex].shift = currentShift;
                  saveNurses(next);
                  toast.success('Shift swap applied', { description: 'Approved by senior nurse workflow.' });
                }} className="rounded-lg border border-input px-3 py-1.5 text-xs font-bold">Swap shift</button>
              </div>
            ))}
          </div>
        </div>
        <div className="card-surface p-5">
          <h3 className="font-bold">Medication & patient care tasks</h3>
          {[
            ['MAR-1', 'Ravi Shankar · 09:00 · Metoprolol 25 mg'],
            ['MAR-2', 'Arjun Pillai · 09:30 · Vitals monitoring'],
            ['MAR-3', 'Meena Sundaram · 10:00 · Dressing change'],
          ].map(([id, label]) => (
            <div key={id} className="mt-3 flex items-center gap-3 rounded-xl border border-border px-3 py-3">
              <div className="flex-1 text-sm font-semibold">{label}</div>
              <button onClick={() => chartTask(id, label)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${done.includes(id) ? 'bg-emerald-50 text-emerald-700' : 'bg-primary text-white'}`}>
                {done.includes(id) ? 'Charted' : 'Chart'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
