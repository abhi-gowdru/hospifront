export type PatientStatus =
  | 'In consult'
  | 'Waiting'
  | 'Admitted'
  | 'Billing'
  | 'Discharged'
  | 'Report ready';

export interface Patient {
  uhid: string;
  name: string;
  age: number;
  sex: 'M' | 'F' | 'O';
  mobile: string;
  department: string;
  doctor: string;
  status: PatientStatus;
  abha?: string;
  token?: string;
  dateOfBirth?: string;
  email?: string;
  aadhaar?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  occupation?: string;
  address?: string;
  guardianName?: string;
  guardianRelation?: string;
  emergencyName?: string;
  emergencyMobile?: string;
}

export const patients: Patient[] = [
  { uhid: '2000851', name: 'Ravi Shankar', age: 46, sex: 'M', mobile: '+91 98200 41011', department: 'General Medicine', doctor: 'Dr. Suresh Iyer', status: 'In consult', abha: '91-4822-1903-4417', token: 'G-11' },
  { uhid: '2000848', name: 'Meena Sundaram', age: 38, sex: 'F', mobile: '+91 98410 22345', department: 'Orthopaedics', doctor: 'Dr. Vikram Nair', status: 'Waiting', token: 'O-07' },
  { uhid: '2000846', name: 'Arjun Pillai', age: 61, sex: 'M', mobile: '+91 98840 90213', department: 'Cardiology', doctor: 'Dr. Karthik Rao', status: 'Admitted', abha: '91-7710-3345-9021', token: 'C-04' },
  { uhid: '2000843', name: 'Kavya Reddy', age: 29, sex: 'F', mobile: '+91 97001 88234', department: 'Obstetrics', doctor: 'Dr. Priya Raman', status: 'Billing', token: 'OB-02' },
  { uhid: '2000839', name: 'Suresh Babu', age: 54, sex: 'M', mobile: '+91 99481 77650', department: 'Neurology', doctor: 'Dr. Ramesh Kumar', status: 'Discharged' },
  { uhid: '2000836', name: 'Divya Menon', age: 33, sex: 'F', mobile: '+91 98950 11209', department: 'Dermatology', doctor: 'Dr. Anitha Das', status: 'Report ready', abha: '91-5566-7812-0934', token: 'D-05' },
  { uhid: '2000832', name: 'Ganesh Murthy', age: 67, sex: 'M', mobile: '+91 94440 67321', department: 'ENT', doctor: 'Dr. Sanjay Rao', status: 'Waiting', token: 'E-03' },
  { uhid: '2000830', name: 'Priya Krishnan', age: 41, sex: 'F', mobile: '+91 98415 90876', department: 'General Medicine', doctor: 'Dr. Suresh Iyer', status: 'In consult', token: 'G-12' },
];

export function loadRegisteredPatients() {
  const stored = localStorage.getItem('Sanmaya_registered_patients');
  if (!stored) return;
  try {
    const registered = JSON.parse(stored) as Patient[];
    for (const patient of registered) {
      if (!patients.some((item) => item.uhid === patient.uhid)) patients.unshift(patient);
    }
  } catch {
    localStorage.removeItem('Sanmaya_registered_patients');
  }
}

export function saveRegisteredPatient(patient: Patient) {
  const stored = localStorage.getItem('Sanmaya_registered_patients');
  let registered: Patient[] = [];
  if (stored) {
    try {
      registered = JSON.parse(stored) as Patient[];
    } catch {
      localStorage.removeItem('Sanmaya_registered_patients');
    }
  }
  localStorage.setItem(
    'Sanmaya_registered_patients',
    JSON.stringify([patient, ...registered.filter((item) => item.uhid !== patient.uhid)]),
  );
  patients.unshift(patient);
}

export interface Ward {
  name: string;
  occupied: number;
  total: number;
}

export const wards: Ward[] = [
  { name: 'General ward', occupied: 48, total: 60 },
  { name: 'Twin sharing', occupied: 14, total: 20 },
  { name: 'Private rooms', occupied: 22, total: 30 },
  { name: 'ICU', occupied: 9, total: 12 },
  { name: 'CCU', occupied: 6, total: 8 },
];

export type BedState =
  | 'Available'
  | 'Reserved'
  | 'Occupied'
  | 'Discharge pending'
  | 'Cleaning'
  | 'Maintenance'
  | 'Blocked'
  | 'Isolation';

export interface Bed {
  id: string;
  room: string;
  state: BedState;
  patient?: string;
  doctor?: string;
  since?: string;
  notes?: string;
}

const mk = (wardPrefix: string, room: string, n: number, states: BedState[], startIdx: number): Bed[] =>
  Array.from({ length: n }, (_, i) => {
    const idx = (startIdx + i) % states.length;
    const state = states[idx];
    const occupiedLike = state === 'Occupied' || state === 'Discharge pending' || state === 'Isolation';
    return {
      id: `${wardPrefix}-${room}${String(i + 1).padStart(2, '0')}`,
      room,
      state,
      patient: occupiedLike ? ['R. Iyer', 'S. Nair', 'A. Khan', 'M. Das', 'P. Rao', 'V. Menon'][idx % 6] : undefined,
      doctor: occupiedLike ? ['Dr. Iyer', 'Dr. Rao', 'Dr. Nair'][idx % 3] : undefined,
      since: occupiedLike ? `${2 + (idx % 6)}d` : undefined,
    };
  });

const seq: BedState[] = ['Occupied', 'Available', 'Occupied', 'Cleaning', 'Occupied', 'Available', 'Discharge pending', 'Available', 'Occupied', 'Maintenance', 'Occupied', 'Available'];

export interface BedWard {
  name: string;
  category: string;
  beds: Bed[];
}

export const bedBoard: BedWard[] = [
  { name: 'General Ward A', category: 'General', beds: [...mk('GA', '101', 6, seq, 0), ...mk('GA', '102', 6, seq, 3), ...mk('GA', '103', 6, seq, 6)] },
  { name: 'Twin Sharing B', category: 'Twin', beds: [...mk('TB', '201', 4, seq, 2), ...mk('TB', '202', 4, seq, 7)] },
  { name: 'Private Wing C', category: 'Private', beds: [...mk('PC', '301', 3, seq, 1), ...mk('PC', '302', 3, seq, 5)] },
  { name: 'ICU', category: 'Critical', beds: mk('ICU', 'ICU', 8, ['Occupied', 'Occupied', 'Available', 'Occupied', 'Isolation', 'Occupied', 'Occupied', 'Blocked'], 0) },
];

export interface PreviousVisit {
  date: string;
  doctor: string;
  title: string;
  summary: string;
  highlight?: string;
  attachment?: { name: string; size: string; kind: 'pdf' | 'ecg' | 'lab' };
}

export const emrPatient = {
  name: 'Mrs. Lakshmi Narayanan',
  age: 54,
  sex: 'F' as const,
  uhid: '2000855',
  abha: '91-4822-1903-5566',
  token: 'C-14',
  doctor: 'Dr. Karthik Rao',
  department: 'Cardiology',
  visitType: 'Walk-In',
  stage: 'Engaged',
  datetime: '08 Nov 2026 · 10:30 AM',
  tag: 'Follow-up',
  vitals: { bp: '148/92', bpFlag: true, pulse: '96', spo2: '97%', weight: '68 kg', temp: '98.4°F' },
  complaints: 'Chest pain on exertion · 2 days',
  allergies: ['Sulfa drugs'],
};

export const previousVisits: PreviousVisit[] = [
  { date: '12 Aug 2026', doctor: 'Dr. Karthik Rao', title: 'Hypertension review', summary: 'BP 152/94 · Telmisartan 40 mg started', attachment: { name: 'Rx_12Aug.pdf', size: '180 KB', kind: 'pdf' } },
  { date: '04 May 2026', doctor: 'Dr. Karthik Rao', title: 'Chest pain · ECG', summary: 'Sinus rhythm, no acute ST changes', attachment: { name: 'ECG_04May.jpg', size: '412 KB', kind: 'ecg' } },
  { date: '18 Jan 2026', doctor: 'Dr. Meera Iyer', title: 'Diabetes review', summary: 'HbA1c 7.9% · Metformin 500 mg BD', highlight: '7.9%', attachment: { name: 'HbA1c_report.pdf', size: '220 KB', kind: 'lab' } },
];

export interface LabOrder {
  id: string;
  patient: string;
  uhid: string;
  test: string;
  doctor: string;
  priority: 'Routine' | 'Urgent' | 'STAT';
  stage: 'Ordered' | 'Sample collected' | 'Processing' | 'Validation' | 'Reported';
  eta: string;
}

export const labOrders: LabOrder[] = [
  { id: 'LAB-9021', patient: 'Lakshmi Narayanan', uhid: '2000855', test: 'Lipid Profile', doctor: 'Dr. Karthik Rao', priority: 'Routine', stage: 'Processing', eta: '2h' },
  { id: 'LAB-9022', patient: 'Lakshmi Narayanan', uhid: '2000855', test: 'HbA1c', doctor: 'Dr. Karthik Rao', priority: 'Routine', stage: 'Processing', eta: '3h' },
  { id: 'LAB-9023', patient: 'Lakshmi Narayanan', uhid: '2000855', test: 'Troponin-T', doctor: 'Dr. Karthik Rao', priority: 'STAT', stage: 'Sample collected', eta: '45m' },
  { id: 'LAB-9024', patient: 'Arjun Pillai', uhid: '2000846', test: 'CBC + ESR', doctor: 'Dr. Karthik Rao', priority: 'Urgent', stage: 'Validation', eta: '20m' },
  { id: 'LAB-9018', patient: 'Meena Sundaram', uhid: '2000848', test: 'X-Ray Knee (AP/Lat)', doctor: 'Dr. Vikram Nair', priority: 'Routine', stage: 'Ordered', eta: '4h' },
  { id: 'LAB-9015', patient: 'Divya Menon', uhid: '2000836', test: 'Skin scraping KOH', doctor: 'Dr. Anitha Das', priority: 'Routine', stage: 'Reported', eta: 'Done' },
  { id: 'LAB-9011', patient: 'Ganesh Murthy', uhid: '2000832', test: 'Audiometry', doctor: 'Dr. Sanjay Rao', priority: 'Routine', stage: 'Ordered', eta: '5h' },
];

export interface RxQueueItem {
  id: string;
  patient: string;
  uhid: string;
  doctor: string;
  items: { name: string; dose: string; qty: number }[];
  stage: 'Pending verification' | 'Verified' | 'Dispensing' | 'Dispensed' | 'Partially dispensed';
  amount: number;
}

export const rxQueue: RxQueueItem[] = [
  {
    id: 'RX-5521', patient: 'Lakshmi Narayanan', uhid: '2000855', doctor: 'Dr. Karthik Rao', stage: 'Pending verification',
    items: [
      { name: 'ASPIRIN 75 MG tab', dose: '1-0-0 · After food', qty: 30 },
      { name: 'ATORVASTATIN 20 MG tab', dose: '0-0-1 · After dinner', qty: 30 },
    ],
    amount: 214,
  },
  {
    id: 'RX-5518', patient: 'Ravi Shankar', uhid: '2000851', doctor: 'Dr. Suresh Iyer', stage: 'Verified',
    items: [
      { name: 'PANTOPRAZOLE 40 MG tab', dose: '1-0-0 · Before food', qty: 14 },
      { name: 'AMOXICILLIN 500 MG cap', dose: '1-1-1 · After food', qty: 21 },
    ],
    amount: 386,
  },
  {
    id: 'RX-5512', patient: 'Arjun Pillai', uhid: '2000846', doctor: 'Dr. Karthik Rao', stage: 'Dispensing',
    items: [
      { name: 'METOPROLOL 25 MG tab', dose: '1-0-1', qty: 60 },
      { name: 'CLOPIDOGREL 75 MG tab', dose: '0-1-0', qty: 30 },
      { name: 'INSULIN GLARGINE 100IU', dose: '10U HS', qty: 1 },
    ],
    amount: 1148,
  },
  {
    id: 'RX-5507', patient: 'Kavya Reddy', uhid: '2000843', doctor: 'Dr. Priya Raman', stage: 'Dispensed',
    items: [
      { name: 'FERROUS ASCORBATE tab', dose: '1-0-0', qty: 30 },
      { name: 'FOLIC ACID 5 MG tab', dose: '1-0-0', qty: 30 },
    ],
    amount: 245,
  },
  {
    id: 'RX-5501', patient: 'Suresh Babu', uhid: '2000839', doctor: 'Dr. Ramesh Kumar', stage: 'Partially dispensed',
    items: [
      { name: 'LEVETIRACETAM 500 MG tab', dose: '1-0-1', qty: 60 },
      { name: 'VITAMIN D3 60K cap', dose: 'Weekly', qty: 4 },
    ],
    amount: 692,
  },
];

export interface Invoice {
  id: string;
  patient: string;
  uhid: string;
  department: string;
  items: number;
  amount: number;
  paid: number;
  status: 'Paid' | 'Partial' | 'Pending' | 'Refunded';
  mode: 'Cash' | 'UPI' | 'Card' | 'Insurance / TPA';
}

export const invoices: Invoice[] = [
  { id: 'INV-2026-1042', patient: 'Kavya Reddy', uhid: '2000843', department: 'Obstetrics', items: 9, amount: 48250, paid: 20000, status: 'Partial', mode: 'Insurance / TPA' },
  { id: 'INV-2026-1041', patient: 'Suresh Babu', uhid: '2000839', department: 'Neurology', items: 14, amount: 86400, paid: 86400, status: 'Paid', mode: 'UPI' },
  { id: 'INV-2026-1039', patient: 'Ravi Shankar', uhid: '2000851', department: 'General Medicine', items: 4, amount: 1850, paid: 1850, status: 'Paid', mode: 'Cash' },
  { id: 'INV-2026-1037', patient: 'Divya Menon', uhid: '2000836', department: 'Dermatology', items: 3, amount: 1240, paid: 0, status: 'Pending', mode: 'Card' },
  { id: 'INV-2026-1034', patient: 'Ganesh Murthy', uhid: '2000832', department: 'ENT', items: 5, amount: 9800, paid: 5000, status: 'Partial', mode: 'UPI' },
  { id: 'INV-2026-1029', patient: 'Anil Kapoor', uhid: '2000819', department: 'Orthopaedics', items: 7, amount: 23500, paid: 23500, status: 'Refunded', mode: 'Card' },
];

export const appointmentList = [
  { time: '09:00', patient: 'Ravi Shankar', type: 'New', doctor: 'Dr. Suresh Iyer', token: 'G-11' },
  { time: '09:20', patient: 'Priya Krishnan', type: 'Follow-up', doctor: 'Dr. Suresh Iyer', token: 'G-12' },
  { time: '09:40', patient: 'Meena Sundaram', type: 'New', doctor: 'Dr. Vikram Nair', token: 'O-07' },
  { time: '10:00', patient: 'Lakshmi Narayanan', type: 'Follow-up', doctor: 'Dr. Karthik Rao', token: 'C-14' },
  { time: '10:30', patient: 'Arjun Pillai', type: 'Review', doctor: 'Dr. Karthik Rao', token: 'C-04' },
  { time: '11:00', patient: 'Divya Menon', type: 'New', doctor: 'Dr. Anitha Das', token: 'D-05' },
];

export const inr = (n: number) => '₹' + n.toLocaleString('en-IN');
