# ColorVerse — sohbetten bağımsız devir paketi

Güncelleme: 2026-09-27. Bu dosya kapanan sohbetin yerine geçecek başlangıç
kaydıdır. Ham sohbetin veya başka bir AI projesinin okunması gerekmemelidir.
Önceki devir oturumu dokümantasyon ve yerel commit ile sınırlıydı; aşağıdaki
güncel yönlendirme sonraki görüşmeyi kaydeder.

## Güncel yönlendirme — 2026-09-27

- Kullanıcı yoğun çalışıp en geç **28 Eylül 2026 (Europe/Berlin)** kendi testini
  yapmak ve yayın koşulları kapanınca çıkmak istiyor. Haftalara yayılan plan
  yerine kısa yayın hazırlığı geçerli. Kalan birkaç ürün işi henüz sıralanmadı.
- Codex **AI Product & Engineering Lead**, Claude **AI Product & Engineering
  Partner**. Tek karar/entegrasyon merkezi Codex; ortak ilk giriş AGENTS.md,
  Claude girişi CLAUDE.md. Ayrı backlog veya bağımsız yayın akışı yok.
- [Koordinasyon protokolü](agent-coordination.md) ve [aktif görevler](open-work.md)
  geçerli. Claude için QA-01 hazır; henüz çalıştırılmadı. Kod yazma görevinde
  ayrı worktree ve dosya sahipliği önce tanımlanır.
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
| Studio `/studio/` | Beş rol, Color Globe dialogu, inline shades, tray, export, Objects/Screens/Campaigns, private Projects | Sahnenin fiziksel ürün rengi doğruluğu iddiası yok. Authenticated gerçek resume kanıtı açık |
| Account `/account/` | Email + OK → sekiz haneli email code; yeni/mevcut üye aynı yol; private 2–24 renkli paletler | Mock test geçti; gerçek mail ve tüketim/saklama yolculuğu ayrı kapı |
| Image to palette `/extract/` | Oran koruyan image/points + beş renk workspace; undo, reset, isim, Studio handoff | Original-pixel manuel sampling var; otomatik analiz ayrı downsample. Hosted/orientation/browser kalite regresyonu izlenecek |
| Library `/explore/` | Local text/alias/filter + Oklab eşleme engine'i | `approvedPaletteIds=[]`; içerik boş. SQL editorial engine yalnız review draft |
| Inspiration `/inspiration/` | Kompakt palette-first shelf; Edition/RoomKit yönleri | Eski görseller kaldırıldı; final handpicked görsel seçkisi yok |
| Community `/community/` | Palette/work/question + inline comments prototipi | Device-local draftlar; örnek yorumlar reload'da gider. Public feed/post/moderation/backend yok |
| Lab `/lab/` | RoomKit browser-local deneyi korunuyor | Gerçek semantic photo recolor değil; yeni ürün fikirleri değerlendirme aşamasında |
| ColorwayKit | Studio/Sandbox'ta body/cap/label/carton/backdrop ataması, frozen baseline, PNG export | Çalışan code-native concept. AI fotoğrafı yeniden renklendirilmiyor |
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
- Yeni görsel **üretme**. Owner-supplied AI görseller disclosure ile kullanılabilir.
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
