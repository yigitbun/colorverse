# ColorVerse — renk araçları için 10 ürün fikri

Araştırma: 14 Eylül 2026. Bunlar öneridir; onaylanmış geliştirme kapsamı değildir.
Mevcut Shades yenilemesi bu listeden bağımsızdır. Sıralama ürün değerlendirmesidir.

## İncelenen alanlar

Adobe Color'ın ana araç ve keşif sayfaları ile Coolors'ın ana araçları tarayıcıda
incelendi. Her kullanıcının ürettiği palet ve giriş arkasındaki kişisel içerikler
kapsama dahil değildir. Font Generator güvenlik doğrulamasında kaldı; bu araç
hakkında çalışma davranışı iddiasında bulunulmuyor.

| Adobe Color sayfası | Gözlem |
| --- | --- |
| [Color wheel](https://color.adobe.com/create/color-wheel) | Sürüklenebilir noktalar; Custom, Analogous, Complementary, Split complementary, Triad, Square, Compound, Shades, Monochromatic uyumları; kilit ve geri alma kontrolleri. |
| [Image](https://color.adobe.com/create/image) | Görsel yükleme ve görselden palet çıkarma. |
| [Image gradient](https://color.adobe.com/create/image-gradient) | Görselden gradient, renk durakları ve geçişte kaplanan alanı düzenleme. |
| [Contrast](https://color.adobe.com/create/color-contrast-analyzer) | Ön plan / arka plan kontrastı, AA/AAA değerlendirmesi. |
| [Accessibility](https://color.adobe.com/create/color-accessibility) | Renk görme farklılıklarını simüle etme ve ayırt edilebilirliği değerlendirme. |
| [Explore](https://color.adobe.com/explore) | Ruh hali, stil ve sezon üzerinden keşif. Eski `/trends` adresi buraya yönleniyor. |
| [Libraries](https://color.adobe.com/library) | Kişisel içeriği görmek için giriş istiyor; kaydetme akışı araçlarda görünür. |

| Coolors sayfası | Gözlem |
| --- | --- |
| [Generator](https://coolors.co/generate) | Beşli palet, hex değerleri, üretme, görünüm, kaydetme ve dışa aktarma. Kilitli renkleri koruyarak üretme [resmi yardımda](https://coolors-help.zendesk.com/hc/en-us/articles/360010581980-Generate-a-palette) açıklanıyor. |
| [Palettes](https://coolors.co/palettes) | Trending görünümü, isimli paletler, arama ve kaydetme sayaçları. |
| [Image picker](https://coolors.co/image-picker) | Fotoğraftan palet oluşturma. |
| [Contrast checker](https://coolors.co/contrast-checker) | Metin / arka plan seçimi ve küçük / büyük metin değerlendirmesi. |
| [Visualizer](https://coolors.co/visualizer) | UI, marka, tipografi, desen ve illüstrasyon bağlamları. |
| [Color picker](https://coolors.co/color-picker) | Renk dönüşümleri; shades, tints, tones, hues, temperatures; uyumlar ve yakın renkler. |
| [Tailwind](https://coolors.co/tailwind) | Light/dark ve default/hover/active/disabled gibi durumları gerçek arayüz örneklerinde gösterme. |
| [Color Bot](https://coolors.co/color-bot) | Renk ve tasarım önerileri için sohbet arayüzü. |
| [Colors](https://coolors.co/colors) | İsimli renk kütüphanesi. |
| [Gradients](https://coolors.co/gradients) | Gradient keşfi. |
| [Gradient maker](https://coolors.co/gradient-maker) | Durak, pozisyon, dönüş, gradient türü ve CSS çıktısı. |
| [Gradient palette](https://coolors.co/gradient-palette) | Başlangıç/bitiş rengi ve aradaki renk sayısı. |
| [Image recolor](https://coolors.co/image-recolor) | Kullanıcının tasarımını paletle renklendirme, varyant kaydetme. |
| [Collage maker](https://coolors.co/collage-maker) | Fotoğraf + palet sunumları. |
| [Photo editor](https://coolors.co/photo-editor) | Ayarlar, filtreler ve efektler. |
| [Image converter](https://coolors.co/image-converter) | Toplu görsel format dönüşümü. |
| [Fonts](https://coolors.co/fonts) | Font keşfi. |
| [Font generator](https://coolors.co/font-generator) | Güvenlik doğrulaması nedeniyle araç incelenemedi. |
| [Pricing](https://coolors.co/pricing) | Koleksiyon, proje, kaydedilen varlık ve gelişmiş araç kapsamlarını karşılaştırma. |

Coolors'ın proje/koleksiyonla filtreleme ve palet kopyalama akışı ayrıca
[resmi kaydedilmiş paletler yardımından](https://coolors-help.zendesk.com/hc/en-us/articles/360010542520-Browse-your-saved-palettes)
kontrol edildi. Ücretli ya da hesap gerektiren özellikler için satın alma veya
hesap değişikliği yapılmadı.

## ColorVerse'e uyarlanmış öneriler

1. **Mini Harmony Wheel.** Studio'nun Color lab alanında açılan yaklaşık 220 px
   renk çarkı. Beş rol noktayla temsil edilir. Serbest modda yalnızca seçili nokta;
   uyum modunda bağlı noktalar birlikte hareket eder. İlk sürüm: serbest, komşu,
   tamamlayıcı, üçlü. Çarktaki noktayı seçmek soldaki rolü de vurgular.
2. **Keep & Explore.** Kullanıcı sevdiği renkleri sabitler; kalan roller için dört
   alternatif palet önizlemesi görür. Örnek: “Bu lacivert kalsın, daha sakin bir
   vurgu bul.” Rastgele üretimin kapsamı baştan görünür olur.
3. **A/B deneme masası.** Mevcut paleti A olarak sabitle, B'de değişiklik dene.
   İkisini aynı Studio tasarımında yan yana karşılaştır; seçilen sürümü uygula.
   İlk sürüm yerel iki anlık görüntü ve geri alma ile sınırlı tutulabilir.
4. **Readability Lens.** Studio önizlemesindeki metin, düğme ve zemin çiftlerinin
   sorunlarını yerinde işaretle. “En yakın okunaklı tonu öner” eylemi seçilen çifti
   düzeltir; kullanıcı sonucu görüp uygular. Renk körlüğü simülasyonu aynı
   tasarıma uygulanabilir. Sonuçlar tüm ürünün erişilebilirliğini garanti etmez.
5. **Proje sepetleri.** Her renk/palet kartındaki “Sepete ekle”, son kullanılan
   koleksiyonu önerir: Kafe kimliği, Ev, Sonbahar kampanyası. Renkle beraber kaynak
   görsel, kısa not ve seçilme bağlamı saklanabilir. İlk aşama cihazda saklama;
   hesaplar geldiğinde cihazlar arası eşitleme.
6. **Color Bridge.** Paletten iki renk seç; aralarında 3/5/7/9 adımlı ara tonlar
   ve gradient üret. Bir ara rengi mevcut role uygulamak ya da gradienti CSS olarak
   almak iki ayrı eylem olur. Extract sayfasındaki görsel de başlangıç olabilir.
7. **Renk kullanım oranları.** Studio'da zemin / destek / vurgu için alan oranını
   değiştiren bir kontrol. Aynı paletin daha sakin veya baskın görünmesini sağlar.
   60/30/10 yalnızca başlangıç örneğidir. Şablon başına gerçek alan dağılımı
   düzenlenmeli; bütün tasarımlar için kesin bir oran iddiası yapılmamalı.
8. **Kendi tasarımında dene.** Kullanıcı basit bir SVG logo veya illüstrasyon
   yükler, bulunan renkleri beş role eşler ve paletini uygular. İlk sürüm düz
   dolgulara odaklanır; orijinali ve varyantları yan yana korur. Görselleri
   yayınlamak bu yerel denemenin bir parçası değildir.
9. **Light/Dark + durum seti.** Beş renkten eşleşen açık/koyu arayüz paletleri ve
   düğmenin hover/pressed/disabled tonlarını öner. Önizlemede iki tema birlikte
   görülebilir; çıktı anlamlı CSS değişkenleri içerir. Ton üretmekle kontrastı
   doğrulamak ayrı kontroller olmalı.
10. **Palette Story Card.** Kaynak fotoğrafı, beş renk, rol etiketleri ve kısa
    açıklamayı seçilmiş bir kompozisyonda birleştir. Kare paylaşım, sunum ve
    masaüstü moodboard boyutlarında indirilebilir bir renk kartı üretir.

## İlk araştırmadaki sıra — sonraki görüşmede güncellendi

Proje/şablon hafızası → Lab + RoomKit / Living Spaces → community koleksiyonları.
Mini çark, Keep & Explore ve A/B karşılaştırma bu temelleri destekleyen sonraki
araçlardır. Kullanıcı özellikle projeleri/şablonları yeniden kullanmayı,
community katkısını ve gerçek mekânda renk görmeyi öne aldı. Güncel tartışma için
[proje hafızası ve yorum araştırması](project-workspace-and-review-research.md)
ile [ürün kararlarına](product-decisions.md) bakılmalı.
Bu sıra mevcut Studio düzenleme ve Color tray altyapısını büyütür. Bağımsız
fotoğraf editörü, font kataloğu ve genel sohbet botu şimdilik daha düşük öncelikli:
ColorVerse'in paletten uygulamaya geçen temel akışına katkıları daha dolaylı.

## Son görüşme özeti

- En güçlü üç yön: kullanıcının proje/şablon hafızası ve kişisel varsayılanları;
  Community + Lab ile deneyleri kullanıcıya doğrulatma; RoomKit / Living Spaces
  ile paleti gerçek veya örnek bir mekânda görme.
- Hemen doğrulanabilir araç: Studio'ya eklenen Mini Harmony Wheel. Aktif renk
  sürüklenerek ayarlanır; Free, Analogous, Complementary ve Triad ilişkileri
  öneri olarak denenir ve Apply ile palete alınır.
- A/B deneme masası için önerilen model: Prototype 1 kaydedilip kilitlenir;
  Prototype 2 ondan bağımsız kopya olarak açılır. Varsayılan testte dört renk
  aynı kalır, tek değişken görünür; değişiklikler baseline'ı ezmez.
- Shades için yön: ilk bakışta kısa inline komşu tonlar; büyük shade kütüphanesi
  yalnızca isteyen kullanıcı için gelişmiş görünüm. Yanında seçili çift için
  okunabilirlik/kontrast önerisi.
- RoomKit upload ilk aşamada private ve browser-local kalmalı. Public görsel
  paylaşımı ayrı eylem, hak onayı, güvenlik ve oda-uygunluk kontrolü, provenance,
  report/takedown ve kalıcı backend olmadan açılmamalı. Oda olmayan görsel
  yönlendirilmeli; uygunsuz görsel public feed'e hiç girmemeli.
