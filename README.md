# mi-espanol-web — Mi Español

一個人也能養成的西班牙文學習法：對話、單字卡 SRS、歌詞、聽力口說、
遊戲化進度，全部收在一頁裡。

線上版：https://mi-espanol-web.vercel.app

## 結構

單檔 `index.html`——教材內容（`DATA`）與全部邏輯都在裡面。
`intro.html` 是產品導覽頁。

- `sw.js` + `manifest.webmanifest`——PWA，可加到主畫面離線用。
  改版要記得 bump `CACHE` 版本，否則使用者拿到的是舊快取。
- `api/sync.js`——跨裝置進度同步。用一組同步碼當 key
  （`esp:<CODE>`）存進 Upstash KV，走 REST API，無 npm 相依。
  金鑰由 Vercel 在連接 KV store 時注入（`KV_REST_API_URL`、
  `KV_REST_API_TOKEN`），不寫在原始碼裡。

## 本機預覽

```powershell
./serve.ps1
```

PowerShell HttpListener，port 8181。（`file://` 開不起來，Service Worker
與 fetch 都需要 http。）

## 不進版本庫

原始筆記照片（`筆記照片/`，約 190MB）網站並未引用，只是建檔時的素材，
因此排除。

## 自訂教材內容

教材都在 `index.html` 的 `const DATA` 區，照現有格式增減即可。
對話／歌詞的文法標註：在該句的 `notes` 加一行
`{t:"要標的字", g:"文法", cn:"中文", why:"為什麼"}`。

（2026-09-29 從網站底部的說明搬來。那段是寫給改檔的人看的，不該放在給訪客的頁面上。）
