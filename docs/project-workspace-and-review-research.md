# ColorVerse: proje hafızası ve kullanıcı yorumu araştırması

Tarih: 2026-09-14. Durum: ürün tartışması ve araştırma yöntemi; geliştirme veya
toplu veri toplama yapılmadı. Aşağıdaki pilot boyutları hedef önerisidir, mevcut
bir veri kümesinin sayıları değildir.

## Kullanıcının vurguladığı yön

ColorVerse, insanların renk ürettiği kadar kendi çalışmalarını sakladığı,
önceki projelerinden devam ettiği ve adlandırılmış şablonlarını yeniden
kullandığı bir çalışma alanı olarak düşünülmeli. Bu yön, community katkısıyla
birlikte ana ürün önceliğidir.

Kullanıcının Power BI örneği: boş rapor yerine daha önce oluşturduğu isimli
şablonu çoğaltıyor. Şablonun ikonları, arka planları, fontları ve şirketin belirli
sarı/siyah renkleri hazır. Yeni grafik de bu tercihleri kullanıyor.

## Önerilen ürün modeli

| Nesne | Amaç | Örnek |
| --- | --- | --- |
| Proje | Güncel iş, palet adayları, seçili roller, referanslar ve sürümler | Firma A — Eylül satış raporu |
| Şablon | Adlandırılmış, yeniden kullanılabilir başlangıç | Firma A — Rapor başlangıcı |
| Marka seti | Kesin renkler, anlamsal kullanımlar, font ve varlık tercihleri | Firma sarısı, koyu zemin, başlık fontu |
| Koleksiyon | Aktif işi değiştirmeden saklanan ilhamlar | Sonra denenecek sıcak tonlar |

Önerilen davranışlar:

- Projeyi çoğaltmak ya da şablondan başlamak bağımsız bir kopya oluşturur;
  kaynak proje değişmez. Şablonun daha sonra güncellenmesi mevcut projelere
  kendiliğinden uygulanmaz.
- Açıkça seçilmiş marka tercihleri varsayılandır. Proje içindeki değişiklikler
  yalnız o projeye aittir; bütün marka setine uygulamak ayrı bir eylemdir.
- Yeni bileşenler rengi yalnızca palet sırasına göre değil, atanmış role göre alır.
  Grafik senaryosunda aynı veri serisi aynı renk eşlemesini korur.
- Studio, Extract ve Community'deki kaydetme eylemi mevcut proje/koleksiyonlara
  eklemeyi ve bulunduğu yerde yeni koleksiyon oluşturmayı destekler. Kaydetme
  bittiğinde kullanıcı aynı seçime, taslağa ve çalışma konumuna döner.
- Ana girişte son projeler, kaldığın yerden devam ve kendi şablonların görünür.
  İlk ziyaretçinin hızlı renk üretme yolu da korunur.
- Community'den alınan palet veya şablon kişisel projeye kopyalanır; kaynak ve
  üretici bilgisi korunur. Özel projenin community'ye açılması açık paylaşım
  eylemidir.
- Fontlar, ikonlar ve arka planlar ileride şablon kapsamına alınabilir. İlk sürüm
  proje kaydetme/çoğaltma, isimli palet şablonları, roller ve referanslarla
  sınırlandırılabilir. Bir Power BI rapor editörü yapmak bu örneğin amacı değil.

## Retention hipotezi

Önceki kararları ve varlıkları yeniden kullanmak, tekrar başlama maliyetini
azaltabilir ve anlamlı geri dönüşü artırabilir. “Kişiselleşme retention'ı kesin
artırır” sonucu henüz kanıtlanmış değil.

Önerilen ölçüm: ilk projesini kaydeden bir grubun 7 ve 28 gün içinde yeniden
gelip projeyi düzenleme, çoğaltma, dışa aktarma veya bir community fikrini kendi
işine uygulama oranı. Sadece sayfayı açmayı anlamlı dönüş sayma. Günlük aktiflik
yerine iş sıklığına göre haftalık/aylık kullanım da değerlendirilmeli.

Şablon kullananlar zaten daha aktif olabilir; iki grubun basit karşılaştırması
nedensellik kanıtı değildir. Yeterli kullanım olduğunda başlangıç deneyimini
deneyle karşılaştır; az kullanıcı varken görev gözlemleri ve görüşmelerle başla.

## Kontrol edilen küçük yorum örneklemi

Bu gözlemler fırsat hipotezi üretir; yaygınlık ya da toplam kullanıcı oranı vermez.

| Kanıt | Kullanıcı ihtiyacı | ColorVerse için hipotez |
| --- | --- | --- |
| Pocket Palette, 2021-12-15, kullanıcının paylaştığı beş yıldızlı yorum: renk seçerken yeni klasör oluşturma ve başka işe uygun paleti saklama isteği | Çalışmayı kesmeden yan keşfi kaydetmek | Kaydet menüsünde yeni koleksiyon; aktif proje/taslak korunur |
| Pocket Palette, 2021-05-11: akıcı arayüzü beğenirken uyum kuralları ve çarkta ilişki görme isteği | Kontrolü anlaşılır biçimde artırmak | Mini çark; yeni seçenekler mevcut akışı yavaşlatmamalı |
| Coolors, 2021-05-19: kilit, renk değiştirme, proje filtresi ve başkalarının çalışmalarına övgü | Tekrar kullanılabilir düzen ve başkalarından keşif | Proje sistemi ile community arasında geçiş |
| Coolors, 2021-11-28 ve 2022-02-24: giriş/bağlantı veya plan sınırları nedeniyle kaydetmenin kesilmesi anlatılıyor | Üretilen çalışmayı kaybetmemek, erişim koşullarını önceden bilmek | Dayanıklı taslak; görünür kayıt durumu; kullanıcı verisinin dışa aktarılabilmesi |

Kaynaklar: [Pocket Palette App Store](https://apps.apple.com/us/app/pocket-palette/id1342063329),
[Coolors App Store yorumları](https://apps.apple.com/us/app/coolors/id956480678?see-all=reviews).
Yorumlar tarihsel deneyimleri anlatır; rakiplerin güncel davranışı olarak
sunulmamalıdır. Pocket Palette'in mevcut sürüm notlarında HSB çarkı bulunması,
eski bir talebin güncelliğini yeniden kontrol etmenin neden gerekli olduğunu
gösterir; bütün uyum kurallarının eklendiğini tek başına kanıtlamaz.

## Binlerce yorumu inceleme yöntemi

1. **Örneklem tasarımı.** Renk araçları yanında şablon/marka/proje akışı olan
   komşu ürünleri seç. Önce 300–500 benzersiz yazılı yorumla pilot; kaynak,
   platform, dil, dönem ve yıldız dağılımını görünür tut. Güncel yorumlarla
   tarihsel örnekleri ayrı değerlendir. Yalnız en çok beğenilen veya 1 yıldızlı
   yorumları toplama. Web ve mobil deneyimlerini karıştırma.
2. **Kaynaklara uygun toplama.** Küçük pilotta açık sayfalar ve talep panoları;
   büyüdükçe erişim kapsamı doğrulanmış export/API. Bütün internete tek bir
   API'den eksiksiz erişildiğini varsayma. Kaynak kapsamı, tarih aralığı ve
   eksikleri kaydet. Bu aşamada ücretli hizmet alınmadı veya hesap bağlanmadı.
3. **Temizleme.** Kaynak yorum ID'siyle, yoksa metin/tarih/ürün eşleşmesiyle
   tekrarları ayıkla. Aynı App Store yorumu sayfada kart ve açılmış ayrıntı
   olarak iki kez görünebiliyor. Güncellenmiş yorum, geliştirici yanıtı ve yeni
   yorum ayrı tutulmalı. Orijinal dil korunur; çeviri ayrı alan olur.
4. **İhtiyaç çıkarma.** Her yorumdan bir veya birden fazla ihtiyaç kaydı çıkar:
   yapılan iş, tetikleyen durum, istenen sonuç, engel, kullanılan geçici çözüm,
   iş üzerindeki etki, açık talep ve yorumladığımız hipotez. Her çıkarımı
   kaynak ID/link ve kısa destekleyici alıntı veya konumuyla ilişkilendir.
   Metinde olmayan kullanıcı mesleği, ödeme niyeti veya demografi uydurulmaz.
5. **Gruplama.** Kaydetme, yeniden başlama, organizasyon, marka tutarlılığı,
   düzenleme kontrolü, paylaşım, dışa aktarma, erişim ve güven gibi temalar.
   Önceden beklemediğimiz temalar için açık kategori ve manuel inceleme bırak.
   Sentiment ve ihtiyaç etiketleri ayrıdır: beş yıldızlı yorum da sorun taşır.
6. **İnsan kontrolü.** Pilotun yaklaşık 50–100 yorumunu elle inceleyip etiketleri
   ve yorumlamayı kalibre et. Her önemli kümeden rastgele, olumlu/olumsuz ve
   aykırı örnekleri yeniden oku. Düşük güvenli çıkarımları ayır. Model özeti
   kaynak metnin yerine geçmez.
7. **Kanıt kartları.** Her fırsatta iş tanımı, benzersiz destekleyen yorum sayısı,
   o segmentte incelenen toplam yorum sayısı, kaynak dağılımı, yakın tarihli
   kanıt, karşı örnek, temsilî bağlantılar ve test edilecek ürün fikri bulunsun.
   Bir yorum birçok ihtiyaç içerirse aynı temanın paydasında tekrar sayılmaz.
8. **Karar ve doğrulama.** Sıklık, engelin ciddiyeti, hedef kullanıcıya uygunluk,
   güncellik, farklı kaynaklarda görülme ve geliştirme maliyeti birlikte
   değerlendirilir. En sık istenen özellik otomatik olarak sıradaki iş olmaz.
   Rakip yorumlarından çıkan hipotezler ColorVerse görev testleriyle sınanır.

Pilot etiketleri yeterince tutarlı olduğunda aynı süreç erişilebilen birkaç bin
yoruma uygulanabilir. Sonraki toplamalarda yeni/değişen kayıtlar işlenir.
Bu, kurulmuş bir periyodik takip veya çalışır veri hattı değildir.

## Erişim yolları için doğrulanan bilgiler

- [Apple App Store Connect](https://developer.apple.com/documentation/appstoreconnectapi/customer-reviews):
  kendi uygulamanın yorumlarını almak içindir; rakipleri kapsayan genel bir
  yorum indirme API'si olarak sunulamaz.
- [Google Play Developer API](https://developers.google.com/android-publisher/reply-to-reviews):
  yetkili erişimle kendi uygulamanın yorumları. Rakiplerin tam tarihçesine
  erişim sağladığı varsayılmamalı.
- [Appfigures Reviews API](https://docs.appfigures.com/api/reference/v2/reviews):
  hesaba ait olmayan ürünlerin verisi için Public Data API eklentisi gerekir.
  Ürün/kaynak/tarih kapsamı ve erişim bedeli satın almadan önce doğrulanmalıdır.
- [AppFollow export](https://support.appfollow.io/hc/en-us/articles/360020831557-Export-Reviews-and-Replies):
  XLS/CSV dışa aktarımı var; ücretsiz hesaplarda sunulmuyor.
  [Ürün ekleme dokümanı](https://support.appfollow.io/hc/en-us/articles/360020979718-Add-Apps-to-Your-Workspace)
  kendi ürünleri ve rakipleri izlemeyi açıklıyor; seçilen planın veri kapsamı
  ayrıca kontrol edilmeli.

## Önerilen ilk ürün sırası

Güvenilir proje kaydı ve devam etme → çoğalt / isimli şablondan başla → çalışma
sırasında koleksiyona kaydet → marka varsayılanları → community'den kişisel
projeye yeniden kullanım. Araç zenginleştirmeleri bu temeli destekler.
