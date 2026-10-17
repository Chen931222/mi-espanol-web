import { test, expect, todayScene, finishTalk } from "./fixtures";

const DAY = 86_400_000;
// 台北時間早上 9 點，避開跨日邊界
const DAY0 = new Date("2026-03-02T09:00:00+08:00").getTime();

test("對話頁有 14 個情境，「健康話題」在對話頁點得到", async ({ page }) => {
  await page.goto("/");
  await page.locator("#tabs .tab", { hasText: "對話練習" }).click();
  const chips = page.locator("#dlg-chips .chip");
  await expect(chips).toHaveCount(14);
  const names = (await chips.allInnerTexts()).map((t) => t.split(" · ")[0].trim());
  expect(new Set(names).size).toBe(14);
  expect(names).toContain("健康話題");

  await page.locator("#dlg-pick-btn").click();
  await chips.filter({ hasText: "健康話題" }).click();
  await expect(page.locator(".tk-prog")).toContainText("健康話題");
});

test("每日輪替：連續 13 天每天聊完，13 個情境不重複、不含健康話題，第 14 天回到第一個", async ({ page }) => {
  test.setTimeout(180_000);
  const seen: string[] = [];
  for (let day = 0; day <= 13; day++) {
    await page.clock.setFixedTime(DAY0 + day * DAY);
    await page.goto("/");
    const scene = await todayScene(page);
    seen.push(scene);
    if (day === 13) break;
    await page.locator("#rt-start").click();
    await expect(page.locator(".tk-prog")).toContainText(scene);
    await finishTalk(page);
  }

  const first13 = seen.slice(0, 13);
  expect(first13[0]).toBe("自我介紹與交友");
  expect(new Set(first13).size, `13 天內有重複：${first13.join("、")}`).toBe(13);
  expect(first13).not.toContain("健康話題");
  // 通用版「看醫生」在輪替內
  expect(first13).toContain("看醫生");
  expect(seen[13]).toBe(seen[0]);
});

test("當天聊完後同一天重新整理，場景不變；隔天才換", async ({ page }) => {
  await page.clock.setFixedTime(DAY0);
  await page.goto("/");
  const d0 = await todayScene(page);
  await page.locator("#rt-start").click();
  await finishTalk(page);
  await page.goto("/");
  expect(await todayScene(page)).toBe(d0);
  await expect(page.locator(".rt-next, #rt-start").first()).toBeVisible();

  await page.clock.setFixedTime(DAY0 + DAY);
  await page.goto("/");
  expect(await todayScene(page)).not.toBe(d0);
});
