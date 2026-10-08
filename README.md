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

### 單字卡基本字的例句

單字卡裡標了 `src:"tatoeba:編號"`、`lv:"A1"` 的 46 張（2026-10-08 加入），例句同樣取自 Tatoeba，同一批匯出檔、同一個授權。
這批是填空題和對話會用到、原本卡組卻沒有的基本字（ser、estar、tener…），刻意避開填空題已經用過的句子。西班牙文沒有改字；中譯規則同上。

| # | 單字 | 西文句（作者） | 中文句（作者） | 中譯 |
|---|---|---|---|---|
| 1 | ser | [#449942](https://tatoeba.org/sentences/show/449942)（Shishir） | [#4](https://tatoeba.org/sentences/show/4)（Martha） | 修改 |
| 2 | estar | [#2329029](https://tatoeba.org/sentences/show/2329029)（BraveSentry） | [#13254701](https://tatoeba.org/sentences/show/13254701)（mimosawang） | 修改 |
| 3 | tener | [#338693](https://tatoeba.org/sentences/show/338693)（Sprachprofi） | [#686662](https://tatoeba.org/sentences/show/686662)（offdare） | 原文 |
| 4 | hay | [#4417815](https://tatoeba.org/sentences/show/4417815)（cueyayotl） | [#6152672](https://tatoeba.org/sentences/show/6152672)（xjjAstrus） | 修改 |
| 5 | gustar | [#1100397](https://tatoeba.org/sentences/show/1100397)（hayastan） | [#12080245](https://tatoeba.org/sentences/show/12080245)（FishlandicFishy） | 原文 |
| 6 | hacer | [#1922641](https://tatoeba.org/sentences/show/1922641)（Shishir） | [#832927](https://tatoeba.org/sentences/show/832927)（Martha） | 原文 |
| 7 | ir | [#1017617](https://tatoeba.org/sentences/show/1017617)（Shishir） | [#5714618](https://tatoeba.org/sentences/show/5714618)（xjjAstrus） | 修改 |
| 8 | poder | [#580891](https://tatoeba.org/sentences/show/580891)（Shishir） | [#4071819](https://tatoeba.org/sentences/show/4071819)（egg0073） | 修改 |
| 9 | saber | [#536711](https://tatoeba.org/sentences/show/536711)（Leono） | [#816880](https://tatoeba.org/sentences/show/816880)（Martha） | 修改 |
| 10 | soler | [#1758194](https://tatoeba.org/sentences/show/1758194)（Shishir） | [#894942](https://tatoeba.org/sentences/show/894942)（Martha） | 修改 |
| 11 | llamarse | [#2975119](https://tatoeba.org/sentences/show/2975119)（hayastan） | [#5710170](https://tatoeba.org/sentences/show/5710170)（xjjAstrus） | 修改 |
| 12 | decir | [#436542](https://tatoeba.org/sentences/show/436542)（lukaszpp） | [#426418](https://tatoeba.org/sentences/show/426418)（fucongcong） | 修改 |
| 13 | hablar | [#1477888](https://tatoeba.org/sentences/show/1477888)（marcelostockle） | [#9238308](https://tatoeba.org/sentences/show/9238308)（xjjAstrus） | 修改 |
| 14 | creer | [#1664063](https://tatoeba.org/sentences/show/1664063)（Shishir） | [#6467630](https://tatoeba.org/sentences/show/6467630)（xjjAstrus） | 修改 |
| 15 | escuchar | [#965019](https://tatoeba.org/sentences/show/965019)（hayastan） | [#883401](https://tatoeba.org/sentences/show/883401)（Martha） | 修改 |
| 16 | salir | [#1020778](https://tatoeba.org/sentences/show/1020778)（Shishir） | [#848941](https://tatoeba.org/sentences/show/848941)（Martha） | 原文 |
| 17 | comer | [#1831900](https://tatoeba.org/sentences/show/1831900)（Shishir） | [#6017368](https://tatoeba.org/sentences/show/6017368)（xjjAstrus） | 原文 |
| 18 | beber | [#564512](https://tatoeba.org/sentences/show/564512)（Shishir） | [#2638680](https://tatoeba.org/sentences/show/2638680)（cienias） | 原文 |
| 19 | desayunar | [#508145](https://tatoeba.org/sentences/show/508145)（Shishir） | [#406718](https://tatoeba.org/sentences/show/406718)（fucongcong） | 修改 |
| 20 | pedir | [#776604](https://tatoeba.org/sentences/show/776604)（chinopinyin） | [#334622](https://tatoeba.org/sentences/show/334622)（fucongcong） | 修改 |
| 21 | agua | [#990276](https://tatoeba.org/sentences/show/990276)（hundo） | [#6158476](https://tatoeba.org/sentences/show/6158476)（xjjAstrus） | 原文 |
| 22 | café | [#3435393](https://tatoeba.org/sentences/show/3435393)（konrad509） | [#4117354](https://tatoeba.org/sentences/show/4117354)（egg0073） | 原文 |
| 23 | hambre | [#5012409](https://tatoeba.org/sentences/show/5012409)（don_ramon） | [#5708688](https://tatoeba.org/sentences/show/5708688)（xjjAstrus） | 修改 |
| 24 | sed | [#743869](https://tatoeba.org/sentences/show/743869)（chinopinyin） | [#367908](https://tatoeba.org/sentences/show/367908)（fucongcong） | 原文 |
| 25 | costar | [#330686](https://tatoeba.org/sentences/show/330686)（Raimondi） | [#4903269](https://tatoeba.org/sentences/show/4903269)（musclegirlxyp） | 修改 |
| 26 | cuánto | [#500057](https://tatoeba.org/sentences/show/500057)（darinmex） | [#8824080](https://tatoeba.org/sentences/show/8824080)（xjjAstrus） | 修改 |
| 27 | estudiar | [#436966](https://tatoeba.org/sentences/show/436966)（lukaszpp） | [#3713624](https://tatoeba.org/sentences/show/3713624)（egg0073） | 修改 |
| 28 | aprender | [#1139941](https://tatoeba.org/sentences/show/1139941)（Shishir） | [#1455143](https://tatoeba.org/sentences/show/1455143)（nickyeow） | 原文 |
| 29 | trabajar | [#2857710](https://tatoeba.org/sentences/show/2857710)（Besatnias） | [#10361416](https://tatoeba.org/sentences/show/10361416)（DaoSeng） | 修改 |
| 30 | correr | [#963755](https://tatoeba.org/sentences/show/963755)（hundo） | [#834632](https://tatoeba.org/sentences/show/834632)（Martha） | 原文 |
| 31 | cansado | [#2442530](https://tatoeba.org/sentences/show/2442530)（Shishir） | [#5973319](https://tatoeba.org/sentences/show/5973319)（xjjAstrus） | 原文 |
| 32 | ocupado | [#497576](https://tatoeba.org/sentences/show/497576)（Shishir） | [#409710](https://tatoeba.org/sentences/show/409710)（egg0073） | 原文 |
| 33 | amigo | [#562159](https://tatoeba.org/sentences/show/562159)（Shishir） | [#338631](https://tatoeba.org/sentences/show/338631)（nickyeow） | 原文 |
| 34 | dónde | [#2224558](https://tatoeba.org/sentences/show/2224558)（Shishir） | [#5713529](https://tatoeba.org/sentences/show/5713529)（xjjAstrus） | 修改 |
| 35 | lejos | [#527181](https://tatoeba.org/sentences/show/527181)（Shishir） | [#398388](https://tatoeba.org/sentences/show/398388)（GlossaMatik） | 原文 |
| 36 | casa | [#2673354](https://tatoeba.org/sentences/show/2673354)（Shishir） | [#3701751](https://tatoeba.org/sentences/show/3701751)（egg0073） | 修改 |
| 37 | habitación | [#9469313](https://tatoeba.org/sentences/show/9469313)（Shishir） | [#6284515](https://tatoeba.org/sentences/show/6284515)（xjjAstrus） | 原文 |
| 38 | hoy | [#1496966](https://tatoeba.org/sentences/show/1496966)（marcelostockle） | [#5363951](https://tatoeba.org/sentences/show/5363951)（egg0073） | 修改 |
| 39 | nunca | [#1173058](https://tatoeba.org/sentences/show/1173058)（alexmarcelo） | [#347049](https://tatoeba.org/sentences/show/347049)（fucongcong） | 原文 |
| 40 | antes | [#667173](https://tatoeba.org/sentences/show/667173)（Shishir） | [#517561](https://tatoeba.org/sentences/show/517561)（fucongcong） | 修改 |
| 41 | cumpleaños | [#476055](https://tatoeba.org/sentences/show/476055)（Fernanto） | [#382981](https://tatoeba.org/sentences/show/382981)（sysko） | 修改 |
| 42 | verano | [#2390519](https://tatoeba.org/sentences/show/2390519)（kuma） | [#834315](https://tatoeba.org/sentences/show/834315)（Martha） | 修改 |
| 43 | quién | [#574321](https://tatoeba.org/sentences/show/574321)（Shishir） | [#895448](https://tatoeba.org/sentences/show/895448)（Martha） | 原文 |
| 44 | muy | [#955344](https://tatoeba.org/sentences/show/955344)（cueyayotl） | [#408845](https://tatoeba.org/sentences/show/408845)（fucongcong） | 修改 |
| 45 | pero | [#672904](https://tatoeba.org/sentences/show/672904)（Shishir） | [#340150](https://tatoeba.org/sentences/show/340150)（nickyeow） | 修改 |
| 46 | claro | [#1767402](https://tatoeba.org/sentences/show/1767402)（Shishir） | [#421347](https://tatoeba.org/sentences/show/421347)（GlossaMatik） | 修改 |
