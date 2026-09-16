# ALINDA Booking — Demo & Sales Guide

## Demo akışı

1. `/` ana sayfasını aç.
2. `Demolar` bölümünden örnek işletmelerden birini seç.
3. Hizmet → tarih → saat → müşteri bilgileri adımlarını göster.
4. Randevu talebi sonrası işletme girişine geç.
5. `/panel/appointments` üzerinden gelen randevuyu göster.
6. `/panel/services` üzerinden hizmet ekleme/düzenleme akışını göster.
7. `/panel/hours` üzerinden haftalık çalışma saatlerini göster.

## Kısa ürün anlatımı

ALINDA Booking, hizmet işletmelerinin kendi randevu sayfasını oluşturup müşterilerden online randevu talebi almasını ve gelen randevuları tek bir işletme panelinden yönetmesini sağlayan web tabanlı bir MVP'dir.

## Demo sırasında vurgulanabilecekler

- İşletmeye özel public URL yapısı: `/{slug}`
- Mobil uyumlu müşteri randevu akışı
- Hizmet yönetimi
- Haftalık çalışma saatleri yönetimi
- Randevu listesi ve durumları
- Firebase Authentication ile panel erişimi
- Firestore üzerinde tenant bazlı veri modeli
- Aynı saat için eşzamanlı randevu çakışmasını önleyen slot rezervasyonu

## Demo öncesi kontrol listesi

- [ ] Firebase proje değişkenleri tanımlı.
- [ ] Firestore database aktif.
- [ ] `firestore.rules` güncel şekilde deploy edilmiş.
- [ ] En az bir `businesses/{businessId}` kaydı mevcut.
- [ ] Business kaydında doğru `ownerId` bulunuyor.
- [ ] Demo işletmesinde hizmetler mevcut.
- [ ] Demo hesabı Firebase Email/Password ile oluşturulmuş.
- [ ] Demo hesabı ile `/login` → `/panel` akışı test edilmiş.
- [ ] Public demo sayfasından örnek randevu oluşturma test edilmiş.

## MVP sınırları

Bu sürümde aşağıdaki özellikler kapsam dışıdır:

- Online ödeme / iyzico
- Otomatik abonelik sistemi
- SMS gönderimi
- WhatsApp API entegrasyonu
- Mobil uygulama
- Gelişmiş CRM
- Kampanya / sadakat sistemi
- Gelişmiş raporlama
- Çoklu şube
- Gelişmiş personel yönetimi

## Bilinen MVP sınırı

Public randevu ekranındaki örnek tarih ve saat seçenekleri şu aşamada statik demo seçenekleridir. İşletme çalışma saatleri Firestore'a kaydedilir; ancak henüz çalışma saatlerinden otomatik uygun slot üretimi yapılmamaktadır.

## Güvenlik notu

Public işletme dokümanı doğrudan okunabildiği için `businesses/{businessId}` içine gizli billing, subscription veya özel erişim bilgileri eklenmemelidir. Public ve internal işletme verilerinin ayrı koleksiyonlara bölünmesi ileride yapılabilecek bir hardening adımıdır.
