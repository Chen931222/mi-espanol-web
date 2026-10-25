// /api/feedback — 匿名的「願不願意付費」與「這句有錯」計數,給站主決定定價、找出要修的句子。
// 問卷與回報只收固定選項、只做計數(Redis hash 的 HINCRBY);唯一的文字是使用者自願留在候補名單的 email。
// IP 只用來限流,一小時後自動消失,不跟其他資料綁在一起。
// 跟 /api/sync 共用同一個 Upstash KV(環境變數 KV_REST_API_URL / KV_REST_API_TOKEN),key 用 "espfb:" 開頭,不碰同步資料。
//   POST { type:"wtp",    choice }                → espfb:wtp      欄位 choice +1
//   POST { type:"report", item:"7-2", field, reason } → espfb:report 欄位 "7-2|a|es" +1
//   POST { type:"waitlist", email, remove? }      → espfb:waitlist 集合加入／移除這個 email(付費版上線時通知用)
//   POST { type:"ev", ev }                         → espfb:ev:<ev> 欄位「台北日期」+1(new 新裝置/back 回訪/start 按開始/done 做完三步/video 點今日影片)
//   GET                                            → 兩張表的目前計數＋候補名單人數＋ev 每天的次數(只有數字,可以公開;email 本身不回傳)
// ev 是 2026-10-25 加的,推估 YouTube 有沒有帶人來(不帶來源):前端每個瀏覽器每個台北日每種最多送一次,不帶任何 id、不設 cookie。
// ev 的限流另外算(espfb:rlev:,每個 IP 每小時 200 次):同一個網路(教室、公司)很多台一起來時,不能把候補名單的 30 次吃光。
// 預覽部署與本機(VERCEL_ENV 不是 production)寫到 espfb:evp:,測試不會混進正式數字。
// 候補名單的 email 只能在 Upstash 主控台(Vercel → Storage → 這個 KV → Data Browser,key espfb:waitlist)看到。

const BASE = process.env.KV_REST_API_URL;
const TOKEN = process.env.KV_REST_API_TOKEN;
const WTP = ["none", "m30", "m60", "m120"];          // 不會付 / 每月 NT$30 / 60 / 120
const FIELDS = ["q", "a", "alt"];                     // 對方那句 / 範例句 / 另一種說法
const REASONS = ["es", "cn", "odd"];                  // 西文有錯 / 中文有錯 / 不自然
const RATE_MAX = 30;                                  // 每個 IP 每小時最多 30 次
const EV_RATE_MAX = 200;                              // ev 另外一桶,每個 IP 每小時最多 200 次
const EVS = ["new", "back", "start", "done", "video"]; // 新的瀏覽器 / 回訪 / 按開始 / 做完三步 / 點今日影片
const EV_NS = process.env.VERCEL_ENV === "production" ? "espfb:ev:" : "espfb:evp:";
const tpeDay = () => new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);   // 台北的日期 YYYY-MM-DD

async function kv(cmd) {
  const r = await fetch(BASE, { method: "POST", headers: { Authorization: `Bearer ${TOKEN}` }, body: JSON.stringify(cmd) });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

function toObj(arr) {
  const o = {};
  for (let i = 0; arr && i < arr.length; i += 2) o[arr[i]] = Number(arr[i + 1]) || 0;
  return o;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!BASE || !TOKEN) return res.status(503).json({ error: "not_configured" });
  try {
    if (req.method === "GET") {
      const [wtp, report, wl, ...evs] = await Promise.all([kv(["HGETALL", "espfb:wtp"]), kv(["HGETALL", "espfb:report"]), kv(["SCARD", "espfb:waitlist"]),
        ...EVS.map(e => kv(["HGETALL", EV_NS + e]))]);
      const ev = {};
      EVS.forEach((e, i) => { ev[e] = toObj(evs[i]); });
      return res.status(200).json({ wtp: toObj(wtp), report: toObj(report), waitlist: Number(wl) || 0, ev });
    }
    if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

    let body = req.body;
    if (typeof body === "string") { try { body = JSON.parse(body || "{}"); } catch (_) { body = {}; } }
    body = body || {};

    let key, field, setOp = null, member = null, isEv = false;
    const email = String(body.email || "").trim().toLowerCase();
    if (body.type === "waitlist" && email.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setOp = body.remove ? "SREM" : "SADD"; member = email;
    } else if (body.type === "wtp" && WTP.includes(body.choice)) {
      key = "espfb:wtp"; field = body.choice;
    } else if (body.type === "report" && /^\d{1,2}-\d{1,2}$/.test(String(body.item || "")) && FIELDS.includes(body.field) && REASONS.includes(body.reason)) {
      key = "espfb:report"; field = `${body.item}|${body.field}|${body.reason}`;
    } else if (body.type === "ev" && EVS.includes(body.ev)) {
      key = EV_NS + body.ev; field = tpeDay(); isEv = true;
    } else if (body.type === "selftest") {
      key = "espfb:selftest"; field = "ok";   // 部署後自我檢查用,不混進正式計數
    } else {
      return res.status(400).json({ error: "bad_input" });
    }

    const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
    const rk = `espfb:${isEv ? "rlev" : "rl"}:${ip}`;
    const n = await kv(["INCR", rk]);
    if (n === 1) await kv(["EXPIRE", rk, 3600]);
    if (n > (isEv ? EV_RATE_MAX : RATE_MAX)) return res.status(429).json({ error: "rate_limited" });

    if (setOp) await kv([setOp, "espfb:waitlist", member]);
    else await kv(["HINCRBY", key, field, 1]);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("feedback error:", e);
    return res.status(500).json({ error: "server_error" });
  }
}
