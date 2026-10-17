import { devices } from "@playwright/test";
import { test, expect } from "./fixtures";

const { defaultBrowserType: _, ...iPhone } = devices["iPhone 13"];
test.use({ ...iPhone });

test("手機寬度：側邊欄隱藏，底部分頁是 4 個常用分頁 + 「更多」", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".sidebar")).toBeHidden();

  const nav = page.locator("#mnav");
  await expect(nav).toBeVisible();
  const btns = nav.locator(":scope > button");
  await expect(btns).toHaveCount(5);
  await expect(btns.locator(".mb-tx")).toHaveText(["今天", "對話", "歌詞", "單字", "更多"]);
  // 5 格同一排、都在畫面內
  const vw = page.viewportSize()!.width;
  const boxes = await Promise.all((await btns.all()).map((b) => b.boundingBox()));
  for (const b of boxes) {
    expect(b).not.toBeNull();
    expect(b!.x).toBeGreaterThanOrEqual(0);
    expect(b!.x + b!.width).toBeLessThanOrEqual(vw + 1);
    expect(Math.abs(b!.y - boxes[0]!.y)).toBeLessThan(2);
  }
  await expect(btns.first()).toHaveAttribute("aria-current", "page");

  // 底部分頁切換
  await btns.nth(1).click();
  await expect(page.locator("#dialogos")).toBeVisible();
  await expect(btns.nth(1)).toHaveAttribute("aria-current", "page");
  await expect(btns.first()).not.toHaveAttribute("aria-current", "page");
});

test("手機寬度：「更多」打開其餘分頁清單，可以切過去、可以關掉", async ({ page }) => {
  await page.goto("/");
  const more = page.locator("#mmore");
  const sheet = page.locator("#msheet");
  await expect(more).toHaveAttribute("aria-expanded", "false");
  await expect(sheet).not.toBeInViewport();

  await more.click();
  await expect(more).toHaveAttribute("aria-expanded", "true");
  await expect(sheet).toBeInViewport();
  const items = sheet.locator("button[data-id]");
  await expect(items).toHaveCount(5);
  expect((await items.allInnerTexts()).map((t) => t.split("\n")[0].replace(/[A-Za-z ]+$/, "").trim()))
    .toEqual(["文法筆記", "綜合練習", "動詞練習", "聽力口說", "學習進度"]);
  await expect(sheet.locator('a[href="intro.html"]')).toBeVisible();

  // 從「更多」切到動詞練習：清單收起、「更多」標成目前所在
  await items.filter({ hasText: "動詞練習" }).click();
  await expect(page.locator("#verbos")).toBeVisible();
  await expect(more).toHaveAttribute("aria-expanded", "false");
  await expect(more).toHaveClass(/\bon\b/);

  // Esc 與點背景都能關
  await more.click();
  await expect(more).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(more).toHaveAttribute("aria-expanded", "false");
  await more.click();
  await page.locator("#mback").click({ position: { x: 10, y: 10 } });
  await expect(more).toHaveAttribute("aria-expanded", "false");
});

test("桌機寬度不顯示底部分頁", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await expect(page.locator("#mnav")).toBeHidden();
  await expect(page.locator(".sidebar")).toBeVisible();
});
