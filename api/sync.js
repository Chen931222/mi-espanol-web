// /api/sync — progreso sync for "Mi Español"
// Stores each sync code's progress in Upstash KV (Redis REST), key = "esp:<CODE>".
// Reuses the existing cpe49-kv store; the "esp:" prefix keeps it separate from other apps.
// Env vars are injected by Vercel when the KV store is connected to this project:
//   KV_REST_API_URL, KV_REST_API_TOKEN
// No npm dependencies — talks to the Upstash REST API with global fetch.

const BASE = process.env.KV_REST_API_URL;
const TOKEN = process.env.KV_REST_API_TOKEN;
const PREFIX = "esp:";

function cleanCode(c) {
  return String(c || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (!BASE || !TOKEN) return res.status(503).json({ error: "sync_not_configured" });

  const auth = { Authorization: `Bearer ${TOKEN}` };

  try {
    // PULL: GET /api/sync?code=ABC123  -> { found, payload:{ updatedAt, data } }
    if (req.method === "GET") {
      const code = cleanCode(req.query && req.query.code);
      if (!code) return res.status(400).json({ error: "no_code" });
      const r = await fetch(`${BASE}/get/${PREFIX}${code}`, { headers: auth });
      const j = await r.json();
      if (j.result == null) return res.status(200).json({ found: false });
      let payload = null;
      try { payload = JSON.parse(j.result); } catch (_) { payload = null; }
      return res.status(200).json({ found: true, payload });
    }

    // PUSH: POST /api/sync  body { code, updatedAt, data } -> { ok, updatedAt }
    if (req.method === "POST") {
      let body = req.body;
      if (typeof body === "string") { try { body = JSON.parse(body || "{}"); } catch (_) { body = {}; } }
      body = body || {};
      const code = cleanCode(body.code);
      if (!code) return res.status(400).json({ error: "no_code" });

      // Only accept this app's own keys, and cap the payload. Without this the
      // endpoint is a free anonymous key-value store for anyone who can guess a
      // code — and a way to fill the shared KV quota.
      const raw = body.data && typeof body.data === "object" ? body.data : {};
      const data = {};
      for (const k of Object.keys(raw)) {
        if (typeof k === "string" && k.startsWith("miEspanol.") && typeof raw[k] === "string") {
          data[k] = raw[k];
        }
      }
      const MAX_BYTES = 512 * 1024;
      if (JSON.stringify(data).length > MAX_BYTES) {
        return res.status(413).json({ error: "payload_too_large" });
      }

      // Always stamp with SERVER time so all devices compare against one clock
      // (avoids clock-skew bugs and the "updatedAt:0" never-updates bug).
      const payload = {
        updatedAt: Date.now(),
        data,
      };
      const r = await fetch(`${BASE}/set/${PREFIX}${code}`, {
        method: "POST",
        headers: auth,
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (j.error) return res.status(502).json({ error: "kv_set_failed", detail: j.error });
      return res.status(200).json({ ok: true, updatedAt: payload.updatedAt });
    }

    return res.status(405).json({ error: "method_not_allowed" });
  } catch (e) {
    // Don't echo internals back to the caller.
    console.error("sync error:", e);
    return res.status(500).json({ error: "server_error" });
  }
}
