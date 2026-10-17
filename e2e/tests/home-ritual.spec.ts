import { test, expect, steps, todayScene, finishTalk, drillRound, nextStep } from "./fixtures";

test("首頁三步清單：主按鈕帶著走完 聊一段 → 填空 → 單字卡，回首頁顯示做完", async ({ page }) => {
  await page.goto("/");

  // 首頁：三步、都還沒做、主按鈕是「開始今天的五分鐘」
  await expect(steps(page)).toHaveCount(3);
  await expect(steps(page).locator(".rt-t")).toHaveText(["聊一段", "填空", "單字卡"]);
  await expect(page.locator("#hoy-hero .rt-step.done")).toHaveCount(0);
  await expect(steps(page).nth(0)).toHaveClass(/\bnow\b/);
  const start = page.locator("#rt-start");
  await expect(start).toContainText("開始今天的五分鐘");
  // 第一天從「自我介紹與交友」開始
  const scene = await todayScene(page);
  expect(scene).toBe("自我介紹與交友");

  // 第 1 步：對話
  await start.click();
  await expect(page.locator("#dialogos")).toBeVisible();
  await expect(page.locator("#rt-crumb")).toContainText("第 1 步,共 3 步");
  await expect(page.locator(".tk-prog")).toContainText(scene);
  await finishTalk(page);
  await expect(page.locator("#rt-bar .rt-bar-msg")).toHaveText("第 1 步完成。");
  await nextStep(page, /下一步:填空/);

  // 第 2 步：填空 5 題全對
  await expect(page.locator("#ejercicios")).toBeVisible();
  await expect(page.locator("#ex-list .blank")).toHaveCount(5);
  const qs = await drillRound(page);
  for (let i = 0; i < qs.length; i++) {
    const inp = page.locator(`#ex-list .blank[data-i="${i}"]`);
    await inp.fill(qs[i].answer);
    await inp.press("Enter");
    await expect(inp).toHaveClass(/\bok\b/);
  }
  await expect(page.locator("#ex-score")).toHaveText("本輪/Ronda 5 / 5");
  await expect(page.locator("#rt-bar .rt-bar-msg")).toHaveText("第 2 步完成。");
  await nextStep(page, /下一步:單字卡/);

  // 第 3 步：單字卡，一張張翻開按「記得」直到佇列清空
  await expect(page.locator("#vocabulario")).toBeVisible();
  await expect(page.locator("#rv-bar")).toBeVisible();
  await expect(page.locator("#rv-bar")).toContainText("今天的單字");
  const total = Number(await page.locator("#rv-left").innerText());
  expect(total).toBeGreaterThanOrEqual(5);
  expect(total).toBeLessThanOrEqual(10);
  for (let i = total; i > 0; i--) {
    await expect(page.locator("#rv-left")).toHaveText(String(i));
    await page.locator("#fc-show").click();
    await page.locator("#fc-good").click();
  }
  await expect(page.locator("#rv-bar")).toBeHidden();
  await expect(page.locator("#rt-bar .rt-bar-msg")).toContainText("今天的五分鐘做完了,+10 XP");
  await nextStep(page, /回今天看看/);

  // 回首頁：三步都打勾、主按鈕換成收尾、預告明天的場景
  await expect(page.locator("#hoy")).toBeVisible();
  await expect(page.locator("#hoy-hero .rt-step.done")).toHaveCount(3);
  await expect(page.locator("#rt-start")).toHaveCount(0);
  await expect(page.locator(".hoy-hi")).toContainText("今天的五分鐘做完了");
  await expect(page.locator(".rt-sum")).toContainText(`單字 ${total} 張`);
  await expect(page.locator(".rt-sum")).toContainText("填空 5 / 5");
  await expect(page.locator(".rt-next")).toContainText("明天聊:咖啡廳點餐");

  // 重新整理後狀態仍在（存在 localStorage）
  await page.reload();
  await expect(page.locator("#hoy-hero .rt-step.done")).toHaveCount(3);
});

test("做完一步後回首頁，主按鈕變成「繼續:下一步」", async ({ page }) => {
  await page.goto("/");
  await page.locator("#rt-start").click();
  await finishTalk(page);
  await page.locator("#rt-bar .rt-bar-x").click();
  await expect(page.locator("#rt-bar")).toBeHidden();
  await page.locator("#tabs .tab").first().click();
  await expect(page.locator("#hoy-hero .rt-step.done")).toHaveCount(1);
  await expect(steps(page).nth(1)).toHaveClass(/\bnow\b/);
  await expect(page.locator("#rt-start")).toContainText("繼續:填空");
  await page.locator("#rt-start").click();
  await expect(page.locator("#ejercicios")).toBeVisible();
  await expect(page.locator("#rt-crumb")).toContainText("第 2 步,共 3 步");
});
