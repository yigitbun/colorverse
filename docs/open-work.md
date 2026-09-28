# ColorVerse — açık işler ve karar kuyruğu

Güncelleme: 2026-09-28. Kanonik backlog; yeni bir ajan önce
[devir paketini](handoff.md) okumalı. Kaynaklar: sahibin kapanan sohbetteki
istekleri, mevcut repo, ürün kararları ve MVP denetimi. Claude projesi okunmadı.

## Güncel çalışma modu

Owner'ın en son talimatı Claude'u mühendislik işlerinde yeniden kullanmaktır;
önceki kapasite rezervasyonu artık geçerli değildir. İlk dar görev
[STUDIO-COLORS-08](tasks/studio-colors-08.md): >5 renkli paletin Studio'ya tam
aktarılması ve görünmesi. Claude ayrı worktree'de tek uygulama yazarı; Codex
kapsam/inceleme/entegrasyon sahibidir. Hazır görev, gerçek başlangıç/teslim
kanıtı değildir; oturum başlatılınca ayrı kaydedilir.

## Aktif yayın hazırlığı — 27–28 Eylül 2026

28 Eylül 02:04 Europe/Berlin: kullanıcı **bir saatlik yoğun yayın hazırlığı**
istedi; hedef 03:04. Claude ana mühendis, üç read-only subagent paralel denetim
yapar; Codex ürün yönlendirmesi, dosya sahipliği, inceleme ve yayını yönetir.
Kullanıcının yeni somut değişiklikleri sırayla bu kuyruğa eklenir.

Ürün sahibi haftalara yayılan planı istemiyor. Hedef, en geç **28 Eylül 2026
(Europe/Berlin)** kendi testini yapabileceği bir yayın adayı hazırlamak ve
yayın koşulları tamamlanınca çıkmak. Kullanıcı araştırması ve büyük mimari
refactor bu yayın hazırlığının ön koşulu değildir. Yeni belirtilen son işler
Codex tarafından bu listeye alınır; henüz ayrıntıları verilmiş sayılmaz.

Tek koordinasyon merkezi Codex'tir; çalışma yöntemi
[agent coordination](agent-coordination.md) dosyasındadır. Aşağıdaki tablo
aktif sahipliği gösterir; alttaki backlog iş tanımlarını ve kabul ölçütlerini
korur. Tarih hedefi, geçilmemiş kontrolleri tamamlanmış saydırmaz.

| İş | Sahip | Durum / sıradaki çıktı |
| --- | --- | --- |
| STUDIO-COLORS-08 / 08A — Studio'ya bütün palet renklerini taşı | Claude Code; inceleme/entegrasyon Codex | [Dar görev](tasks/studio-colors-08.md): ilk audit/test-only `2e8d179` incelendi; gerçek izole browser'da normal Extract 10 üye korunur, legacy home-test edit→Studio 5'e düşer; ayrıca 8–10 üye rail'de görünür alanın altında saklanır. 08A dar görünürlük + legacy yazar düzeltmesi aynı Opus 5.5 oturumuna atanır; legacy cleanup/HQ-03 kararı genişletilmez. Oturum `1e38f465-63e3-45dd-b455-dc4e03d68b3b`, canlı `http://127.0.0.1:4205/`; Codex paralel uygulama yazmaz |
| STUDIO-FOCUS-07 — sonuç odaklı Studio ve görünür düzenleme | Codex tek yazar | [Yerel teslim](tasks/studio-focus-07.md): renkli yeni başlangıç, Apply paneli yok, solda 184/64px rail ve seçme, sağda görünür tonlar/tek tıklık ayarlar/açık Globe. Üyeler/atamalar/baseline korunur; >5 üye için explicit sağ yerleştirme. 111 static / 189 PASS; 4203 5/10 renk, select-only/shade/collapse/comparison/Globe/reload ve 320px kontrolü; owner UX kabulü/yayın yok, Claude kullanılmadı |
| STUDIO-NAMING-06 — palet rengi ile uygulama yüzeyini ayır | Codex tek yazar | [Yerel teslim](tasks/studio-naming-06.md): Studio/Extract Color 1…N; ürün yüzeyleri ve Print gerçek üyeyi gösterir. Kayıt/rol/HEX/sıra korunur; başlangıç shade anchor ve 320px kesilme düzeltildi. 189 PASS, 4202 gerçek 5/10 renk/atama/reload/comparison/mobil yolu ve temiz console. Owner görsel kabulü henüz yok; Claude/ajan çağrılmadı, yayın yok |
| SERUM-RENDERER-01A — onaylı şişenin beş yüzeyli renk uygulaması | Codex fallback worker teslim; Codex lead inceleme | Claude quota %100 ile durdu, hiç dosya değiştirmedi. Base `06f78e4` → `f4eff775`, tam inceleme sonrası yerel main `903f9ea`; worker durdu. [Dar scope](tasks/serum-renderer-01a.md); beş yüzey, exact source identity, arka plan/clear base sabit; eski photo API korunur |
| SERUM-STUDIO-01B — v3'ü Studio'ya bağla | Codex lead | [Entegrasyon](tasks/serum-studio-01b.md) yerelde tamam. Açık kayıt indeksleri/karşılaştırma korunur; Label/Body/Accent/Cap ve beşinci slot→Print. İlk teslim 185 PASS; 4201 browser renk/atama/restore/clear/context ve temiz console. Sonraki NAMING-06 320px ürün/comparison kontrolünü tamamladı. Cihaz PNG/authenticated save NOT RUN; yayın yok |
| STUDIO-UX-05A — tek ton düzenleme yolu | Claude teslim; inceleme/entegrasyon Codex | `21c10e7` → `9b25e08`, dört izinli dosya; main `2e9352c`. Sağdaki tekrar ton şeridi kaldırıldı; inline seçim, Alternatives/Contrast/tray korunur. Browser/cache pass yerelde tamam; yayın yok. 05A içinde bulunan çok-renkli tray hatası 05B'ye ayrıldı |
| STUDIO-TRAY-05B — seçilen workspace rengini tepsiye ekle | Claude teslim; inceleme/entegrasyon Codex | `9b25e08` → `bc9d6bf`, üç izinli dosya. `activeColor()` ile preview-role/member index karışıklığı giderildi; 8 üyeli regresyon eklendi. İncelenip main'e alındı; yayın yok |
| STUDIO-ROLE-USE-05C — seçilen rengin fotoğraftaki kullanımını açıkla | Claude teslim; Codex inceleme/entegrasyon | `bc9d6bf` → `5e74ccc`, üç izinli dosya; main `83aa555`. Actual role/surface mapping'e göre kısa kullanım bilgisi; kullanılmayan renk ve sabit arka plan/baskı açık. Tube ataması değiştirilince açıklama değişir, Screens'te gizlenir: izole local browser kontrolü. Yeni rol/palet veya kontrol yok; yayın yok |
| CORPUS-RESEARCH-01A — akademik/kaynak araştırması ve kaynak renkleri | Claude teslim; Codex inceleme/entegrasyon | `21c10e7` → `f6693f8`, iki izinli çıktı, altı kaynak. İlk kanıt sorunları 01B ve Codex son ifade incelemesiyle düzeltildi; yerel main'de. [Kaynak raporu](research/corpus-source-audit-01.md); henüz sayısal renk alınmadı, aday listesi boş. Approved IDs/runtime/DB değişmedi |
| CORPUS-RESEARCH-01B — kanıt/özgün sayısal değer düzeltmesi | Claude teslim; Codex son kanıt ifadesi incelemesi | `f6693f8` → `64e688a`; main `6d36211`. Resmî geçiş hükmü, unresolved Wada ve doğrulanmamış CIE terms, orijinal Munsell/xyY ile derived HEX ayrımı. Codex artık kalan kesin hak iddialarını ve bağımsız doğrulanmamış fetch sayılarını da kaldırdı. Hukuki clearance/ingest değil. Sonraki dar iş: NBS centroid tablosunu gerçekten okuyup az sayıda özgün değeri konumuyla kaydet; henüz başlatılmadı |
| STUDIO-VISUAL-01 — yeni ürün master'ı | Codex görsel yönü/üretimi; Codex fallback renderer | Owner v1'i reddetti, [v3'ü](assets/katre-product-design-proof-v3.png) başlangıç olarak onayladı: yassı-oval cam, kalın taban, alçak kapak, küçük etiket, ince halka. [Brief/promptlar](tasks/studio-visual-01.md); mevcut beş Citrus Muse HEX'i korunur. Opak fotoğrafa yerel serum renderer bağlandı; başka ürün varyasyonu/corpus onayı/yayın yok. Eski alpha master kabul edilmedi; eski Katre asset'i korunur |
| STUDIO-UX-04 — kullanıcı gözüyle sadeleştirme ve fotoğraf kenarları | Codex tek yazar; Claude yalnız bağımsız okuma incelemesi | Yerel checkpoint `21c10e7`; push/yayın yok. Küçük yatay kategori seçimi; fotoğraf max 320px genişlik; daha dar/içe yumuşayan ürün konturları ve daha doğal açık kapak dokusu. Yeni workspace'te Jar → Accent; mevcut kayıt/baseline ataması korunur. Save project/Save palette ve anlaşılır comparison etiketleri. Sonraki sağ-panel tekrar sadeleştirmesi 05A; Campaigns kararı açık |
| STUDIO-UX-02 — Studio yerleşimi ve doğrudan renk düzenleme | Claude teslim; Codex inceleme/entegrasyon | İlk paket `c6a187d`, final `58ff1fe`: dışarı tıklama, padding hitbox, Globe aç/cancel ve 320/390 px PASS. Products/Katre/canlı report, SVG metin düzeltmesi hazır. Campaigns owner kararı bekler |
| STUDIO-MEMBERS-01 — çok renkli kompakt workspace ve Extract + | Claude teslim; Codex inceleme/entegrasyon | `78617f6` + final `58ff1fe`. 8 renk insert → Undo → Studio → unassigned edit → Accent ataması → reload PASS; 10 sınırı/remove/reset PASS. Mobil kesilme düzeltildi: 10 tam row, 320/390 px PASS. My palettes rol haritası saklamaz (RPC alanı yok); projects/prototypes/templates saklar; gerçek authenticated kayıt testi açık |
| PHOTO-COLORWAY-01 — mevcut Katre görselinde canlı renk | Ayrı Claude teslim; Codex entegrasyon | 10 hedefli test; `58ff1fe` ile gerçek fotoğraf Studio'ya bağlı. Tüp/şişe/kavanoz/kapaklar değişir, arka plan sabit. Baseline/renk ataması/aç-kapat ve 390px PASS. PNG blob/download isteği tamam; IAB download olayı gelmedi, cihaz dosyası NOT RUN. Koyu baskı/kenar sınırlaması, fiziksel renk doğruluğu yok |
| STUDY-GALLERY-01 — mevcut AI çalışmalarını göster | Ayrı Claude teslim; Codex inceleme/entegrasyon | `103ae96` + final `58ff1fe`; 13 hedefli test. 8/4 mevcut görsel, alt, arama, Feeling gizleme, current yok mesajı ve 320px header PASS. Approval listesi boş/değişmedi; shared placeholder testleri güncellendi |
| STUDIO-INTEGRATION-03 — fotoğraf, galeri ve ortak release kontratı | Codex, dosya sahipliği açıkça devralındı | Claude `bc13dca1-1dfe-4378-8c76-03fc1f889abe` 429 kota sınırında durdu; reset 28 Eylül 06:50 Europe/Berlin, aktif yazar değil. Codex son bağlantı/mobil/test/cache işlerini `58ff1fe` içinde tamamladı. Final 109 static / 171 PASS / 0 FAIL, audit 0 açık, diff-check PASS. Hosted yazım veya corpus üretimi yok; public yayın kanıtı aşağıda |
| TEAM-01 — ortak kurallar ve Claude girişi | Codex | Hazır; Claude Code çalıştırıldı. Tek yazıcı, Codex'in başlattığı mevcut uygulama oturumu; diğer Claude görüşmeleri read-only inceleyici. Teknik branch koruması kurulmadı |
| LAUNCH-HOUR-01 — bir saatlik mühendislik | Claude; koordinasyon Codex | [Görev](tasks/launch-hour-01.md) hazır, henüz başlatılmadı. Kullanıcı ilk önceliği Color Corpus değerlendirmesi olarak belirledi; bu görevden önce CORPUS-INTEGRATION-01 sunulur ve onay beklenir |
| CORPUS-INTEGRATION-01 — dış corpus entegrasyon değerlendirmesi | Claude; üç read-only subagent; sunum Codex | Tamamlandı: üç alt ajan incelemesi, Claude raporu ve Codex kapsam/entegrasyon incelemesi. [A–G değerlendirmesi](color-corpus-integration-assessment.md) hazır. Uygulama kodu, corpus verisi veya DB değiştirilmedi. Sunumdan sonra DUR; implementasyon için yeni owner onayı gerekir |
| AUTH-EMAIL-01 — markalı kod e-postası | Claude; entegrasyon Codex | Yerel şablon, metin eşlikçisi ve testler tamamlandı. Hosted Confirm sign up ile Magic link or OTP şablonlarına aynı kod e-postası ve `Your ColorVerse sign-in code` konusu kaydedildi; Supabase başarı bildirimi ve yeniden açılan içerik kontrol edildi. Gerçek inbox henüz denenmedi |
| AUTH-UI-01 — ortak e-posta/kod ekranları | Claude'a devredildi | Codex'in kısmi UI çalışması AUTH-ACCOUNT-01'e aktarıldı; paralel yazım yapılmadı |
| AUTH-ACCOUNT-01 — hesap/giriş mühendisliğinin tamamı | Claude; inceleme/entegrasyon Codex | [Tam görev](tasks/auth-account-01.md) teslim edildi, main'e alındı. Yerel build ve 119/119 test geçti; Account/Studio signed-out ekranları masaüstü ve 320/390 px'de görsel incelendi. Gerçek inbox/session ve private save/resume kanıtı AUTH-01/02/03'te açık |
| QA-01 — bağımsız yayın denetimi | Claude | `09bba40` üzerinde tamamlandı: 119 yerel test PASS; canlı route/asset/header kontrolleri PASS. Eski canlı-test metin beklentisi QA-RELEASE-02 ile düzeltildi. Claude etkileşimli tarayıcı ve gerçek inbox testini çalıştırmadı |
| QA-RELEASE-02 — canlı aday kontrol düzeltmesi | Claude; entegrasyon Codex | [Dar kapsam](tasks/qa-release-02.md) tamamlandı; yalnız `scripts/test-live-mvp.mjs` için bir satırlık düzeltme incelenip main'e alındı. Claude'un canlı aday kontrolü PASS; isolated worktree yerel testleri 118 PASS / 1 private-backup SKIP |
| Son kullanıcı istekleri ve çıkan yayın hataları | Codex | İlk istek hesap/kod/e-posta deneyiminin tamamlanması olarak alındı; ek istekler ve QA bulguları burada takip edilir |
| AUTH-01/02/03 — gerçek inbox ve save/resume | Ürün sahibi; hazırlık Codex | En geç 28 Eylül kullanıcı testi hedefi. Gerçek giriş ve veri korunumu kanıtı açık |
| CUR-01 / LEGAL-01 — içerik ve yayın metni kararları | Ürün sahibi; hazırlık Codex | Yayın öncesi açık. Onaylı ilk içerik veya açıkça boş Library kararı gerekli |
| REL-01 / REL-02 — aday kontrolü ve yayın | Codex | Güncel UI `58ff1fe` public yayında; Pages `df233a75-da5b-4ac0-bd63-f8ee8b442a6c` completed/success. Yerel 171 test/audit ve canlı infrastructure + release-candidate PASS. Dört ilgili route + sekiz JS/CSS public byte-match; canlı photo ready/konsol temiz. Önceki auth `09bba40` korunur. Gerçek inbox/private save-resume ve cihaz PNG dosyası açık; tam MVP kabulü değildir |

### Studio — kullanıcı gözüyle öncelikli değerlendirme, 28 Eylül

Owner bu geri bildirimde teknik doğrulama değil, anlaşılabilirlik ve paletin
bitmiş bir kompozisyon olarak ikna ediciliğini istedi. Kullanıcı açısından
Studio bir renk düzenleyici olarak anlaşılır; iyi bir renk sistemini gösteren
ürün olarak henüz yeterli değildir. Şu sırayla ele alınmalı:

1. **Renk ile sonuç arasındaki bağ.** Başlangıçta Background seçiliyken photo
   arka planı sabittir; kullanıcı değişikliğin çalışmadığını düşünebilir. Dört
   yüzey ataması ve beş genel rol iki farklı mental modeldir. Eski default iki
   ürüne Surface veriyor, Accent'i hiç göstermiyordu; yeni default bunu düzeltir
   fakat bütün paletin görünür bir tasarım sistemi olması sorusunu çözmez.
2. **Görselin inandırıcılığı.** Katre'nin taş/dal/doku dünyası her palete uygun
   değildir. Çok açık/koyu hedefler ve sabit baskı, renkleri plastik veya okunmaz
   gösterebilir. Kenar iyileştirmesi ürünü fiziksel proof yapmaz; fotoğraf tek
   başına bütün paletin estetik başarısını kanıtlamaz.
3. **Tekrarlanan düzenleme.** İlk değerlendirme inline seçimi korumayı önerdi;
   son owner kararı FOCUS-07 ile bunu değiştirdi. Sol yalnız seçer, tonlar ve
   açık Globe sağdadır; tek tıklık seçenekler yalnız seçilen rengi değiştirir.
   Bu, tüm-palete öneri motoru veya corpus üretimi yetkisi değildir.
4. **Sonuç vermeyen seçimler.** Footwear/Object genel palette yalnız Reference
   image pending gösterir. Kontrol gibi görünür ama beklenen tasarım sonucu yok;
   görsel hazır değilken nasıl gösterileceği owner kararıdır. Kategori alanının
   geniş rail olması küçük yatay seçimle giderildi.
5. **İşlemlerin hiyerarşisi.** Save project / Save palette farkı görünürleştirildi.
   Copy palette ve alttaki format export hâlâ iki ayrı kopyalama girişi; kod,
   tray, contrast ve bağlantılar aynı ağırlıkta görünür. Disclosure'ları yok
   etmeden tek sonuç-odaklı akış ve ikincil araçlara daha az vurgu gerekir.
6. **Anlamlı uygulama seçimi.** Campaigns'in afiş/story/bilet hali beş rengi bir
   arada göstermekte yararlı; isim anlaşılmaz. Print & Social önerisi hâlâ owner
   kararı bekler. Screens'in raporu faydalı ama palette değerlendirmesinde
   örnek rakamlar ve dense küçük metinler görsel odağı dağıtabilir.

Bu başlıklar yeni CMS, corpus üretimi, görsel üretimi veya genel redesign brief'i
değildir. Bu tur yalnız dar yerleşim/kenar/kopya iyileştirmelerini uygular.

UX-04 bağımsız inceleme: aynı Claude oturumu
`bc13dca1-1dfe-4378-8c76-03fc1f889abe`, mevcut Studio worktree'sinden main'in
`f93b4a5` üzerindeki uncommitted uygulama diff'ini yalnız okuyarak değerlendirir.
Yazılabilir dosya yok; Read/Grep/Glob dışında araç verilmedi. Kabul ölçütü:
rol/snapshot korunumu, comparison, fotoğraf sınırları ve mobil yerleşimde
somut regresyonları raporla; browser kontrolü yaptığını iddia etme. Eski
implementasyon görevi devam etmiyor; commit/stage/deploy yetkisi yok.
Claude statik incelemede blocker bulmadı; comparison'ın orta genişlikte 2×2
atama düzeni, eksik Jar fallback'i, swap hedefi ve geri-alma etiketi iyileştirildi.
Explicit eski Jar ataması korunur. Fotoğraf üst üste gelen jar/bottle konturları
gerçek örtüşme alanıdır; kenar doğruluğu yine yaklaşık. Yerel 978px comparison
görünümü ve 320px renk listesi görüldü; telefonda uzun rol adları hâlâ kısalır.
Son aday yerel `check:release` 109 static / 173 PASS; public sürüm değişmedi.

### QA-01 — Claude'a hazır ilk görev

- **Amaç:** mevcut adayın temel kullanıcı yolculuklarındaki tekrarlanabilir
  yayın engellerini bul. Yeni ürün tasarlama veya kod düzeltmesi yapma.
- **Çalışma alanı:** mevcut checkout yalnız okunur; yazılabilir repo dosyası
  yok. Branch/worktree açma, branch değiştirme, stage/commit/push yapma.
  Başta ve sonda HEAD ile dirty-file durumunu, uncommitted uygulama varsa
  diff veya içerik hash'lerini kaydet; değişen yolu yeniden kontrol et.
  Bu görev için henüz ayrı worktree yok.
- **Oku:** AGENTS.md, coordination, handoff, MVP denetimi ve bu brief.
- **Kontrol:** `npm run check:release`; yerel `http://127.0.0.1:4174/` üzerinde
  Explore → Studio renk aktarımı, Extract → Studio beş renk/oran/manuel örnek,
  Studio düzenleme → export, Account ve Studio signed-out form durumları.
  Geniş ekran ve 390 px'de klavye, taşma ve console hatalarına bak.
- **Sınır:** ayrı tarayıcı profili/izole oturumda browser-local taslaklarla çalış;
  yalnız yeni sekme açmak localStorage'ı ayırmaz. Sahibin oturumunu kullanma.
  Extract için yalnız repo içindeki örnek görselleri kullan; kişisel dosya
  veya mevcut üye projesi açma. Gerçek mail/OTP gönderme, hesap yaratma/silme,
  hosted ayar veya veri değiştirme. `test-member-live.mjs` çalıştırma.
  Test edemediğin yolu NOT RUN olarak bırak; gerçek inbox testinin yerine geçme.
- **Teslim:** Codex'e PASS / FAIL / NOT RUN tablosu; her hata için URL,
  tekrarlama adımları, beklenen/gözlenen sonuç ve önem derecesi. Repo dosyası
  düzenleyerek ikinci iş listesi oluşturma. Düzeltme görevini Codex dağıtır.

## Durum ve yetki sözlüğü

- **Açık:** gerekli iş/kanıt yok; otomatik olarak uygulama yetkisi verilmiş sayılmaz.
- **Kısmi:** somut uygulama var ama kapsam/ürün onayı/yolculuk eksik.
- **Doğrulama:** local kod/test var; gerçek kullanıcı/hosted kanıtı gerekli.
- **Karar:** sahibin seçimi gerekir. **Park:** gelecek fikir, mevcut MVP işi değil.
- **Kapandı:** belirtilen dar kapsamın kanıtı var. **Geri alındı:** tekrar yapılmaz.
- P0: yayın engeli; P1: güvenilirlik/kalite; P2: sonraki ürün turu.

Aşağıdaki işlerin tamamında, ayrıca belirtilmedikçe, son tarih **tarih
belirlenmeli**. Teknik işlerin sahibi uygulama ajanı; içerik/ürün seçimlerinin
sahibi ürün sahibidir. Hukuki inceleme için sorumlu atanmalıdır. Sorumlu rolü
yetkiyi genişletmez. `HQ-01` kapandı. Güncel odak ve süre yukarıdaki aktif yayın
hazırlığı tablosundadır; diğer kayıtlar takip kuyruğudur. HQ-02 private backup
kararı unutulmaz.

## HQ / rapordaki teknik riskler

| ID | Öncelik / durum | İş, sorumlu ve tamamlanma ölçütü |
| --- | --- | --- |
| HQ-01 | P0 / Kapandı, local | Private ignore sınırı + bekleyen app/test/doc checkpointleri kaydedildi. Ajan. Kanıt: handoff'taki commitler ve git log; private yollar tracked değil. Push dahil değil; local commit makine dışı backup değil |
| HQ-02 | P1 / Açık | Makine dışı private backup yöntemini seç. Ürün sahibi. Git local commit ile raw transcript, Downloads orijinalleri, rights backup ve founder materyali güvenceye alınmış sayılmaz; hedef/kapsam/recovery denemesi belirlenmeli |
| HQ-03 | P1 / Karar | `home-test/` kopyalarını kaldırmak, repo-dışı arşive taşımak veya ortak modüllere geçirmek arasında karar ver. Önce owner, sonra ajan. Mevcut restore/undo kaydı korunacak; route/tests/assets cleanup birlikte doğrulanacak |
| HQ-04 | P2 / Açık | Yaklaşık 98 KB `app.js` dosyasını route/controller modüllerine böl. Ajan. İlk adım bağımlılık haritası; renk/rol/persistence/handoff davranışı aynı kalır. Refactor yeni ürün redesign'i değildir |
| HQ-05 | P1 / Kısmi | Gerçek browser smoke testini tek komuta dönüştür. Ajan. Şu an otomatik testler Node unit/static contract; 390px geçmiş manuel kontroller CI değildir. Explore→Studio, Extract→Studio, account form states, keyboard ve overflow kapsansın; mail gönderme yok |
| HQ-06 | P2 / Karar | `components/ui/*.tsx` ve `docs/prototype-v10.html` legacy yerleşimini netleştir. Ürün sahibi. React komponentleri static runtime'a dahil değil; kullanılmayan kodu silmek veya taşımak bu turun işi değil |
| HQ-07 | P1 / Kapandı, doküman | Güncel durum, backlog, module map, kanıt sınırı ve yeni sohbet başlangıcı yazıldı. Ajan. Handoff/open-work, product-decisions current state, README/AGENTS/runbook birbirine bağlı; ham özel transcript yayınlanmadı |
| HQ-08 | P1 / Kapandı, dar kapsam | Fresh checkout testi için private backup bağımlılığını ayır. Ajan. Local backup varsa recoverability testi koşar; yoksa yalnız o test skip olur, deployed-image yokluğu testi her zaman koşar |

## Auth / üyelik ve özel çalışma

| ID | Öncelik / durum | İş, sorumlu ve tamamlanma ölçütü |
| --- | --- | --- |
| AUTH-01 | P0 / Doğrulama | Ürün sahibi gerçek inbox ile yeni ve mevcut hesapta email→OK→8-digit OTP yolunu tamamlasın. Kodun alınması/session oluşması ayrı kanıt; Account ve Studio içi giriş ikisi de denenmeli. OTP/log/kişisel email public kayda yazılmasın |
| AUTH-02 | P0 / Doğrulama | AUTH-01 sonrasında 2–24 renkli palet ve 5-role project kaydet, çık, tekrar giriş yap, resume et. Ürün sahibi. İsim, tüm orijinal renkler, beş rol, preview direction, mapping ve sürüm korunmalı; >5 renk orijinalden kırpılmamalı |
| AUTH-03 | P0 / Doğrulama | Yanlış/expired kod, resend cooldown, change email, refresh ve session failure durumlarını gerçek yolculukta kontrol et. Ürün sahibi. Aynı request/session bağlamı, leading zeroes, disabled/busy state ve honest error; üretici rate-limit ayarlarını izinsiz değiştirme |
| AUTH-04 | P1 / Doğrulama | Template rename/delete, collections, tray merge/sync failure ve Prototype 1/2 yollarını authenticated browser'da dene. Ajan, owner session onayıyla. RPC/static policy kanıtı gerçek UI davranışı yerine geçmez |
| AUTH-05 | P1 / Açık | Archive→restore yüzeyinin ve private-workspace silme kapsamının yeterliliğini kontrol et. Ajan. Archive history korunur; silme adımsal ve açık kapsamlıdır. Önceki “hepsini sil” isteği yeni kullanıcıları silmeye sürekli izin değildir |
| AUTH-06 | P2 / Kapandı, görünüm | Header kişi iconu + Studio icon/name ve email-first form var. Browser/password-manager içindeki Find your login öğesini site kontrolü gibi yeniden üretme. Responsive iki kolon/tek kolon farkı ayrı auth sürümleri değildir |

**Geçerli auth kararı:** passwordless code; sekiz hane; hosted bir saat expiry ve
60 saniye UI resend. Eski link/password/signup branches tarihsel. Jack Wolfskin
referansı sade ortak giriş akışıdır; onların üyelik koşullarını kopyalama.

## Hero / Mini Studio / dünya seçimi

| ID | Öncelik / durum | İş, sorumlu ve tamamlanma ölçütü |
| --- | --- | --- |
| HOME-01 | P1 / Kısmi | Hero yüksekliğini, sol/sağ hizasını ve küre alanını geniş/orta/mobilde tekrar değerlendir. Ajan. Yeni world menu son onaylı; gereksiz üst/alt çerçeve ve pazarlama blokları geri gelmez, globe/control overlap yok |
| HOME-02 | P1 / Doğrulama | Hue/Intensity/Lightness track'larının IAB ve normal browser'da aynı görünmesini kontrol et. Ajan. Kod gradientlerini tanımlar; önceki “yavan / tek renk slider” screenshot'u güncel bug olarak yeniden üretilmiş değil. Viewport, cache, selected color ve browser-local state farklarını kaydet |
| HOME-03 | P2 / Karar | Slider→globe marker/rotation çift yönlü ilişkiyi yeniden ele alıp almamayı sor. Owner. Önceki full instrument denemesi geri alındı; şu an küre seçimi Mini Studio'ya gider ama reverse coupling garanti değil. Otomatik fix/refactor içine saklama |
| HOME-04 | P2 / Karar | Homepage Apply Color + otomatik sonraki slot akışını yeniden onaylat. Owner. Deney sayfasında uygulandı, main'deki instrument trial geri alındı; mevcut ana sayfada Apply yok. Hiç değişmeden öneriyi kabul etmek ve hedef slotu belirtmek gerekiyorsa yeni sınırlandırılmış deney tanımlanmalı |
| HOME-05 | P2 / Karar | Boş başlangıç yerine seeded renk kullanma isteğini yeniden teyit et. Owner. Son rollback boş başlangıcı geri getirdi. “En popüler dünya” kanıtı yok; starter'ı popüler diye etiketleme |
| HOME-06 | P1 / Kısmi | Öneri kalitesini source palette + seçilen tüm renkler üzerinden incele. Ajan. Main `miniStudioColors()` ilk explicit renkten `paletteFromColor()` üretir; her çoklu seçim için handpicked matching değildir. Test sayfasındaki one-to-one matcher ayrı. Kaliteyi 8 approved olmayan AI study ile gizlice güvenilir model gibi sunma |
| HOME-07 | P1 / Doğrulama | Soldaki ghost suggestions ile sağdaki Complete your palette tekrarını ve + onayını gözlemle. Owner/ajan. Sahibin beğendiği öneri davranışı korunmalı; her değişimde chosen vs suggested ayrımı ve tam five-color Studio handoff belli olmalı |
| HOME-08 | P2 / Geri alındı | Büyük Color Block paneli, Original/Preview, sıkıştırılmış modalı hero'ya birebir taşıma ve density artırma deneyi current main değil. “99.9% hex” isteği distorted hücreler üretme izni değildir; main geodesic'i koru |
| HOME-09 | P2 / Kapandı, görünüm | Gereksiz Current direction / Prism Light ve hero source görseli kaldırıldı; feed'den önceki Find a direction worth keeping pazarlama boşluğu yok. Next variation eski world starter carousel kontrolüydü; handpicked içerik hazır olmadan geri ekleme |

## Curation / palette-first kartlar / isim / provenance

| ID | Öncelik / durum | İş, sorumlu ve tamamlanma ölçütü |
| --- | --- | --- |
| CUR-01 | P0 / Karar | İlk 3–5 Library paletini tek tek onayla veya açıkça empty Library launch seç. Owner. Görsel seçimi, beş HEX, kısa isim ve hak/provenance kaydı ayrı; onaydan önce manifest boş kalır |
| CUR-02 | P1 / Kısmi | 10–15 gerçekten farklı palette system biriktir; sonra hero/featured seç. Owner görsel verir, ajan candidate çıkarır. Dört Explore kartı var, sekiz deney kaydı var. Katre aynı aile; onu beş farklı palet gibi sayma |
| CUR-03 | P1 / Açık | Her candidate için editoryal süzgeci kayda geçir. Ajan. Sorusu: “Bu renkler benzer bir tasarım üretmeye gerçekten yardımcı olur mu?” Traceable product-led renkler, rol/kontrast, istenen kullanım, accent, aydınlatma biası, tekrar ve bütünlük; scalar bilimsel puan uydurma |
| CUR-04 | P1 / Kısmi | AI/owner-supplied/external/member provenance ve attribution sistemini ortaklaştır. Ajan. Tags/content dimensions ortak; kaynak/creator/AI disclosure ayrı alanlar. Fotoğrafçı palette author sayılmaz; dış link indicator ve member sade identity ileride tasarlanmalı |
| CUR-05 | P1 / Doğrulama | Palette-first cards density / name weight / media crop / küçük Studio linkini kontrol et. Ajan. 64px renk strip'i, image ardından kısa meta; long description ve curated-by copy yok. Görsel paleti gölgelememeli; rastgele büyütme/küçültme yok |
| CUR-06 | P2 / Kısmi | Editorial short-name registry ile db reservation/alias/history bağını tamamla. Ajan. Local library var, SQL draft var, database editorial cutover yok. IDs immutable; old names lookup, case-fold uniqueness, retired-name reservation; member adı bağımsız |
| CUR-07 | P2 / Kapandı, local | Yeni unnamed draft'lar `Untitled` yerine kısa editable öneri alır. Username/email prefix zorunlu değil. Mevcut kullanıcı isimlerini değiştirme; suggested isim collision-free/trademark-cleared iddiası yok |
| CUR-08 | P2 / Park | Önceki 15 stock link, 80 arama havuzu ve 13 tekil aday final onaylı collection değildir. Owner bu yönü beğenmedi; external yedi card retired. Yeni stock search veya imagegen'i kendiliğinden başlatma |
| CUR-09 | P1 / Doğrulama | Supplied AI asset'lerin yazı/brand glyph, gölge, crop ve tekrar hatalarını candidate review'da kontrol et. Ajan + owner. Daha temiz Lorien tek-kompozisyon referansı final kalite onayı sayılmaz; AI disclosure görsel kalite incelemesinin yerine geçmez. Yeni varyasyon üretmek veya asset'i otomatik değiştirmek bu işin yetkisi değil |

**Son görsel kararı:** Katre'den yalnız Room / Stone Haven Explore'da kaldı;
Lorien cosmetics / Clay Veil eklendi. Tam HEX/envanter [handoff](handoff.md)
içinde. AI indicator kalıcı. Final palette interpretation onayı hâlâ ayrı.

## Library engine / data engineering

| ID | Öncelik / durum | İş, sorumlu ve tamamlanma ölçütü |
| --- | --- | --- |
| LIB-01 | P1 / Kısmi | Local engine için approved içerik ve anlamlı search örnekleri üret. Ajan, CUR-01 sonrası. Exact name/aliases/AND words/category/use case/HEX ve Match current palette beklenen sonuçları verir; boş sonuç truthful |
| LIB-02 | P2 / Açık | `supabase/drafts/editorial_library.sql` dosyasını clean local Postgres'te migration/constraints/RLS/rollback ile test et. Ajan. Draft henüz execute edilmedi; static regex test SQL çalıştırmak değildir |
| LIB-03 | P2 / Karar | DB editorial publication → versioned static manifest cutover planını onaylat. Owner. Tek approval authority; historical `palettes.is_published` ve RPC reference compatibility bozulmaz. Draftı hosted projeye kendiliğinden uygulama |
| LIB-04 | P2 / Park | Bounded candidate retrieval/vector versioning ve öğrenilmiş ranking ancak curated data + consented feedback varsa. Ajan. Oklab proximity zevk/popularity/accessibility skoru değildir; tüm renkler distinct one-to-one eşleşir |

## Studio / uygulanabilir hayali ürünler / projeler

| ID | Öncelik / durum | İş, sorumlu ve tamamlanma ölçütü |
| --- | --- | --- |
| STU-01 | P1 / Kısmi | Owner Objects → Products istedi ve uygulandı; Screens native report. Campaigns (afiş/story/bilet) tut / Print & Social / kaldır kararı bekler. Saved Report legacy preview korunur; yeni kategori yok |
| STU-02 | P1 / Doğrulama | Katre fotoğrafı dört yüzeyle canlı değişir; frozen baseline/photo aç-kapat yerel QA PASS. PNG canvas/blob/download isteği var, IAB dosya kanıtı yok. Authenticated gerçek mapping/save/resume açık. Source dosya/arka plan değişmez, yaklaşık concept; fiziksel proof değil |
| STU-03 | P1 / Yerel PASS | Daha yüksek tam row shades, padding hitbox, dışarı tıklama/Escape kapanışı ve 320/390px Codex tarayıcı kontrolü PASS. Owner görsel kabulü henüz yok; role/focus hedefleri korunur |
| STU-04 | P1 / Doğrulama | Surface rolünün source image görünümünü istenmeden değiştirip değiştirmediğini denetle. Ajan. Önceki şikâyet current state'te yeniden üretilmedi; gerçek photo'yu CSS wash ile palette proof gibi gösterme |
| STU-05 | P2 / Kısmi | A/B baseline clone, tek değişkeni default test etme, independent undo, isimler ve make-active yolunu refine et. Ajan. Baseline/alternative owner-RPC var; önerilen bütün UX tamamlandı varsayılmasın |
| STU-06 | P2 / Kısmi | Project/template memory'yi brand defaults ile genişletme brief'i çıkar. Owner. Palette/role/template var; font/icon/background asset defaults ve chart series mappings tam brand-kit ürünü değil |
| STU-07 | P2 / Açık | Çalışmayı kesmeden collection oluştur/kaydet/geri dön akışını tüm entrypoint'lerde denetle. Ajan. Studio koleksiyon var; Community saves ve her card'da evrensel sepet yok |
| STU-08 | P2 / Park | Material Study ve pair contrast guidance gelişmiş araçlar olarak değerlendirilsin. Ajan. Screen material simulation physical proof değil, bir pair'in AA/AAA değeri bütün ürünün accessibility garantisi değil |

## Extract / Inspiration

| ID | Öncelik / durum | İş, sorumlu ve tamamlanma ölçütü |
| --- | --- | --- |
| EXT-01 | P1 / Doğrulama | “Upload dikine / düşük resolution” şikâyeti için portrait, landscape, EXIF-rotated ve transparent örneklerle browser test yap. Ajan. Display contain + true image bounds; manual sampling orijinal canvas. Downsampled automatic analysis'in preview ile karışmadığı gösterilsin |
| EXT-02 | P1 / Kısmi | Image + 5–10 renk, numaralı draggable points, arada +, undo/reset ve tam Studio aktarımı hazır; 10 renk 320/390px PASS. Numara örnek noktası, alan edit, HEX butonu copy. Owner görsel kabulü açık; referans/font/photo kopyası yok |
| EXT-03 | P1 / Doğrulama | Signature/MIME/20MB/25MP/12000px sınırları, clipboard/dragdrop ve denied decode/handoff yollarını doğrula. Ajan. Görsel browser-local kalır; invalid file preview olmamalı. Orijinal resim private project'e upload edilmiş sayılmaz |
| INS-01 | P1 / Kısmi | Sekiz mevcut supplied AI study aile gruplarıyla Inspiration'da, dört homeStudy ayrı Library concept rafında; placeholders kaldırıldı. Görüntüleme owner isteği, corpus/editoryal onay değil. Yeni AI kayıt/görsel üretilmedi; nihai seçim owner'da |
| INS-02 | P2 / Karar | Editions, Explore ve Inspiration'ın rolünü açıklığa kavuştur. Owner. Applied study brief/CMF/detail route yararlıysa kalsın; hayali product/client gerçek veya satın alınabilir gösterilmesin |

## Community / paylaşım ve kullanıcı katkısı

| ID | Öncelik / durum | İş, sorumlu ve tamamlanma ölçütü |
| --- | --- | --- |
| COM-01 | P2 / Kısmi | Palette/work/question feed ve direkt görünen yorum prototipini owner ile değerlendir. Owner. Şu an device-local; gerçek kullanıcı kimlikleri, popularity/vote sayaçları uydurulmaz. “İnsanlar vakit geçirsin” retention hipotezidir |
| COM-02 | P2 / Açık | Public post/comment storage + permissions + moderation + report/takedown + admin workflow brief'i hazırla. Owner ürün kararı, ajan uygulama. MVP'ye public write açmak mevcut görev değil |
| COM-03 | P2 / Açık | Palette-only ve optional image paylaşımını ayrık tasarla. Owner. Extract upload hiçbir zaman publish değildir; image rights consent, creator credit, remix lineage ve default all-rights-reserved görünür. Persistent upload için validation + safety/relevance review |
| COM-04 | P2 / Park | Saves/remixes/creator discovery ve Community→private-project reuse'u geliştir. Ajan. Kaynak attribution korunur; private-workspace verisi kendiliğinden public olmaz |

## Lab / Sandbox / referans HTML

| ID | Öncelik / durum | İş, sorumlu ve tamamlanma ölçütü |
| --- | --- | --- |
| LAB-01 | P2 / Korunacak | RoomKit mevcut yerde kalır; bu dokümantasyon/commit turunda davranışı değiştirilmedi. Uploaded-room preview broad-surface approximation, semantic segmentation değil |
| LAB-02 | P2 / Park | Gerçek room/material recolor için uygun provider/segmentation yöntemini araştır. Ajan, yeniden talimatla. Texture/light koruma, editable semantic surfaces, original/after, privacy/rights/safety/cost doğrulanmadan AI ürün iddiası yok |
| LAB-03 | P1 / Kapandı, local | Şifresiz Sandbox açıldı; kendi draft key'i, surface mapping, HSL, frozen compare, isim+undo, simulated feedback ve commands. Şifre koyma veya bunu private staging diye anlatma |
| LAB-04 | P1 / Kapandı, local | Owner-supplied One Shape HTML uyarlanmış 14s motion player'da; gerçek play/pause/scrub, CSP external files, no autoplay. İçindeki sahneler çalışan ürün editorleri değildir |
| LAB-05 | P2 / Açık | HTML'deki motion/state-transition mentalitesinden bir işlevsel ürün deneyi seç. Owner. Merkez shape/cursor animasyonunu başlı başına ürün sayma; aynı sakin motion ilkesi bağımsız test edilebilir özelliğe bağlansın |
| LAB-06 | P2 / Kısmi | Her gerçek Lab deneyine açık feedback/try/save ölçümü tasarla. Ajan. Current local feedback community traction sayılmaz; qualitative notlar/user text analytics'e gönderilmez |

## Park edilmiş ürün fikirleri — on farklı yön kaybolmasın

[Renk araçları fırsatları](color-tools-opportunities.md) detay ve tarihsel kaynakları
tutar. Bunlar otomatik geliştirme listesi değildir; güncel durum:

| Fikir | Durum / sonraki soru |
| --- | --- |
| Mini Harmony Wheel | Denendi, reddedildi, kaldırıldı; yeni owner isteği olmadan geri yok |
| Keep & Explore / locked-color suggestions | Park; chosen vs suggested ve handpicked kaliteyle beraber scope tanımla |
| A/B deneme masası | Private baseline/alternative var; daha kapsamlı karşılaştırma UX'i STU-05 |
| Readability Lens / safer alternatives / color-vision simulation | Pair contrast var; tam in-context lens ve color-vision suite yok |
| Proje sepetleri | Private collections var; her entrypoint, contextual note/image scope STU-07 |
| Color Bridge / gradients | Park; role application ve CSS gradient export ayrı yollar olmalı |
| Renk kullanım oranları | Park; 60/30/10 evrensel kural değil, gerçek template surface alanları gerek |
| Kendi SVG tasarımında dene | Park; sanitization, external references, source/variant preservation tasarımı gerek |
| Light/Dark + component states | Global theme ve Sandbox surface demo var; generated accessible token/state set ürünü yok |
| Palette Story Card | Park; source rights, palette-first kompozisyon ve downloadable output brief'i gerek |

## Diğer unutulmaması gerekenler

| ID | Öncelik / durum | İş, sorumlu ve tamamlanma ölçütü |
| --- | --- | --- |
| INT-01 | P2 / Park | 21st.dev theme-toggle/component kaynağı ve MCP entegrasyonu ilgili konu tekrar gelince gündeme getir. Ajan. MCP kurulmadı, mevcut paket/API erişimi varsayılmaz; güncel resmi kaynak ve bağımlılık/lisans incelemesi sonrasında karar. Şu an reminder automation yok |
| INT-02 | P2 / Karar | ChatGPT'deki ayrı ColorVerse içerik/corpus çalışma çıktısını sonradan devral. Owner. Kullanıcı quota transferi istemiyor; seçili output/asset/schema/approval alınacak. Proje özetine erişildi, gerçek chat mesajları henüz okunmadı; hiçbir başka AI projesini kendiliğinden tarama |
| RES-01 | P2 / Park | Rakip review research pilotu. Owner. Yöntem mevcut; 300–500 unique reviews, human coding, bias/duplicates/dated evidence ve provenance henüz toplanmış dataset değil. Çalışır sürekli veri hattı veya satın alınmış hizmet yok |
| RES-02 | P2 / Park | Project/template retention hipotezini gerçek kullanıcı görevleriyle sınamak. Owner. 7/28-day meaningful resume/edit/export ölçümü ancak consented veriyle; daha aktif kullanıcı seçimi nedensellik kanıtı değil |

## Yayın kapıları ve kanıt şablonu

| ID | Öncelik / durum | İş, sorumlu ve tamamlanma ölçütü |
| --- | --- | --- |
| LEGAL-01 | P0 / Karar | Preview membership/privacy notice'ı final launch scope'a göre değerlendir. Owner, gerekirse uzman. Retail koşulları kopyalanmaz; şu an metin hukuki onaylı değildir. Stock/AI/member hakları ayrı record; timestamp izin kanıtı değildir |
| REL-01 | P0 / Yayın hazırlığı | Kullanıcının hızlandırılmış yayın hedefi geçerli. Test edilmiş ve Codex tarafından incelenmiş adayın yayınını operations akışı ve sahibin yayın yönlendirmesiyle yap; Cloudflare deployment'ı, `npm run test:live:release` ve hosted browser journeys doğrula. Açık kullanıcı/içerik kapıları henüz geçilmiş değil |
| REL-02 | P1 / Açık | Hosted dar-screen/keyboard/dark/reduced-motion/no-JS/CSP required-assets smoke tekrarını yap. Ajan. Historical 390px local pass, yeni release browser pass sayılmaz |
| REL-03 | P1 / Doğrulama | Private-data policy boundary kanıtını değişiklik riskine göre yenile. Ajan. Read-only checks ile admin user-creating tests ayrı; `test-member-live.mjs` eski password probe'u OTP delivery testine alternatif değil |
| REL-04 | P2 / Park | İlk gerçek kullanıcılardan sonra consented funnel review. Owner. Fixed event enums; email/code/palette/image/project name taşınmaz. Popularity/world starter kararına yeterli veri olmadan ranking iddiası yok |

Her gerçek kapıda şu kayıt doldurulur:

- Tarih, local commit ve test edilen URL/environment.
- İş ID'si ve scope: örneğin Account → OTP → member palette → Studio → project.
- Beklenen sonuç / gözlenen sonuç / PASS–FAIL–NOT RUN.
- Kanıt türü: static, unit/mocked, local browser, hosted browser, real inbox,
  anonymous policy check veya authorized owner-boundary probe.
- Kalan açık nokta ve sonraki tek adım; email/kod/token/password kayda girmez.

Yeni sohbet “bütün TODO'lar bitti” diyemez. Somut local implementasyon, owner
ürün onayı, test kanıtı, hosted release ve gelecekteki fikirler ayrı tutulur.
