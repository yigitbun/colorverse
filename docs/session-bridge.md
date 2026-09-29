# ColorVerse — kısa sohbet devri

Güncelleme: 2026-09-29. Yeni bir Codex sohbetinde “ColorVerse'de devam”
denirse önce [AGENTS.md](../AGENTS.md), sonra bu sayfa ve `git status`
okunur. Bu dosya güncel yön bulma kartıdır; ayrıntı kaynağı ilgili görev,
karar, kod ve Git kaydıdır. Tarihli iddiaları yeniden doğrula.

Kaynak Codex görevi: **Handoff’tan devam et**
(`01a0eac6-ccc6-7f71-bfcd-42804ad9bad5`, host `local`). Yalnız burada
eksik kalan bir karar/kanıt varsa o görevin ilgili son bölümünü oku.

## Şu anki durum

- Public yayın hâlâ `14d7a38`. Yerel `main`: hareketli Studio drag kartı
  `b03c953`, renk ekleme `3812fdc`, karttan Globe açma `b8d4911`, zengin
  Screens raporu `1bd6f95` + asset pin `0fbddea`, görünür Studio Shuffle
  `6f291d2` entegre; public'e gönderilmedi. Son release 236/236 PASS.
  Shuffle 13/13, ilgili Studio browser regresyon 14/14 PASS. Rapor ve
  Shuffle 1280/390px yerel tarayıcıda
  görsel olarak incelendi, yatay taşma yok. Gerçek inbox/private save kanıtı açık.
- AGENTS başlangıç okuması görev bazlı hale getirildi; bu kısa sohbet devri
  akışı eklendi. Giriş ve köprü belgeleri yerel `main` checkpoint'indedir;
  public yayına gönderilmedi.
- Yerel ana sayfa world-menu/zoom çalışması ile ilgili dosyalar dirty:
  `dist/app.js`, `dist/index.html`, `dist/world-picker.css`; ilgili backlog ve
  ürün kararlarında da yerel düzenlemeler var. Başka görevin kapsamına katma.
- HOME-JOURNEY-17: owner yönüyle ana sayfadaki örnek palet bölümü kaldırıldı;
  globe hero'yu doğrudan “Color is a decision, not a swatch.” rafı izliyor.
  Hero'nun ikincil bağlantısı Library'ye gidiyor; Library'deki dört konsept
  artık ilk ekranda (`799d688`), onay durumu değişmedi. Yerel main `782ae13`,
  release 236/236 ve izole
  browser smoke 2/2 PASS; public'e gönderilmedi. Claude dar worktree görevinde
  dosya üretmeden beklediği için durduruldu; Codex uyguladı.
- SITE-TOOL-CATALOG-18: owner'ın Color Globe ekran görüntüsü, gerçek Piera
  kaynak görseli + beş renk ve mevcut Katre ürün görseliyle ortak raf daha
  basık/footer tarzı şerit oldu (`95cd0b4`). “Find a direction” yerine
  “Explore a color”; Account/Privacy sakin sürümü korundu. 114 statik dosya,
  236/236 test, 2/2 izole browser smoke ve masaüstü/390px görsel kontrol PASS;
  public'e gönderilmedi. Studio'nun ayrıca ürün/görsel güncellemesi owner
  değerlendirmesine açık; bu turda mevcut Katre preview'u korunarak bırakıldı.
- Claude STU-10/12/13/14 revizyonları Codex tarafından incelenip entegre edildi;
  aktif ikinci yazar yok. Ayrı worktree'ler duruyor; yeni kapsam vermeden
  üzerinde çalışma başlatma.
- REL-02 hosted dar smoke 2026-09-29: 390px, klavye, dark, reduced-motion,
  JS-kapalı fallback, CSP ve Studio gerekli asset'leri kontrol edildi.

## Açık sınırlar ve kararlar

- Tek kanonik kuyruk: [open-work.md](open-work.md). Yeni isteğin ID'sini veya
  ilgili bölümünü ara; bütün dosyayı varsayılan olarak okuma.
- Ana sayfanın genel hero hiyerarşisi `HOME-01` kapsamında açık. Yerel world
  menu/zoom değişiklikleri Studio yayınına girmedi.
- Gerçek sekiz haneli e-posta kodu, authenticated project save/resume ve cihaz
  PNG denemeleri ayrıca kanıt ister (`AUTH-01/02/03`, `STU-02`).
- HQ-05'in kalan browser smoke kapsamı Extract→Studio ve hesap form durumları;
  hiçbir test gerçek mail veya canlı hesap oluşturmaz.
- STU-09: Owner'ın isteğiyle Studio renk kartı artık grip-drag sırasında
  imleç/parmağı izliyor; Claude `c8c54b7` → Codex yerel main `b03c953`.
  Entegre drag browser 4/4, smoke 2/2, release 232/232 PASS. Public'e
  gönderilmedi; gerçek cihaz kabulü yok. Ana sayfa dirty home zoom korunuyor.
- Studio Color 6+ ekleme, karttan Color Globe açma, ayrıntılı Sales Performance
  raporu ve mevcut renkleri karıştıran Shuffle yerel PASS;
  [STU-10/12/13/14](open-work.md) ayrıntıları görev belgelerinde. Generate
  ayrı aday/karşılaştırma akışı olarak önerildi; ürün kararı açık (STU-15).
  Owner düzeltmesi STU-14A: tam genişlikli Shuffle bloğu kaldırıldı; ikon
  palet adıyla aynı satırın sağında (`efa8125`), 1280/390px kontrol edildi.
- STU-16: Skincare Katre etiket harfleri düşük kontrastta yalnız preview'da
  uyarlanıyor (`54e66bc`); kaynak/palet korunuyor. Release 235/235,
  açık-koyu yerel görsel ve frozen comparison kontrolü PASS. Public değil.
- HOME-03: Mini Studio Hue/Lightness özel HEX'e geçince dünya seçimi filtresi
  globe marker'ını temizliyor; `focusPoint` çağrılmıyor. Önceki reverse coupling
  geri alınmıştı. Slider değişince globe'un yaklaşık renge dönmesi/işaretlemesi
  için owner tercihi bekleniyor; mevcut davranış gizlice değiştirilmesin.
- Onaylı renk corpus'u hâlâ yok; araştırma notları import veya içerik onayı
  değildir. Campaigns yönü ve ilk Library paletleri owner kararı bekler.

## Ayrıntıya gitmek için

- Karar veya kapsam: [product-decisions.md](product-decisions.md), ilgili
  [open-work.md](open-work.md) satırı ve `docs/tasks/` görevi.
- Eski oturumun gerekçesi/kanıtı: [handoff.md](handoff.md) içindeki ilgili
  tarihli bölüm. Eski “yarım uygulama” satırları güncel durum değildir.
- Yayın/hosting: [operations.md](operations.md). Ajan devri ve dosya sahipliği:
  [agent-coordination.md](agent-coordination.md).

## Sonraki sohbet için kullanım

Başlangıç mesajı: **“ColorVerse'de devam. AGENTS.md ve
docs/session-bridge.md ile güncel durumu al, git status ile doğrula; sonra
şu işe geç: …”**

Yeni görev ayrı bir worktree'de açılırsa commit edilmemiş yerel değişiklikler
oraya otomatik taşınmaz. Dirty bir işi sürdürürken mevcut checkout'u seç veya
görevi açıkça working-tree durumundan başlat; önce dosyaların orada olduğunu
doğrula.

Sohbet uzadığında veya kullanıcı “yeni sohbete geçelim” dediğinde Codex bu
sayfayı kısa ve güncel tutar: kaynak görev kimliği, gerçekleşen sonuç, karar,
test/kanıt, dirty dosyalar, açık iş ve bir sonraki adım. Tam sohbeti veya uzun
kronolojiyi buraya kopyalamaz. Yeni sohbet önce bu karttan başlar; eksik
ayrıntıyı ilgili dosyada veya kaynak Codex görevinde arar. Kullanıcı açıkça
yeni görev açılmasını isterse aynı başlangıç mesajı yeni Codex görevine
gönderilir.
