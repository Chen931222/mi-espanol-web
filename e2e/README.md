# e2e — Playwright 冒煙測試

```bash
cd e2e
npm ci
npx playwright install chromium   # 第一次
npx playwright test
```

- `serve.mjs`：零相依的靜態伺服器（比照 `serve.ps1`），把 repo 根目錄當網站根目錄；`/api/*` 一律 404。
- `/api/feedback`、`/api/sync` 在 `tests/fixtures.ts` 裡用 route mock 掉，測試不會打到正式 API。
- 時區固定 `Asia/Taipei`；每日輪替的測試用 `page.clock` 把日期往後撥。
- 除了 `offline.spec.ts`，其他測試都擋掉 service worker（SW 會讓 route mock 失效）。
- GitHub Actions：`.github/workflows/e2e.yml`，PR 時自動跑。
