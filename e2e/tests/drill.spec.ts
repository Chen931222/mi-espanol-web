import { test, expect, drillRound, stripAccents } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.locator("#tabs .tab", { hasText: "綜合練習" }).click();
  await expect(page.locator("#ex-list .blank")).toHaveCount(5);
});

test("填空：答對、答錯、沒打重音、沒填，各自判定正確", async ({ page }) => {
  // 找一輪至少有一題答案帶重音的，才能驗「沒打重音也算對」
  let qs = await drillRound(page);
  for (let i = 0; i < 30 && !qs.some((q) => stripAccents(q.answer) !== q.answer); i++) {
    await page.locator("#ex-new").click();
    qs = await drillRound(page);
  }
  const acc = qs.findIndex((q) => stripAccents(q.answer) !== q.answer);
  expect(acc, "換了 30 輪都沒有帶重音的答案").toBeGreaterThanOrEqual(0);
  const others = [0, 1, 2, 3, 4].filter((i) => i !== acc);
  const [right, wrong, empty] = others;
  const blank = (i: number) => page.locator(`#ex-list .blank[data-i="${i}"]`);
  const fb = (i: number) => page.locator(`#ex-list .ex-fb[data-fb="${i}"]`);

  // 沒填就按 Enter：只提示，不掀答案、不計分
  await blank(empty).press("Enter");
  await expect(fb(empty)).toHaveText("還沒填。不會的話按「看答案」");
  await expect(blank(empty)).not.toHaveClass(/\b(ok|no)\b/);
  await expect(page.locator("#ex-score")).toHaveText("");

  // 答對
  await blank(right).fill(qs[right].answer);
  await blank(right).press("Enter");
  await expect(blank(right)).toHaveClass(/\bok\b/);
  await expect(fb(right)).toContainText("✓ 正確");
  await expect(page.locator("#ex-score")).toHaveText("本輪/Ronda 1 / 5(還有 4 題)");

  // 答錯：顯示正確答案
  await blank(wrong).fill("zzzz");
  await blank(wrong).press("Enter");
  await expect(blank(wrong)).toHaveClass(/\bno\b/);
  await expect(fb(wrong)).toContainText(`✗ 正確答案:${qs[wrong].answer}`);

  // 沒打重音也算對，並把輸入框改成正確的重音形
  await blank(acc).fill(stripAccents(qs[acc].answer));
  await blank(acc).press("Enter");
  await expect(blank(acc)).toHaveClass(/\bok\b/);
  await expect(fb(acc)).toContainText(`(${qs[acc].answer})`);
  await expect(blank(acc)).toHaveValue(qs[acc].answer);

  // 剩下兩題用「檢查全部」：一題看答案（不計分），一題答對
  const last = others[3];
  await page.locator(`#ex-list [data-show="${empty}"]`).click();
  await expect(fb(empty)).toContainText(`答案 · Respuesta:${qs[empty].answer}`);
  await blank(last).fill(qs[last].answer.toUpperCase());
  await page.locator("#ex-check").click();
  await expect(blank(last)).toHaveClass(/\bok\b/);
  await expect(page.locator("#ex-score")).toHaveText("本輪/Ronda 3 / 5");
  await expect(page.locator("#ex-log")).toContainText("答對 3 / 5");

  // 答錯的題進錯題本
  await page.locator("#tabs .tab", { hasText: "學習進度" }).click();
  await expect(page.locator("#pg-err")).toContainText(qs[wrong].answer);
});

test("填空：換 5 題會出新的一輪", async ({ page }) => {
  await page.locator('#ex-list .blank[data-i="0"]').fill("x");
  await page.locator("#ex-new").click();
  await expect(page.locator("#ex-list .blank")).toHaveCount(5);
  await expect(page.locator('#ex-list .blank[data-i="0"]')).toHaveValue("");
});
