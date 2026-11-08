import { useState } from 'react';
import { BadgeCheck, ChevronLeft, ChevronRight, Eye, Link2, Plus, Search, UserPlus } from 'lucide-react';
import { patients, saveRegisteredPatient, type Patient } from '@/data/mock';
import { StatusPill } from '@/components/StatusPill';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Registration({ onOpenPatient }: { onOpenPatient: (uhid: string) => void }) {
  const [q, setQ] = useState('');
  const [form, setForm] = useState({
    name: '',
    age: '',
    sex: 'M',
    mobile: '',
    abha: '',
    address: '',
    dateOfBirth: '',
    email: '',
    aadhaar: '',
    bloodGroup: '',
    maritalStatus: '',
    occupation: '',
    guardianName: '',
    guardianRelation: '',
    emergencyName: '',
    emergencyMobile: '',
  });
  const [abhaState, setAbhaState] = useState<'idle' | 'checking' | 'verified'>('idle');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const results = q
    ? patients.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.uhid.includes(q))
    : patients;
  const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedResults = results.slice((safePage - 1) * pageSize, safePage * pageSize);

  const verifyAbha = () => {
    if (!form.abha.trim()) {
      toast.warning('Enter an ABHA number or mobile to verify.');
      return;
    }
    const abhaDigits = form.abha.replace(/\D/g, '');
    if (abhaDigits.length !== 14 && abhaDigits.length !== 10 && abhaDigits.length !== 12) {
      setErrors((current) => ({ ...current, abha: 'Enter a valid 14-digit ABHA, 12-digit Aadhaar, or 10-digit mobile.' }));
      toast.warning('Invalid ABHA details.');
      return;
    }
    setErrors((current) => {
      const next = { ...current };
      delete next.abha;
      return next;
    });
    setAbhaState('checking');
    setTimeout(() => {
      setAbhaState('verified');
      toast.success('ABHA verified (sandbox)', { description: 'Demographics matched via ABDM sandbox OTP flow.' });
    }, 1200);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = 'Patient name is required.';
    if (!form.mobile.trim()) {
      nextErrors.mobile = 'Mobile number is required.';
    } else {
      const mobileDigits = form.mobile.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
      if (!/^[6-9]\d{9}$/.test(mobileDigits)) nextErrors.mobile = 'Enter a valid 10-digit Indian mobile number.';
    }
    const aadhaarDigits = form.aadhaar.replace(/\D/g, '');
    if (aadhaarDigits && aadhaarDigits.length !== 12) {
      nextErrors.aadhaar = 'Aadhaar must contain exactly 12 digits.';
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (form.age.trim()) {
      const age = Number(form.age);
      if (!/^\d+$/.test(form.age) || age < 0 || age > 120) nextErrors.age = 'Enter an age from 0 to 120.';
    }
    if (form.dateOfBirth) {
      const dob = new Date(`${form.dateOfBirth}T00:00:00`);
      if (Number.isNaN(dob.getTime()) || dob > new Date()) nextErrors.dateOfBirth = 'Date of birth cannot be in the future.';
    }
    if (form.emergencyMobile.trim()) {
      const emergencyDigits = form.emergencyMobile.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
      if (!/^[6-9]\d{9}$/.test(emergencyDigits)) nextErrors.emergencyMobile = 'Enter a valid 10-digit mobile number.';
    }
    if (form.guardianName.trim() && !form.guardianRelation.trim()) {
      nextErrors.guardianRelation = 'Add the guardian relationship.';
    }
    if (form.emergencyName.trim() && !form.emergencyMobile.trim()) {
      nextErrors.emergencyMobile = 'Add the emergency mobile number.';
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      toast.warning('Please correct the highlighted fields.');
      return;
    }
    const duplicate = patients.find(
      (patient) =>
        patient.mobile.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '') === form.mobile.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '') ||
        patient.name.toLowerCase() === form.name.trim().toLowerCase() ||
        (aadhaarDigits && patient.aadhaar?.replace(/\D/g, '') === aadhaarDigits),
    );
    if (duplicate) {
      toast.error('Possible duplicate patient found', {
        description: `${duplicate.name} already has UHID ${duplicate.uhid}.`,
      });
      return;
    }

    const uhid = String(Math.max(...patients.map((patient) => Number(patient.uhid) || 0)) + 1);
    const patient = {
      uhid,
      name: form.name.trim(),
      age: Number(form.age) || 0,
      sex: (form.sex === 'F' ? 'F' : form.sex === 'O' ? 'O' : 'M') as 'M' | 'F' | 'O',
      mobile: form.mobile.trim(),
      department: 'General Medicine',
      doctor: 'Assignment pending',
      status: 'Waiting' as const,
      abha: abhaState === 'verified' && form.abha ? form.abha : undefined,
      token: `G-${String((patients.length % 20) + 11).padStart(2, '0')}`,
      dateOfBirth: form.dateOfBirth || undefined,
      email: form.email.trim() || undefined,
      aadhaar: aadhaarDigits ? aadhaarDigits.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : undefined,
      bloodGroup: form.bloodGroup || undefined,
      maritalStatus: form.maritalStatus || undefined,
      occupation: form.occupation.trim() || undefined,
      address: form.address.trim() || undefined,
      guardianName: form.guardianName.trim() || undefined,
      guardianRelation: form.guardianRelation.trim() || undefined,
      emergencyName: form.emergencyName.trim() || undefined,
      emergencyMobile: form.emergencyMobile.trim() || undefined,
    };
    saveRegisteredPatient(patient);
    toast.success('Patient registered', {
      description: `UHID ${uhid} issued for ${patient.name}.`,
    });
    setForm({
      name: '',
      age: '',
      sex: 'M',
      mobile: '',
      abha: '',
      address: '',
      dateOfBirth: '',
      email: '',
      aadhaar: '',
      bloodGroup: '',
      maritalStatus: '',
      occupation: '',
      guardianName: '',
      guardianRelation: '',
      emergencyName: '',
      emergencyMobile: '',
    });
    setAbhaState('idle');
    setErrors({});
    setShowRegistration(false);
  };

  const field = (label: string, node: React.ReactNode, error?: string) => (
    <label className="block">
      <span className="text-[12px] font-semibold text-muted-foreground">{label}</span>
      <div className="mt-1">{node}</div>
      {error && <span className="mt-1 block text-[11px] font-semibold text-rose-600">{error}</span>}
    </label>
  );

  const clearError = (key: string) => {
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const input =
    'focus-ring w-full rounded-xl border border-input px-3 py-2.5 text-[14px] placeholder:text-slate-400';

  return (
    <div className="mx-auto w-full max-w-[1400px] p-4 lg:p-6">
      {/* Lookup */}
      <div className="card-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-[16px] font-bold">Patient Management</h2>
            <p className="text-xs text-muted-foreground">Search, view, and manage registered patients.</p>
          </div>
          <button type="button" onClick={() => setShowRegistration(true)} className="focus-ring flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2.5 text-[13px] font-bold text-primary-foreground">
            <Plus className="h-4 w-4" /> Add Patient
          </button>
        </div>
        <div className="p-5">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search by name, UHID or mobile" className={`${input} pl-10`} aria-label="Search patients" />
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="th-cell">UHID</th>
                  <th className="th-cell">Patient</th>
                  <th className="th-cell">Mobile</th>
                  <th className="th-cell">Department</th>
                  <th className="th-cell">Status</th>
                  <th className="th-cell text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedResults.map((p) => (
                  <tr key={p.uhid} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                    <td className="td-cell font-mono text-[12.5px] text-slate-500">{p.uhid}</td>
                    <td className="td-cell">
                      <span className="font-semibold">{p.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{p.age}{p.sex}</span>
                    </td>
                    <td className="td-cell text-slate-600">{p.mobile}</td>
                    <td className="td-cell text-slate-600">{p.department}</td>
                    <td className="td-cell"><StatusPill value={p.status} /></td>
                    <td className="td-cell text-right">
                      <button type="button" onClick={() => setSelectedPatient(p)} className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[12px] font-bold hover:bg-muted">
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-[12px] text-muted-foreground">
              Showing {results.length ? (safePage - 1) * pageSize + 1 : 0}-{Math.min(safePage * pageSize, results.length)} of {results.length}
            </p>
            <div className="flex items-center gap-2">
              <button type="button" disabled={safePage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="focus-ring rounded-lg border border-border p-2 disabled:opacity-40" aria-label="Previous page">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-[12px] font-bold">Page {safePage} of {totalPages}</span>
              <button type="button" disabled={safePage === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="focus-ring rounded-lg border border-border p-2 disabled:opacity-40" aria-label="Next page">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* New registration */}
      <Dialog open={showRegistration} onOpenChange={setShowRegistration}>
        <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
      <form onSubmit={submit} className="card-surface h-fit lg:col-span-2">
        <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
          <UserPlus className="h-4.5 w-4.5 text-primary" />
          <div>
            <h2 className="text-[16px] font-bold">Add Patient</h2>
            <p className="text-xs text-muted-foreground">UHID is issued automatically on save.</p>
          </div>
        </div>
        <div className="space-y-4 p-5">
          {field(
            'Full name *',
            <input
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                clearError('name');
              }}
              placeholder="e.g. Lakshmi Narayanan"
              className={`${input} ${errors.name ? 'border-rose-400' : ''}`}
              aria-invalid={Boolean(errors.name)}
              maxLength={80}
            />,
            errors.name,
          )}
          <div className="grid grid-cols-2 gap-3">
            {field(
              'Age',
              <input
                value={form.age}
                onChange={(e) => {
                  setForm({ ...form, age: e.target.value.replace(/\D/g, '').slice(0, 3) });
                  clearError('age');
                }}
                placeholder="54"
                inputMode="numeric"
                className={`${input} ${errors.age ? 'border-rose-400' : ''}`}
                aria-invalid={Boolean(errors.age)}
              />,
              errors.age,
            )}
            {field(
              'Sex',
              <select value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })} className={input}>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>,
            )}
          </div>
          {field(
            'Mobile *',
            <input
              value={form.mobile}
              onChange={(e) => {
                setForm({ ...form, mobile: e.target.value });
                clearError('mobile');
              }}
              placeholder="+91 …"
              inputMode="tel"
              className={`${input} ${errors.mobile ? 'border-rose-400' : ''}`}
              aria-invalid={Boolean(errors.mobile)}
              maxLength={18}
            />,
            errors.mobile,
          )}
          {field(
            'Address',
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Area, city"
              className={input}
              maxLength={200}
            />,
          )}

          <details className="rounded-xl border border-border bg-muted/20">
            <summary className="cursor-pointer select-none rounded-xl px-4 py-3 text-[13px] font-bold text-slate-700">
              Add more information <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
            </summary>
            <div className="grid grid-cols-1 gap-3 border-t border-border p-4 sm:grid-cols-2">
              {field(
                'Date of birth',
                <input
                  value={form.dateOfBirth}
                  onChange={(e) => {
                    setForm({ ...form, dateOfBirth: e.target.value });
                    clearError('dateOfBirth');
                  }}
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  className={`${input} ${errors.dateOfBirth ? 'border-rose-400' : ''}`}
                  aria-invalid={Boolean(errors.dateOfBirth)}
                />,
                errors.dateOfBirth,
              )}
              {field(
                'Blood group',
                <select value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} className={input}>
                  <option value="">Select</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => <option key={group}>{group}</option>)}
                </select>,
              )}
              {field(
                'Email address',
                <input
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    clearError('email');
                  }}
                  type="email"
                  placeholder="patient@example.com"
                  className={`${input} ${errors.email ? 'border-rose-400' : ''}`}
                  aria-invalid={Boolean(errors.email)}
                  maxLength={120}
                />,
                errors.email,
              )}
              {field(
                'Marital status',
                <select value={form.maritalStatus} onChange={(e) => setForm({ ...form, maritalStatus: e.target.value })} className={input}>
                  <option value="">Select</option>
                  <option>Single</option>
                  <option>Married</option>
                  <option>Widowed</option>
                  <option>Divorced</option>
                  <option>Prefer not to say</option>
                </select>,
              )}
              {field('Occupation', <input value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} placeholder="Occupation" className={input} />)}
              {field(
                'Aadhaar number',
                <input
                  value={form.aadhaar}
                  onChange={(e) => {
                    setForm({ ...form, aadhaar: e.target.value.replace(/[^\d ]/g, '').slice(0, 14) });
                    clearError('aadhaar');
                  }}
                  inputMode="numeric"
                  placeholder="XXXX XXXX XXXX"
                  className={`${input} ${errors.aadhaar ? 'border-rose-400' : ''}`}
                  autoComplete="off"
                  aria-invalid={Boolean(errors.aadhaar)}
                />,
                errors.aadhaar,
              )}

              <div className="sm:col-span-2">
                <p className="mb-2 text-[12px] font-bold text-slate-600">Guardian / emergency contact</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {field('Guardian name', <input value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} placeholder="Full name" className={input} />)}
                  {field(
                    'Relationship',
                    <input
                      value={form.guardianRelation}
                      onChange={(e) => {
                        setForm({ ...form, guardianRelation: e.target.value });
                        clearError('guardianRelation');
                      }}
                      placeholder="e.g. Spouse"
                      className={`${input} ${errors.guardianRelation ? 'border-rose-400' : ''}`}
                      aria-invalid={Boolean(errors.guardianRelation)}
                    />,
                    errors.guardianRelation,
                  )}
                  {field('Emergency contact name', <input value={form.emergencyName} onChange={(e) => setForm({ ...form, emergencyName: e.target.value })} placeholder="Contact person" className={input} />)}
                  {field(
                    'Emergency mobile',
                    <input
                      value={form.emergencyMobile}
                      onChange={(e) => {
                        setForm({ ...form, emergencyMobile: e.target.value });
                        clearError('emergencyMobile');
                      }}
                      inputMode="tel"
                      placeholder="+91 …"
                      className={`${input} ${errors.emergencyMobile ? 'border-rose-400' : ''}`}
                      aria-invalid={Boolean(errors.emergencyMobile)}
                      maxLength={18}
                    />,
                    errors.emergencyMobile,
                  )}
                </div>
              </div>
              <p className="sm:col-span-2 text-[11px] leading-4 text-muted-foreground">
                These details are optional. Aadhaar information is sensitive; collect it only with patient consent and applicable hospital privacy policies.
              </p>
            </div>
          </details>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
            <p className="flex items-center gap-1.5 text-[12.5px] font-bold text-emerald-800">
              <Link2 className="h-3.5 w-3.5" /> ABHA linking (ABDM sandbox)
            </p>
            <div className="mt-2 flex gap-2">
              <input
                value={form.abha}
                onChange={(e) => {
                  setForm({ ...form, abha: e.target.value });
                  setAbhaState('idle');
                  clearError('abha');
                }}
                placeholder="ABHA number or linked mobile"
                className={`focus-ring w-full rounded-xl border bg-card px-3 py-2 text-[13px] ${errors.abha ? 'border-rose-400' : 'border-emerald-300/70'}`}
                aria-invalid={Boolean(errors.abha)}
              />
              <button
                type="button"
                onClick={verifyAbha}
                disabled={abhaState === 'checking'}
                className="focus-ring shrink-0 rounded-xl bg-emerald-600 px-3.5 py-2 text-[12.5px] font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {abhaState === 'checking' ? 'Verifying…' : 'Verify'}
              </button>
            </div>
            {errors.abha && <p className="mt-2 text-[11px] font-semibold text-rose-600">{errors.abha}</p>}
            {abhaState === 'verified' && (
              <p className="mt-2 flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700" role="status">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified · will link to the new UHID
              </p>
            )}
          </div>

          <button type="submit" className="focus-ring w-full rounded-xl bg-primary py-3 text-[14px] font-bold text-primary-foreground shadow-sm hover:bg-blue-700 active:bg-blue-800">
            Register &amp; issue UHID
          </button>
          <p className="text-center text-[11.5px] text-muted-foreground">Consent capture and identity documents follow in the admission step.</p>
        </div>
      </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedPatient)} onOpenChange={(open) => { if (!open) setSelectedPatient(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>Complete profile for the selected UHID.</DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <div className="grid grid-cols-1 gap-3 text-[13px] sm:grid-cols-2">
              {[
                ['UHID', selectedPatient.uhid],
                ['Name', selectedPatient.name],
                ['Age / Sex', `${selectedPatient.age} / ${selectedPatient.sex}`],
                ['Mobile', selectedPatient.mobile],
                ['Department', selectedPatient.department],
                ['Assigned Doctor', selectedPatient.doctor],
                ['Status', selectedPatient.status],
                ['Address', selectedPatient.address || '—'],
                ['Date of Birth', selectedPatient.dateOfBirth || '—'],
                ['Blood Group', selectedPatient.bloodGroup || '—'],
                ['Email', selectedPatient.email || '—'],
                ['Aadhaar', selectedPatient.aadhaar || '—'],
                ['Marital Status', selectedPatient.maritalStatus || '—'],
                ['Occupation', selectedPatient.occupation || '—'],
                ['Guardian', selectedPatient.guardianName || '—'],
                ['Emergency Contact', selectedPatient.emergencyMobile || selectedPatient.emergencyName || '—'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-border p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
                  <p className="mt-1 break-words font-semibold text-slate-700">{value}</p>
                </div>
              ))}
              <div className="sm:col-span-2 flex justify-end">
                <button type="button" onClick={() => { onOpenPatient(selectedPatient.uhid); setSelectedPatient(null); }} className="focus-ring rounded-lg bg-primary px-3 py-2 text-[12px] font-bold text-primary-foreground">
                  Open Patient Record
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
