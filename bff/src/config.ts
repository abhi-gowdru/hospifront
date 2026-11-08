/**
 * Environment configuration for the BFF.
 * All Frappe credentials stay server-side — the browser never sees them.
 */
export interface Config {
  port: number;
  frappeBaseUrl: string;
  frappeApiKey: string;
  frappeApiSecret: string;
  /** Shared token the frontend must send as `Authorization: Bearer <token>`. Empty = open (local dev only). */
  bffApiToken: string;
  /** Comma-separated allowed origins for CORS. */
  allowedOrigins: string[];
  /** Upstream timeout per Frappe request (ms). */
  upstreamTimeoutMs: number;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    port: Number(env.PORT ?? 3001),
    frappeBaseUrl: (env.FRAPPE_BASE_URL ?? 'http://localhost:8080').replace(/\/+$/, ''),
    frappeApiKey: env.FRAPPE_API_KEY ?? '',
    frappeApiSecret: env.FRAPPE_API_SECRET ?? '',
    bffApiToken: env.BFF_API_TOKEN ?? '',
    allowedOrigins: (env.FRONTEND_ORIGINS ?? 'http://localhost:5173,http://localhost:3000')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
    upstreamTimeoutMs: Number(env.UPSTREAM_TIMEOUT_MS ?? 8000),
  };
}
