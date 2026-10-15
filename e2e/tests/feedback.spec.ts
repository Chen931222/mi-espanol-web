import fs from "node:fs";
import path from "node:path";
import { test, expect, type FeedbackCall } from "./fixtures";
import type { Page } from "@playwright/test";

/*
 * /api/feedback：前端送出的匿名計數。所有請求都被 fixtures 裡的 route mock 攔下，不會打到正式 API。
 * 最後一個測試把攔到的 body 餵給 repo 裡真正的 api/feedback.js（KV 換成假的），確認伺服器會收。
 */

/** 首頁收尾畫面才會出現付費意願問卷：先把今天三步標成做完（只寫 localStorage，日期用頁面自己的「今天」） */
async function seedDoneToday(page: Page) {
  await page.addInitScript(() => {
    if (localStorage.getItem("miEspanol.ritual")) return;
    const d = new Date();
    localStorage.setItem("miEspanol.ritual", JSON.stringify({
      d: d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(), nTalk: 1, scene: 6, talk: 1, drill: 1, cards: 1,
    }));
  });
}

// 最後的契約測試要用前面攔到的 body，所以這個檔案照順序跑
test.describe.configure({ mode: "serial" });
const collected: FeedbackCall[] = [];

test("付費意願：選一個選項送出 {type:wtp, choice}，之後不再問；留 email 送 waitlist", async ({ page, feedback }) => {
  await seedDoneToday(page);
  await page.goto("/");
  const wtp = page.locator("#wtp");
  await expect(wtp).toBeVisible();
  await expect(wtp.locator("[data-wtp]")).toHaveCount(4);

  await wtp.locator('[data-wtp="m60"]').click();
  await expect(wtp).toContainText("謝謝,收到了");
  await expect.poll(() => feedback.length).toBe(1);
  expect(feedback[0].body).toEqual({ type: "wtp", choice: "m60" });
  expect(feedback[0].contentType).toContain("application/json");

  await page.locator("#wtp-email").fill("Someone@Example.com");
  await page.locator("#wtp-mail button[type=submit]").click();
  await expect(wtp).toContainText("寄信給你");
  await expect.poll(() => feedback.length).toBe(2);
  expect(feedback[1].body).toEqual({ type: "waitlist", email: "someone@example.com" });

  // 學習進度 · 設定可以自己移除 email
  await page.locator("#tabs .tab", { hasText: "學習進度" }).click();
  await page.locator("#wl-remove").click();
  await expect.poll(() => feedback.length).toBe(3);
  expect(feedback[2].body).toEqual({ type: "waitlist", email: "someone@example.com", remove: true });

  // 答過就不再問
  await page.reload();
  await expect(page.locator("#wtp")).toHaveCount(0);
  collected.push(...feedback);
});

test("回報錯誤：對話裡按「回報錯誤」送出 {type:report, item, field, reason}", async ({ page, feedback }) => {
  await page.goto("/");
  await page.locator("#rt-start").click();
  // 先談一句，回報的 item 應該是「場景-第幾句」
  await page.locator("#tk-say").click();
  await expect(page.locator(".tk-prog")).toContainText("第 2 /");
  await page.locator("#tk-reptoggle").click();
  await page.locator('#tk-report [data-rep="a|cn"]').click();
  await expect(page.locator("#tk-report")).toContainText("謝謝,記下了");
  await expect.poll(() => feedback.length).toBe(1);
  // 今天的場景是「自我介紹與交友」= DATA.dialogos[6]
  expect(feedback[0].body).toEqual({ type: "report", item: "6-1", field: "a", reason: "cn" });
  collected.push(...feedback);
});

test("API 掛掉（500 或連不上）時，畫面照常、不出 JS 錯誤", async ({ page, context }) => {
  let n = 0;
  await context.route("**/api/feedback**", (route) => { n++; return n === 1
    ? route.fulfill({ status: 500, contentType: "application/json", body: '{"error":"server_error"}' })
    : route.abort("connectionrefused"); });
  await seedDoneToday(page);
  await page.goto("/");
  await page.locator('#wtp [data-wtp="none"]').click();
  await expect(page.locator("#wtp")).toContainText("謝謝,收到了");
  await page.locator("#tabs .tab", { hasText: "對話練習" }).click();
  await page.locator("#tk-reptoggle").click();
  await page.locator('#tk-report [data-rep="q|es"]').click();
  await expect(page.locator("#tk-report")).toContainText("謝謝,記下了");
  expect(n).toBe(2);
  // fixtures 會檢查沒有未捕捉的錯誤（包括 unhandled rejection）
});

test("契約：前端送出的每一種 body，真正的 api/feedback.js 都回 200（KV 換成假的，不連網）", async () => {
  test.skip(collected.length === 0, "前面的測試沒有收集到請求（單獨跑這個測試時）");
  process.env.KV_REST_API_URL = "https://kv.invalid";
  process.env.KV_REST_API_TOKEN = "test";
  const kvCalls: any[] = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (url: any, init: any) => {
    expect(String(url)).toBe("https://kv.invalid");
    kvCalls.push(JSON.parse(init.body));
    return new Response(JSON.stringify({ result: 1 }), { headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;
  try {
    // api/ 沒有 package.json 標 "type":"module"，直接 import 會被當 CommonJS；用 data: URL 照原文當 ES module 載入（檔案沒有相依）
    const src = fs.readFileSync(path.resolve(__dirname, "../../api/feedback.js"));
    const mod = await import("data:text/javascript;base64," + src.toString("base64"));
    for (const c of collected) {
      let status = 0, out: any;
      const res = { setHeader() {}, status(s: number) { status = s; return this; }, json(j: any) { out = j; return this; } };
      await mod.default({ method: "POST", body: c.body, headers: { "x-forwarded-for": "203.0.113.1" } }, res);
      expect({ body: c.body, status, out }).toEqual({ body: c.body, status: 200, out: { ok: true } });
    }
    // 計數只用 HINCRBY / SADD / SREM，不會寫進別的 key
    const ops = kvCalls.filter((c) => !["INCR", "EXPIRE"].includes(c[0]));
    expect(ops.map((c) => c[0]).sort()).toEqual(["HINCRBY", "HINCRBY", "SADD", "SREM"]);
  } finally {
    globalThis.fetch = realFetch;
  }
});
