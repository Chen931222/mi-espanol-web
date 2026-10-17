import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";
import type { Server } from "node:http";

// 這個檔案要真的跑 service worker
test.use({ serviceWorkers: "allow" });

/*
 * 「關掉網路」：Playwright 的 context.setOffline() 管不到 service worker 自己發的 fetch
 * （SW 照樣連得到伺服器，測不出離線行為），所以每個測試自己開一台伺服器，
 * 等 SW 把頁面快取好之後把伺服器整台關掉，再加上 setOffline，對這個網站來說就是完全斷線。
 */
let server: Server;
let base: string;
test.beforeEach(async () => {
  // @ts-ignore serve.mjs 是純 JS
  const mod = await import("../serve.mjs");
  ({ server, url: base } = await mod.start(0));
});
test.afterEach(() => { server.closeAllConnections(); server.close(); });

async function goOffline(page: Page) {
  await new Promise<void>((r) => { server.closeAllConnections(); server.close(() => r()); });
  await page.context().setOffline(true);
  // 確認真的斷線：沒快取過的檔案拿不到
  const st = await page.evaluate(() => fetch("/sitemap.xml", { cache: "no-store" }).then((r) => r.status, () => "failed"));
  expect(st).not.toBe(200);
}

/** 等 sw.js 接管頁面，並且某個網址已經進快取 */
async function waitCached(page: Page, url: string) {
  await page.waitForFunction(async (u) => {
    if (!navigator.serviceWorker.controller) return false;
    return !!(await caches.match(u));
  }, url, { timeout: 15_000 });
}

test("離線：service worker 接管後斷網，首頁與各分頁仍能開", async ({ page }) => {
  await page.goto(base + "/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await waitCached(page, "/index.html");
  await waitCached(page, "/");
  await goOffline(page);

  for (const p of ["/", "/index.html"]) {
    await page.goto(base + p);
    await expect(page.locator("#hoy-hero .rt-step")).toHaveCount(3);
    await expect(page.locator("#rt-start")).toBeVisible();
  }

  // 單頁切換各主要分頁
  const tabs: [string, string, string][] = [
    ["對話練習", "#dialogos", ".tk-prog"],
    ["文法筆記", "#gramatica", "#verb-list .verb"],
    ["歌詞分析", "#canciones", "#lyrics"],
    ["單字卡", "#vocabulario", "#fc-word"],
    ["綜合練習", "#ejercicios", "#ex-list .blank"],
    ["動詞練習", "#verbos", "#vb-prompt"],
    ["聽力口說", "#escucha", "#lp-stage"],
    ["學習進度", "#progreso", "#pg-goal"],
  ];
  for (const [label, sec, content] of tabs) {
    await page.locator("#tabs .tab", { hasText: label }).click();
    await expect(page.locator(sec)).toBeVisible();
    const el = page.locator(content).first();
    if (await el.evaluate((e) => e.tagName === "INPUT")) await expect(el).toBeVisible();
    else await expect(el).not.toBeEmpty();
  }

  // 離線時首頁主按鈕照樣能開始今天的五分鐘
  await page.locator("#tabs .tab").first().click();
  await page.locator("#rt-start").click();
  await expect(page.locator(".tk-prog")).toBeVisible();
});

test("離線：上線時開過的導覽頁（intro.html）離線也能開；沒開過的頁面回 503 而不是假裝成首頁", async ({ page }) => {
  await page.goto(base + "/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await waitCached(page, "/index.html");
  await page.goto(base + "/intro.html");
  await waitCached(page, "/intro.html");
  const title = await page.title();
  await goOffline(page);

  await page.goto(base + "/intro.html");
  await expect(page).toHaveTitle(title);

  const res = await page.goto(base + "/robots.txt");
  expect(res?.status()).toBe(503);
  await expect(page.locator("body")).toContainText("離線");
});
