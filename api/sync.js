// /api/sync — progreso sync for "Mi Español"
// Stores each sync code's progress in Upstash KV (Redis REST), key = "esp:<CODE>".
// Reuses the existing cpe49-kv store; the "esp:" prefix keeps it separate from other apps.
// Env vars are injected by Vercel when the KV store is connected to this project:
//   KV_REST_API_URL, KV_REST_API_TOKEN
// No npm dependencies — talks to the Upstash REST API with global fetch.
//
// Rate limits (2026-10-30), per client (IPv4 address, or IPv6 /64), same idea as /api/feedback:
//   - every request: RATE_MAX per hour. A real user pushes once per save (1.5 s debounce) and pulls
//     when the tab comes back to the front, so this only bites scripts.
//   - creating a code that doesn't exist yet: NEW_MAX per hour. Without it anyone could open codes
//     forever at up to 512K characters each (CJK text is ~3 bytes a character) and fill the store
//     this shares with the CPE site. Existing codes aren't capped: overwriting doesn't grow the store.
//     Both windows are one hour because the page footer promises an IP is kept at most an hour.
// A limited request gets 429; the page shows "同步太頻繁" and keeps progress locally.
// Sync keys still never expire; whether abandoned codes should is a separate decision.

const BASE = process.env.KV_REST_API_URL;
const TOKEN = process.env.KV_REST_API_TOKEN;
const PREFIX = "esp:";
const RATE_MAX = 1200;
const NEW_MAX = 3;

function cleanCode(c) {
  return String(c || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
}

// Commands go in the request body (like /api/feedback), so keys with ":" from IPv6 need no URL encoding.
async function kv(cmd) {
  const r = await fetch(BASE, { method: "POST", headers: { Authorization: `Bearer ${TOKEN}` }, body: JSON.stringify(cmd) });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

// Who to count. IPv6 users usually get a whole /64, so one machine could rotate addresses inside it.
function clientKey(req) {
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim().toLowerCase();
  if (!ip) return "unknown";
  if (ip.includes(".")) return ip.slice(ip.lastIndexOf(":") + 1);   // IPv4, or IPv4-mapped ::ffff:1.2.3.4
  const [head, tail = ""] = ip.split("::");
  const h = head ? head.split(":") : [], t = tail ? tail.split(":") : [];
  const full = ip.includes("::") ? [...h, ...Array(Math.max(0, 8 - h.length - t.length)).fill("0"), ...t] : h;
  return full.slice(0, 4).map(x => x.replace(/^0+(?=.)/, "")).join(":") + "::/64";
}

// One counter per client per window; true when this request is over `max`.
// SET … NX EX starts the window with its expiry in one step, so a failed EXPIRE can't leave a counter that never resets.
// If the key expires between SET and INCR, INCR makes a new one without a TTL; n === 1 means that may have happened.
async function overLimit(bucket, who, max, secs) {
  const key = `espsync:${bucket}:${who}`;
  await kv(["SET", key, "0", "EX", String(secs), "NX"]);
  const n = await kv(["INCR", key]);
  if (n === 1) await kv(["EXPIRE", key, String(secs)]);
  return n > max;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (!BASE || !TOKEN) return res.status(503).json({ error: "sync_not_configured" });

  const auth = { Authorization: `Bearer ${TOKEN}` };
  const who = clientKey(req);

  try {
    if ((req.method === "GET" || req.method === "POST") && await overLimit("rl", who, RATE_MAX, 3600)) {
      return res.status(429).json({ error: "rate_limited" });
    }

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

      // Overwriting an existing code doesn't grow the store; opening a new one does.
      if (!(await kv(["EXISTS", PREFIX + code])) && await overLimit("rlnew", who, NEW_MAX, 3600)) {
        return res.status(429).json({ error: "rate_limited" });
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
