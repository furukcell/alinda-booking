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

## 🗺️ Sıradaki Yol Haritası

### Phase 10 — Panel ve işletme yönetimi
- [x] İşletme ayarları
- [x] İşletme iletişim bilgileri
- [x] Hizmet yönetimi
- [x] Çalışma saatleri yönetimi
- [x] Randevu listesinin temel panel görünümü
- [x] Firebase bağlantısı ve gerçek proje entegrasyonu
- [x] GitHub Actions build altyapısı
- [ ] Mobil panel son incelemesi

### Phase 11 — Randevu Yönetimi
- [ ] Randevu listesini geliştirme
- [ ] Randevu detay ekranı
- [ ] Bekliyor / onaylandı / reddedildi / iptal edildi durumları
- [ ] Randevu onaylama
- [ ] Randevu reddetme
- [ ] Randevu iptal etme
- [ ] Tarih filtresi
- [ ] Durum filtresi
- [ ] Müşteri arama
- [ ] Randevu geçmişi

### Phase 12 — İşletme Profili ve Medya
- [ ] Logo yükleme
- [ ] Kapak görseli
- [ ] Storage upload arayüzü
- [ ] Görsel önizleme / değiştirme / silme
- [ ] Sosyal medya alanları
- [ ] Public profil geliştirmeleri

### Phase 13 — Müşteri Randevu Deneyimi
- [ ] Hizmet seçim UX'i
- [ ] Tarih seçim UX'i
- [ ] Saat seçim UX'i
- [ ] Müşteri form doğrulaması
- [ ] Randevu onay ekranı
- [ ] Randevu referans numarası
- [ ] Eski/geçersiz seçimlerin engellenmesi
- [ ] Mobil deneyimin geliştirilmesi
- [ ] Slot çakışması hata yönetimi

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
- WhatsApp API
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

**ALINDA şu anda gerçek Firebase projesine bağlı, MVP seviyesinde çalışan bir ürün durumunda.**

Şu ana kadar doğrulanan altyapı:

- Firebase Authentication aktif.
- Firestore'da gerçek işletme kaydı mevcut.
- Authentication kullanıcısı ile işletme `ownerId` bağlantısı kurulmuş durumda.
- `services`, `hours` ve `bookings` yapıları hazır.
- Firebase Storage bucket ve güvenlik kuralları hazır.
- Public randevu akışı, dinamik uygunluk ve slot kilitleme altyapısı mevcut.
- İşletme panelinin temel bölümleri hazır.
- Firebase Web SDK için repo içinde fallback yapılandırması mevcut; istenirse environment değişkenleriyle override edilebilir.
- `.gitignore` ve GitHub Actions production build workflow'u eklendi.

Henüz doğrulanmamış / yapılmamış kritik noktalar:

- Public tarafta gerçek Firebase verisiyle uçtan uca randevu testi.
- Panelden gerçek veri ekleme / değiştirme / silme testleri.
- Randevu onay / red / iptal işlemleri.
- Canlı URL üzerinden gerçek müşteri akışının test edilmesi.
- Custom domain bağlantısı.

### 🎯 Şu anki gerçek sıra

1. **Canlı App Hosting URL'sini ve yeni rollout'u doğrula.**
2. **Gerçek Firebase ile `/login` → `/panel` akışını test et.**
3. **Randevu yönetimini tamamla:** onayla / reddet / iptal et / filtrele.
4. **Public + panel uçtan uca testlerini yap.**
5. **Security / edge-case kontrolü yap.**
6. **Custom domain bağla.**
7. **İlk gerçek işletme pilotu.**

> Yani şu an yeni özellik eklemekten önce **mevcut MVP'yi gerçek Firebase üzerinde doğrulama ve randevu yönetimini tamamlama** aşamasındayız.

---

## 📁 Önemli Dosyalar

- `firestore.rules` — Firestore güvenlik kuralları
- `storage.rules` — Firebase Storage güvenlik kuralları
- `firebase.json` — Firebase CLI yapılandırması
- `docs/roadmap.md` — Detaylı ürün yol haritası
- `docs/sales.md` — Demo ve satış notları

---

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
