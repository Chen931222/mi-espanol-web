// 測試用的靜態伺服器（零相依）：把 repo 根目錄當網站根目錄，行為比照 serve.ps1。
// /api/* 一律 404 —— 測試裡的 API 都由 Playwright 的 route 攔下來 mock，這裡不碰正式 API。
// 直接執行（playwright.config 的 webServer）或給離線測試 import 進來、測到一半關掉。
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml", ".json": "application/json", ".webmanifest": "application/manifest+json",
  ".png": "image/png", ".jpg": "image/jpeg", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml",
};

/** 開一台伺服器，回傳 { server, url }；port 0 = 隨機 */
export function start(port = 0) {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p === "/") p = "/index.html";
    const file = path.join(ROOT, p);
    if (!file.startsWith(ROOT + path.sep) || p.startsWith("/api/") || p.startsWith("/e2e/")) { res.writeHead(404).end(); return; }
    fs.readFile(file, (err, buf) => {
      if (err) { res.writeHead(404).end(); return; }
      res.writeHead(200, { "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-cache" });
      res.end(buf);
    });
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () =>
    resolve({ server, url: `http://127.0.0.1:${server.address().port}` })));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { url } = await start(Number(process.env.PORT) || 4173);
  console.log(`serving ${ROOT} on ${url}/`);
}
