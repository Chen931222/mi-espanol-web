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

## 例句來源

填空題裡標了 `src:"tatoeba:編號"` 的 50 題，句子取自 [Tatoeba](https://tatoeba.org)（2026-10-06 的每週匯出檔），授權 [CC BY 2.0 FR](https://creativecommons.org/licenses/by/2.0/fr/)。
西班牙文沒有改字，只挖掉一個字做成填空；中文翻譯以 Tatoeba 的中文句為底，簡體轉繁體，並改成台灣用語或修正錯譯（下表「中譯」欄標「修改」的那些）。
挑選標準是 Instituto Cervantes《Plan Curricular》文法清單的 A1 欄。

| # | 西班牙文 | 西文句（作者） | 中文句（作者） | 中譯 |
|---|---|---|---|---|
| 1 | ¿Cómo te llamas? | [#449153](https://tatoeba.org/sentences/show/449153)（naikodemus） | [#6142027](https://tatoeba.org/sentences/show/6142027)（xjjAstrus） | 修改 |
| 2 | ¿Eres de Australia? | [#5755707](https://tatoeba.org/sentences/show/5755707)（arh） | [#6016957](https://tatoeba.org/sentences/show/6016957)（xjjAstrus） | 修改 |
| 3 | No soy médico. | [#1198554](https://tatoeba.org/sentences/show/1198554)（cueyayotl） | [#2634804](https://tatoeba.org/sentences/show/2634804)（egg0073） | 原文 |
| 4 | Sí, yo también soy estudiante. | [#2213121](https://tatoeba.org/sentences/show/2213121)（Shishir） | [#2202377](https://tatoeba.org/sentences/show/2202377)（GlossaMatik） | 修改 |
| 5 | Mi hijo tiene ocho años. | [#5023312](https://tatoeba.org/sentences/show/5023312)（don_ramon） | [#10329821](https://tatoeba.org/sentences/show/10329821)（DaoSeng） | 修改 |
| 6 | ¿Usted dónde vive? | [#9035999](https://tatoeba.org/sentences/show/9035999)（Shishir） | [#393584](https://tatoeba.org/sentences/show/393584)（GlossaMatik） | 原文 |
| 7 | Él quiere ser médico. | [#970018](https://tatoeba.org/sentences/show/970018)（hayastan） | [#846317](https://tatoeba.org/sentences/show/846317)（Martha） | 修改 |
| 8 | Tengo dos hijos. | [#1240412](https://tatoeba.org/sentences/show/1240412)（Shishir） | [#6486891](https://tatoeba.org/sentences/show/6486891)（xjjAstrus） | 修改 |
| 9 | ¿Tu padre es español? | [#10223398](https://tatoeba.org/sentences/show/10223398)（Shishir） | [#6047151](https://tatoeba.org/sentences/show/6047151)（xjjAstrus） | 修改 |
| 10 | Ese es mi hijo. | [#1970583](https://tatoeba.org/sentences/show/1970583)（Shishir） | [#1967352](https://tatoeba.org/sentences/show/1967352)（egg0073） | 原文 |
| 11 | Ella tiene una familia grande. | [#2003543](https://tatoeba.org/sentences/show/2003543)（camilou） | [#5710171](https://tatoeba.org/sentences/show/5710171)（xjjAstrus） | 原文 |
| 12 | Mi padre corre todas las mañanas. | [#5628647](https://tatoeba.org/sentences/show/5628647)（arh） | [#5964270](https://tatoeba.org/sentences/show/5964270)（xjjAstrus） | 修改 |
| 13 | ¿Cuántos hermanos tienes? | [#562035](https://tatoeba.org/sentences/show/562035)（Shishir） | [#350682](https://tatoeba.org/sentences/show/350682)（nickyeow） | 修改 |
| 14 | Me gusta mucho el helado. | [#1032284](https://tatoeba.org/sentences/show/1032284)（riccioberto） | [#5410868](https://tatoeba.org/sentences/show/5410868)（egg0073） | 修改 |
| 15 | ¿Te gusta comer fruta? | [#10092593](https://tatoeba.org/sentences/show/10092593)（Shishir） | [#6057153](https://tatoeba.org/sentences/show/6057153)（xjjAstrus） | 原文 |
| 16 | No tengo hambre. | [#864893](https://tatoeba.org/sentences/show/864893)（pisclis） | [#13262912](https://tatoeba.org/sentences/show/13262912)（mimosawang） | 原文 |
| 17 | ¿Quién tiene sed? | [#9462450](https://tatoeba.org/sentences/show/9462450)（ignacio） | [#13259748](https://tatoeba.org/sentences/show/13259748)（mimosawang） | 修改 |
| 18 | Quiero comer helado. | [#5146808](https://tatoeba.org/sentences/show/5146808)（albrusgher） | [#8762953](https://tatoeba.org/sentences/show/8762953)（crescat） | 修改 |
| 19 | ¿Carne o pescado? | [#1173653](https://tatoeba.org/sentences/show/1173653)（Shishir） | [#1358670](https://tatoeba.org/sentences/show/1358670)（sadhen） | 修改 |
| 20 | Normalmente desayuno aquí. | [#549401](https://tatoeba.org/sentences/show/549401)（Shishir） | [#5957626](https://tatoeba.org/sentences/show/5957626)（xjjAstrus） | 修改 |
| 21 | ¿Qué hora es? | [#2830](https://tatoeba.org/sentences/show/2830)（Shishir） | [#501536](https://tatoeba.org/sentences/show/501536)（fucongcong） | 修改 |
| 22 | Son las dos. | [#2225009](https://tatoeba.org/sentences/show/2225009)（Shishir） | [#6084266](https://tatoeba.org/sentences/show/6084266)（xjjAstrus） | 修改 |
| 23 | Mañana es domingo. | [#656878](https://tatoeba.org/sentences/show/656878)（Shishir） | [#409409](https://tatoeba.org/sentences/show/409409)（GlossaMatik） | 原文 |
| 24 | Hoy es mi cumpleaños. | [#985107](https://tatoeba.org/sentences/show/985107)（riccioberto） | [#1480125](https://tatoeba.org/sentences/show/1480125)（egg0073） | 原文 |
| 25 | Hoy no tengo clases. | [#1128209](https://tatoeba.org/sentences/show/1128209)（marcelostockle） | [#834810](https://tatoeba.org/sentences/show/834810)（Martha） | 原文 |
| 26 | Nos vemos mañana. | [#2216149](https://tatoeba.org/sentences/show/2216149)（Shishir） | [#4879134](https://tatoeba.org/sentences/show/4879134)（musclegirlxyp） | 原文 |
| 27 | Hoy hace mucho calor. | [#2858](https://tatoeba.org/sentences/show/2858)（Zifre） | [#343752](https://tatoeba.org/sentences/show/343752)（fucongcong） | 原文 |
| 28 | Hace mucho frío. | [#623776](https://tatoeba.org/sentences/show/623776)（darinmex） | [#4547211](https://tatoeba.org/sentences/show/4547211)（murr） | 修改 |
| 29 | Hace mucho viento, pero no hace frío. | [#10097437](https://tatoeba.org/sentences/show/10097437)（manufrutos） | [#13552175](https://tatoeba.org/sentences/show/13552175)（LeviHighway） | 修改 |
| 30 | No me gusta el verano. | [#501964](https://tatoeba.org/sentences/show/501964)（Shishir） | [#1700146](https://tatoeba.org/sentences/show/1700146)（sadhen） | 原文 |
| 31 | ¿Te gusta la lluvia? | [#566126](https://tatoeba.org/sentences/show/566126)（Shishir） | [#894324](https://tatoeba.org/sentences/show/894324)（Shishir） | 原文 |
| 32 | Mi casa está aquí. | [#1275958](https://tatoeba.org/sentences/show/1275958)（Shishir） | [#1275340](https://tatoeba.org/sentences/show/1275340)（egg0073） | 原文 |
| 33 | ¿Dónde está tu madre? | [#3555037](https://tatoeba.org/sentences/show/3555037)（Shishir） | [#13119359](https://tatoeba.org/sentences/show/13119359)（LeviHighway） | 修改 |
| 34 | ¿Por qué no estás en casa? | [#2783046](https://tatoeba.org/sentences/show/2783046)（Shishir） | [#5972310](https://tatoeba.org/sentences/show/5972310)（xjjAstrus） | 原文 |
| 35 | Mi país está lejos de Japón. | [#1932119](https://tatoeba.org/sentences/show/1932119)（hayastan） | [#2635812](https://tatoeba.org/sentences/show/2635812)（cienias） | 原文 |
| 36 | Aquí no hay nada. | [#1591598](https://tatoeba.org/sentences/show/1591598)（Shishir） | [#10283397](https://tatoeba.org/sentences/show/10283397)（DaoSeng） | 修改 |
| 37 | ¿Cuántos gatos hay en esta casa? | [#751831](https://tatoeba.org/sentences/show/751831)（chinopinyin） | [#479092](https://tatoeba.org/sentences/show/479092)（nickyeow） | 修改 |
| 38 | ¿Cuánto cuesta esta cámara? | [#5367928](https://tatoeba.org/sentences/show/5367928)（Riwanon） | [#5367935](https://tatoeba.org/sentences/show/5367935)（xjjAstrus） | 修改 |
| 39 | Esto es muy caro. | [#969977](https://tatoeba.org/sentences/show/969977)（hayastan） | [#5689024](https://tatoeba.org/sentences/show/5689024)（xjjAstrus） | 修改 |
| 40 | No tengo tiempo ni dinero. | [#642185](https://tatoeba.org/sentences/show/642185)（Shishir） | [#6068645](https://tatoeba.org/sentences/show/6068645)（xjjAstrus） | 修改 |
| 41 | ¿Cuántos libros tienes? | [#600171](https://tatoeba.org/sentences/show/600171)（Shishir） | [#846426](https://tatoeba.org/sentences/show/846426)（Martha） | 修改 |
| 42 | Necesito más dinero. | [#2432098](https://tatoeba.org/sentences/show/2432098)（Shishir） | [#6015377](https://tatoeba.org/sentences/show/6015377)（xjjAstrus） | 修改 |
| 43 | Estoy bien, gracias. | [#493008](https://tatoeba.org/sentences/show/493008)（Shishir） | [#868290](https://tatoeba.org/sentences/show/868290)（cherylting） | 原文 |
| 44 | Estoy muy cansado. | [#377265](https://tatoeba.org/sentences/show/377265)（hayastan） | [#397734](https://tatoeba.org/sentences/show/397734)（GlossaMatik） | 修改 |
| 45 | Siempre estoy ocupado. | [#746893](https://tatoeba.org/sentences/show/746893)（Shishir） | [#3713700](https://tatoeba.org/sentences/show/3713700)（egg0073） | 修改 |
| 46 | ¿No estás cansada? | [#540018](https://tatoeba.org/sentences/show/540018)（Shishir） | [#340099](https://tatoeba.org/sentences/show/340099)（nickyeow） | 原文 |
| 47 | ¿Te gusta el béisbol? | [#1856745](https://tatoeba.org/sentences/show/1856745)（Shishir） | [#10314049](https://tatoeba.org/sentences/show/10314049)（DaoSeng） | 原文 |
| 48 | No me gustan los perros. | [#1970668](https://tatoeba.org/sentences/show/1970668)（Shishir） | [#1959163](https://tatoeba.org/sentences/show/1959163)（egg0073） | 原文 |
| 49 | No sabe nadar. | [#1089628](https://tatoeba.org/sentences/show/1089628)（Shishir） | [#5689031](https://tatoeba.org/sentences/show/5689031)（xjjAstrus） | 修改 |
| 50 | Su libro es muy interesante. | [#2635959](https://tatoeba.org/sentences/show/2635959)（Shishir） | [#1441683](https://tatoeba.org/sentences/show/1441683)（egg0073） | 修改 |
