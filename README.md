# HospiFront — Hospital Information Management System

A production-oriented HIMS for a 60-bed / ~500-OPD-visits-per-day Indian
hospital: a fully custom React frontend over a **thin BFF** that talks
REST to **Frappe Health (Marley) + ERPNext**.

- Live preview of the frontend (demo data): open the saved version in Kimi.
- Full-stack local run: see [`deployment/README.md`](deployment/README.md).

## Repository layout

```
src/                 React 19 + TypeScript + Vite frontend
  components/        App shell (sidebar, topbar, shared UI)
  pages/             Dashboard, Registration, OPD/EMR consult, IPD bed
                     board, Lab, Pharmacy, Billing, Reports, Settings
  data/mock.ts       Synthetic demo dataset (used when backend is offline)
  lib/api.ts         Typed BFF client (health, patient search/create)
  hooks/             useBackend — live/demo status polling
bff/                 Thin BFF (Hono + zod) — the only Frappe credential holder
  src/               config, Frappe REST client, patient routes, app entry
  test/              Vitest suite with a stub Frappe server (10 tests)
deployment/          Docker assets: Frappe image build, compose stack,
                     BFF/web containers, full runbook
```

## Design language

Light clinical SaaS (Healthray-inspired): Plus Jakarta Sans, soft gray
canvas, primary blue `hsl(221 83% 53%)`, status pills, KPI cards with
sparklines, dense data tables, left icon sidebar. Hash-based routing so
the static build works anywhere.

## Quick start

**Frontend only (demo mode):**

```bash
npm install
npm run dev        # http://localhost:5173 — header badge shows "Demo"
npm run build      # static build in dist/
```

**BFF:**

```bash
cd bff
npm install
cp .env.example .env   # point FRAPPE_BASE_URL at a Frappe site + API keys
npm run dev            # http://localhost:3001
npm test               # 10 integration tests against a stub Frappe
```

**Full stack (Docker):** everything — Frappe image, compose topology,
secrets, verification — is documented in
[`deployment/README.md`](deployment/README.md).

## Ground rules (from the master plan)

- Reuse Frappe Healthcare/ERPNext functionality before writing custom
  code; **never modify upstream Frappe/ERPNext/Marley source**.
- Never invent APIs, database fields, or compliance claims — BFF endpoints
  map to documented Frappe REST resources only.
- **Synthetic patient data only** in development; never production PHI.
- Never hardcode secrets; all credentials come from env files/variables.
- Clinical safety over occupancy and billing flows.
- Thin BFF with REST is the default integration architecture; the ABHA /
  ABDM adapter plugs in later (stable Marley has no ABHA fields yet).
