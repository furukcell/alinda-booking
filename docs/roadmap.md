# ALINDA Booking — Product Roadmap

Bu dosya ALINDA'nın mevcut durumunu ve bundan sonraki geliştirme sırasını takip etmek için kullanılır.

> **Temel prensip:** Yeni özellikler mevcut randevu motorunu bozmayacak. Her faz tamamlandıktan sonra build ve mevcut işletme akışları kontrol edilecek.

## ✅ Şu Ana Kadar Yapılanlar

### Core & Multi-Tenant
- [x] Next.js / React / TypeScript altyapısı
- [x] Firebase Authentication
- [x] Firestore + Storage
- [x] Firebase App Hosting
- [x] GitHub Actions build
- [x] Multi-tenant business yapısı
- [x] Owner → business çözümleme
- [x] İşletme slug sistemi
- [x] Tenant izolasyonu için Firestore Rules
- [x] Public booking akışı
- [x] Hizmet / uzman / çalışma saati yönetimi
- [x] Slot ve çakışma koruması
- [x] Randevu yönetimi
- [x] İşletme ayarları ve branding
- [x] Logo yönetimi
- [x] İşletme adresi + koordinat + Google Maps konumu

### WhatsApp & AI
- [x] Meta WhatsApp Embedded Signup altyapısı
- [x] WhatsApp webhook
- [x] Token encryption
- [x] Randevu bildirimleri
- [x] Deterministic WhatsApp randevu sekreteri
- [x] Randevu sorgulama / iptal
- [x] AI intent katmanı
- [x] Pro günlük özet altyapısı

### Super Admin
- [x] İşletme oluşturma / düzenleme / silme
- [x] Owner Auth hesabı oluşturma
- [x] Plan yönetimi
- [x] Manuel abonelik yönetimi
- [x] Manuel erişim açma / kapatma
- [x] Aktivite logları
- [x] AI Sekreter / yönetim istatistikleri
- [x] Kupon sistemi
- [x] Duyuru sistemi
- [x] WhatsApp Merkezi
- [x] Tek Super Admin modeli


## FAZ 0 — MVP Stabilizasyonu & Satışa Hazırlık ✅

Bu faz, mevcut güzellik merkezi ürününün kullanılabilir ve satışa hazır hale getirilmesi için tamamlandı.

### Public Booking
- [x] Telefon formatlama ve Türkiye mobil numarası doğrulaması
- [x] KVKK / gizlilik onayı ve consent kaydı
- [x] Randevu başarı ekranı + referans numarası
- [x] Randevum var / randevu sorgulama
- [x] Müşteri randevu iptali
- [x] Hizmet / uzman boş durumları
- [x] Uygun olmayan tarihlerin takvimde engellenmesi
- [x] Slot çakışması için son anda transaction kontrolü
- [x] Loading / hata / submit UX iyileştirmeleri
- [x] Mobil booking akışının dokunmatik kullanım için iyileştirilmesi
- [x] Sticky mobil booking CTA
- [x] Randevu başarı ekranında .ics takvim ekleme
- [x] Google Takvim bağlantısı
- [x] İşletme adresi + koordinat + public harita
- [x] Google Maps yönlendirmesi
- [x] QR kod ile randevu sayfası paylaşımı

### İşletme Dashboard
- [x] İşletme onboarding / kurulum adımları
- [x] Randevu linki kopyalama
- [x] Public randevu sayfasını açma
- [x] Mobil dashboard menüsü
- [x] Bugünkü toplam / bekleyen / onaylanan randevu özeti
- [x] Bugünkü tahmini ciro
- [x] Sıradaki randevu kartı
- [x] Hizmet / uzman / randevu özetleri
- [x] Mobil paylaşım (Web Share API) + fallback link kopyalama

### Ticari Yönetim
- [x] Starter / Pro plan modeli
- [x] Aylık / yıllık plan seçimi
- [x] Manuel ödeme durumu yönetimi
- [x] Manuel abonelik başlatma
- [x] Abonelik süresi bitse bile otomatik erişim kesmeme kuralı
- [x] Super Admin'in panel + public booking erişimini manuel kapatabilmesi
- [x] Aktivite logları
- [x] Kupon sistemi
- [x] Duyuru sistemi

### Build / Kalite
- [x] GitHub Actions production build kontrolü
- [x] Kritik dashboard / booking değişikliklerinde build doğrulaması
- [x] TypeScript hatalarının build sırasında yakalanması ve düzeltilmesi

> **Not:** QR görüntüsü şu an harici QR servisinden üretilmektedir. Production hardening aşamasında QR üretiminin kendi altyapısına alınması değerlendirilecek.

# 🚧 Bundan Sonra Yapılacaklar

## FAZ 1 — Sektör Altyapısı

**Amaç:** Mevcut sistemi bozmadan ALINDA'yı sektör bağımsız hale getirmek.

- [ ] Business modeline industry alanı ekle
- [ ] Theme alanı için altyapı oluştur
- [ ] Super Admin işletme oluşturma ekranına sektör seçimi ekle
- [ ] İşletme düzenleme ekranına sektör seçimi ekle
- [ ] Eski işletmelerde industry yoksa otomatik beauty kabul et
- [ ] Mevcut güzellik merkezi tasarımını beauty default olarak koru
- [ ] Sektör bilgisini public booking'e taşı
- [ ] Build + tenant regression testi

**İlk sektörler:**
- Güzellik Merkezi
- Kuaför
- Berber
- Veteriner
- Diş Kliniği
- Özel Doktor
- Psikolog
- Fizyoterapist
- Spa / Masaj
- Nail Studio
- Estetik Merkezi
- Diğer

## FAZ 2 — Theme Engine

**Amaç:** Aynı booking motorunu kullanırken her sektörün kendine uygun görünmesini sağlamak.

- [ ] Tema token yapısı
- [ ] Renk sistemi
- [ ] Tipografi seçenekleri
- [ ] Header / hero varyasyonları
- [ ] Hizmet kartı varyasyonları
- [ ] Uzman kartı varyasyonları
- [ ] Booking form varyasyonları
- [ ] Mobil tema kontrolü
- [ ] İşletme bazlı tema seçimi

**Kural:** beauty mevcut ALINDA görünümünü koruyacak.

## FAZ 3 — İlk Sektör Temaları

- [ ] Kuaför
- [ ] Berber
- [ ] Veteriner
- [ ] Diş Kliniği

Her biri için:
- [ ] Renk paleti
- [ ] Public booking düzeni
- [ ] Sektöre uygun metinler
- [ ] Mobil görünüm
- [ ] Demo işletme
- [ ] E2E booking testi

## FAZ 4 — Sağlık Sektörü

- [ ] Özel Doktor
- [ ] Psikolog
- [ ] Fizyoterapist
- [ ] Diyetisyen
- [ ] Göz kliniği
- [ ] Klinik

Gerektiğinde sektör bazlı randevu alanları opsiyonel olarak eklenecek.

> Sağlık tarafında gereksiz hassas sağlık verisi ilk aşamada toplanmayacak.

## FAZ 5 — Hizmet / Araç Odaklı Sektörler

- [ ] Oto Servis
- [ ] Lastikçi
- [ ] Oto Yıkama
- [ ] Oto Detailing
- [ ] Oto Ekspertiz

Gerekirse:
- [ ] Araç bilgisi
- [ ] Marka / model
- [ ] Plaka
- [ ] Hizmet türü
- [ ] Servis personeli

gibi opsiyonel alanlar eklenecek.

## FAZ 6 — Sektöre Özel Modüller

Randevu motoru ortak kalacak; sektör özellikleri modüler olacak.

**Veteriner**
- [ ] Hayvan profili
- [ ] Hayvan türü / ırkı

**Oto servis**
- [ ] Araç profili

**Doktor**
- [ ] Uzmanlık / muayene türü

**Pilates / spor**
- [ ] Ders
- [ ] Grup kapasitesi

## FAZ 7 — Ticari Ölçekleme

- [ ] Sektör bazlı onboarding
- [ ] Sektör bazlı hazır hizmet önerileri
- [ ] Hazır tema + içerik şablonları
- [ ] İşletme kurulum sihirbazı
- [ ] Custom domain
- [ ] Online ödeme
- [ ] Otomatik abonelik tahsilatı
- [ ] İlk gerçek işletme pilotları
- [ ] Production E2E
- [ ] Security audit
- [ ] Monitoring / operasyon

> Manuel abonelik sistemi zaten mevcut. Bu fazdaki ödeme maddeleri online ödeme ve otomatik tahsilat içindir.

## 🎯 Çalışma Sırası

    FAZ 0 — MVP stabilizasyonu ✅
         ↓
    Randevu yönetimi + onboarding + production hardening
         ↓
    WhatsApp / ödeme / güvenlik production hazırlığı
         ↓
    FAZ 1 — Sektör altyapısı
         ↓
    FAZ 2 — Theme Engine
         ↓
    FAZ 3 — Kuaför / Berber / Veteriner / Diş
         ↓
    FAZ 4 — Sağlık
         ↓
    FAZ 5 — Otomotiv
         ↓
    FAZ 6 — Sektöre özel modüller
         ↓
    FAZ 7 — Ticari ölçekleme

**Her faz ayrı ayrı uygulanacak ve test edilecek.**
