import { test as base, expect, type Page } from "@playwright/test";

/** 送到 /api/feedback 的請求（測試裡 mock 掉，不會打到正式 API） */
export type FeedbackCall = { body: any; contentType: string | undefined };

type Fixtures = {
  feedback: FeedbackCall[];
};

/**
 * 每個測試都：
 * - 把 /api/feedback mock 成 200 並記下送出的內容；/api/sync 回 503（沒有設定同步碼時本來就不會呼叫）
 * - 擋掉 Google Fonts，測試不依賴外部網路
 * - 收集頁面上未捕捉的 JS 錯誤，測試結束時必須是 0 個
 */
export const test = base.extend<Fixtures>({
  feedback: [async ({ context }, use) => {
    const calls: FeedbackCall[] = [];
    await context.route("**/api/feedback**", async (route) => {
      const req = route.request();
      let body: any = null;
      try { body = req.postDataJSON(); } catch { body = req.postData(); }
      calls.push({ body, contentType: req.headers()["content-type"] });
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    });
    await context.route("**/api/sync**", (route) =>
      route.fulfill({ status: 503, contentType: "application/json", body: '{"error":"not_configured"}' }));
    await context.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
    await use(calls);
  }, { auto: true }],
  page: async ({ page }, use) => {
    const errors: Error[] = [];
    page.on("pageerror", (e) => errors.push(e));
    await use(page);
    expect(errors.map((e) => e.message), "頁面不應有未捕捉的 JS 錯誤").toEqual([]);
  },
});

export { expect };

/** 首頁「今天的五分鐘」三步清單 */
export const steps = (page: Page) => page.locator("#hoy-hero .rt-step");

/** 今天要聊的場景名（首頁第 1 步說明「自我介紹與交友 · 6 句,照範例句回」的前半） */
export async function todayScene(page: Page): Promise<string> {
  const d = await steps(page).nth(0).locator(".rt-d").innerText();
  return d.split(" · ")[0].trim();
}

/** 在對話頁把目前場景一句一句談完（都按「我唸完這句了」）；fixFirst 時第一句先按一次「沒聽懂 → 請對方重說」 */
export async function finishTalk(page: Page, opts: { fixFirst?: boolean } = {}) {
  await expect(page.locator("#dialogos")).toBeVisible();
  if (opts.fixFirst) {
    await page.locator("#tk-fixtoggle").click();
    await page.locator(".tk-util").first().click();
    await expect(page.locator(".tk-badge.util").first()).toBeVisible();
  }
  for (let i = 0; i < 40; i++) {
    if (await page.locator(".tk-done").isVisible()) return;
    const prog = await page.locator(".tk-prog").innerText();
    await page.locator("#tk-say").click();
    // 等畫面換到下一句（或談完），避免連點
    await expect(page.locator(".tk-prog, .tk-done").first()).not.toHaveText(prog);
  }
  throw new Error("對話談不完");
}

/** 讀出目前這輪填空每一題的答案、以及答案對到的單字卡（頁面內部狀態，只用來決定要填什麼） */
export async function drillRound(page: Page): Promise<{ answer: string; card: string | null }[]> {
  return page.evaluate(() => {
    // @ts-ignore 頁面全域
    return round.map((qi: number) => { const e = POOL[qi]; const c = exCard(e); return { answer: e.answer, card: c ? c.es : null }; });
  });
}

/** 去掉重音（ñ 保留），用來驗證「沒打重音也算對」 */
export const stripAccents = (s: string) =>
  s.replace(/ñ/g, "\u0000").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\u0000/g, "ñ");

/** 用 #rt-bar 的「下一步」按鈕前進 */
export async function nextStep(page: Page, label: RegExp) {
  const bar = page.locator("#rt-bar");
  await expect(bar).toBeVisible();
  await expect(bar.locator(".rt-go")).toHaveText(label);
  await bar.locator(".rt-go").click();
}
