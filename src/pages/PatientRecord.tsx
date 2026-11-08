import { BadgeCheck, CalendarDays, HeartPulse, Hospital, Stethoscope } from 'lucide-react';
import { patients } from '@/data/mock';
import type { StaffRole } from '@/pages/Login';
import { StatusPill } from '@/components/StatusPill';

export default function PatientRecord({
  uhid,
  session,
  onNavigate,
}: {
  uhid: string;
  session: { name: string; role: StaffRole } | null;
  onNavigate: (id: string) => void;
}) {
  const patient = patients.find((item) => item.uhid === uhid);

  if (!patient) {
    return (
      <div className="mx-auto max-w-[700px] p-6">
        <div className="card-surface p-8 text-center">
          <p className="text-lg font-extrabold text-slate-900">Patient not found</p>
          <p className="mt-2 text-sm text-muted-foreground">UHID {uhid} is not available in this session.</p>
        </div>
      </div>
    );
  }

  const canClinical = session?.role === 'Doctor' || session?.role === 'Admin';
  const isAdmitted = patient.status === 'Admitted';

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-4 p-4 lg:p-6">
      <div className="card-surface overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-primary">Patient Record</p>
            <h1 className="mt-1 text-xl font-extrabold text-slate-900">{patient.name}</h1>
            <p className="mt-1 text-[12px] text-muted-foreground">UHID {patient.uhid} · {patient.age} years · {patient.sex}</p>
          </div>
          <StatusPill value={patient.status} />
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['Mobile', patient.mobile],
            ['Department', patient.department],
            ['Assigned Doctor', patient.doctor],
            ['Blood Group', patient.bloodGroup || 'Not recorded'],
            ['Date of Birth', patient.dateOfBirth || 'Not recorded'],
            ['Aadhaar', patient.aadhaar || 'Not recorded'],
            ['ABHA', patient.abha || 'Not linked'],
            ['Address', patient.address || 'Not recorded'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border bg-muted/20 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
              <p className="mt-1 break-words text-[13px] font-semibold text-slate-700">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card-surface p-5">
        <h2 className="text-[15px] font-bold text-slate-900">Next action</h2>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Choose the appropriate hospital workflow. Clinical work is kept separate from patient registration.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {canClinical && (
            <button type="button" onClick={() => onNavigate(isAdmitted ? 'ipd' : 'opd')} className="focus-ring flex items-center gap-3 rounded-xl border border-border p-4 text-left hover:border-blue-300 hover:bg-blue-50/40">
              <Stethoscope className="h-5 w-5 text-primary" />
              <span>
                <span className="block text-[13px] font-bold">{isAdmitted ? 'Inpatient Visit' : 'Start OPD Visit'}</span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground">Vitals, notes, orders and follow-up</span>
              </span>
            </button>
          )}
          {(session?.role === 'Reception' || session?.role === 'Admin') && (
            <button type="button" onClick={() => onNavigate('calendar')} className="focus-ring flex items-center gap-3 rounded-xl border border-border p-4 text-left hover:border-blue-300 hover:bg-blue-50/40">
              <CalendarDays className="h-5 w-5 text-primary" />
              <span>
                <span className="block text-[13px] font-bold">Appointments</span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground">Book against a doctor schedule</span>
              </span>
            </button>
          )}
          {(session?.role === 'Nurse' || session?.role === 'Doctor' || session?.role === 'Admin') && (
            <button type="button" onClick={() => onNavigate('nursing')} className="focus-ring flex items-center gap-3 rounded-xl border border-border p-4 text-left hover:border-blue-300 hover:bg-blue-50/40">
              <HeartPulse className="h-5 w-5 text-primary" />
              <span>
                <span className="block text-[13px] font-bold">Nursing Care</span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground">Medication and care chart</span>
              </span>
            </button>
          )}
          <button type="button" onClick={() => onNavigate('ipd')} className="focus-ring flex items-center gap-3 rounded-xl border border-border p-4 text-left hover:border-blue-300 hover:bg-blue-50/40">
            <Hospital className="h-5 w-5 text-primary" />
            <span>
              <span className="block text-[13px] font-bold">Inpatient Status</span>
              <span className="mt-0.5 block text-[11px] text-muted-foreground">Beds, admission and discharge</span>
            </span>
          </button>
        </div>
      </div>

      {patient.abha && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[12px] font-semibold text-emerald-700">
          <BadgeCheck className="h-4 w-4" /> ABHA identity is linked to this patient record
        </div>
      )}
    </div>
  );
}
