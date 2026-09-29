# ColorVerse — kısa sohbet devri

Güncelleme: 2026-09-29. Yeni bir Codex sohbetinde “ColorVerse'de devam”
denirse önce [AGENTS.md](../AGENTS.md), sonra bu sayfa ve `git status`
okunur. Bu dosya güncel yön bulma kartıdır; ayrıntı kaynağı ilgili görev,
karar, kod ve Git kaydıdır. Tarihli iddiaları yeniden doğrula.

Kaynak Codex görevi: **Handoff’tan devam et**
(`01a0eac6-ccc6-7f71-bfcd-42804ad9bad5`, host `local`). Yalnız burada
eksik kalan bir karar/kanıt varsa o görevin ilgili son bölümünü oku.

## Şu anki durum

- `main` başı `14d7a38`: Studio orta genişlik düzeni ve grip ile renk takası
  yayımlandı. Yerel release check 232/232 PASS, canlı release adayı kontrolü
  PASS. Beş üyede renkler preview slotlarıyla birlikte takas olur; 6+ üyede
  preview rolü aynı renge bağlı kalır. Gerçek inbox/private save kanıtı açık.
- AGENTS başlangıç okuması görev bazlı hale getirildi; bu kısa sohbet devri
  akışı eklendi. Giriş ve köprü belgeleri yerel `main` checkpoint'indedir;
  public yayına gönderilmedi.
- Yerel ana sayfa world-menu/zoom çalışması ile ilgili dosyalar dirty:
  `dist/app.js`, `dist/index.html`, `dist/world-picker.css`; ilgili backlog ve
  ürün kararlarında da yerel düzenlemeler var. Başka görevin kapsamına katma.
- Aktif atanmış ikinci yazar veya yürüyen Claude işi kaydedilmiş değil.

## Açık sınırlar ve kararlar

- Tek kanonik kuyruk: [open-work.md](open-work.md). Yeni isteğin ID'sini veya
  ilgili bölümünü ara; bütün dosyayı varsayılan olarak okuma.
- Ana sayfanın genel hero hiyerarşisi `HOME-01` kapsamında açık. Yerel world
  menu/zoom değişiklikleri Studio yayınına girmedi.
- Gerçek sekiz haneli e-posta kodu, authenticated project save/resume ve cihaz
  PNG denemeleri ayrıca kanıt ister (`AUTH-01/02/03`, `STU-02`).
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
