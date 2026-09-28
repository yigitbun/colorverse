# Color Corpus entegrasyon değerlendirmesi — CORPUS-INTEGRATION-01

Base: `2208df1`. Bu çalışmada yalnızca okuma yapıldı ve değişen tek dosya bu
belge. Komut, test, ağ isteği ya da canlı DB sorgusu çalıştırılmadı.

Denetim üç read-only subagent ile yapıldı: `corpus-model-audit`,
`corpus-product-audit` ve `corpus-editorial-audit`. Kritik atıfları birincil
oturum ayrıca doğruladı. Revizyon, Codex incelemesinin ardından yapıldı;
nihai entegrasyon notları Codex tarafından aşağıda netleştirildi.

Etiketler: **[Kod]** kaynakta görülen durum, **[Öneri]** onay bekleyen
değişiklik. Henüz gerçek bir korpus girdisi yok. E bölümündeki sözleşme,
implementasyondan önce üretici ekiple teyit edilmeli.

## A. Mevcut mimari [Kod]

**Palet verisi**

- Keşif ekranlarının verisi statik ES modüllerinden gelir: `dist/palettes.js:599`
  (100 kayıt, 75'i `hslToHex` ile üretilmiş: 448–597), `dist/ai-studies.js`,
  `dist/retired-review-palettes.js` ve inline `drift-field-01`
  (`dist/app.js:49-61`).
- Bunların hepsi `editionPalettes` içinde birleşir (`dist/app.js:62`).
- Keşif akışında Supabase okuyan bir kod bulunamadı. Supabase yalnızca üye
  verisi için kullanılıyor (`dist/account.js:88-214`, `dist/project-store.js`).

**Renk ve roller**

- Bir renk yalnızca `#RRGGBB` string'idir. Renk ID'si ya da renk başına
  metadata tutulmuyor.
- Studio rolleri konumsal: `['Background','Surface','Primary','Accent','Text']`
  (`dist/color.js:1`). Hangi rengin hangi rol olduğunu dizideki sıra belirler
  (`dist/app.js:342-346`, `dist/color.js:78`).
- `arrangeRoles`, renkleri luminance ve chroma değerine göre yeniden sıralar
  (`dist/color.js:87-102`).
- DB tarafında `palette_colors` yalnızca 1–5 pozisyonlarını ve aynı beş rolü
  kabul eder (initial schema `supabase/migrations/20260911000000_initial_colorverse_schema.sql:66-74`).
- Foundation, Secondary ve Neutral rol olarak hiçbir yerde tanımlı değil.

**ID'ler**

- ID'ler text slug. Üretilmiş kayıtlarda slug addan türetiliyor
  (`dist/palettes.js:572-574`).
- Statik katalog ile DB `palettes` tablosu aynı ID uzayını paylaşır
  (`scripts/generate-palette-migration.mjs:29-30`).

**Library ve Explore**

- Library yalnızca onaylı, tekil ve tam 5 geçerli HEX'e sahip kayıtları
  indeksler (`dist/library-engine.js:38-43`).
- Home ekranı sabit ID listeleri kullanır (`dist/app.js:985-991`).
  `homeStudyIds` onay kontrolünü bypass eder (`dist/curation.js:11-19`).

**Görseller**

- Yalnızca `dist/assets/studies/*.jpg` altındaki 8 AI konsepti var. Kredileri
  `{kind:'ai',label,origin:'owner-supplied'}` biçiminde (`dist/ai-studies.js:18`).
- Diğer kayıtlarda `image`, `source` ve `credit` null (`dist/palettes.js:395-446`).
- Library kartı ne görsel ne kredi gösterir (`dist/app.js:424-428`).
- Studio mockup'ları CSS/HTML/SVG kitleridir (`dist/app.js:548-587`).

**Kaynak ve hak alanları**

- `visual_sources` tablosunda şu alanlar var: `source_url`, `source_credit`,
  `license_name` ve `license_url` (initial schema 37-49).
- Repoda bu tabloyu dolduran bir seed ya da onu okuyan runtime kodu
  bulunamadı. Canlı DB içeriği sorgulanmadı.

**Yayın durumu**

- Keşif için tek etkin kapı `approvedPaletteIds = Object.freeze([])`
  (`dist/curation.js:4`). Listenin boş kalması testle kilitli
  (`scripts/test-palettes.mjs:28-31`).
- `is_published` şu an iki şeyi kapılar:
  - DB'de anonim okumaları (RLS, initial schema 231-243),
  - RPC referans kontrollerini (`20260919000200_sync_palette_library.sql:669-670`,
    `20260922000100_member_palettes.sql:52-57`).
- Ancak `is_published` editoryal keşif onayı değildir
  (`docs/library-engine.md:33-35`).
- `supabase/drafts/editorial_library.sql` bir taslak ve uygulanmamış (satır 1,
  `docs/library-engine.md:18-22`). Etkin mimari sayılmamalı.

## B. Yeniden kullanılabilir parçalar [Kod]

- **Library engine:** onaylı-ID kapısı, 5 renk kontrolü, tekil ID kontrolü,
  metin/alias/tag araması ve Oklab bire bir eşleme.
- **Tek onay otoritesi olarak `approvedPaletteIds`.** Doküman bunu açıkça
  istiyor (`docs/library-engine.md:42-45`).
- **Yardımcılar:** `normalizeHex` (`dist/member-palette.js:7-10`) ve ID deseni
  `^[a-z0-9-]{1,120}$` (`dist/member-palette.js:17-25`).
- **Ad kuralı:** ColorVerse editoryal adları ASCII, bir-iki kelime ve en fazla
  18 karakter olmalı (`scripts/test-palettes.mjs:70-86`).
  - Kredilerde orijinal yazım korunur (`docs/palette-naming.md:32-33, 47-52`).
  - `suggestPaletteName` yalnızca boş adı doldurur
    (`scripts/test-sandbox.mjs:23-26`).
- **Handoff:** `?p=<id>` parametresi ve `colorverse-current-palette` anahtarı
  (`dist/palette-handoff.js:5`, `dist/app.js:69-72`).
- **Kredi gösterimi:** `credit.kind` dalı ve AI rozeti (`dist/app.js:1004-1006`).
- **Test altyapısı:** `npm test` / `check:release` (`package.json:10-11`).

## C. Gerçek boşluklar

1. **Kaynak ve provenance alanları yok.** Kaynak yorumu ile Original'ı ayıracak,
   orijinal kaynak renklerini, renk türetme gerekçesini, kaynak lisansını,
   görsel lisansını, yaratım türünü ve metodolojiyi tutacak alan bulunmuyor.
   Taslaktaki tek `provenance_kind` alanı görseli anlatıyor, paleti değil.
2. **Korpus rolleri Studio rolleriyle örtüşmüyor.** Primary ve Accent iki sette
   de var ama anlamları aynı olmayabilir. Neutral'ın hangi Studio rolüne
   denk geldiği belirsiz.
3. **Kayıt tanıma dar.** Tıklama işleyicisi (`dist/app.js:706`) ve
   `studioSnapshot` (`dist/app.js:237`) yalnızca `palettes` modülünü tanıyor.
4. **Kaydetme bağı kırılıyor.**
   - `projects.source_palette_id` bir FK (initial schema 84).
   - Save RPC'leri referansta `is_published` şartı arıyor.
   - Sonuç: yalnızca statik dosyada bulunan bir korpus ID'si kaydetmede
     "Reference not found" hatası alır.
5. **Provenance handoff'ta düşüyor.** Snapshot yalnızca `sourcePaletteId`
   taşıyor (`dist/app.js:236-248`). `sanitizeDraft` yalnızca `{name, collection,
   colors, referenceKey}` alanlarını tutuyor (`dist/member-palette.js:17-25`).
   RPC ise sadece `reference_key` yazıyor (`20260922000100_member_palettes.sql:79`).
   Revizyon, eşleme ve kaynak ilişkisi hiçbir yerde korunmuyor.
6. **Eksik kontroller ve durumlar.**
   - Veri doğrulayıcısı yok. `scripts/validate-static-site.mjs` yalnızca CSP,
     link ve sözdizimi kontrol ediyor.
   - `withdrawn` durumu yok.
   - Dış kredi/lisans gösterimi yok.

## D. En küçük genişletmeler [Öneri]

1. **Statik, local-first import.**
   - `data/corpus/approved.json` dosyası `scripts/import-corpus.mjs` ile
     doğrulanır ve `dist/corpus-palettes.js` üretilir.
   - Bu mevcut runtime'a ve `docs/library-engine.md:38-45` kararına uyar.
   - CMS ya da yeni bir backend gerekmez.
2. **Adapter kaydı.**
   - Mevcut kayıt şekli aynen kalır: `{id, name, description, category, tags,
     useCases, colors[5], image, imageAlt, credit}`.
   - Tam provenance ise engine'in yok saydığı ayrı bir `corpus` nesnesinde
     değiştirilmeden tutulur.
   - `credit.kind` her kayıtta `external` değildir. Görselin yaratım türünden
     türetilir: AI görsel AI rozeti alır, fotoğraf ya da illüstrasyon kendi
     etiketiyle gösterilir.
3. **Onay listesi.** Üretilmiş onaylı ID'ler `approvedPaletteIds` listesine
   eklenir. Bu liste tek otorite olarak kalır.
4. **Kayıt tanıma genişler.** `dist/app.js:706` ve `:237` satırları
   `editionPalettes` üzerinden arama yapar hale gelir.
5. **DB uyumluluk ankoru.**
   - Mevcut save RPC'lerinin çalışması için onaylı her korpus ID'sine karşılık
     `palettes` tablosuna bir satır eklenir.
   - Bu yeni bir yayın otoritesi değildir. `is_published=true` burada yalnızca
     RPC referans kontrolünü ve DB public okumalarını açar; editoryal keşif
     onayını ise statik liste belirlemeye devam eder.
   - Ekleme yeni ve ileriye dönük bir additive migration ile yapılır. Uygulanmış
     migration yeniden üretilmez (`scripts/generate-palette-migration.mjs:4`
     riskli) ve legacy satırlar toplu olarak toggle edilmez.
   - Migration frontend release'inden önce uygulanır ve doğrulanır.
6. **Additive referans handoff'u.**
   - Snapshot'a ve üye taslağına `corpusRef {id, revision, studioMapping}`
     eklenir; editoryal orijinal ile kullanıcı çalışma kopyası ayrılır.
   - Proje kaydında mevcut `p_editor_state` / `project_versions.editor_state`
     kullanılır; bunun için yeni snapshot RPC parametresi gerekmez.
     Template yolu aynı referansı mevcut `defaults` içinde koruyabilir.
   - Üye ve collection kayıtları için `save_member_palette` ve
     `save_palette_to_collection` yollarına gerekirse geriye uyumlu,
     opsiyonel ve doğrulanan kaynak metadata girdisi eklenir. Bu bilgi
     mevcut `saved_palette_items.source_metadata` içinde korunur.
   - Onaylı revizyonların kaynak/provenance geçmişi import tarafında tutulur;
     yalnız güncel revizyona bakıp eski kullanıcı kopyasının kökeni değiştirilmez.
     Yayından kaldırılan içerik public artifact'ten çıkarılır; kimlik için
     asgari kaldırılma kaydı korunur.
   - Mevcut private satırlar yeniden yazılmaz. Güncel sanitizer/save/resume
     zinciri genişletilmeden revizyon ve eşlemenin korunduğu iddia edilemez.
7. **Görüntüleme.**
   - Karta opsiyonel görsel ve kredi satırı eklenir. Application görseli,
     paletten tasarım kararına ve bitmiş sonuca giden örnektir; kaynak
     fotoğrafından piksel çıkarımı olarak etiketlenmez.
   - Detay alanında kaynak, yorum, iki ayrı lisans ve renk türetmeleri
     gösterilir.
8. **Dokunulmayan kısımlar.** Üye verisi ve mevcut 2–24 renk desteği aynen
   kalır. Korpus kayıtları için engine'de değişiklik gerekmez.

## E. Tek interchange sözleşmesi: versiyonlu JSON batch [Öneri]

İç içe provenance ve ayrı kaynak renkleri için JSON en basit kayıpsız seçenek.
CSV bu aşamada ek dönüşüm ve düzleştirme gerektirir.

Batch şekli: `{contractVersion, batchId, producedAt, records[]}`.

**Kamuya açıklık.** Repo ve `dist/` herkese açık. Batch yalnızca yayına uygun,
onaylı metin ve provenance içerebilir. Private editoryal audit (yorumlar,
reddedilen içerik, iç notlar) repo dışında kalır. Bu değerlendirmede o
materyale erişilmedi.

**Ortak zorunlu alanlar**

- `id`: kalıcı ve addan türetilmemiş. Desen `^[a-z0-9-]{1,120}$`.
- `revision`: tamsayı.
- `kind`: `source-interpretation` ya da `colorverse-original`.
- `editorial`: `{status: approved|withdrawn, decidedBy, decidedAt}`.
  `decidedBy` bir rol ya da ekip etiketidir, kişisel veri değildir.
- `name`: ColorVerse editoryal adıdır ve mevcut kısa ASCII kuralına tabidir.
  Kural gevşetilmez ve ad otomatik olarak değiştirilmez. Kurala uymayan ad
  import'u durdurur ve owner kararına gider (bkz. G3).
- `aliases[]` / `titles[]`: kaynak başlıkları ve alternatif adlar. Orijinal
  yazımlarıyla korunur.
- `description`: onaylı açıklama metni.
- `colors[]`: **tam 5 renk**, editoryal sırada. Her renk
  `{hex, role, origin, sourceColorRefs[], derivationNote}` alanlarını taşır.
  - `role` korpus sözlüğünden gelir: Foundation, Primary, Secondary, Accent
    ya da Neutral.
  - `origin` değerleri: `source` (kaynaktan değiştirilmeden), `modified`,
    `added` ya da `original`.
- `methodology`: `{summary, references[]}`. Onaylı yöntem açıklaması ve,
  sağlandıysa, açıklayıcı metin.
- `context`: `{applicationContexts[], category, tags[], useCases[]}`.
- `metadata`: opak ve yayına uygun anahtar-değer çiftleri. ColorVerse bu
  alanı skorlamaz ve yorumlamaz. Bilimsel ya da harmoni alanı eklenmez.

**Alt tipe göre kurallar**

- `source-interpretation`
  - Zorunlu alanlar:
    - `source {title, creator, reference, license{name,url}, attribution}`,
    - `sourceColors[]` (`{sourceColorId, hex, note}`; sayısı 5 olmak zorunda
      değil),
    - `interpretation {statement}`.
  - `source` ve `modified` renkleri, kayıt içinde tekil ve geçerli
    `sourceColorId` değerlerine bağlanmalı.
  - `modified` ve `added` renklerde `derivationNote` zorunlu.
  - `original` renk kullanılamaz.
- `colorverse-original`
  - `methodology` ve `original {creator, statement, producedAt}` provenance
    bilgisi zorunlu. Tarihsel kaynak sahibi gibi gösterilmez; `source` ile
    `sourceColors` bu alt tipte kullanılmaz. Metodoloji referansları korunur.
  - Renkler yalnızca `origin: original` olabilir.
- `visuals[]`: `{asset, alt, purpose: application|source-reference,
  creationKind: ai|photograph|illustration|render|other, creator, supplier,
  license{name,url}, attribution}`.
  - `creationKind`, `supplier`/`creator` ve haklar ayrı alanlarda tutulur.
  - `asset`, repoda doğrulanmış yerel bir dosyadır. Runtime'da uzak görsel
    çekilmez ve görsel üretilmez.
- `studioMapping`: opsiyonel. Studio'nun beş rolünün her birini `colors`
  içindeki bir index'e bağlar. Beş index de benzersiz ve 0–4 aralığında
  olmalı.

**Geçersiz kayıt, duplicate ve güncelleme davranışı**

- **Atomik doğrulama.** Tek bir hata bile yerel hiçbir artifact'in üretilmemesine
  yol açar. Buradaki atomiklik yalnızca yerel artifact'ler içindir; DB
  migration'ı ve Cloudflare deploy'u tek bir transaction değildir.
- **Duplicate ID.** Batch içinde tekrar eden ya da legacy, AI, retired veya
  edition ID'leriyle çakışan kayıtlar reddedilir.
- **Revizyon.**
  - Aynı revizyon ve aynı içerik: işlem yapılmaz.
  - Aynı revizyon ama farklı içerik: reddedilir.
  - Daha yüksek revizyon: mevcut kaydın yerini alır.
  - Daha düşük revizyon: reddedilir.
- **Withdrawn.** `withdrawn` kayıt aktif public kayıt olarak yayınlanmaz.
  Yalnızca ID ile "kaldırıldı" mesajı için gereken asgari bilgi tutulur ve ID
  rezerve kalır. Reddedilen içerik ya da private alanlar sızdırılmaz.
- **Aynı renk kümesi.** Farklı ID'lerde aynı beş renk yalnızca uyarı üretir.

**Saklama ile gösterim farkı.** Import tüm alanları değiştirmeden saklar.
Gösterim bunların yalnızca bir alt kümesini kullanır.

## F. Akış [Öneri]

1. Korpus ekibi onaylı ve yayına uygun batch'i teslim eder.
2. `import-corpus.mjs` şema, alt tip, kaynak rengi referansları, eşleme,
   ad kuralı, ID/revizyon ve yerel asset kontrollerini yapar.
3. Statik modül ve onay listesi üretilir. DB ankor migration'ı ayrıca hazırlanır.
   Boş onay listesini kilitleyen eski test, yeni kayıtlarda onay şartını
   doğrulayacak şekilde güncellenir; legacy/proposed kayıtlar otomatik onaylanmaz.
4. **Yayın kapısı.** Yalnızca `approved` kayıtlar `approvedPaletteIds`
   listesine girer (`library-engine.js:41`, testler). Önce migration uygulanıp
   doğrulanır, sonra frontend release'i Codex ve owner yönlendirmesiyle yapılır
   (`AGENTS.md:28-29`).
5. **Library görünümü.** Kartta renkler korpus rolleriyle birlikte editoryal
   sırada gösterilir. Home'a eklenmek owner kararına bağlıdır.
6. **Studio.**
   - `studioMapping` varsa, orijinal kaydı değiştirmeden 5 renkli türetilmiş
     bir çalışma kopyası oluşturulur. Yalnızca bu kopya Studio sırasına göre
     dizilir ve `corpusRef` alanını taşır. `arrangeRoles` hiçbir zaman sessizce
     çağrılmaz.
   - Eşleme yoksa kayıt Library'de kullanılmaya devam eder, ama Studio eylemi
     görünmez.
   - Üye kaydederken ya da çalışmaya geri dönerken `corpusRef` D6'daki
     additive yolla korunur.

## G. Gerçek ürün kararları

1. **Studio eşlemesi.** Önerim, eşlemenin her kayıt için korpus ekibinden
   açıkça gelmesi. Eşleme verilmemiş kayıtlar yalnızca görüntülenir; ColorVerse
   ne sabit bir kural uygular ne de otomatik eşleme yapar
   (`docs/product-decisions.md:507`).
2. **Onay yetkisi.** `docs/product-decisions.md:282-286`, her kayıt için
   owner'ın görsel ve HEX onayını gerektiriyor. Korpus ekibinin `approved`
   kararı bu onayın yerine geçen bir yetki devri mi, yoksa owner ikinci bir
   kapı olarak mı kalacak?
3. **Ad çakışması.** Üreticinin verdiği bir kanonik ad kısa ASCII kuralına
   uymazsa ne yapılacak? Seçenekler: kayıt beklemeye alınır, ya da ekip
   kurala uyan bir ad sunar ve orijinal ad alias olarak korunur. Bu karar
   yalnızca gerçek adlar geldiğinde gerekir.

Teknik varsayılan, statik import ile minimal DB ankorudur (D1, D5, D6). Henüz
onaylı bir üretici örneği yok. Bu eksik bir girdi; yerine içerik uydurulmadı.

## Kaynak haritası

- **Veri:** `dist/palettes.js`, `dist/ai-studies.js`, `dist/curation.js`,
  `dist/retired-review-palettes.js`
- **Motor ve UI:** `dist/library-engine.js`, `dist/app.js` (62, 69-81, 236-248,
  424-428, 548-587, 706, 985-1020), `dist/color.js`, `dist/palette-handoff.js`,
  `dist/member-palette.js`, `dist/palette-names.js`
- **SQL:**
  - initial schema: 37-74, 84, 134-146, 231-243
  - `20260919000200_sync_palette_library.sql`
  - `20260921000800_prototype_workbench_rpc.sql`
  - `20260922000100_member_palettes.sql`
  - taslak (uygulanmadı): `supabase/drafts/editorial_library.sql`
- **Belgeler:** `docs/library-engine.md`, `docs/product-decisions.md`,
  `docs/palette-naming.md`, `docs/curation-review.md`
- **Testler ve scriptler:** `scripts/test-palettes.mjs`,
  `scripts/test-release-readiness.mjs`, `scripts/generate-palette-migration.mjs`

Değerlendirme burada durur. Implementasyon için owner onayı gerekiyor.
