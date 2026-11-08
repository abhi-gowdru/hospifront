import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BadgeCheck,
  BedDouble,
  FileText,
  FlaskConical,
  HeartPulse,
  Image as ImageIcon,
  Plus,
  Printer,
  Receipt,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { emrPatient, previousVisits } from '@/data/mock';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MedRow {
  id: number;
  name: string;
  dose: string;
  when: string;
  duration: string;
}

const templates: Record<string, MedRow[]> = {
  'Cardiology: Chest pain follow-up': [
    { id: 1, name: 'ASPIRIN 75 MG', dose: '1-0-0', when: 'After food', duration: '30 Day(s)' },
    { id: 2, name: 'ATORVASTATIN 20 MG', dose: '0-0-1', when: 'After dinner', duration: '30 Day(s)' },
  ],
  'Hypertension review': [
    { id: 1, name: 'TELMISARTAN 40 MG', dose: '1-0-0', when: 'After breakfast', duration: '30 Day(s)' },
    { id: 2, name: 'AMLODIPINE 5 MG', dose: '0-0-1', when: 'After dinner', duration: '30 Day(s)' },
  ],
  'Diabetes review': [
    { id: 1, name: 'METFORMIN 500 MG', dose: '1-0-1', when: 'After food', duration: '90 Day(s)' },
  ],
};

const medCatalog = [
  'ASPIRIN 75 MG', 'ATORVASTATIN 20 MG', 'TELMISARTAN 40 MG', 'AMLODIPINE 5 MG',
  'METFORMIN 500 MG', 'PANTOPRAZOLE 40 MG', 'AMOXICILLIN 500 MG', 'METOPROLOL 25 MG',
  'CLOPIDOGREL 75 MG', 'LEVETIRACETAM 500 MG', 'PARACETAMOL 650 MG', 'AZITHROMYCIN 500 MG',
];

const testCatalog = ['LIPID PROFILE', 'HBA1C', 'TROPONIN-T', 'ECG', 'CBC', 'ECHO 2D', 'TFT', 'CHEST X-RAY'];

const tabs = ['Summary', 'Vitals', 'Complaints', 'Rx', 'Investigation', 'Follow Up'] as const;

let rowId = 100;

export default function EmrConsult() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Rx');
  const [template, setTemplate] = useState('Cardiology: Chest pain follow-up');
  const [meds, setMeds] = useState<MedRow[]>(templates['Cardiology: Chest pain follow-up']);
  const [tests, setTests] = useState<string[]>(['LIPID PROFILE', 'HBA1C', 'TROPONIN-T', 'ECG']);
  const [medQuery, setMedQuery] = useState('');
  const [testQuery, setTestQuery] = useState('');
  const [ordersSent, setOrdersSent] = useState(false);
  const [savedAt, setSavedAt] = useState('10:42 AM');
  const [vitals, setVitals] = useState({ bp: '148/92', pulse: '96', spo2: '97', weight: '68', temp: '98.4' });
  const [complaints, setComplaints] = useState('Chest pain on exertion · 2 days');
  const [notes, setNotes] = useState('Exertional chest pain, no radiation. ECG today: sinus rhythm. Continue statin, add anti-platelet. Review with Troponin-T report.');
  const [followUp, setFollowUp] = useState('15 Nov 2026');
  const dirtyRef = useRef(false);

  // Simulated auto-save
  useEffect(() => {
    const t = setInterval(() => {
      if (dirtyRef.current) {
        dirtyRef.current = false;
        const now = new Date();
        setSavedAt(now.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }));
      }
    }, 15000);
    return () => clearInterval(t);
  }, []);

  const markDirty = () => {
    dirtyRef.current = true;
    setOrdersSent(false);
  };

  const applyTemplate = (name: string) => {
    setTemplate(name);
    setMeds(templates[name].map((m) => ({ ...m, id: ++rowId })));
    markDirty();
  };

  const addMed = (name: string) => {
    setMeds((m) => [...m, { id: ++rowId, name, dose: '1-0-1', when: 'After food', duration: '5 Day(s)' }]);
    setMedQuery('');
    markDirty();
  };

  const medSuggestions = useMemo(
    () => medCatalog.filter((m) => medQuery && m.toLowerCase().includes(medQuery.toLowerCase()) && !meds.some((r) => r.name === m)).slice(0, 5),
    [medQuery, meds],
  );
  const testSuggestions = useMemo(
    () => testCatalog.filter((t) => testQuery && t.toLowerCase().includes(testQuery.toLowerCase()) && !tests.includes(t)).slice(0, 5),
    [testQuery, tests],
  );

  const handleSave = (print: boolean) => {
    setOrdersSent(true);
    dirtyRef.current = false;
    const now = new Date();
    setSavedAt(now.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }));
    toast.success(print ? 'Consultation saved · printing prescription' : 'Consultation saved', {
      description: `Orders sent to lab and pharmacy for UHID ${emrPatient.uhid}.`,
      action: print ? { label: 'View', onClick: () => toast.info('Prescription preview opened (mock).') } : undefined,
    });
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] p-4 lg:p-6">
      {/* Patient header strip */}
      <div className="card-surface flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="relative grid h-12 w-12 place-items-center rounded-full bg-fuchsia-700 text-lg font-extrabold text-white">
            L
            <HeartPulse className="absolute -bottom-1 -right-1 h-4.5 w-4.5 rounded-full bg-card p-0.5 text-rose-500" />
          </span>
          <div>
            <p className="text-[16px] font-extrabold tracking-tight">
              {emrPatient.name} <span className="ml-1 text-[13px] font-semibold text-muted-foreground">· {emrPatient.age}Y {emrPatient.sex}</span>
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="rounded-md bg-accent px-2 py-0.5 font-mono text-[11px] font-bold text-accent-foreground">UHID {emrPatient.uhid}</span>
              <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                ABHA <BadgeCheck className="h-3 w-3" />
              </span>
              <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-slate-600">Token {emrPatient.token}</span>
            </div>
          </div>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2.5">
          <p className="mr-2 hidden text-[13px] font-medium text-muted-foreground lg:block">
            {emrPatient.doctor} · {emrPatient.department}
          </p>
          <button
            onClick={() => toast.info('Admission request created', { description: 'Sent to IPD desk for bed allocation.' })}
            className="focus-ring flex items-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-50 px-3.5 py-2 text-[13px] font-bold text-emerald-700 hover:bg-emerald-100"
          >
            <BedDouble className="h-4 w-4" /> Admit
          </button>
          <button
            onClick={() => toast.info('Bill initiated', { description: 'Consultation charge added to UHID 2000855.' })}
            className="focus-ring flex items-center gap-1.5 rounded-xl border border-input px-3.5 py-2 text-[13px] font-bold text-slate-700 hover:bg-muted"
          >
            <Receipt className="h-4 w-4" /> Bill
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Main encounter workspace */}
        <div className="card-surface p-5 xl:col-span-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
            <p>
              <span className="font-bold text-rose-600">{emrPatient.visitType}</span>
              <span className="mx-1.5 text-slate-300">/</span>
              <span className="font-bold text-teal-600">{emrPatient.stage}</span>
              <span className="ml-3 font-medium text-muted-foreground">{emrPatient.datetime}</span>
              <span className="ml-2 rounded-md bg-accent px-2 py-0.5 text-[11px] font-bold text-accent-foreground">{emrPatient.tag}</span>
            </p>
            <div className="ml-auto flex items-center gap-2">
              <label htmlFor="template" className="flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">T</span>
                Template
              </label>
              <select
                id="template"
                value={template}
                onChange={(e) => applyTemplate(e.target.value)}
                className="focus-ring h-9 rounded-xl border border-primary/40 bg-card px-3 text-[13px] font-semibold text-primary"
              >
                {Object.keys(templates).map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex flex-wrap gap-1.5" role="tablist" aria-label="Encounter sections">
            {tabs.map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={activeTab === t}
                onClick={() => setActiveTab(t)}
                className={cn(
                  'focus-ring rounded-xl px-4 py-2 text-[13px] font-semibold transition-colors',
                  activeTab === t ? 'bg-accent text-primary ring-1 ring-primary/40' : 'text-slate-600 ring-1 ring-inset ring-input hover:bg-muted',
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Vitals + complaints banner (always visible, like Healthray) */}
          <div className="mt-4 rounded-xl border border-rose-200/70 bg-rose-50/70 px-4 py-2.5 text-[13px]">
            <span className="font-bold text-rose-900">
              VITALS: BP <span className="text-rose-600">{vitals.bp} ↑</span> · Pulse {vitals.pulse} · SpO₂ {vitals.spo2}% · Wt {vitals.weight} kg
            </span>
            <span className="ml-4 font-semibold text-rose-900/80">COMPLAINTS: {complaints}</span>
          </div>

          {/* Tab panels */}
          <div className="mt-4">
            {activeTab === 'Rx' && (
              <section aria-label="Prescription">
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-bold">Rx <span className="text-[12px] font-medium text-muted-foreground">from template</span></h3>
                  <button onClick={() => setActiveTab('Summary')} className="focus-ring text-[12.5px] font-semibold text-primary hover:underline">
                    Previous Rx
                  </button>
                </div>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[560px]">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="th-cell w-8">#</th>
                        <th className="th-cell">Medicine</th>
                        <th className="th-cell w-28">Dose</th>
                        <th className="th-cell w-32">When</th>
                        <th className="th-cell w-28">Duration</th>
                        <th className="th-cell w-10" />
                      </tr>
                    </thead>
                    <tbody>
                      {meds.map((m, i) => (
                        <tr key={m.id} className="border-b border-border/60 last:border-0">
                          <td className="td-cell text-slate-400">{i + 1}</td>
                          <td className="td-cell font-bold tracking-wide">
                            {m.name} <span className="text-[11px] font-medium text-slate-400">tab</span>
                          </td>
                          {(['dose', 'when', 'duration'] as const).map((f) => (
                            <td key={f} className="td-cell">
                              <input
                                value={m[f]}
                                onChange={(e) => {
                                  markDirty();
                                  setMeds((rows) => rows.map((r) => (r.id === m.id ? { ...r, [f]: e.target.value } : r)));
                                }}
                                aria-label={`${f} for ${m.name}`}
                                className="focus-ring w-full rounded-lg border border-input bg-muted/40 px-2.5 py-1.5 text-[12.5px] font-medium"
                              />
                            </td>
                          ))}
                          <td className="td-cell">
                            <button
                              onClick={() => {
                                markDirty();
                                setMeds((rows) => rows.filter((r) => r.id !== m.id));
                              }}
                              aria-label={`Remove ${m.name}`}
                              className="focus-ring grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td className="td-cell text-slate-400">{meds.length + 1}</td>
                        <td className="td-cell" colSpan={5}>
                          <div className="relative max-w-sm">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                            <input
                              value={medQuery}
                              onChange={(e) => setMedQuery(e.target.value)}
                              placeholder="Search medicine…"
                              aria-label="Search and add medicine"
                              className="focus-ring w-full rounded-lg border border-dashed border-input bg-card py-2 pl-9 pr-3 text-[13px]"
                            />
                            {medSuggestions.length > 0 && (
                              <div className="absolute left-0 right-0 top-11 z-30 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                                {medSuggestions.map((s) => (
                                  <button key={s} onClick={() => addMed(s)} className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-[13px] font-medium hover:bg-muted">
                                    <Plus className="h-3.5 w-3.5 text-primary" /> {s} <span className="text-[11px] text-slate-400">tab</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <h3 className="text-[15px] font-bold">Investigation</h3>
                  <div className="relative">
                    <input
                      value={testQuery}
                      onChange={(e) => setTestQuery(e.target.value)}
                      placeholder="+ Add test"
                      aria-label="Search and add investigation"
                      className="focus-ring w-40 rounded-lg border border-input px-3 py-1.5 text-[12.5px] font-semibold text-primary placeholder:text-primary"
                    />
                    {testSuggestions.length > 0 && (
                      <div className="absolute right-0 top-10 z-30 w-48 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                        {testSuggestions.map((s) => (
                          <button
                            key={s}
                            onClick={() => {
                              setTests((t) => [...t, s]);
                              setTestQuery('');
                              markDirty();
                            }}
                            className="w-full px-3.5 py-2 text-left text-[12.5px] font-semibold hover:bg-muted"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tests.map((t) => (
                    <span key={t} className="flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-[12px] font-bold text-rose-700">
                      {t}
                      <button
                        onClick={() => {
                          setTests((x) => x.filter((y) => y !== t));
                          markDirty();
                        }}
                        aria-label={`Remove ${t}`}
                        className="focus-ring rounded-full text-rose-400 hover:text-rose-700"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                  {tests.length === 0 && <p className="text-[13px] text-muted-foreground">No investigations ordered.</p>}
                </div>

                {ordersSent && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-800" role="status">
                    <BadgeCheck className="h-4 w-4 text-emerald-600" />
                    Orders sent to lab and pharmacy · just now
                  </div>
                )}
              </section>
            )}

            {activeTab === 'Vitals' && (
              <section aria-label="Vitals" className="grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-3">
                {(
                  [
                    ['BP (mmHg)', 'bp'], ['Pulse (bpm)', 'pulse'], ['SpO₂ (%)', 'spo2'], ['Weight (kg)', 'weight'], ['Temp (°F)', 'temp'],
                  ] as const
                ).map(([label, key]) => (
                  <label key={key} className="block">
                    <span className="text-[12px] font-semibold text-muted-foreground">{label}</span>
                    <input
                      value={vitals[key]}
                      onChange={(e) => {
                        markDirty();
                        setVitals((v) => ({ ...v, [key]: e.target.value }));
                      }}
                      className="focus-ring mt-1 w-full rounded-xl border border-input px-3 py-2.5 text-[15px] font-bold tabular-nums"
                    />
                  </label>
                ))}
              </section>
            )}

            {activeTab === 'Complaints' && (
              <section aria-label="Complaints" className="max-w-2xl">
                <label className="block">
                  <span className="text-[12px] font-semibold text-muted-foreground">Presenting complaints</span>
                  <textarea
                    value={complaints}
                    onChange={(e) => {
                      markDirty();
                      setComplaints(e.target.value);
                    }}
                    rows={3}
                    className="focus-ring mt-1 w-full rounded-xl border border-input px-3 py-2.5 text-[14px]"
                  />
                </label>
                <label className="mt-4 block">
                  <span className="text-[12px] font-semibold text-muted-foreground">Clinical notes</span>
                  <textarea
                    value={notes}
                    onChange={(e) => {
                      markDirty();
                      setNotes(e.target.value);
                    }}
                    rows={4}
                    className="focus-ring mt-1 w-full rounded-xl border border-input px-3 py-2.5 text-[14px]"
                  />
                </label>
              </section>
            )}

            {activeTab === 'Summary' && (
              <section aria-label="Visit summary" className="max-w-2xl space-y-3 text-[14px]">
                <div className="rounded-xl border border-border p-4">
                  <p className="text-[12px] font-bold uppercase tracking-wide text-muted-foreground">Assessment</p>
                  <p className="mt-1">Exertional angina — stable. Known hypertensive and diabetic, on treatment.</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="text-[12px] font-bold uppercase tracking-wide text-muted-foreground">Allergies</p>
                  <p className="mt-1">{emrPatient.allergies.join(', ')}</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="text-[12px] font-bold uppercase tracking-wide text-muted-foreground">Plan</p>
                  <p className="mt-1">{notes}</p>
                </div>
              </section>
            )}

            {activeTab === 'Investigation' && (
              <section aria-label="Investigation results" className="max-w-2xl space-y-3">
                {[
                  { name: 'Troponin-T', status: 'Sample collected', eta: '45 min', lab: true },
                  { name: 'Lipid Profile', status: 'Processing', eta: '2 h', lab: true },
                  { name: 'HbA1c', status: 'Processing', eta: '3 h', lab: true },
                  { name: 'ECG', status: 'Reported', eta: 'Done', lab: false },
                ].map((r) => (
                  <div key={r.name} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                    <div className="flex items-center gap-3">
                      {r.lab ? <FlaskConical className="h-4 w-4 text-indigo-500" /> : <ImageIcon className="h-4 w-4 text-teal-600" />}
                      <p className="text-[14px] font-semibold">{r.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] text-muted-foreground">{r.eta}</span>
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-inset',
                          r.status === 'Reported' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/25' : 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
                        )}
                      >
                        {r.status}
                      </span>
                    </div>
                  </div>
                ))}
                <p className="text-[12.5px] text-muted-foreground">Results appear in the chart automatically when the lab validates them.</p>
              </section>
            )}

            {activeTab === 'Follow Up' && (
              <section aria-label="Follow up" className="max-w-md">
                <label className="block">
                  <span className="text-[12px] font-semibold text-muted-foreground">Next review date</span>
                  <input
                    value={followUp}
                    onChange={(e) => {
                      markDirty();
                      setFollowUp(e.target.value);
                    }}
                    className="focus-ring mt-1 w-full rounded-xl border border-input px-3 py-2.5 text-[14px] font-semibold"
                  />
                </label>
                <p className="mt-2 text-[12.5px] text-muted-foreground">An SMS/WhatsApp reminder goes to the patient two days before the visit.</p>
              </section>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <p className="text-[12.5px] text-muted-foreground">
              Follow-up: {followUp} · Auto-saved {savedAt}
            </p>
            <div className="ml-auto flex gap-2.5">
              <button
                onClick={() => handleSave(false)}
                className="focus-ring flex items-center gap-2 rounded-xl border border-input px-4 py-2.5 text-[13px] font-bold text-slate-700 hover:bg-muted"
              >
                <Save className="h-4 w-4" /> Save
              </button>
              <button
                onClick={() => handleSave(true)}
                className="focus-ring flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-[13px] font-bold text-primary-foreground shadow-sm hover:bg-blue-700 active:bg-blue-800"
              >
                <Printer className="h-4 w-4" /> Save &amp; Print
              </button>
            </div>
          </div>
        </div>

        {/* Previous visits rail */}
        <aside className="card-surface h-fit p-5">
          <div className="flex items-baseline justify-between">
            <h3 className="text-[15px] font-bold">Previous visits</h3>
            <span className="text-[12px] font-medium text-muted-foreground">3 of 9</span>
          </div>
          <ol className="mt-4 space-y-5">
            {previousVisits.map((v) => (
              <li key={v.date} className="border-b border-border/60 pb-5 last:border-0 last:pb-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[13px] font-bold">{v.date}</p>
                  <p className="text-[12px] text-muted-foreground">{v.doctor}</p>
                </div>
                <p className="mt-0.5 text-[13.5px] font-semibold text-primary">{v.title}</p>
                <p className="mt-0.5 text-[12.5px] text-slate-600">
                  {v.highlight ? (
                    <>
                      {v.summary.split(v.highlight)[0]}
                      <span className="font-bold text-amber-600">{v.highlight}</span>
                      {v.summary.split(v.highlight)[1]}
                    </>
                  ) : (
                    v.summary
                  )}
                </p>
                {v.attachment?.kind === 'ecg' && (
                  <div className="mt-2 overflow-hidden rounded-lg border border-rose-100 bg-rose-50/60 p-2">
                    <svg viewBox="0 0 200 40" className="h-10 w-full text-rose-600" aria-label="ECG trace thumbnail">
                      <path
                        d="M0 22h18l3-8 4 16 4-22 4 14h12l2-4 3 4h20l3-9 4 18 4-24 5 15h14l2-3 2 3h22l3-8 4 16 4-20 4 13h14l2-4 3 4h26"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                      />
                    </svg>
                  </div>
                )}
                {v.attachment && (
                  <button
                    onClick={() => toast.info(`${v.attachment!.name} opened (mock attachment).`)}
                    className="focus-ring mt-2 flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:underline"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    {v.attachment.name} <span className="font-normal text-muted-foreground">· {v.attachment.size}</span>
                  </button>
                )}
              </li>
            ))}
          </ol>
          <button
            onClick={() => toast.info('Full longitudinal chart opens here (mock).')}
            className="focus-ring mt-4 w-full text-center text-[13px] font-bold text-primary hover:underline"
          >
            View all 9 visits
          </button>
        </aside>
      </div>
    </div>
  );
}
