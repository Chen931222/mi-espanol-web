import { test, expect, steps, finishTalk, drillRound, nextStep } from "./fixtures";

test("單字卡：當天填空錯的字、對話卡住的字排在今日單字卡最前面", async ({ page }) => {
  await page.goto("/");
  await page.locator("#rt-start").click();

  // 第 1 步：第一句先按「沒聽懂」請對方重說 → 那句的字記成「對話卡住」
  await finishTalk(page, { fixFirst: true });
  const weak: string[] = await page.evaluate(() => JSON.parse(localStorage.getItem("miEspanol.ritual") || "{}").weak || []);
  expect(weak.length, "第一句應至少對到一張單字卡").toBeGreaterThan(0);
  await nextStep(page, /下一步:填空/);

  // 第 2 步：故意答錯一題「答案對得到單字卡」的，其餘答對
  let qs = await drillRound(page);
  for (let i = 0; i < 30 && !qs.some((q) => q.card && !weak.includes(q.card)); i++) {
    await page.locator("#ex-new").click();
    qs = await drillRound(page);
  }
  const miss = qs.findIndex((q) => q.card && !weak.includes(q.card));
  expect(miss, "換了 30 輪都沒有對得到單字卡的題目").toBeGreaterThanOrEqual(0);
  const missWord = qs[miss].card!;
  for (let i = 0; i < 5; i++) {
    const inp = page.locator(`#ex-list .blank[data-i="${i}"]`);
    await inp.fill(i === miss ? "zzzz" : qs[i].answer);
    await inp.press("Enter");
  }
  await expect(page.locator("#ex-score")).toHaveText("本輪/Ronda 4 / 5");

  // 首頁第 3 步的說明要算到這兩種來源
  await page.locator("#rt-bar .rt-bar-x").click();
  await page.locator("#tabs .tab").first().click();
  const desc = steps(page).nth(2).locator(".rt-d");
  await expect(desc).toContainText("填空錯的 1");
  await expect(desc).toContainText(`對話卡住 ${weak.length}`);
  await page.locator("#rt-start").click();

  // 第 3 步：卡片照「對話卡住 → 填空錯的」排；翻開後按「記得」往下
  await expect(page.locator("#rv-bar")).toBeVisible();
  const expected = [...weak.map((w) => [w, "今天對話卡住的字"]), [missWord, "今天填空錯的字"]].slice(0, 10);
  for (const [word, why] of expected) {
    await expect(page.locator("#fc-word")).toContainText(word);
    await expect(page.locator("#fc-why")).toContainText(why);
    await page.locator("#fc-show").click();
    await page.locator("#fc-good").click();
  }
});

test("單字卡：按「忘了」的卡會排回佇列尾端，不會算完成", async ({ page }) => {
  await page.goto("/");
  await page.locator("#tabs .tab", { hasText: "單字卡" }).click();
  await page.evaluate(() => {
    // @ts-ignore 頁面全域：直接開一輪兩張的複習
    startReview(CARDS.slice(0, 2));
  });
  await expect(page.locator("#rv-left")).toHaveText("2");
  const first = await page.locator("#fc-word").innerText();
  await page.locator("#fc-show").click();
  await page.locator("#fc-bad").click();
  await expect(page.locator("#rv-left")).toHaveText("2");
  await expect(page.locator("#fc-word")).not.toHaveText(first);
  await page.locator("#fc-show").click();
  await page.locator("#fc-good").click();
  await expect(page.locator("#rv-left")).toHaveText("1");
  await expect(page.locator("#fc-word")).toHaveText(first);
});
