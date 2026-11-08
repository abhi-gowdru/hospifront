# Deployment — HIMS frontend + BFF + Frappe Health

This folder brings up the full chain on any machine with Docker:

```
browser → web (nginx, serves the React build, proxies /api → bff)
        → bff (Hono, thin REST adapter, port 3001 internal)
        → frappe (MariaDB + Frappe/ERPNext + Marley "healthcare" app)
```

The browser never talks to Frappe directly and never holds Frappe
credentials. Frappe API keys live only in the BFF container.

## 0. Prerequisites

- Docker Engine 24+ with the Compose plugin (`docker compose version`)
- ~6 GB free RAM for the Frappe stack (MariaDB + Redis + workers)
- Ports free: **3000** (web) and **8080** (Frappe desk, optional exposure)

## 1. Build the Frappe image

The stock `frappe/erpnext` image does not include Marley (Frappe Health,
app name `healthcare`). Build a custom image with both apps pinned:

```bash
cd deployment/frappe
./build-image.sh            # builds hims-frappe:v15 (version-15 branches)
```

`apps.json` pins ERPNext and Marley to their `version-15` branches. ERPNext
is a **mandatory** dependency of Marley — do not remove it.

> To try `version-16` instead: set `FRAPPE_BRANCH=version-16` and edit the
> branches in `apps.json`. Note that ABDM/ABHA support exists only on
> Marley's `abdm-milestone-1-wip` branch — the stable branches have **no
> ABHA fields** on Patient, so the ABHA flow in the UI is a placeholder
> until the ABDM adapter phase.

## 2. Configure secrets

```bash
cd deployment
cp .env.example .env            # DB root password + site admin password
cp bff/.env.example bff/.env    # BFF <-> Frappe credentials (step 4)
```

Set strong values for `DB_ROOT_PASSWORD` and `ADMIN_PASSWORD` in `.env`.
Generate a random `VITE_BFF_TOKEN` (e.g. `openssl rand -hex 32`) and put
the **same value** in `bff/.env` as `BFF_API_TOKEN`. The web build bakes
`VITE_BFF_TOKEN` in at image build time; the BFF requires it as a Bearer
token. Neither is a Frappe credential.

## 3. Start the stack

```bash
docker compose up -d
```

First boot takes several minutes: `create-site` runs
`bench new-site … --install-app erpnext` and then installs `healthcare`.
Watch it with:

```bash
docker compose logs -f create-site
```

## 4. Create Frappe API keys for the BFF

Once `create-site` exits 0:

1. Open http://localhost:8080 and log in as `Administrator`
   (password = `ADMIN_PASSWORD`).
2. In Desk, go to **Users → Administrator** (better: create a dedicated
   **integration user** with only the roles the BFF needs — least
   privilege for production).
3. Scroll to **API Access → Generate Keys**. Copy the API key and secret.
4. Put them in `deployment/bff/.env` as `FRAPPE_API_KEY` /
   `FRAPPE_API_SECRET`, then restart the BFF and web:

```bash
docker compose up -d --build bff web
```

## 5. Verify

```bash
# BFF liveness through the web proxy (same origin the browser uses)
curl -s http://localhost:3000/api/v1/health
# → {"status":"ok","frappe":"up"}        (503 + "degraded" while keys are missing)

# Patient search (empty query = recent registrations)
curl -s -H "Authorization: Bearer $VITE_BFF_TOKEN" \
  "http://localhost:3000/api/v1/patients/search?q="

# Create a synthetic patient
curl -s -X POST -H "Authorization: Bearer $VITE_BFF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Patient","sex":"F","mobile":"9999900001","age":30}' \
  http://localhost:3000/api/v1/patients
```

Then open **http://localhost:3000** — the header badge should read
**Live** (green). Registration writes real Patient documents; you can see
them in Desk under **Healthcare → Patient**.

> Use **synthetic patient data only** in this environment. Never load real
> patient records into a development deployment.

## 6. Tear down / reset

```bash
docker compose down          # stop, keep data volumes
docker compose down -v       # stop and DELETE all data (fresh start)
```

## Architecture notes

- **Thin BFF** (`../bff`): validates input (zod), normalizes Frappe errors
  to `{ "error": { "code", "message" } }`, and is the only component
  holding Frappe credentials. The frontend talks REST to the BFF only.
- **Same-origin in production**: nginx proxies `/api/*` to `bff:3001`, so
  there is no CORS surface and no credential in the browser bundle beyond
  the shared app token.
- **No upstream forks**: we never modify Frappe/ERPNext/Marley source.
  Everything custom lives in this repo (frontend + BFF). When Marley's
  ABDM work lands in a stable branch, the ABHA adapter plugs into the BFF
  without touching the frontend contract.
- The BFF runs fine without Frappe (health reports `degraded`) so the
  frontend always renders — it falls back to demo data with a visible
  **Demo** badge. Hiding failures is worse than showing them.

## Troubleshooting

| Symptom | Check |
|---|---|
| Badge stuck on **Demo** | `docker compose logs bff`; usually missing/invalid `FRAPPE_API_KEY` |
| `health` returns 502 `FRAPPE_AUTH` | Keys revoked or integration user lacks permissions |
| `create-site` fails | Re-run `docker compose up create-site`; check DB container is healthy |
| Registration 409 `DUPLICATE` | A Patient with that mobile already exists — search first |
| Port already in use | Change the left-hand side of the `ports:` mapping in `compose.yml` |
