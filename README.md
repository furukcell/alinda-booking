# ALINDA Booking

Modern, çok kiracılı (multi-tenant) randevu ve işletme yönetim platformu.

ALINDA; kuaför, güzellik merkezi, bakım, wellness ve benzeri hizmet işletmelerinin kendi online randevu sayfasını oluşturmasını, hizmetlerini ve çalışma saatlerini yönetmesini ve müşterilerden online randevu almasını sağlar.

## 🎯 Vizyon

Her işletmenin kendi markasına ait profesyonel bir randevu sayfasına sahip olması ve randevularını tek bir panelden kolayca yönetebilmesi.

Örnek yapı:

`/işletme-slug`

Örneğin:

`/alinda-beauty`

---

## 🚀 MVP Özellikleri

- Çok kiracılı (multi-tenant) işletme mimarisi
- İşletmeye özel public randevu sayfası
- Hizmet yönetimi
- Haftalık çalışma saatleri yönetimi
- Dinamik uygunluk / saat üretimi
- Online randevu oluşturma
- Randevu çakışmalarını önleyen slot kilitleme sistemi
- İşletme yönetim paneli
- İşletme profil / iletişim bilgileri düzenleme
- Firebase Authentication
- Firestore veri katmanı
- Firebase Storage altyapısı
- Tenant bazlı güvenlik kuralları
- Responsive ve premium UI
- Demo / landing page
- Uzman bazlı uygunluk ve uzman çalışma saatleri
- 12 aylık public takvim
- Randevu referans numarası
- İşletme logo yönetimi
- WhatsApp bildirim altyapısı
- WhatsApp randevu durum bildirimleri
- WhatsApp sekreter webhook altyapısı
- WhatsApp üzerinden gerçek müsaitlik sorgulama ve randevu onay akışı
- Super Admin işletme yönetimi altyapısı

---

## 🛠 Teknoloji

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Firebase Authentication
- Firebase Firestore
- Firebase Storage
- Lucide Icons

---

## 🌐 Canlı Web Panel ve Test Adresleri

ALINDA şu anda **Firebase App Hosting** üzerinde yayınlanmaktadır.

- **Canlı site:** https://alinda-booking--alinda-booking-9e0d8.europe-west4.hosted.app
- **İşletme girişi:** https://alinda-booking--alinda-booking-9e0d8.europe-west4.hosted.app/login
- **İşletme paneli:** https://alinda-booking--alinda-booking-9e0d8.europe-west4.hosted.app/panel
- **Demo işletme / randevu sayfası:** https://alinda-booking--alinda-booking-9e0d8.europe-west4.hosted.app/meltem-guzellik

> **Hosting:** Firebase App Hosting — backend: `alinda-booking`, bölge: `europe-west4 (Netherlands)`.
> GitHub Actions production build'i başarıyla tamamlanmaktadır ve `main` branch'i App Hosting backend'ine bağlıdır.

## 🔐 Super Admin Giriş Bilgileri

- **Yönetim paneli:** https://alinda-booking--alinda-booking-9e0d8.europe-west4.hosted.app/admin
- **E-posta:** admin@alindabooking.com
- **Şifre:** Firebase Authentication'da bu hesap için belirlenen şifre

> Not: Super Admin şifresi güvenlik nedeniyle repo içinde düz metin olarak tutulmamalıdır. Şifre unutulursa Firebase Authentication üzerinden sıfırlanmalıdır.

## 🆕 2026-10-07 Güncel Durum

Bu README, projedeki mevcut gerçek durumu takip etmek için güncellendi.

### 2026-10-07 — Çalışma saatleri mobil UX polish

Çalışma saatleri ekranında mobil düzen iyileştirildi. Kaydet aksiyonu küçük ekranlarda görünür ve tam genişlikte; açılış/kapanış alanları mobilde yan yana kullanılabilir; geçersiz saat aralığı kaydetme öncesinde doğrulanıyor.

### 2026-10-07 — Hizmet paneli mobil UX polish

Hizmet yönetim ekranındaki yeni hizmet aksiyonu mobilde de görünür hale getirildi. Hizmet formu ve silme onayı küçük ekranlarda dikey akışa uyumlu hale getirildi; liste aksiyonlarına keyboard focus durumları eklendi.

### 2026-10-07 — Owner tabanlı multi-tenant panel

Ana işletme dashboard'u artık sabit `meltem-guzellik` işletmesine bağlı değil. Giriş yapan Firebase kullanıcısının `ownerId` alanı üzerinden kendi işletmesi bulunuyor; işletme adı, logo, şehir/ilçe, slug, public randevu bağlantısı ve günlük randevular gerçek Firestore verisinden yükleniyor. Hizmetler, uzmanlar, çalışma saatleri, randevular ve ayarlar ekranları da `getOwnedBusinessId()` ile giriş yapan owner'ın işletmesine bağlanıyor.

Firestore Rules'a owner kullanıcıların kendi `ownerId` kayıtlarını kontrollü şekilde çözebilmesi için business query erişimi eklendi.

### 2026-10-07 — Super Admin işletme yönetimi

Super Admin artık işletme listesinden işletme bilgilerini düzenleyebilir, Starter / Pro planını değiştirebilir, işletmeyi aktif / pasif yapabilir, owner e-posta adresini görebilir, güvenli şifre sıfırlama bağlantısı üretebilir ve işletmeyi alt koleksiyonlarıyla birlikte kalıcı olarak silebilir. Pasif işletmelerin public randevu sayfası erişimi kapatılır.

Ayrıca randevu panelindeki bekleyen randevular için onaylama ve iptal etme akışı main branch'e alınmıştır; iptal edilen randevunun slotları tekrar müsait hale gelir.

### Son tamamlanan geliştirmeler

- [x] Public booking akışı hizmet → uzman → tarih → saat şeklinde yeniden düzenlendi.
- [x] Hizmete göre uzman filtreleme eklendi.
- [x] Uzman fotoğrafı / adı / unvanı public tarafta gösteriliyor.
- [x] Uzman bazlı çalışma saatleri ve izin günleri eklendi.
- [x] Public tarafta 12 aylık takvim navigasyonu eklendi.
- [x] Dolu saatler ve mesai dışı durumları görsel olarak ayrıştırıldı.
- [x] Hizmet süresine göre otomatik seans blokları eklendi.
- [x] 5 karakterli randevu referans numarası sistemi eklendi.
- [x] İşletme panelinde referans numarasıyla randevu arama eklendi.
- [x] İşletme logo yükleme / değiştirme / silme sistemi tamamlandı.
- [x] Public işletme sayfasında işletme logosu / baş harfleri kullanılıyor.
- [x] ALINDA ana sayfası pazarlama odaklı yeniden tasarlandı.
- [x] Ana sayfa hero görseli büyütüldü.
- [x] WhatsApp Business / Meta Embedded Signup server altyapısı hazırlandı.
- [x] WhatsApp token şifreleme ve işletme bazlı bağlantı kaydı hazırlandı.
- [x] Super Admin paneli `/admin` oluşturuldu.
- [x] Super Admin API'si oluşturuldu.
- [x] Super Admin üzerinden yeni işletme oluşturma akışı oluşturuldu.
- [x] Yeni işletme için Firebase Authentication owner hesabı oluşturulabiliyor.
- [x] `superadmins/{uid}` Firestore yetki modeli eklendi.
- [x] Super Admin için Firebase ID token + Admin SDK doğrulaması eklendi.
- [x] İşletme plan alanı (`starter` / `pro`) eklendi.
- [x] Pro işletmeler için günlük WhatsApp randevu özeti ayarı eklendi.
- [x] Günlük özet API endpoint'i ve GitHub Actions zamanlayıcısı eklendi.
- [x] Günlük özet; saat, müşteri adı, hizmet, uzman ve referans numarası ile hazırlanıyor.
- [x] İptal edilmiş randevular günlük özete dahil edilmiyor.

### Firebase'de yapılan Super Admin bootstrap

İlk Super Admin hesabı Firebase Authentication'da oluşturuldu ve UID'si Firestore'da aşağıdaki yapıya eklendi:

```text
superadmins/{SUPER_ADMIN_UID}
├── role: "superadmin"
└── email: "admin@alindabooking.com"
```

> `/admin` kodu GitHub'da mevcut. Canlı ortamda 404 görülürse App Hosting Rollouts bölümünde yeni Super Admin commit'inin yayınlanıp yayınlanmadığı kontrol edilmelidir.

### Şu anki en önemli ürün işi

Super Admin'den yeni işletme oluşturulduktan sonra:

```text
SUPER ADMIN
   ↓
/admin
   ↓
Yeni işletme + owner Auth
   ↓
İşletme sahibi login
   ↓
/panel
   ↓
Kendi işletmesi
   ↓
/{business-slug}
   ↓
Müşteri randevusu
```

Bu zincirin tamamen dinamik multi-tenant hale getirilmesi gerekiyor. Özellikle mevcut panelde demo işletmesine bağlı hardcoded `meltem-guzellik` / işletme ID kullanımları temizlenmeli.

## 📌 Proje Aşamaları

### Tamamlananlar

- [x] Phase 0 — Proje temeli
- [x] Phase 1 — ALINDA tasarım sistemi + ilk public booking prototipi
- [x] Phase 2 — Multi-tenant temel yapı + Firestore entegrasyonu
- [x] Phase 3 — İşletme paneli + Firebase Authentication
- [x] Phase 4 — Hizmetler ve çalışma saatlerinin Firestore'a kaydedilmesi
- [x] Phase 5 — Randevu oluşturma ve Firestore'a kaydetme
- [x] Phase 6 — Randevu çakışma / slot kilitleme sistemi
- [x] Phase 7 — Firestore güvenlik kuralları
- [x] Phase 8 — Demo, landing page ve satış hazırlığı
- [x] Phase 9 — Dinamik uygunluk / saat üretimi
- [x] Phase 10 — İşletme paneli temel geliştirmeleri
- [x] Phase 11 — Uzman yönetimi ve uzman bazlı uygunluk
- [x] Phase 12 — WhatsApp bildirim altyapısı
- [x] Phase 13 — Yeni public randevu deneyimi ve otomatik seans süreleri

### Phase 10'da yapılanlar

- [x] Panel dashboard yapısı ve navigasyon kontrolü
- [x] İşletme profil düzenleme
- [x] İşletme adı, slug, kategori ve açıklama düzenleme
- [x] Şehir, ilçe, adres ve telefon düzenleme
- [x] İşletme baş harfleri düzenleme
- [x] Ana ve yardımcı marka rengi düzenleme
- [x] Hizmet ekleme / düzenleme / silme
- [x] 7 günlük çalışma saatlerini yönetme
- [x] Randevuları panelden görüntüleme
- [x] Loading / boş / hata durumları
- [x] Başarılı işlem ve hata bildirimleri
- [x] İşletme sahibi erişim kontrolü
- [x] Uzman ekleme / düzenleme / silme
- [x] Uzmanların hizmetlerle eşleştirilmesi
- [x] Uzman bazlı çalışma saatleri ve izin günleri
- [x] Hizmetlerde 30 dakikalık seans süresi mantığı
- [x] Seans süresine göre uygun randevu saatlerinin otomatik hesaplanması
- [x] Firebase Web App yapılandırmasının repo içinde çalışır hale getirilmesi
- [x] `.gitignore` ile local/environment dosyalarının korunması
- [x] GitHub Actions production build workflow'u eklenmesi

---

## 🔧 Mevcut Sistem

### Public taraf

- `/{slug}` adresi işletmeyi bulur ve işletmeye özel randevu sayfasını açar.
- Ana sayfa `/` ALINDA tanıtım / demo sayfasıdır.
- Public tarafta işletmenin yalnızca gerekli bilgileri gösterilir.
- Hizmetler Firestore'dan alınır.
- Firestore yapılandırılmamışsa geliştirme için mock veriler kullanılabilir.
- Ziyaretçinin yerel takvimine göre sonraki 14 gün oluşturulur.
- İşletmenin kayıtlı çalışma saatlerine göre uygun saatler dinamik üretilir.
- Hizmet süresi dikkate alınır.
- Geçmiş saatler mevcut gün için gösterilmez.
- Dolu slotlar public tarafta listelenmeden kontrol edilir.
- Çalışma saatine sığmayacak geç başlangıç saatleri gösterilmez.
- Randevu oluşturulurken son bir transaction kontrolü yapılır.

### İşletme paneli

- `/login` Firebase Email/Password giriş ekranıdır.
- `/panel` ve altındaki sayfalar authentication ile korunur.
- `/panel/services` üzerinden hizmet ekleme, düzenleme ve silme yapılabilir.
- `/panel/hours` üzerinden 7 günlük çalışma saatleri yönetilebilir.
- `/panel/appointments` üzerinden işletmenin randevuları görüntülenebilir.
- `/panel/settings` üzerinden işletme bilgileri ve marka renkleri düzenlenebilir.
- İşletme sahibi `ownerId` üzerinden belirlenir.

### Randevu güvenliği

Public müşteri randevu oluştururken:

1. Uygun slot kontrol edilir.
2. Slot deterministic bir ID ile oluşturulmaya çalışılır.
3. Aynı slot daha önce alınmışsa ikinci işlem engellenir.
4. Ardından randevu kaydı oluşturulur.
5. Böylece iki müşterinin aynı saati aynı anda almasının önüne geçilir.

---

## 🗃 Firestore Veri Yapısı

```text
businesses/{businessId}
├── ownerId
├── name
├── slug
├── category
├── description
├── city
├── district
├── address
├── phone
├── initials
├── primaryColor
└── primaryColorSoft

businesses/{businessId}/services/{serviceId}
├── name
├── description
├── durationMinutes
├── price
├── currency
├── createdAt
└── updatedAt

businesses/{businessId}/hours/{dayId}
├── dayOfWeek
├── enabled
├── open
├── close
└── updatedAt

businesses/{businessId}/bookings/{bookingId}
├── businessId
├── serviceId
├── serviceName
├── serviceDurationMinutes
├── servicePrice
├── customerName
├── customerPhone
├── date
├── time
├── status
├── slotId
└── createdAt

businesses/{businessId}/slots/{date_time}
├── slotId
├── date
├── time
├── status
└── createdAt
```

> Public booking akışı işletme dokümanını doğrudan okuyabildiği için `businesses/{businessId}` içerisinde billing, subscription veya başka gizli bilgilerin tutulmaması gerekir. İleride public ve internal işletme verileri ayrı koleksiyonlara bölünebilir.

---

## 🔐 Güvenlik

`firestore.rules` içerisinde:

- İşletme yönetimi yalnızca işletme sahibine açıktır.
- Public işletme, hizmet ve çalışma saatleri okunabilir.
- Public randevu oluşturma yalnızca beklenen veri yapısıyla sınırlandırılmıştır.
- Slot oluşturma yalnızca beklenen veri yapısıyla yapılabilir.
- Slot listeleme kapalıdır.
- İşletme sahibi olmayan kullanıcı panel verilerine erişemez.
- Aynı slotun ikinci kez oluşturulması engellenir.

Firebase Storage tarafında:

- Public görseller okunabilir.
- Görsel yükleme yalnızca işletme sahibine açıktır.
- Görsel boyutu 5 MB ile sınırlandırılmıştır.
- Yalnızca image içerik türlerine izin verilir.
- Silme işlemi yalnızca işletme sahibi tarafından yapılabilir.

---

## 📲 WhatsApp Entegrasyonu

ALINDA'da WhatsApp Business bağlantısı için Meta Embedded Signup altyapısı hazırlandı.

Akış:

1. İşletme panelinden **İşletme Ayarları → WhatsApp'ı Bağla** açılır.
2. Meta'nın Embedded Signup ekranında işletmenin WhatsApp Business hesabı seçilir.
3. ALINDA, dönen bağlantı kodunu sunucu tarafında güvenli şekilde işler.
4. WABA aboneliği oluşturulur ve WhatsApp numarası ALINDA'ya bağlanır.
5. Yeni randevu oluşturulduğunda, onaylı WhatsApp şablonları üzerinden işletmeye ve müşteriye bildirim gönderilebilir.

### Gerekli Meta ayarları

App Hosting ortamında şu değişkenler tanımlanmalıdır:

- `NEXT_PUBLIC_META_APP_ID`
- `NEXT_PUBLIC_META_CONFIG_ID`
- `META_APP_SECRET` — **Secret Manager**
- `WHATSAPP_TOKEN_ENCRYPTION_KEY` — **Secret Manager**, 32 byte Base64 anahtar
- `WHATSAPP_GRAPH_VERSION` — örn. `v25.0`
- `WHATSAPP_OWNER_BOOKING_TEMPLATE`
- `WHATSAPP_CUSTOMER_BOOKING_TEMPLATE`
- `WHATSAPP_TEMPLATE_LANGUAGE` — `tr`

WhatsApp erişim tokenı kod tabanına yazılmaz; sunucu tarafında şifrelenerek işletmenin `integrations/whatsapp` dokümanında tutulur.

> Meta tarafında Embedded Signup için gerekli ürün/izin/App Review adımları ayrıca tamamlanmalıdır. İşletmeye gönderilen ilk mesajlar için onaylı mesaj şablonları ve alıcıdan gerekli WhatsApp iletişim izni bulunmalıdır.

## 🗺️ Sıradaki Yol Haritası

### Phase 9.5 — Super Admin ve Multi-Tenant Yönetim

- [x] Super Admin yetki modeli
- [x] `/admin` dashboard
- [x] İşletme listeleme
- [x] Yeni işletme oluşturma
- [x] Yeni işletme owner Authentication hesabı oluşturma
- [x] İşletme oluşturma API'si
- [x] Super Admin işletme bilgilerini düzenleme
- [x] Starter / Pro plan yönetimi
- [x] İşletme aktif / pasif yönetimi
- [x] İşletme ve owner hesabı için güvenli silme akışı
- [x] Owner e-posta görüntüleme
- [x] Owner şifre sıfırlama bağlantısı oluşturma
- [ ] App Hosting'de `/admin` rollout doğrulaması
- [ ] Panelde hardcoded demo işletmesi bağlantılarını kaldırma
- [ ] Paneli Auth `ownerId` üzerinden tamamen dinamik hale getirme
- [ ] Tüm panel alt sayfalarında tenant izolasyonu
- [ ] Yeni işletme owner login → panel testi
- [ ] Yeni işletme public booking uçtan uca testi
- [x] Super Admin işletme düzenleme
- [x] İşletme aktif / pasif yönetimi
- [x] İşletme arşivleme / silme
- [x] İşletme detay / yönetim modalı
- [x] Owner şifre sıfırlama yönetimi

### Phase 10 — Panel ve işletme yönetimi
- [x] İşletme ayarları
- [x] İşletme iletişim bilgileri
- [x] Hizmet yönetimi
- [x] Çalışma saatleri yönetimi
- [x] Randevu listesinin temel panel görünümü
- [x] Firebase bağlantısı ve gerçek proje entegrasyonu
- [x] GitHub Actions build altyapısı
- [ ] Mobil panel son incelemesi
- [x] Uzman yönetimi ve uzman bazlı uygunluk
- [x] Public booking UX yeniden tasarlandı
- [x] Hizmet seans süresi 30 dakikalık bloklara standardize edildi
- [x] WhatsApp bildirim altyapısı kodlandı

### Phase 11 — Uzman ve Randevu Yönetimi

- [x] Uzman yönetimi
- [x] Uzman-hizmet eşleştirmesi
- [x] Uzman çalışma saatleri
- [x] Uzman izin günleri
- [x] Hizmete göre uzman filtreleme
- [x] Uzman bazlı uygunluk hesabı
- [x] Hizmet seans süresine göre otomatik saat üretimi
- [x] Randevu listesini geliştirme
- [x] Randevu detay ekranı
- [x] Bekliyor / onaylandı / iptal edildi durumları
- [x] Randevu onaylama
- [ ] Randevu reddetme
- [x] Randevu iptal etme
- [x] Tarih filtresi
- [x] Durum filtresi
- [x] Müşteri arama
- [x] Randevu geçmişi

### Phase 12 — İşletme Profili ve Medya
- [x] Logo yükleme
- [ ] Kapak görseli
- [x] Storage upload arayüzü
- [x] Görsel önizleme / değiştirme / silme
- [ ] Sosyal medya alanları
- [ ] Public profil geliştirmeleri

### Phase 13 — Müşteri Randevu Deneyimi

- [x] Hizmet → uzman → tarih → saat akışı
- [x] Aylık takvim görünümü
- [x] Dolu / müsait saatlerin görsel ayrımı
- [x] Ad soyad + telefon ile hızlı randevu
- [x] WhatsApp iletişim izni seçeneği
- [ ] Hizmet seçim UX'i
- [ ] Tarih seçim UX'i
- [ ] Saat seçim UX'i
- [ ] Müşteri form doğrulaması
- [x] Randevu onay ekranı
- [x] Randevu referans numarası
- [x] Eski/geçersiz seçimlerin engellenmesi
- [ ] Mobil deneyimin geliştirilmesi
- [ ] Slot çakışması hata yönetimi

### WhatsApp bildirimleri

- [x] Meta Embedded Signup altyapısı
- [x] WhatsApp Business bağlantı ekranı
- [x] WABA abonelik bağlantısı
- [x] Şifrelenmiş access token saklama
- [x] İşletmeye yeni randevu bildirimi altyapısı
- [x] WhatsApp opt-in alanı
- [x] Müşteriye randevu bildirimi altyapısı
- [x] Müşteriye onay / iptal durum bildirimi altyapısı
- [x] WhatsApp webhook ve temel sekreter yanıt altyapısı
- [x] WhatsApp gerçek müsaitlik sorgulama ve randevu onaylama
- [x] WhatsApp konuşma state ve webhook duplicate koruması
- [ ] AI destekli doğal dil kapsamının genişletilmesi
- [ ] Meta App Review / production izinleri
- [ ] Onaylı WhatsApp template'lerinin production'da tanımlanması
- [ ] `WHATSAPP_DAILY_SUMMARY_TEMPLATE` Meta template'inin oluşturulması
- [ ] App Hosting Secret/Environment'a `WHATSAPP_DAILY_SUMMARY_TEMPLATE` eklenmesi
- [ ] App Hosting Secret/Environment'a `CRON_SECRET` eklenmesi
- [ ] Pro test işletmesinin `plan: pro` yapılması
- [ ] Günlük özet için gerçek WhatsApp uçtan uca testinin yapılması

### Phase 14 — Güvenlik ve Edge Case'ler
- [ ] Firestore Rules tam inceleme
- [ ] Storage Rules tam inceleme
- [ ] Tenant izolasyon testi
- [ ] Yetkisiz erişim testleri
- [ ] Randevu veri doğrulama testleri
- [ ] Slot çakışma testleri
- [ ] Silinen/devre dışı hizmet senaryoları
- [ ] Kapalı gün ve geçmiş saat senaryoları
- [ ] Public veri sızıntısı kontrolü
- [ ] Gerekirse App Check

### Phase 15 — Premium UI/UX
- [ ] Desktop / tablet / mobil inceleme
- [ ] Skeleton loading
- [ ] Sayfa geçişleri
- [ ] Mikro etkileşimler
- [ ] Modal / drawer iyileştirmeleri
- [ ] Form doğrulama UX'i
- [ ] Tipografi ve spacing standardizasyonu
- [ ] Accessibility kontrolü
- [ ] Son görsel tutarlılık turu

### Phase 16 — Firebase ve uçtan uca test
- [x] Firebase Web SDK yapılandırmasının gerçek proje ile eşleştirilmesi
- [x] Firebase Authentication bağlantısının hazırlanması
- [x] Firestore bağlantısının hazırlanması
- [x] Firebase Storage bağlantısının hazırlanması
- [ ] Authentication gerçek senaryo testleri
- [ ] Firestore okuma/yazma testleri
- [ ] Storage upload/delete testleri
- [ ] Randevu oluşturma testleri
- [ ] Slot çakışma testleri
- [ ] Panel yetki testleri
- [ ] Public availability testleri
- [ ] Uçtan uca manuel test
- [ ] GitHub Actions build sonucunun doğrulanması

### Phase 17 — Production
- [x] Next.js için production hosting stratejisinin netleştirilmesi
- [x] Firebase App Hosting yapılandırması
- [x] GitHub repository bağlantısı / otomatik rollout
- [x] Production environment değişkenleri kontrolü
- [x] İlk deployment
- [ ] Canlı URL üzerinden uçtan uca test
- [ ] Public booking testi
- [ ] Login / panel testi
- [ ] Custom domain
- [ ] Production monitoring

### Phase 18 — Satışa Hazır Sürüm
- [ ] Landing page son rötuşları
- [ ] Demo işletmesi hazırlığı
- [ ] Satış/demo akışının son testi
- [ ] Fiyatlandırma
- [ ] İşletme onboarding'i
- [ ] İşletme kurulum checklist'i
- [ ] Randevu linki paylaşımı
- [ ] İlk gerçek işletme pilotu

---

## 💰 MVP'de Şimdilik Olmayanlar

İlk sürümü gereksiz büyütmemek için şu özellikler henüz kapsam dışında:

- Online ödeme / iyzico
- Otomatik abonelik sistemi
- SMS gönderimi
- Mobil uygulama
- Gelişmiş CRM
- Kampanya / sadakat sistemi
- Gelişmiş raporlama
- Çoklu şube
- Gelişmiş personel yönetimi

Bunlar ürünün temel randevu akışı çalıştıktan ve ilk gerçek müşterilerden geri bildirim alındıktan sonra değerlendirilecek.

---

## 🧪 Demo Akışı

1. `/` ana sayfasını aç.
2. Demolar bölümünden örnek işletme seç.
3. Hizmet seç.
4. Tarih seç.
5. Uygun saat seç.
6. Müşteri bilgilerini gir.
7. Randevu oluştur.
8. İşletme hesabıyla `/login` üzerinden giriş yap.
9. `/panel/appointments` üzerinden randevuyu kontrol et.
10. `/panel/services`, `/panel/hours` ve `/panel/settings` bölümlerini göster.

---

## ⚠️ Mevcut Durum

**ALINDA şu anda gerçek Firebase projesine bağlı, MVP + Super Admin temel sistemi aşamasındadır.**

### Hazır olan ana parçalar

- Firebase Authentication
- Firestore
- Firebase Storage
- Firebase App Hosting
- Public randevu sistemi
- Hizmet → uzman → tarih → saat akışı
- Uzman bazlı uygunluk
- Hizmet süresine göre seans üretimi
- Slot çakışma koruması
- Randevu referans numarası
- İşletme paneli
- İşletme logo sistemi
- ALINDA pazarlama ana sayfası
- WhatsApp server altyapısı
- Super Admin paneli ve işletme oluşturma API'si

### Henüz tamamlanmamış kritik işler

- Super Admin rollout'unun canlı App Hosting'de doğrulanması
- Panelin tamamen ownerId tabanlı multi-tenant hale getirilmesi
- Yeni işletme oluşturma → owner login → panel → public booking uçtan uca testi
- Randevu onay / red / iptal durum yönetimi
- Firestore / Storage güvenlik audit'i
- E2E production testleri
- WhatsApp Meta production izinleri ve template'leri
- Custom domain
- İlk gerçek işletme pilotu

### 🎯 Bundan sonra yapılacak sıra

1. **App Hosting rollout'unu doğrula ve `/admin` sayfasını canlıda aç.**
2. **Yeni işletme owner login → panel testini yap.**
3. **Tüm panel alt sayfalarında tenant izolasyonunu test et.**
4. **Super Admin'den test işletmesi oluştur.**
5. **Test işletmesi owner hesabıyla login → panel testini yap.**
6. **Test işletmesinin public randevu sayfasını test et.**
7. **Randevu onay / red / iptal yönetimini tamamla.**
8. **Firestore + Storage Rules audit yap.**
9. **Uçtan uca production testi yap.**
10. **WhatsApp production bağlantısını tamamla.**
11. **Custom domain ve ilk gerçek işletme pilotuna geç.**

## 📁 Önemli Dosyalar

- `firestore.rules` — Firestore güvenlik kuralları
- `storage.rules` — Firebase Storage güvenlik kuralları
- `firebase.json` — Firebase CLI yapılandırması
- `docs/roadmap.md` — Detaylı ürün yol haritası
- `docs/sales.md` — Demo ve satış notları
- `app/admin/page.tsx` — Super Admin arayüzü
- `app/api/admin/businesses/route.ts` — Super Admin işletme yönetim API'si
- `app/api/admin/businesses/reset-password/route.ts` — Owner şifre sıfırlama bağlantısı API'si
- `lib/whatsapp/server.ts` — WhatsApp server entegrasyonu
- `lib/firebase/admin.ts` — Firebase Admin SDK
- `lib/businesses/owner.ts` — Owner kullanıcının işletmesini çözümleme yardımcı fonksiyonu

---

## 📊 Güncel Ürün Durumu

| Alan | Durum |
|---|---|
| Public booking | 🟢 Hazır |
| Uzman bazlı booking | 🟢 Hazır |
| İşletme paneli | 🟢 Temel sistem hazır |
| Logo / branding | 🟢 Hazır |
| Firebase | 🟢 Bağlı |
| WhatsApp kod altyapısı | 🟡 Hazır / production bekliyor |
| Pro günlük WhatsApp özeti | 🟡 Kod hazır / Meta template + env + test bekliyor |
| AI WhatsApp sekreteri | 🟡 Gerçek randevu akışı hazır / doğal dil + sorgu/iptal genişletilecek |
| Super Admin | 🟢 İşletme yönetimi hazır / rollout doğrulama bekliyor |
| Multi-tenant panel | 🟢 Owner tabanlı temel panel hazır / tenant testleri devam ediyor |
| Randevu durum yönetimi | 🟢 Onay / iptal hazır |
| Güvenlik audit | 🟡 Yapılacak |
| E2E test | 🔴 Yapılacak |
| Custom domain | 🔴 Yapılacak |
| İlk gerçek işletme | 🔴 Yapılacak |

## 📐 Geliştirme Prensipleri

1. Her fazı tamamlamadan sonraki faza geçme.
2. MVP'yi gereksiz özelliklerle şişirme.
3. Tenant izolasyonunu ve randevu bütünlüğünü temel gereksinim kabul et.
4. Mobil uyumluluğu baştan düşün.
5. Arayüzü premium, temiz ve anlaşılır tut.
6. Production'a çıkmadan önce Firebase ve güvenlik akışlarını gerçek senaryolarla test et.
7. GitHub Actions build'i yeşil olmadan production deployment yapma.
8. Gerçek işletme verisiyle doğrulanmayan bir özelliği "tamamlandı" kabul etme.


<!-- ALINDA_APP_HOSTING_ROLLOUT_2026-10-07 -->

<!-- ALINDA_APP_HOSTING_REFRESH_2026-10-07T07-47 -->


### WhatsApp Randevu İşlemleri
- Doğal dil randevu talepleri için OpenAI Responses API tabanlı intent çözümleme desteği eklendi; AI yoksa mevcut deterministik akış çalışmaya devam eder.
- AI tarafı yalnızca intent/tarih/saat/hizmet çözümleme yapar; uygunluk ve gerçek randevu oluşturma yine ALINDA'nın kendi Firestore transaction akışıyla yapılır.
- Müşteri WhatsApp üzerinden 5 karakterli referans ile randevusunu sorgulayabilir.
- Referans işlemlerinde müşterinin WhatsApp telefon numarası doğrulanır.
- `iptal ABC12` ile randevu iptal talebi başlatılır; sistem randevuyu gösterip `Evet` onayı ister.
- İptal onayı 5 dakika geçerlidir ve yalnızca aynı WhatsApp numarası için çalışır.
- İptalde hizmet süresine ait tüm slot segmentleri transaction içinde serbest bırakılır.
