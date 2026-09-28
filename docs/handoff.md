# ColorVerse — sohbetten bağımsız devir paketi

Güncelleme: 2026-09-28. Bu dosya kapanan sohbetin yerine geçecek başlangıç
kaydıdır. Ham sohbetin veya başka bir AI projesinin okunması gerekmemelidir.
Önceki devir oturumu dokümantasyon ve yerel commit ile sınırlıydı; aşağıdaki
güncel yönlendirme sonraki görüşmeyi kaydeder.

## Güncel yönlendirme — 2026-09-28

- Owner ana sayfanın kürede tek seçili renk ile açılmasını istedi.
  [HOME-GLOBE-SEED-09](tasks/home-globe-seed-09.md) Claude Opus 5.5 tarafından
  ayrı worktree'de `553f72c` + `ed21c97` olarak teslim edildi, Codex inceleyip
  yerel main'e aldı. Aktif/kayıtlı dünyadaki gerçek ön yüz hücresi Mini Studio'da
  `1 / 5` görünür; Clear boş bırakır, Studio'ya aktarım korunur. 4208 izole
  browser kanıtı var. Main `8c305da` 2026-09-28'de Cloudflare Pages'e
  gönderildi; 111 static / 195 PASS / 0 FAIL, audit 0, canlı aday kontrolü ve
  hem Pages origin hem public domainde ana sayfa/app/globe/Studio byte-match
  PASS. Mobil/reduced-motion/owner kabulü ve gerçek inbox/private save hâlâ
  açık; Claude'un canlı oturumu `http://127.0.0.1:4207/` tamamlandı.
- Owner'ın son talimatı Claude'u yeniden tüm mühendislik işlerinde kullanmak;
  eski kapasite rezervasyonu aşağıda tarihsel kalır. İlk öncelik >5 palet renginin
  Studio'da kaybolması: [STUDIO-COLORS-08 / 08A](tasks/studio-colors-08.md) dar
  görevi yerelde teslim edildi. Ayrı `codex/claude-studio-colors` branch/worktree, base `e69731f`;
  gerçek Claude oturumu `1e38f465-63e3-45dd-b455-dc4e03d68b3b`, model
  `claude-opus-5-5`, canlı konuşma `http://127.0.0.1:4205/`. Claude `2e8d179` ve
  `6e3f334` teslim etti; exact review→main `c2b63e1` / `f352b8d`. Codex uygulama
  düzeltmesi yazmadı. 8–10 renk iki kompakt sütunda tam görünür; büyük listede
  toplam/scroll-swipe/fade, collapsed dar şerit, klavye satır seçimi. Eski
  home-test beş-slot yazarının tüm workspace'i koruması düzeltildi; HQ-03 cleanup
  kararı verilmedi. 4206 izole gerçek 5/8/10, unassigned edit→atama→reload,
  legacy 10→10 ve 320px PASS; main 111 static / 193 PASS. İlk 4204 canlı yazım
  sırasında cache-pin/CSS ara sürümünü tuttu, final kanıt değil; final 4206
  immutable teslim üstünde. Owner 4202/4203 taslağı işletilmedi. Orijinal owner
  yolu henüz verilmedi; 24 gerçek UI/private save/inbox/device PNG açık. Worker
  bekliyor; yeni hosted işlem/push/yayın yok. Codex kapsamı/entegrasyonu yönetir.
- Owner yeni Studio UX yönünü açıkça istedi; [STUDIO-FOCUS-07](tasks/studio-focus-07.md)
  yerelde tamamlandı. Bu karar UX-05A'nın solda inline shade tercihini değiştirir:
  sol yalnız renk seçimi, sağda görünür tonlar ve tek tıklık ayarlar. Yeni Studio
  draftı mevcut renkli Citrus Muse ile başlar; eski kayıt/URL paletleri korunur.
  Apply palette colors paneli kaldırıldı; saved careAssignment/baseline/Print
  ve export sözleşmesi korunur. Solda 184→64px collapse şeridi; mobil yatay,
  büyük listede iç scroll. Sağda 21 ton, Lighter/Darker/Softer/Richer, açık Globe,
  isimli swap; >5 üye için explicit Use in preview. Eski inline/drag-grip ve
  küçük swap düğmeleri yerine bu seçili-renk akışı geçerlidir. App v103/Studio
  CSS v16/photo CSS v6; 111 static / 189 PASS. 4203 gerçek 5/10 renk,
  select-only/collapse/shade/Globe-cancel/comparison/swap/restore ve
  unassigned-edit→placement→reload, 320px taşmasız yol kontrol edildi;
  console temiz. Son preview `http://127.0.0.1:4203/studio/?p=custom-concept-piera`,
  özgün beş renk/karşılaştırmasız/daraltılmış şerit. Owner 4202 draftı işletilmedi.
  Yeni UX'nin owner kabulü henüz yok; Claude/başka ajan/hosted işlem/push/yayın yok.
- Bütün backlog bitmiş değildir. Campaigns kararı, corpus uygulama onayı,
  gerçek inbox/private save ve cihaz PNG gibi açık kapılar korunur; bu tur
  yalnız sahibin yukarıdaki somut Studio isteklerini kapatır.
- En son owner talimatı: normal işleri sürdür, Claude kapasitesini başka iş
  için ayır; şimdilik yeni görev verme. Bu turda Claude/başka ajan hiç
  çağrılmadı. Alttaki yoğun delegasyon talimatları tarihsel; bu kaynak tercihi
  onların önüne geçer. Aktif worker/hatırlatma yok.
- Owner'ın Background/Surface/Primary/Accent/Text sorusuna verilen nötr isim
  önerisi, normal işe devam yönlendirmesiyle dar yerel
  [STUDIO-NAMING-06](tasks/studio-naming-06.md) olarak uygulandı. Studio ve
  Extract üyeleri Color 1…N; sağdaki Label/Body/Accent/Cap ve Print gerçek
  üye numarasını gösterir. Persisted rol/indeks/HEX/sıra ve legacy export
  anahtarları değişmedi; özel renk ismi editörü eklenmedi. Çok renkli kaydın
  ilk açılışındaki yanlış shade anchor düzeltildi, 320px numara/HEX kesilmesi
  giderildi. App v101/member v3/Studio CSS v13; 189 PASS / 0 FAIL. 4202 izole
  browser'da 5/10 renk, Extract→Studio, boş üye düzenleme/atama/reload,
  Globe/shades, comparison/restore ve 320px ürün/karşılaştırma kontrol edildi;
  console temiz. Owner'ın 4201 tab/draftı işletilmedi. Yerel teslim
  `http://127.0.0.1:4202/studio/?p=concept-piera`; ilk beş renk geri getirildi,
  geçici karşılaştırma temizlendi. Yeni isimlerin owner görsel kabulü henüz
  yok; cihaz PNG/inbox/authenticated save NOT RUN, hosted işlem/push/yayın yok.

- Owner v3'ü açıkça onayladı: "Bununla başlayalım". Dar local Studio renderer
  ve entegrasyon işi tamamlandı; yeni varyasyon/push/yayın yetkisi değil.
  Claude'a SERUM-RENDERER-01A verildi fakat oturum
  `678a9c81-9fff-4f46-82c0-842f87ac4b86` %100 five-hour sınırında hiç dosya
  değiştirmeden bitti (reset 28 Eylül 13:50 Europe/Berlin). Bu bir Claude
  teslimi değildir. Kullanıcıya açıklandı; Codex fallback worker aynı izole
  `codex/claude-serum` / `.local/worktrees/claude-serum`, base `06f78e4`
  üzerinde yalnız renderer/profil/test dosyalarının yazarlığını aldı; teslim
  `f4eff775` tamamen incelenip yerel main'e `903f9ea` olarak alındı. Worker
  durdu, Codex lead ayrı app/CSS/entegrasyonu tamamladı. Görev kayıtları
  [renderer](tasks/serum-renderer-01a.md) / [Studio](tasks/serum-studio-01b.md).
  V3 PNG aynen korunur; beş yüzey label/body/cap/accent/print renk alır, arka
  plan ve clear base değişmez. Eski kayıtların açık rol indeksleri korunur.
  Son release check 185 PASS / 0 FAIL; 4201 izole browser'da gerçek renk/atama,
  Text baskı, comparison/restore/clear ve Screens/Products geçişi kontrol edildi,
  console temiz. Başlangıç renkleri geri getirildi. Yerel preview
  `http://127.0.0.1:4201/studio/?p=custom-concept-piera`; 4200 account/4197 draft
  dokunulmadı. Bu teslimde mobil browser/cihaz PNG/authenticated save NOT RUN;
  mobil browser kontrolü sonraki STUDIO-NAMING-06 turunda tamamlandı.
  corpus/hosted işlem/push/yayın yok. Arkada aktif Claude veya worker yok.

- Son görsel geri bildirimi: owner v1 ürün formunu standart boş DM tüpü gibi
  buldu, daha nitelikli Fransız kozmetik ambalajı karakteri istedi. Built-in
  imagegen ile yeni form ve bir material/closure refinement yapıldı;
  [v3 aday](assets/katre-product-design-proof-v3.png) yassı-oval cam, kalın taban,
  alçak kapak, küçük serif etiket ve ince boyun halkası kullanır. Aynı beş
  Citrus Muse rengi korunur; gerçek marka kopyası veya coğrafi üretim iddiası
  yok. [Promptlar ve değerlendirme](tasks/studio-visual-01.md) kaydedildi.
  Owner revised form'u sonraki mesajında onayladı; güncel renderer/entegrasyon
  durumu yukarıdadır. Corpus kaydı, hosted işlem veya yayın yok.

- Son uygulama turu **yerel**: UX-04 checkpoint `21c10e7`; Claude'un üç
  küçük mühendislik teslimi main'e incelenerek alındı: UX-05A `2e9352c`,
  tray-05B `697594c`, role-use-05C `83aa555`. Sağdaki tekrar ton şeridi yok;
  inline shades korunur. Tepsi tüm workspace üyelerinde seçilen doğru rengi
  alır. Seçilen rengin gerçek fotoğraf yüzeyi/boş kullanım bilgisi mapping ile
  güncellenir ve Screens'te gizlenir. App v99/Studio CSS v12 cache pass yerel.
  `npm run check:release`: 176 PASS / 0 FAIL. Bu UX kabulü veya yayın değildir.
  İzole preview `http://127.0.0.1:4200/studio/?p=concept-piera`; kullanım
  açıklaması, yüzey ataması, Screens geçişi ve Escape doğrulandı; console temiz.
  Sahibin 4197 origin'deki custom draftına/sunumuna dokunulmadı.
- Claude'un corpus ilk araştırması ve kanıt düzeltmesi teslim edildi:
  `f6693f8` + `64e688a`, yerel main `8e727df` + `6d36211`.
  [Kaynak raporu](research/corpus-source-audit-01.md) altı kaynak listeler;
  ham renk tablosu okunamadığından sayısal aday **yok**. İthalat/palet onayı yok.
  Codex review ilk Wada life+70 ve numeric=HEX varsayımlarını reddetti;
  son incelemede kalan kesin hak ifadeleri de kaldırıldı. Hak durumları
  kaynak kurum beyanlarıdır, küresel hukuki clearance değildir. Bir sonraki
  küçük research görevi NBS tablosundan az sayıda konumlu özgün değer olabilir;
  henüz başlatılmadı, Munsell verisi için lisans sorusu açık.
- Yeni görsel adayı built-in imagegen ile üretildi:
  [görsel brief'i/promptlar](tasks/studio-visual-01.md). Tek hero şişede mevcut
  Citrus Muse renkleri gövde/etiket/kapak/vurgu/yazıda; arka plan ayrı sakin
  nötr. [Renkli proof](assets/katre-product-design-proof-v1.png) yalnız tasarım
  yönü, interaktif veya live replacement değil. Nötr alpha master'ın kenar
  kusurları çözülmedi; renderer'a kabul edilmedi. Kaynak Katre asset'i korunur.
- Gerçek Claude oturumları: kısa Studio `a060c844-3ef8-498c-9dcf-07204ec47851`,
  research `06598d4e-d8c5-4af5-add9-0acfa91db048`; bütün bu turdaki çağrılar
  teslim/STOP ile bitti, arkada aktif mühendis yok. Son rate-limit bildirimi
  five-hour %98 / weekly %69 kullanım; reset epoch `1790596200` bildirildi.
  Yeni işten önce kotayı tekrar doğrula. Eski büyük bağlamlı `bc13dca1` küçük
  işler için yeniden kullanılmasın; kullanıcıya hazırlanmış işi başlamış gibi
  bildirme. MCP/private proje erişimi açılmadı. Main push/deploy bu turda yok.

- Yeni owner talimatı: açık Studio işleri küçük Claude uygulama görevleriyle
  başlatılsın; corpus akademik/kaynak araştırması ve renk toplama da Claude'a
  verilsin. Dış ekip-only araştırma sınırı bu kapsam için değişti. Önce küçük
  kaynak/lisans raporu ve research-candidate; import/DB/editorial approval için
  önceki kapılar korunur. Yeni yüksek kaliteli ürün master'ı görsel adayı da
  hazırlanabilir; kullanıcı paletini ve canlı Katre asset'ini otomatik değiştirme.

- Owner çalışma yöntemi: küçük mühendislik düzeltmeleri de netleşir netleşmez
  Claude'a devredilir; Codex işi önce kendi bitirip büyük paket halinde vermez.
  Codex ürün kararı, dosya sahipliği, inceleme ve entegrasyonu tutar. Hazırlanan,
  gerçekten başlatılan ve teslim edilen görevleri ayrı durumlar olarak bildir.

- Son owner geri bildirimi: Studio renkleri bir arada iyi bir tasarım gibi
  göstermiyor, kategori rail'i geniş, Katre kenarları yapay. Codex dar UX-04
  düzeltmesini ve [kullanıcı önceliklerini](open-work.md) hazırladı: küçük yatay
  kategori seçimleri, sınırlı photo boyutu, sıkı konturlar/yumuşak kenarlar,
  yeni default Jar → Accent ve açık save/comparison etiketleri. Kaynak görsel,
  kayıtlar ve eski snapshot atamaları korunur. Genel sağ-panel tasarımı,
  Footwear/Object boş durumları ve Campaigns kararı hâlâ ürün değerlendirmesi;
  UX kalitesini test/audit sayısıyla tamamlanmış göstermeme isteği geçerlidir.
  UX-04 yerel `21c10e7` checkpoint'inde; push/public yayın yapılmadı.
  Codex tek yazar; aynı Claude oturumu yalnız bağımsız read-only inceleme için
  yeniden çağrıldı, yeni implementasyon görevi verilmedi.
  Statik incelemede blocker yok; küçük takip düzeltmeleri de okuma değerlendirmesi
  aldı. Yerel aday 109 static / 173 test PASS. Bu bilgi kullanıcı-gözüyle UX
  kabulü yerine geçmez; public hâlâ önceki yayın sürümüdür.

- Son owner isteği Palette Studio/Extract/galeri iyileştirmeleridir; Corpus
  değerlendirmesini uygulama onayı sayma. İlk Studio paketi `c6a187d`, fotoğraf
  `ae27737`, galeri `103ae96`, çok renkli workspace `78617f6`; final entegrasyon
  main `58ff1fe`. `npm run check:release`: 109 statik dosya, 171 PASS / 0 FAIL;
  audit: 0 açık. 8–10 üyeli palet, atama/Undo/reload, fotoğraf aç/kapat ve
  320/390 px kesilmeden Extract → Studio yolu izole origin'de kontrol edildi.
  Yeni bitmap/palet üretilmedi; verilen Katre görseli yalnız tarayıcıda değişir.
- Claude Studio oturumu `bc13dca1-1dfe-4378-8c76-03fc1f889abe` 429 kullanım
  sınırında durdu (reset: 28 Eylül 06:50 Europe/Berlin). Teslimleri korunarak
  final entegrasyon dosyalarının tek yazarlığı Codex'e geçti; aktif Claude
  implementasyonu yok. Kotayı sıfırlanmış veya yeni iş başlamış gibi gösterme.
  Codex yarım fotoğraf bağlantısını, mobil kesilmeyi ve ortak test/cache
  sözleşmelerini tamamladı. Bir saatlik 03:04 hedefi aşıldı; gate atlanmadı.
- Fotoğraf PNG blob'u oluşturulup indirme istendi, fakat IAB download olayı
  gelmedi: cihazdaki dosya doğrulaması NOT RUN. Fotoğraf maske kenarları ve koyu
  baskı kontrastı yaklaşık dijital concept sınırlamasıdır. My palettes tüm
  renkleri saklar fakat RPC rol haritasını saklamaz; yeniden Studio'ya açarken
  beş rol tekrar seçilir. Projects/prototypes/templates haritayı saklar;
  authenticated gerçek save/resume henüz denenmedi.
- Campaigns: aynı paletin afiş/story/bilet uygulaması, kampanya yönetimi değil.
  Owner'a tut/Print & Social adıyla tut/kaldır seçimi soruldu; henüz karar yok.
  Extract 1–5 kontrolleri görseldeki numaralı örnek noktalarına karşılık gelir.
- Güncel UI yayını `58ff1fe`: Cloudflare Pages `df233a75-da5b-4ac0-bd63-f8ee8b442a6c`
  completed/success. `npm run test:live` ve `npm run test:live:release` PASS;
  dört ilgili HTML route ve sekiz JS/CSS asset public içerikle byte-eşleşti.
  Public Studio fotoğrafı ready, export etkin ve konsolda error/warn yok.
  Bu UI/infrastructure kanıtıdır; gerçek inbox/private save-resume kabulü değil.
- İlk somut öncelik dış ekipten gelecek Color Corpus entegrasyonudur.
  `CORPUS-INTEGRATION-01` üç read-only Claude alt ajanıyla incelendi;
  [A–G raporu](color-corpus-integration-assessment.md) Codex incelemesiyle hazır.
  Corpus üretimi/editoryal yönetim dış ekipte kalır. Henüz kayıt içe alınmadı,
  palet/görsel üretilmedi veya uygulama/DB değiştirilmedi. Kullanıcıya rapor
  sunulduktan sonra DUR: implementasyon için yeni onay gerekir.
- Kullanıcı yoğun çalışıp en geç **28 Eylül 2026 (Europe/Berlin)** kendi testini
  yapmak ve yayın koşulları kapanınca çıkmak istiyor. Haftalara yayılan plan
  yerine kısa yayın hazırlığı geçerli. Kalan birkaç ürün işi henüz sıralanmadı.
- Codex **AI Product & Engineering Lead**, Claude **AI Product & Engineering
  Partner**. Tek karar/entegrasyon merkezi Codex; ortak ilk giriş AGENTS.md,
  Claude girişi CLAUDE.md. Ayrı backlog veya bağımsız yayın akışı yok.
- [Koordinasyon protokolü](agent-coordination.md) ve [aktif görevler](open-work.md)
  geçerli. Claude'un ilk email teslimatı ve bağımsız incelemesi alındı.
  Kullanıcı tüm hesap/giriş mühendisliğini Claude'a devretti: tek uygulama
  oturumu aynı `codex/claude-auth-email` worktree'de AUTH-ACCOUNT-01'i yürütür.
  Codex'in kısmi UI değişiklikleri ona aktarılır; Codex inceleme/entegrasyon ve
  hosted ayarları yönetir. Claude teslimi tamamlandı ve Codex main'e entegre
  etti. Confirm sign up ile Magic link or OTP için yeni markalı kod e-postası
  Supabase'de kaydedildi. Yerel build ve 119 test geçti; Account/Studio giriş
  görünümü dar/geniş ekranda kontrol edildi. Claude QA-01'i tamamladı; eski
  canlı-test metin beklentisini QA-RELEASE-02'de düzeltti. Gerçek inbox ve
  save/resume kanıtı hâlâ açıktır. Diğer Claude oturumları read-only kalır.
- Kullanıcı birikmiş çalışmaları açıkça public adreste yayınlatmak istedi.
  `09bba40` main'e push edildi; Cloudflare Pages check completed/success.
  Ana sayfa, Account/Studio HTML ve altı ana JS/CSS dosyası public adreste
  yerel içerikle birebir doğrulandı. Canlı aday kontrolü, testteki eski metin
  beklentisi düzeltildikten sonra PASS. Yayın gerçekleşti; gerçek inbox,
  authenticated save/resume, içerik ve metin kararlarının hepsi tamamlanmış
  gibi sunulmamalıdır. Library approval listesi boş kalır.
- Süre hedefi inbox/save-resume, içerik ve yayın metni kontrollerini kapatmaz.
  Kullanıcı testi ve hosted doğrulama hâlâ kanıt gerektirir; canlı veri silme
  veya başka AI projelerine erişim bu hazırlığın parçası değildir.

## İlk okunacaklar

1. [AGENTS.md](../AGENTS.md): çalışma alanı sınırları.
2. Bu dosya: güncel durum ve korunacak kararlar.
3. [Açık işler](open-work.md): bütün takip kayıtları ve kabul ölçütleri.
4. [MVP denetimi](mvp-gap-audit.md): yayın kapıları; geçilen test yayın değildir.
5. [Operasyon](operations.md): public repo, tek public adres, commit/yayın sınırı.

[Ürün kararları](product-decisions.md) başındaki güncel özet geçerlidir; altındaki
tarihsel kayıtlar otomatik geliştirme talimatı değildir. Yeni uygulama isteği
gelmeden terk edilmiş deneyleri tekrar yapma.

## Yayın öncesi öncelikler

Mevcut ürünün güvenilirliğini, içeriğini ve kullanıcının belirteceği son işleri
yayına hazırla. Aktif görev sahipliği open-work başındadır; aşağıdaki tablo
yayın için gereken temel kanıtları gösterir.

| Sıra | İş | Tek sorumlu | Son tarih | Tamamlanma kanıtı |
| --- | --- | --- | --- | --- |
| 1 | Yerel adayın bağımsız denetimi (`QA-01`) ve bulgu düzeltmeleri | Codex; denetim Claude | Kullanıcı testinden önce | Tekrarlanabilir rapor, incelenmiş düzeltmeler, yerel kontrol |
| 2 | Gerçek inbox ve özel save/resume yolculuğunu tamamla (`AUTH-01/02/03`) | Ürün sahibi | En geç 2026-09-28 test hedefi | Yeni/mevcut üye, sekiz haneli kod, kayıt, çıkış ve tekrar açma |
| 3 | İlk Library içerik kararını ver (`CUR-01`) | Ürün sahibi | Yayın öncesi | Tek tek onay veya açıkça boş Library ile sınırlı yayın kararı |
| 4 | Yayın metinleri/haklar için inceleme yap (`LEGAL-01`) | Ürün sahibi | Yayın öncesi | Sahibin değerlendirdiği nihai metin; hukuki inceleme gerekirse uzman |
| 5 | Cloudflare yayını ve hosted smoke test (`REL-01/02`) | Codex | Testler ve yayın yönlendirmesi sonrası | Deployment kanıtı + release-candidate kontrolü + tarayıcı yolculuğu |

Ürün sahibi inbox erişimi ve içerik kararlarını verir. Ajan eksik onayı varmış
gibi doldurmaz; canlı kullanıcı/veri silmek önceki bir onayın devamı değildir.

## Çalışma alanı ve erişim

- Authored/deployable uygulama `dist/` içindedir. `npm run build` dosya üretmez;
  statik referansları, modülleri ve CSP uyumunu doğrular. React'a taşınmış değil.
- `npm run dev`: `http://127.0.0.1:4174`. `file:///studio/` bir sunucu değildir.
- Tek public çalışan adres `https://colorverse.byigit.dev`; Cloudflare Pages,
  repo `yigitbun/colorverse`, branch `main`. Repo görünürlüğü bu turda GitHub'ın
  read-only çıktısıyla **PUBLIC** olarak doğrulandı.
- `main` push otomatik yayın tetikler. Yerel commit ne uzak yedek ne deployment'dır.
- `.openai/hosting.json` yalnızca secondary private preview'dır; public domaini
  ona bağlama. Yeni dev hostname/Cloudflare Access kurulumu mevcut yön değildir.
- Local preview ve public site aynı onaylanmış Supabase Studio backend'ini
  kullanır. Verileri disposable development data sayma. Ayrıntılar ve credential
  saklama kuralları [Supabase setup](supabase-setup.md) içindedir; burada secret yok.
- Kullanıcı Claude projesine girilmemesini istedi. Önceden açık ChatGPT projesinin
  yalnızca proje listesi/sohbet özeti görüldü; konuşma içeriği içe aktarılmadı.
  Diğer AI projelerinden materyal ancak kullanıcının seçtiği kapsamda alınmalıdır.

## Mevcut yüzeyler: ne var, ne tamamlanmadı?

| Yüzey | Koddaki durum | Kanıt sınırı / kalan iş |
| --- | --- | --- |
| Explore `/` | Globe + solda beş slotlu Mini Studio; kısa altı dünya menüsü; dört AI kartı | Son dünya menüsü beğenildi. Büyük homepage instrument deneyi geri alındı. Yeni Apply/default seçim/globe coupling otomatik eklenmeyecek |
| Studio `/studio/` | 5–24 üyeli workspace, beş preview rolü, Color Globe, inline shades, Products/Screens/Campaigns, Katre canlı photo, private Projects | Fiziksel renk doğruluğu yok. PNG cihaz dosyası ve authenticated resume kanıtı açık |
| Account `/account/` | Email + OK → sekiz haneli email code; yeni/mevcut üye aynı yol; private 2–24 renkli paletler | Mock test geçti; gerçek mail ve tüketim/saklama yolculuğu ayrı kapı |
| Image to palette `/extract/` | Oran koruyan image/points, 5–10 renk arası +; undo, reset, isim, tam Studio handoff | Numara görsel örnek noktasına bağlı. Original-pixel sampling; otomatik analiz ayrı downsample. Orientation regresyonu açık |
| Library `/explore/` | Local text/alias/filter + Oklab eşleme; ayrı rafta dört supplied AI concept | `approvedPaletteIds=[]`; concept görüntüleme corpus onayı değildir. SQL editorial engine yalnız review draft |
| Inspiration `/inspiration/` | Sekiz mevcut supplied AI study; aile gruplaması; ayrı RoomKit Lab linki | Provisional concept disclosure; dış corpus veya nihai editoryal onay yok |
| Community `/community/` | Palette/work/question + inline comments prototipi | Device-local draftlar; örnek yorumlar reload'da gider. Public feed/post/moderation/backend yok |
| Lab `/lab/` | RoomKit browser-local deneyi korunuyor | Gerçek semantic photo recolor değil; yeni ürün fikirleri değerlendirme aşamasında |
| ColorwayKit | Legacy/Sandbox code-native body/cap/label/carton/backdrop; Studio Katre'de ayrı maskeli photo renderer | Eski snapshot alanları tube/bottle/jar/caps'e eşlenir; fotoğraf arka planı sabit, fiziksel doğruluk iddiası yok |
| Sandbox `/sandbox/` | Açık, şifresiz, ayrı local state; deneyler ve One Shape player | Public URL ile erişilebilir; noindex erişim kontrolü değildir. Otomatik ana ürüne taşıma yok |
| Home test `/home-test/` | Geri alma sırasında eski deney yeniden tutuldu; kopya modüller var | Silme isteği ile restore arasında tarihsel çakışma. Kaldırma/taşıma kararını sor; canonical ürün değil |
| Worlds / Editions / About / Privacy | Adresler korunuyor; retired referanslar bozulmuyor | Tarihsel metin/placeholder tutarlılığı ayrıca denetlenecek; hazır curated yayın sayılmaz |

## Korunacak ürün kararları

- **Önce palet.** Kart sırası renkler → bağlam görseli → kısa isim + küçük Studio
  eylemi. Uzun description/curated-by bölümleri geri gelmesin; eski yüksek renk
  blokları büyütülmesin. Hero'da fotoğraf yok; feed filtresi hemen ardından gelir.
- Dünya menüsü: altı kısa isim, iki sıra × üç. Opsiyonel başlangıç daveti,
  seçili dünyada ince ana-renk vurgusu. Dropdown, büyük crescent butonlar,
  dekoratif pentagon/yuvarlak rozetler son tercih değil.
- Main globe geodesic düzenini korur. Zorla tam yüzde yirmi daha çok yüzey
  üretmek için hücreleri yamultma; test küresi ve main küreyi karıştırma.
- Studio Color Globe: tam HEX ve Hue/Intensity/Lightness; Apply yalnız düzenlenen
  role uygulanır, Cancel draftı atar. Dialog'daki bu model ana sayfanın son
  onaylı modelinin aynısı değildir. Homepage reverse coupling hâlâ bir ürün sorusu.
- Auth: password yok, signup/sign-in ayrık form yok, magic-link mail istenmiyor.
  Hosted sekiz hane sahibin açık kararı; altıya indirme. E-posta gönderilmeden
  gönderildiğini ve session oluşmadan giriş yapıldığını söyleme.
- Header: Studio adı + workspace icon, Account yerine erişilebilir kişi iconu.
  Email alanındaki password-manager/Find your login simgesi site bileşeni değildir.
- RoomKit'e dokunma; kaynak fotoğrafın bütününü Surface rolüyle tint etme.
  Code-native yüzey ataması, gerçek/AI fotoğraf recolor'undan ayrı özelliktir.
- Yeni görsel üretmeme önceki sınırdı; güncel owner talimatı Studio için dar
  yeni ürün görseli adayını açtı. Otomatik galeri/corpus üretimi veya live asset
  değişimi yetkisi değildir. Owner-supplied AI görseller disclosure ile kullanılabilir.
  Stock görsel geri getirme, lisansı source link var diye otomatik cleared sayma.
- Kısa editorial isimler ASCII, bir/iki kelime, ≤18 karakter; stable ID ve aile
  adı farklı alanlar. Member'ın yazdığı isimler/non-ASCII metinler korunur.
- Popüler/en iyi iddiası için veri gerekir. Şu anki paletler çalışılmış visual
  interpretations; gerçek üretici spesifikasyonu veya bilimsel kalite skoru değil.

## İçerik envanteri

`dist/ai-studies.js` sekiz supplied AI study kaydıdır. Ana sayfayı ayrı
`dist/curation.js` → `homeStudyIds` seçer; Library approval yine ayrı kalır.

| Explore ID | Kısa isim | Görsel ailesi | Beş renk |
| --- | --- | --- | --- |
| `concept-piera` | Citrus Muse | Piera drinks | `#C8D8A7 #BBA2D1 #E9947B #EAC843 #253B25` |
| `concept-lorien` | Quiet Ink | Lorien pens | `#E9DFCF #958373 #203147 #74322F #283D31` |
| `concept-lorien-care` | Clay Veil | Lorien cosmetics | `#E5D7C1 #B8AA88 #B27D50 #8B4938 #4B2B1C` |
| `concept-katre-room` | Stone Haven | Katre Room | `#EBE4D7 #C8BBA7 #A49379 #74725A #34332D` |

Katre Body/Desk/Street/Motion aynı stone ailesi nedeniyle **seçkiden çıkarıldı**;
dosyaları ve stable ID'leri silinmedi, Sandbox/Studio'da kullanılabilir. Lorien
pens ve cosmetics farklı paletlerdir; aile adına göre global dedupe yapma.
Sekiz study'nin isim/renk yorumu hâlâ proposed; görünmesini istemek Library/hero
onayı anlamına gelmez. 100 legacy palette ve yedi retired external record
yalnız compatibility/referans içindir. Eski katalogla handpicked kaliteyi karıştırma.

## Yedek, özel materyal ve yeniden kurma sınırı

Public Git'e alınmayacak yollar `.gitignore` ile korunur:
`backups/`, `.local/`, `colorverse-chat-transcript.md`, `founder-playbook/`.
Bu yollar silinmedi veya taşınmadı. Ham transkript yeni oturumun zorunlu girdisi
değildir; kişisel konuşma ve gömülü görsel içerebilir, public dokümanlara kopyalama.

Yedi retired external fotoğraf ve kaynak metadata'nın mevcut local kopyası
`backups/curation/external-2026-09-27/` içindedir. Bu **makine dışı yedek değildir**.
Downloads'taki supplied orijinallerin de private backup yöntemi ayrıca seçilmeli.
Git'teki sekiz optimize AI JPEG uygulamayı tekrar kurmaya yeter; orijinallerin
yerini tutmaz. Önceden kaldırılan diğer legacy görsellerin kurtarılabilirliği
tek tek doğrulanmadı; hepsinin bu local backup'ta olduğunu söyleme.

`npm ci`, `npm run check:release` fresh checkout üzerinde uygulanabilir olmalı.
Local external-photo backup testi backup yoksa SKIP edilir; deployed-image
yokluğu, retired ID ve uygulama testleri yine koşar. Gerçek mail gönderen,
admin test kullanıcıları yaratan `scripts/test-member-live.mjs` otomatik
handoff/smoke komutu değildir; yeniden yetki alınmadan çalıştırma.

## Kanıt ve bir sonraki sohbet için başlangıç

### Bu turun yerel checkpoint kaydı

- Önceki temel commit: `7b0f62f` (2026-09-23). Yeni yerel commitler:
  `8478222` private ignore sınırı;
  `c1f0e60` bekleyen uygulama, supplied AI assets, Sandbox ve Auth/template snapshot;
  `c949372` regression/release kontrolleri ve portable backup testi.
  Bu dosyalar ayrıca bir dokümantasyon commitinde kaydedilir; onun hash'i için
  `git log -4 --oneline` kullan. Commit açıklamaları kapsamı ayırır; ürün
  checkpointi paylaşılan controller/asset bağımlılıklarını birlikte tutar.
- Bu turda yeni ürün davranışı geliştirilmedi. Önceki bekleyen değişiklikler
  kaydedildi; tek teknik düzeltme, private backup kontrolünü checkout'tan ayırmak.
- Local workspace: 101 statik dosya doğrulandı, 101/101 test geçti; audit sıfır
  bilinen vulnerability bildirdi. Testler unit/static/mocked türündedir.
- `c949372` yalnız Git içeriğinden temporary klasöre `git archive` ile açıldı:
  101 statik dosya doğrulandı, 100 test geçti, 0 failure; ignored fotoğraf
  backup'ı olmadığı için yalnız 1 local-backup testi SKIP. Bu, özel yerel
  materyal olmadan build/test yapılabildiğinin kanıtıdır; gerçek OTP/browser
  yolculuğu veya temiz dependency install testi değildir.
- Hiçbir push/deployment, canlı mail, kullanıcı yaratma/silme, hosted schema
  değişimi veya Claude erişimi yapılmadı. Makine dışı private backup hâlâ açık.

Yeni oturum önce `git status`, son local commitler ve release kanıtını kontrol
etmelidir; current hosted state yerel kodla aynı varsayılmamalıdır. Tarihsel
Cloudflare/Supabase/GA kontrollerinin tamamlandığı doc'ta yazsa da bu turun
fresh hosted doğrulaması yapılmadı. Geçerli kanıt [MVP denetimi](mvp-gap-audit.md)
ve aşağıdaki çalışma kayıtlarından okunur; gerçek inbox gate açık kalır.

Yeni sohbete yapıştırılabilir başlangıç:

> ColorVerse projesinde devam ediyoruz. Önce AGENTS.md ve oradaki koordinasyon
> kurallarını, ardından docs/handoff.md, docs/open-work.md ve docs/mvp-gap-audit.md
> dosyalarını oku. Hedef en geç 28 Eylül 2026 kullanıcı testine hazır yayın adayı.
> Codex tek koordinasyon/entegrasyon merkezidir. Atanmış kapsamda ilerle; başka
> agent'ın dosyalarını düzenleme. Claude/ChatGPT projelerine kendiliğinden girme.
> Gerçek inbox, içerik ve yayın kanıtını yerel testlerden ayrı tut.
