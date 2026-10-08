# ALINDA — Panel Bazlı Geliştirme ve Polish Roadmap

Bu doküman ALINDA'nın mevcut özelliklerini yeniden yazmak yerine, **hangi ekranın hangi sırayla görsel, UX, ticari ve operasyonel olarak tamamlanacağını** takip etmek için hazırlanmıştır.

## Çalışma Kuralı

- Her panel ayrı sprint olarak ele alınacak.
- Bir sprintte yalnızca o panelin kapsamı değiştirilecek.
- Mevcut booking motoru, tenant izolasyonu ve güvenlik kuralları bozulmayacak.
- Her önemli değişiklikten sonra GitHub Actions build kontrol edilecek.
- Build yeşil olmadan sonraki sprint'e geçilmeyecek.
- Gerçek işletme akışı test edilmeden özellik production-ready kabul edilmeyecek.
- Önce **kullanılabilirlik**, sonra **görsellik**, sonra **satış/operasyon değeri** optimize edilecek.

---

# 1. ANA SAYFA — SATIŞ PANELİ

**Amaç:** Ziyaretçiyi mümkün olduğunca hızlı şekilde demo veya WhatsApp görüşmesine götürmek.

### P0 — Öncelikli

- [ ] Hero alanını satış odaklı son haline getir
- [ ] Ana CTA'yı güçlendir: Demo işletmeyi incele
- [ ] İkinci CTA: WhatsApp'tan bilgi al
- [ ] Gerçek public booking demo bağlantısını görünür yap
- [ ] "Kimler için?" sektör bölümünü ekle
- [ ] Gerçek kullanım senaryosu ekle: müşteri → randevu → WhatsApp → panel
- [ ] Pro planı görsel olarak ana teklif haline getir
- [ ] Yıllık planların avantajını net göster
- [ ] Yıllık fiyat kartı stil koşulunu düzelt
- [ ] Mobil hero ve CTA'ları yeniden kontrol et

### P1 — Güven ve dönüşüm

- [ ] Public booking sayfasından gerçek ekran görüntüleri / mockup alanı
- [ ] İşletme sahibinin 3 adımda kurulum akışını göster
- [ ] WhatsApp AI Sekreter senaryosu göster
- [ ] "Randevu kaçırma" ve "telefon trafiği" problemini net anlat
- [ ] Özellikleri teknik değil işletme faydası olarak anlat
- [ ] Sık sorulan sorular bölümü
- [ ] KVKK / güvenlik / veri izolasyonu için güven bölümü
- [ ] Sahte yorum / sahte puan kullanılmaması

### P2 — Premium polish

- [ ] Tipografi hiyerarşisini standartlaştır
- [ ] Kart, border, shadow ve radius sistemini standardize et
- [ ] Scroll animasyonlarını ölçülü ekle
- [ ] Mobil header/menu son kontrol
- [ ] SEO title/description/OG görselleri
- [ ] Favicon / manifest / sosyal paylaşım görselleri
- [ ] Lighthouse / Core Web Vitals kontrolü

**Çıkış kriteri:** Ziyaretçi 30 saniye içinde ALINDA'nın ne yaptığını anlamalı ve demo/WhatsApp aksiyonuna ulaşabilmeli.

---

# 2. İŞLETME PANELİ — OWNER PANEL

**Amaç:** Salon sahibinin her gün kullanacağı ekranı mümkün olduğunca hızlı ve sade hale getirmek.

## 2.1 Dashboard

### P0

- [ ] Bugünkü randevu sayısını daha güçlü göster
- [ ] Bekleyen / onaylanan / iptal edilen ayrımı
- [ ] Bugünkü tahmini ciro
- [ ] Günün ilk/son randevusu
- [ ] Yaklaşan randevu kartı
- [ ] Boş gün için güçlü CTA
- [ ] Public booking linkini dashboard'da görünür yap
- [ ] "Linki kopyala" butonu
- [ ] QR kod oluştur / indir

### P1

- [ ] Yeni işletme için onboarding checklist
- [ ] Hizmet ekle
- [ ] Uzman ekle
- [ ] Çalışma saatlerini ayarla
- [ ] İşletme profilini tamamla
- [ ] WhatsApp'ı bağla
- [ ] Onboarding ilerleme yüzdesi

### P2

- [ ] Son 7 gün randevu özeti
- [ ] En çok tercih edilen hizmet
- [ ] En yoğun saat
- [ ] Basit gelir grafiği
- [ ] Mobil dashboard sadeleştirmesi

---

## 2.2 Randevular

### P0

- [ ] Mobilde randevuları daha hızlı taranabilir hale getir
- [ ] Bugün / yarın / bu hafta hızlı filtreleri
- [ ] Pending / confirmed / cancelled görsel ayrımı
- [ ] Randevu kartında kritik bilgileri tek bakışta göster
- [ ] Onay / iptal aksiyonlarını hızlandır
- [ ] İptal sonrası slotun tekrar açıldığını görünür belirt

### P1

- [ ] Tarih navigasyonu
- [ ] Uzman filtresi
- [ ] Hizmet filtresi
- [ ] Müşteri araması
- [ ] Referans araması
- [ ] Randevu detay drawer/modal polish
- [ ] WhatsApp iletişim aksiyonu

### P2

- [ ] Günlük takvim görünümü
- [ ] Uzman bazlı takvim görünümü
- [ ] Randevu durumuna göre hızlı toplu filtreleme

---

## 2.3 Hizmetler

### P0

- [ ] Hizmet kartlarını sadeleştir
- [ ] Fiyat + süreyi daha görünür yap
- [ ] Aktif/pasif durumunu netleştir
- [ ] Boş durumda örnek hizmet önerileri

### P1

- [ ] Hizmet ekleme formunu adımlara bölme veya sadeleştirme
- [ ] Uzman eşleştirmesini daha anlaşılır yap
- [ ] Sürükle-bırak sıralama gerekiyorsa değerlendirme

---

## 2.4 Uzmanlar

### P0

- [ ] Uzman kartlarını premium hale getir
- [ ] Fotoğraf / isim / unvan / aktiflik tek bakışta
- [ ] Hizmet eşleşmeleri görünür
- [ ] Çalışma durumu görünür

### P1

- [ ] Uzman detayında çalışma saatleri özeti
- [ ] İzin günleri özeti
- [ ] Uzmanın verdiği hizmetler

---

## 2.5 Çalışma Saatleri

### P0

- [ ] Haftalık saatleri daha görsel hale getir
- [ ] Açık/kapalı durumunu netleştir
- [ ] Mola alanlarını sadeleştir
- [ ] Kaydetme/loading durumlarını iyileştir

### P1

- [ ] Uzman çalışma saatlerini işletme saatlerinden ayırarak daha anlaşılır göster
- [ ] İzin günü yönetimini kolaylaştır
- [ ] "Bugün kapalı" gibi özet durumlar

---

## 2.6 İşletme Ayarları

### P0

- [ ] Ayarları bölümlere ayır
- [ ] İşletme bilgileri
- [ ] İletişim ve adres
- [ ] Marka / logo
- [ ] Public booking
- [ ] WhatsApp

### P1

- [ ] Public booking önizlemesi
- [ ] Booking linki + kopyala
- [ ] QR kod
- [ ] Harita önizlemesi
- [ ] Marka renkleri için canlı preview

### P2

- [ ] Tema seçimi
- [ ] Public sayfa görünüm önizlemesi

---

## 2.7 WhatsApp

### P0

- [ ] Bağlantı durumunu çok net göster
- [ ] Bağlı / bağlı değil durumları
- [ ] Kurulum CTA'sı
- [ ] Test mesajı / test bildirimi
- [ ] Günlük özet ayarı

### P1

- [ ] WhatsApp konuşma geçmişi görünümü
- [ ] Sekreter durum özeti
- [ ] AI aktif/pasif durumu
- [ ] Template / production eksiklerini kullanıcıya anlaşılır göster

---

# 3. PUBLIC RANDEVU SAYFASI

**Amaç:** Müşterinin telefondan mümkün olan en az adımla randevu almasını sağlamak.

## 3.1 Ana akış

### P0

- [ ] Hizmet → uzman → tarih → saat → müşteri akışını son UX kontrolünden geçir
- [ ] Seçili adımı görsel olarak çok net göster
- [ ] Mobil sticky booking summary son polish
- [ ] Form bölümüne otomatik scroll davranışını kontrol et
- [ ] Loading durumlarını standardize et
- [ ] Hata mesajlarını kullanıcı dostu hale getir
- [ ] Slot dolarsa otomatik yeniden yükleme mesajını polish et

## 3.2 Mobil

### P0

- [ ] iPhone/Android gerçek cihaz QA
- [ ] Yatay hizmet kartı swipe/snap kontrolü
- [ ] Uzman kartlarının dokunma alanı
- [ ] Takvim dokunma alanları
- [ ] Sticky bottom bar
- [ ] Klavye açıldığında form davranışı
- [ ] Uzun sayfada scroll pozisyonu
- [ ] Safe-area kontrolü

## 3.3 Güven ve dönüşüm

### P1

- [ ] İşletme logosu / marka kimliği
- [ ] Adres + harita
- [ ] Google Maps yol tarifi
- [ ] Telefon / WhatsApp iletişim CTA
- [ ] Hizmet açıklamalarının okunabilirliği
- [ ] "Randevum var" erişimini görünür tut
- [ ] KVKK metnini sadeleştir ama hukuki kapsamı koru

## 3.4 Randevu sonrası

### P0

- [ ] Başarı ekranını premium hale getir
- [ ] Referans numarasını çok görünür yap
- [ ] Randevu özeti
- [ ] İşletme iletişim bilgisi
- [ ] Randevuyu takvime ekle
- [ ] WhatsApp'a yönlendirme
- [ ] Randevu sorgulama / iptal CTA'sı

## 3.5 Harita

### P1

- [ ] OpenStreetMap embed son görsel polish
- [ ] Marker kontrolü
- [ ] Mobil yükseklik
- [ ] Adres ile koordinat tutarlılığı
- [ ] Harita yüklenmezse fallback
- [ ] Google Maps yol tarifi bağlantısı

## 3.6 Public booking teknik QA

- [ ] Geçmiş tarih/saat testi
- [ ] Uzman izin testi
- [ ] İşletme kapalı gün testi
- [ ] Mola testi
- [ ] Uzun hizmet testi
- [ ] Aynı slot için eşzamanlı booking testi
- [ ] Kupon testi
- [ ] İptal sonrası slot testi
- [ ] accessEnabled=false testi
- [ ] Mobil gerçek cihaz testi

**Çıkış kriteri:** Yeni müşteri hiçbir eğitim almadan telefondan randevusunu tamamlayabilmeli.

---

# 4. SUPER ADMIN PANELİ

**Amaç:** Faruk'un tüm işletmeleri tek merkezden hızlı ve güvenli yönetebilmesi.

## 4.1 Dashboard

### P0

- [ ] Toplam işletme
- [ ] Aktif işletme
- [ ] Erişimi kapalı işletme
- [ ] Aktif abonelik
- [ ] Bekleyen ödeme
- [ ] Bugünkü toplam randevu
- [ ] Pro işletme sayısı

### P1

- [ ] Yeni işletmeler
- [ ] Yaklaşan abonelik bitişleri
- [ ] Son aktivite
- [ ] WhatsApp bağlantı durumu
- [ ] Sistem uyarıları

---

## 4.2 İşletmeler

### P0

- [ ] Arama
- [ ] Plan filtresi
- [ ] Aktif/pasif filtresi
- [ ] Erişim filtresi
- [ ] Ödeme durumu filtresi
- [ ] Abonelik durumu filtresi
- [ ] İşletme kartında kritik bilgileri tek bakışta göster

### P1

- [ ] İşletme detayına hızlı geçiş
- [ ] Public booking linki
- [ ] Owner e-posta
- [ ] Plan
- [ ] Abonelik bitişi
- [ ] Access durumu
- [ ] WhatsApp durumu

---

## 4.3 İşletme Detay

### P0

- [ ] İşletme özeti
- [ ] Owner bilgisi
- [ ] Plan / ödeme / abonelik özeti
- [ ] Access aç/kapat
- [ ] Public booking aç/kapat
- [ ] Public sayfaya git
- [ ] Panel erişimini kontrol et

### P1

- [ ] Randevu özeti
- [ ] Son aktiviteler
- [ ] WhatsApp durumu
- [ ] Hızlı destek görünümü
- [ ] İşletme yapılandırma özeti

---

## 4.4 Abonelik Yönetimi

### P0

- [ ] Starter / Pro
- [ ] Aylık / yıllık
- [ ] Ödeme durumu
- [ ] Başlangıç / bitiş tarihi
- [ ] Access Enabled
- [ ] Aktif/pasif
- [ ] Manuel abonelik başlatma

### P1

- [ ] Süresi yaklaşan işletmeler için filtre
- [ ] Ödeme bekleyenler için filtre
- [ ] Abonelik geçmişi
- [ ] İşlem öncesi net confirmation modal

**Kural:** Abonelik süresi doldu diye sistem otomatik erişim kesmeyecek. Erişim manuel olarak yönetilecek.

---

## 4.5 Aktivite Logları

### P0

- [ ] Kritik işlem listesi
- [ ] İşlem yapan
- [ ] İşletme
- [ ] Tarih/saat
- [ ] İşlem tipi

### P1

- [ ] İşlem filtresi
- [ ] İşletme filtresi
- [ ] Tarih filtresi
- [ ] Detay görünümü

---

## 4.6 Kuponlar

### P1

- [ ] Kupon listesi
- [ ] Aktif/pasif
- [ ] Tarih
- [ ] Kullanım limiti
- [ ] Kullanım sayısı
- [ ] İşletme kapsamı

### P2

- [ ] Kullanım istatistikleri
- [ ] En çok kullanılan kuponlar

---

## 4.7 Duyurular

### P1

- [ ] Aktif duyurular
- [ ] İşletme kapsamı
- [ ] Başlangıç/bitiş
- [ ] Tip
- [ ] Düzenleme/silme

### P2

- [ ] Duyuru okunma / görünme takibi gerekiyorsa eklenmesi

---

## 4.8 AI Sekreter / İstatistik

### P1

- [ ] Toplam randevu
- [ ] Gelir
- [ ] İptal oranı
- [ ] En yoğun saat
- [ ] En çok tercih edilen hizmet
- [ ] En aktif işletmeler

### P2

- [ ] Tarih aralığı filtresi
- [ ] İşletme filtresi
- [ ] Plan bazlı karşılaştırma
- [ ] Daha güçlü operasyon önerileri

---

## 4.9 WhatsApp Merkezi

### P0

- [ ] Bağlı işletmeler
- [ ] Bağlı olmayanlar
- [ ] Telefon
- [ ] WABA durumu
- [ ] Pro günlük özet durumu

### P1

- [ ] Production eksiklerini göster
- [ ] Template durumu
- [ ] Webhook durumu
- [ ] Son webhook / mesaj zamanı
- [ ] Hata durumları

---

# 5. LOGIN / ACCESS / SUSPENDED EKRANLARI

**Amaç:** Kullanıcı erişim durumunu karışıklık yaratmadan anlatmak.

### P0

- [ ] Login ekranı premium polish
- [ ] Loading state
- [ ] Hatalı giriş mesajları
- [ ] Şifre reset akışı
- [ ] Suspended ekranı açıklaması
- [ ] Destek WhatsApp CTA
- [ ] İşletme adı gösterimi mümkünse eklenmesi

### P1

- [ ] İlk giriş yönlendirmesi
- [ ] Yeni işletmede onboarding'e yönlendirme

---

# 6. ORTAK TASARIM SİSTEMİ

Tüm panellerde aynı görsel dil korunacak.

### P0

- [ ] Renk tokenlarını tek standarda getir
- [ ] Tailwind renkleri ile globals.css değişkenlerini uyumlu hale getir
- [ ] Border/radius standardı
- [ ] Shadow standardı
- [ ] Button varyantları
- [ ] Input/select standardı
- [ ] Modal/drawer standardı
- [ ] Empty state standardı
- [ ] Loading/skeleton standardı
- [ ] Error state standardı

### P1

- [ ] Tipografi sistemi
- [ ] Icon boyut standardı
- [ ] Spacing standardı
- [ ] Mobile breakpoint standardı
- [ ] Focus/accessibility standardı

---

# 7. GÜVENLİK + PRODUCTION QA

Bu bölüm görsel sprintlerden sonra değil, kritik özelliklerle birlikte sürekli kontrol edilecek.

### P0

- [ ] Owner A → Owner B verisini göremiyor
- [ ] Public endpoint tenant dışına çıkamıyor
- [ ] accessEnabled=false paneli kapatıyor
- [ ] accessEnabled=false public booking'i kapatıyor
- [ ] Super Admin API'leri yetki kontrolünden geçiyor
- [ ] Secret değerleri repo dışında
- [ ] Booking transaction çakışma testi
- [ ] Coupon transaction testi
- [ ] Customer booking lookup telefon doğrulaması
- [ ] Customer cancellation yetki testi

### P1

- [ ] Storage upload security
- [ ] Rate limit değerlendirmesi
- [ ] Webhook signature testi
- [ ] Replay/duplicate webhook testi
- [ ] Production error monitoring
- [ ] E2E smoke test

---

# 8. UYGULAMA SIRASI

## Sprint 1 — Public Booking Premium Polish
1. Mobil UX
2. Form
3. Success screen
4. Harita
5. Empty/error/loading states
6. Gerçek cihaz QA

## Sprint 2 — Owner Dashboard
1. Bugün özeti
2. Onboarding
3. Public link
4. QR
5. Mobile dashboard

## Sprint 3 — Owner Panel Alt Ekranları
1. Randevular
2. Hizmetler
3. Uzmanlar
4. Çalışma saatleri
5. İşletme ayarları
6. WhatsApp

## Sprint 4 — Super Admin
1. Dashboard
2. İşletmeler
3. İşletme detay
4. Abonelik
5. Loglar
6. WhatsApp Merkezi
7. Kuponlar
8. Duyurular
9. AI istatistik

## Sprint 5 — Ana Sayfa
1. Hero
2. Demo CTA
3. Sektörler
4. Kullanım senaryosu
5. Fiyatlar
6. Güven bölümü
7. FAQ
8. Mobil/SEO

## Sprint 6 — Ortak UI + Production QA
1. Design system
2. Accessibility
3. Security audit
4. Tenant E2E
5. Production smoke test
6. Gerçek işletme pilotu

---

# 9. HER SPRINT İÇİN ZORUNLU KONTROL

Her sprint sonunda:

- [ ] TypeScript/build başarılı
- [ ] GitHub Actions yeşil
- [ ] Mobil responsive kontrol
- [ ] Desktop responsive kontrol
- [ ] Mevcut booking akışı çalışıyor
- [ ] Owner tenant izolasyonu çalışıyor
- [ ] Super Admin erişimi çalışıyor
- [ ] Değişen özelliğin happy path testi
- [ ] Hata/boş/loading state testi
- [ ] Commit oluşturuldu
- [ ] Bir sonraki sprint ancak build doğrulandıktan sonra başlanır

---

# 🎯 Nihai Hedef

ALINDA'nın üç ana yüzü birbirinden net şekilde ayrılacak:

**Ana Sayfa**
→ Satacak.

**Owner Panel**
→ İşletme sahibinin her gün kullanacağı kadar hızlı olacak.

**Public Booking**
→ Müşterinin telefondan en az sürtünmeyle randevu almasını sağlayacak.

**Super Admin**
→ Tüm işletmeleri, abonelikleri, erişimleri ve operasyonu tek merkezden yönetmeye yarayacak.

Bu doküman bundan sonraki geliştirmelerde ana kontrol listesi olarak kullanılacaktır.
