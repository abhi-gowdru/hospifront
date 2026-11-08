import { useState } from 'react';
import { Activity, ArrowRight, Eye, EyeOff, HeartPulse, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import { toast } from 'sonner';

export type StaffRole = 'SuperAdmin' | 'Admin' | 'Doctor' | 'Nurse' | 'Reception';

export default function Login({ onLogin }: { onLogin: (staffId: string, role: StaffRole) => void }) {
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<StaffRole>('Reception');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!staffId.trim() || !password.trim()) {
      toast.warning('Enter your staff ID and password.');
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      onLogin(staffId.trim(), role);
      setLoading(false);
    }, 650);
  };

  return (
    <main className="grid min-h-dvh grid-cols-1 bg-white lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.28),transparent_32%),linear-gradient(135deg,#0f172a_0%,#111827_55%,#172554_100%)]" />
        <div className="relative flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-950/30">
            <HeartPulse className="h-6 w-6" />
          </span>
          <div>
            <p className="text-lg font-extrabold tracking-tight">Sanmaya</p>
            <p className="text-xs text-slate-300">Hospital Information System</p>
          </div>
        </div>

        <div className="relative max-w-xl pb-6">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-blue-200">
            <Activity className="h-3.5 w-3.5" /> Connected care workflow
          </p>
          <h1 className="max-w-lg text-5xl font-extrabold leading-[1.08] tracking-tight">
            Every patient journey, in one place.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
            Registration, consultations, admissions, billing and clinical operations—connected for faster care.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              ['Registration', 'Fast patient lookup'],
              ['Clinical care', 'OPD and IPD workflow'],
              ['Operations', 'Lab, pharmacy and billing'],
            ].map(([title, detail]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                <p className="text-sm font-bold">{title}</p>
                <p className="mt-1 text-xs text-slate-400">{detail}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" /> Secure staff access
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <form onSubmit={submit} className="w-full max-w-[420px]">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <HeartPulse className="h-5 w-5" />
            </span>
            <div>
              <p className="font-extrabold">Sanmaya</p>
              <p className="text-xs text-muted-foreground">Hospital IMS</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-primary">Staff portal</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500">Sign in to continue to Sanmaya Hospital.</p>
          </div>

          <div className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Staff ID or email</span>
              <div className="relative mt-2">
                <UserRound className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                <input
                  value={staffId}
                  onChange={(event) => setStaffId(event.target.value)}
                  placeholder="e.g. AN001"
                  autoComplete="username"
                  className="focus-ring h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Password</span>
              <div className="relative mt-2">
                <LockKeyhole className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="focus-ring h-12 w-full rounded-xl border border-slate-200 pl-11 pr-12 text-sm outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Staff role</span>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as StaffRole)}
                className="focus-ring mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
              >
                <option>Reception</option>
                <option>Doctor</option>
                <option>Nurse</option>
                <option>Admin</option>
                <option>SuperAdmin</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="focus-ring flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? 'Signing in…' : 'Sign in'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>

          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-800">
            <strong>Demo access:</strong> use any Staff ID and password.
          </div>
        </form>
      </section>
    </main>
  );
}
