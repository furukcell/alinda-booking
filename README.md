# ALINDA Booking

ALINDA Booking, kuaför, güzellik merkezi, bakım, wellness, nail/lash artist, home studio ve benzeri hizmet işletmeleri için geliştirilen çok kiracılı (multi-tenant) online randevu ve işletme yönetim SaaS platformudur.

Temel amaç; her işletmeye kendi markasıyla çalışan profesyonel bir online randevu sayfası vermek, işletme sahibinin randevularını tek panelden yönetmesini sağlamak ve WhatsApp üzerinden randevu süreçlerini otomatikleştirmektir.

---

## 🌐 Canlı Sistem

- Ana site: https://alinda-booking--alinda-booking-9e0d8.europe-west4.hosted.app
- İşletme girişi: https://alinda-booking--alinda-booking-9e0d8.europe-west4.hosted.app/login
- İşletme paneli: https://alinda-booking--alinda-booking-9e0d8.europe-west4.hosted.app/panel
- Super Admin: https://alinda-booking--alinda-booking-9e0d8.europe-west4.hosted.app/admin
- Demo işletme / public booking: https://alinda-booking--alinda-booking-9e0d8.europe-west4.hosted.app/meltem-guzellik

### Firebase App Hosting

- Backend: alinda-booking
- Bölge: europe-west4
- GitHub: furukcell/alinda-booking
- Branch: main
- Node: 22
- Otomatik rollout: açık

---

# 🎯 ALINDA Nedir?

ALINDA'nın temel yapısı:

    SUPER ADMIN
          ↓
    İşletme oluştur
          ↓
    Owner hesabı
          ↓
    İşletme sahibi login
          ↓
    /panel
          ↓
    Hizmet + Uzman + Çalışma Saatleri
          ↓
    /işletme-slug
          ↓
    Müşteri randevusu
          ↓
    İşletme paneli + WhatsApp

Her işletme kendi slug'ı üzerinden public booking sayfasına sahip olur.

Örnek:

    /meltem-guzellik
    /alinda-beauty
    /ornek-salon

Aynı altyapı üzerinde çok sayıda farklı işletme çalıştırılabilir.

---

# 🚀 Şu Anda Sistemde Neler Var?

## Public Online Randevu

Müşteri:

1. Hizmet seçer.
2. O hizmeti verebilen uzmanları görür.
3. Uzman seçer.
4. Tarih seçer.
5. Uygun saati seçer.
6. Ad soyad ve telefonunu girer.
7. Randevuyu oluşturur.
8. 5 karakterli referans numarasını alır.

Mevcut özellikler:

- 12 aylık takvim navigasyonu
- Hizmete göre uzman filtreleme
- Uzman fotoğrafı, adı ve unvanı
- Uzman bazlı çalışma saatleri
- Uzman izin günleri
- Mesai dışı gün/saat kontrolü
- Dolu saatlerin ayrıştırılması
- Hizmet süresine göre seans hesabı
- Geçmiş saatlerin engellenmesi
- Son anda slot kontrolü
- Transaction tabanlı slot çakışma koruması
- WhatsApp iletişim izni
- Randevu onay ekranı
- Randevu referans numarası

## Hizmet Yönetimi

Her hizmette:

- Ad
- Açıklama
- Süre
- Fiyat
- Para birimi

tutulur.

Hizmet süreleri 30 dakikalık bloklar üzerinden çalışır:

    30 dk  → 1 slot
    60 dk  → 2 slot
    90 dk  → 3 slot
    120 dk → 4 slot

Uzun bir hizmetin ortasına başka randevu alınması bu yapı sayesinde engellenir.

## Uzman Yönetimi

İşletme sahibi:

- Uzman ekleyebilir.
- Uzman düzenleyebilir.
- Uzman silebilir.
- Uzman fotoğrafı yükleyebilir.
- Uzmanı hizmetlerle eşleştirebilir.
- Uzmanın çalışma saatlerini belirleyebilir.
- Uzman izin günleri tanımlayabilir.

Public booking sırasında yalnızca seçilen hizmeti verebilen uzmanlar gösterilir.

## Çalışma Saatleri

İşletmenin haftanın 7 günü çalışma saatleri yönetilebilir.

Uzman bazında da:

- özel çalışma saatleri
- mola aralıkları
- izin günleri

desteklenir.

Uygunluk hesaplanırken işletme saatleri, uzman saatleri, izinler, molalar, hizmet süresi, mevcut slotlar ve geçmiş zaman birlikte değerlendirilir.

---

# 📅 Randevu Yönetimi

Panelde randevular için:

- Referans arama
- Tarih filtresi
- Durum filtresi
- Müşteri adı/telefon araması
- Randevu detayları
- Hizmet
- Uzman
- Tarih/saat
- Süre
- Ücret
- WhatsApp opt-in
- Randevu onaylama
- Randevu iptal etme
- İptal edilen slotları yeniden açma

özellikleri vardır.

Mevcut durumlar:

- pending
- confirmed
- cancelled

Reddetme/rejected durumu henüz ayrı bir status olarak uygulanmamıştır.

---

# 🔐 Multi-Tenant Yapı

Her işletme kendi business kaydı ve alt koleksiyonlarıyla izole edilir.

Temel yapı:

    businesses/{businessId}
        ├── services
        ├── specialists
        ├── hours
        ├── bookings
        ├── slots
        ├── whatsappMessages
        ├── whatsappConversations
        └── integrations/whatsapp

İşletme sahibi ownerId üzerinden bulunur.

Amaç:

    İşletme A → yalnızca A verileri
    İşletme B → yalnızca B verileri
    İşletme C → yalnızca C verileri

Panel artık sabit demo işletmesine bağlı değildir; giriş yapan Firebase kullanıcısının ownerId bilgisine göre işletmesini çözer.

Bu yapı Firebase Rules ve server tarafındaki kontrollerle birlikte tenant izolasyonu sağlamayı hedefler.

---

# 👩‍💼 İşletme Paneli

Ana panel ve alt bölümler:

- Dashboard
- Randevular
- Hizmetler
- Uzmanlar
- Çalışma saatleri
- İşletme ayarları
- WhatsApp

Panel authentication ile korunur.

İşletme ayarlarında:

- İşletme adı
- Slug
- Kategori
- Açıklama
- Şehir
- İlçe
- Adres
- Telefon
- Marka renkleri
- Logo

yönetilebilir.

Logo sistemi PNG/JPG/WEBP ve maksimum 5 MB sınırıyla çalışır.

---

# 🏢 Super Admin

Super Admin paneli:

https://alinda-booking--alinda-booking-9e0d8.europe-west4.hosted.app/admin

üzerinden yönetilir.

Super Admin ile:

- İşletme listesi görüntülenir.
- Yeni işletme oluşturulur.
- Owner Firebase Authentication hesabı oluşturulur.
- İşletme bilgileri düzenlenir.
- Starter / Pro planı değiştirilir.
- İşletme aktif/pasif yapılır.
- Owner e-postası görüntülenir.
- Owner için şifre sıfırlama bağlantısı oluşturulur.
- İşletme yönetimi ve silme işlemleri yapılabilir.
- İşletme detaylarını görüntüleme.
- Salt okunur destek görünümü.
- İşletme erişimini manuel açma/kapatma.
- Abonelik ve ödeme bilgilerini yönetme.
- WhatsApp Merkezi üzerinden tüm işletmelerin WhatsApp durumunu görme.

Yetki modeli superadmins/{uid} üzerinden çalışır.

Super Admin şifresi repository içinde tutulmaz.

---

# 💬 WhatsApp Entegrasyonu

WhatsApp tarafında Meta WhatsApp Business / Embedded Signup altyapısı kurulmuştur.

Hazır olan parçalar:

- Meta Embedded Signup
- WABA bağlantısı
- WhatsApp telefon numarası çözümleme
- Access token şifreleme
- İşletme bazlı WhatsApp integration kaydı
- Yeni randevu bildirimi
- Müşteri randevu bildirimi
- Randevu onay/iptal bildirimleri
- Webhook
- Meta signature doğrulaması
- Duplicate mesaj koruması
- Telefon numarası üzerinden işletme eşleştirme

Access token kod içinde düz metin tutulmaz; server tarafında AES-256-GCM ile şifrelenerek saklanır.

Production kullanım için Meta tarafındaki gerekli izinler, onaylı template'ler ve environment/secret ayarlarının tamamlanması gerekir.

---

# 🤖 WhatsApp AI Randevu Sekreteri

AI katmanı WhatsApp üzerinden gelen doğal dil randevu taleplerini anlamlandırmak için eklendi.

Örnek:

    "Yarın öğleden sonra manikür için müsait bir saat var mı?"

AI bunu hizmet, tarih, saat, uzman ve intent bilgilerine ayırabilir.

Desteklenen intent yapısı:

- book
- lookup
- cancel
- help
- unknown

### Önemli mimari

AI doğrudan randevu oluşturmaz veya slot kilitlemez.

Akış:

    WhatsApp mesajı
          ↓
    AI intent çözümleme
          ↓
    Hizmet / uzman / tarih / saat
          ↓
    ALINDA uygunluk kontrolü
          ↓
    Firestore transaction
          ↓
    Gerçek randevu

Yani AI yalnızca doğal dili anlamlandırır; gerçek randevu işlemi ALINDA'nın deterministic Firestore akışından geçer.

AI kullanılamadığında mevcut deterministic secretary akışı kullanılabilir.

---

# 📲 WhatsApp Randevu Sekreteri

Deterministic secretary tarafında gerçek booking akışı hazırdır.

Desteklenen işlemler:

- Hizmet bulma
- Tarih çözümleme
- Saat çözümleme
- Uzman uygunluğu
- Mesai kontrolü
- Uzman molası kontrolü
- Mevcut slot kontrolü
- Uygun saat önerme
- Müşteriden Evet/onay alma
- Gerçek booking oluşturma
- 5 karakterli referans üretme

Örnek:

    Müşteri:
    Yarın 15:00 manikür istiyorum.

    ALINDA:
    Müsait bir saat buldum. 😊
    Manikür
    Uzman: Ayşe
    08.10.2026 15:00

    Bu saati onaylıyor musunuz?
    "Evet" yazabilirsiniz.

    Müşteri:
    Evet

    ALINDA:
    Randevunuz oluşturuldu. ✅
    Referans: ABC12

---

# 🔎 WhatsApp Randevu Sorgulama

5 karakterli referans ile randevu sorgulanabilir.

Sistem:

- Booking'i bulur.
- Müşterinin WhatsApp telefonunu doğrular.
- Başka müşterinin randevusunun görüntülenmesini engeller.
- Hizmet, uzman, tarih, saat ve referans bilgilerini döndürür.

---

# ❌ WhatsApp Randevu İptali

Akış:

    Müşteri:
    İptal ABC12

    ALINDA:
    Randevunuz...
    İptal etmek istediğinize emin misiniz?
    "Evet" yazın.

    Müşteri:
    Evet

    ALINDA:
    Randevunuz iptal edildi. ✅

İptal onayı:

- 5 dakika geçerlidir.
- Aynı WhatsApp numarasıyla sınırlandırılır.
- İptal edilmiş booking tekrar iptal edilemez.
- Hizmet süresine ait tüm slotlar transaction içinde serbest bırakılır.

---

# 📊 Pro Günlük WhatsApp Özeti

Pro plan için günlük randevu özeti altyapısı hazırdır.

Özet içerisinde:

- Tarih
- Saat
- Müşteri
- Hizmet
- Uzman
- Referans
- Toplam ücret

bulunabilir.

İptal edilen randevular özete dahil edilmez.

GitHub Actions cron ile günlük gönderim hazırlanmıştır.

Türkiye saatine göre yaklaşık 08:00 hedeflenmektedir.

Production için:

- Meta günlük özet template'i
- App Hosting WHATSAPP_DAILY_SUMMARY_TEMPLATE
- CRON_SECRET
- GitHub ALINDA_CRON_SECRET
- Pro test işletmesi
- Gerçek WhatsApp testi

tamamlanmalıdır.

---

# 🤖 WhatsApp AI Sekreter — Çalışma Biçimi

ALINDA Pro planındaki WhatsApp AI Sekreteri, işletmenin WhatsApp numarasına gelen her mesaja otomatik cevap veren kontrolsüz bir bot olarak çalışmaz. **AI, müşteri bazında izinli şekilde devreye girer.**

## AI kullanım izni

Bir kişi işletmenin WhatsApp numarasına ilk kez yazdığında sistem önce sabit bir izin mesajı gönderir:

    Merhaba 👋 Hoş geldiniz!
    Randevu, müsaitlik ve randevu işlemlerinizde AI Asistanımızdan yardım almak ister misiniz?

    🤖 AI Asistanı Kullan
    👤 İşletmeyle Görüşeceğim

Müşteri AI'ı kabul ederse yalnızca o WhatsApp numarası için AI aktifleşir.

Müşteri reddederse AI o müşteri için kapalı kalır. İşletme ekibi normal şekilde cevap verebilir.

## AI'ı sonradan tekrar açma

AI kapatıldığında müşteriye:

    Tamamdır 👍 Bundan sonraki mesajlarınızı işletme ekibimiz yanıtlayacaktır.

    🤖 Dilediğiniz zaman "Asistanı aç" yazarak AI Asistanı tekrar kullanabilirsiniz.

mesajı gönderilir.

Müşteri daha sonra:

- Asistanı aç
- AI'ı aç
- AI asistanla konuşmak istiyorum
- Asistanla devam edelim

gibi ifadeler kullandığında AI tekrar aktifleşir.

Benzer şekilde müşteri "Asistanı kapat", "İnsanla görüşmek istiyorum" veya "Yetkiliyle görüşmek istiyorum" dediğinde AI o müşteri için kapatılır.

## İşletme 10 dakika cevap vermezse

Pro müşteride AI kapalı olsa bile müşteri mesajı işletme tarafından **10 dakika boyunca yanıtlanmazsa**, sistem otomatik olarak bir yardım teklifi gönderebilir:

    👋 İşletme ekibimiz şu anda yoğun olabilir ve mesajınıza henüz yanıt veremedi.

    🤖 Dilerseniz AI Asistanımız müsaitlik ve randevu konusunda size hemen yardımcı olabilir.
    "Asistanla devam et" veya "Asistanı aç" yazabilirsiniz.

AI müşterinin onayı olmadan sessizce konuşmaya başlamaz. Müşteri kabul ederse AI devreye girer.

Bu teklif aynı konuşmada tekrar tekrar gönderilmez. Teklif gönderildiği kayıt altına alınır.

## AI'ın yapabildiği işlemler

AI aktif olan müşteriler için:

- Hizmet ve fiyat bilgisi
- Gerçek müsaitlik sorgulama
- Uzman seçimi
- Randevu hazırlama
- Müşteri onayı sonrası gerçek randevu oluşturma
- Randevu referansıyla sorgulama
- Randevu iptali için onay alma
- Müşteri onayı sonrası gerçek iptal
- Doğal Türkçe konuşma

desteklenir.

AI randevuyu veya iptali doğrudan kendi başına yazmaz. Gemini önce doğal dili yorumlar; gerçek uygunluk ve değişiklik işlemleri ALINDA'nın deterministic Firestore akışından geçer.

## Şahsi + işletme numarası kullanımı

İşletme sahibi aynı WhatsApp numarasını şahsi görüşmeler için de kullanıyorsa AI'ın herkese cevap vermemesi için müşteri bazlı AI izni kullanılır.

AI kapalı bir kişinin mesajları AI tarafından işlenmez.

Önerilen kullanım, işletme için ayrı bir WhatsApp Business numarasıdır. Ancak aynı numara kullanılıyorsa müşteri bazlı izin ve insan desteğine dönüş komutları AI'ın kapsamını sınırlar.

## Starter / Pro farkı

### Starter

- WhatsApp randevu bildirimleri
- WhatsApp üzerinden manuel müşteri iletişimi
- Temel WhatsApp bağlantısı

AI WhatsApp Sekreteri Starter'da aktif değildir.

### Pro

Starter özelliklerine ek olarak:

- AI WhatsApp Sekreteri
- Müşteri bazlı AI kullanım izni
- "Asistanı aç" / "Asistanı kapat" komutları
- Gerçek müsaitlik kontrolü
- WhatsApp üzerinden randevu oluşturma
- Randevu sorgulama
- Randevu iptali
- İşletme 10 dakika cevap vermezse AI yardım teklifi
- 24 saat önce WhatsApp randevu hatırlatması

## AI güvenlik prensibi

1. Müşteri AI'ı kabul etmeden AI sekreter konuşmaz.
2. AI kapatılmış müşterinin normal mesajları AI'a gönderilmez.
3. AI emin olmadığı işlemlerde bilgi uydurmaz.
4. Hizmet, uzman, fiyat ve uygunluk gerçek işletme verisinden alınır.
5. Gerçek randevu işlemleri Firestore transaction akışından geçer.
6. Müşteri istediğinde insan desteğine geri dönülebilir.
7. AI API kullanılamazsa sistem kontrollü fallback davranışı uygular.

# 💰 Güncel Fiyatlandırma

Landing page'de güncel planlar:

### Starter — 499 TL / ay

### Starter Yıllık — 4.999 TL / yıl

Temel online randevu ve işletme yönetimi.

### Pro — 750 TL / ay

Starter özelliklerine ek olarak:

- AI destekli WhatsApp randevu sekreteri
- WhatsApp randevu sorgulama
- WhatsApp randevu iptali
- Doğal dil ile randevu talebi anlama
- Günlük WhatsApp randevu özeti

### Pro Yıllık — 7.500 TL / yıl

12 aylık Pro kullanımı.

Aylık Pro'ya göre 3.750 TL daha avantajlı olarak sunulmaktadır.

Ödeme ve otomatik abonelik tahsilatı henüz tamamlanmış değildir; plan bilgisi şu anda işletme üzerinde yönetilmektedir.

---

# 🛡️ Güvenlik

Firestore ve Storage Rules ile:

- Owner erişimi
- Public gerekli verilerin okunması
- Public booking veri doğrulaması
- Slot oluşturma kontrolleri
- İşletme izolasyonu
- Logo upload yetkileri
- Dosya tipi ve boyut kontrolleri

uygulanmaktadır.

WhatsApp webhook tarafında Meta signature kontrolü vardır.

Admin API'leri Firebase ID token ve Super Admin yetkisiyle korunur.

Production öncesi ayrıca kapsamlı security audit yapılacaktır.

---

# 🗃️ Firebase Veri Yapısı

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
    ├── logoUrl
    ├── primaryColor
    ├── primaryColorSoft
    ├── plan
    ├── billingCycle
    ├── subscriptionStatus
    ├── paymentStatus
    ├── subscriptionStartDate
    ├── subscriptionEndDate
    ├── trialEndDate
    ├── accessEnabled
    ├── whatsappDailySummaryEnabled
    │
    ├── services/{serviceId}
    ├── specialists/{specialistId}
    ├── hours/{dayId}
    ├── bookings/{bookingId}
    ├── slots/{slotId}
    ├── whatsappMessages/{messageId}
    ├── whatsappConversations/{phone}
    └── integrations/whatsapp

    superadmins/{uid}

Booking kayıtlarında temel olarak:

- businessId
- referenceNo
- service
- serviceDurationMinutes
- servicePrice
- specialist
- customerName
- customerPhone
- date
- time
- status
- whatsappOptIn
- createdAt

tutulur.

---

# 📱 Super Admin WhatsApp Merkezi

Super Admin için merkezi WhatsApp görünümü bulunmaktadır. İşletmelerin WhatsApp bağlantı durumu, telefon numarası, doğrulanmış işletme adı, planı ve Pro günlük özet durumu tek ekranda görülebilir. Access token gibi gizli bilgiler gösterilmez.

# 🛡️ Güvenlik

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Firebase Authentication
- Firebase Firestore
- Firebase Storage
- Firebase Admin SDK
- Firebase App Hosting
- GitHub Actions
- Meta WhatsApp Business Platform
- Google Gemini API
- Lucide React

---

# 🔑 Environment / Secret Yapısı

Firebase:

    NEXT_PUBLIC_FIREBASE_API_KEY
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
    NEXT_PUBLIC_FIREBASE_PROJECT_ID
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
    NEXT_PUBLIC_FIREBASE_APP_ID

Meta / WhatsApp:

    NEXT_PUBLIC_META_APP_ID
    NEXT_PUBLIC_META_CONFIG_ID
    META_APP_SECRET
    WHATSAPP_TOKEN_ENCRYPTION_KEY
    WHATSAPP_GRAPH_VERSION
    WHATSAPP_OWNER_BOOKING_TEMPLATE
    WHATSAPP_CUSTOMER_BOOKING_TEMPLATE
    WHATSAPP_TEMPLATE_LANGUAGE
    WHATSAPP_CUSTOMER_CONFIRMED_TEMPLATE
    WHATSAPP_CUSTOMER_CANCELLED_TEMPLATE
    WHATSAPP_SECRETARY_REPLY_TEMPLATE
    WHATSAPP_DAILY_SUMMARY_TEMPLATE

AI:

    GEMINI_API_KEY
    GEMINI_SECRETARY_MODEL

Cron:

    CRON_SECRET

Secret değerleri repository içine yazılmamalıdır.

---

# 📁 Önemli Dosyalar

- app/page.tsx — landing page
- app/panel — işletme paneli
- app/admin/page.tsx — Super Admin
- app/api/admin/businesses/route.ts — işletme yönetimi API
- app/api/whatsapp/webhook/route.ts — WhatsApp webhook
- app/api/whatsapp/booking-notification/route.ts — booking bildirimi
- app/api/whatsapp/booking-status/route.ts — onay/iptal bildirimi
- app/api/whatsapp/daily-summary/route.ts — Pro günlük özet
- components/booking/business-booking.tsx — public booking
- lib/firebase/admin.ts — Firebase Admin
- lib/businesses/owner.ts — owner → business çözümleme
- lib/whatsapp/server.ts — WhatsApp server entegrasyonu
- lib/whatsapp/secretary.ts — deterministic WhatsApp secretary
- lib/whatsapp/ai-secretary.ts — AI intent çözümleme
- lib/whatsapp/booking-lookup.ts — sorgulama ve iptal
- firestore.rules — Firestore güvenliği
- storage.rules — Storage güvenliği
- docs/roadmap.md — detaylı yol haritası
- .env.example — environment örneği
- firebase.json — Firebase yapılandırması

---

# ✅ Tamamlananlar

## Core

- [x] Next.js / React / TypeScript altyapısı
- [x] Firebase Authentication
- [x] Firestore
- [x] Storage
- [x] Firebase App Hosting
- [x] GitHub Actions build
- [x] Multi-tenant temel mimari

## Public Booking

- [x] İşletme slug sistemi
- [x] Hizmet seçimi
- [x] Uzman seçimi
- [x] Tarih seçimi
- [x] Saat seçimi
- [x] 12 aylık takvim
- [x] Uygunluk hesabı
- [x] Uzman bazlı uygunluk
- [x] Hizmet süresi
- [x] Slot locking
- [x] Randevu oluşturma
- [x] Referans numarası
- [x] Randevu onay ekranı

## Panel

- [x] Dashboard
- [x] Randevu listesi
- [x] Randevu filtreleri
- [x] Müşteri arama
- [x] Randevu detayları
- [x] Onaylama
- [x] İptal
- [x] Hizmet CRUD
- [x] Uzman CRUD
- [x] Çalışma saatleri
- [x] İşletme ayarları
- [x] Logo yönetimi
- [x] Owner tabanlı business çözümleme
- [x] Mobil UX iyileştirmeleri

## WhatsApp

- [x] Meta Embedded Signup altyapısı
- [x] Token encryption
- [x] Booking notifications
- [x] Status notifications
- [x] Webhook
- [x] Signature verification
- [x] Duplicate protection
- [x] Deterministic secretary
- [x] AI intent katmanı
- [x] Müşteri bazlı AI izin sistemi
- [x] AI kapat/aç komutları
- [x] 10 dakika cevap gelmezse AI yardım teklifi
- [x] Randevu sorgulama
- [x] Randevu iptal
- [x] Pro günlük özet altyapısı

## Super Admin

- [x] Admin authentication
- [x] İşletme listeleme
- [x] İşletme oluşturma
- [x] Owner Auth oluşturma
- [x] Plan yönetimi
- [x] Aktif/pasif yönetimi
- [x] Owner e-posta görüntüleme
- [x] Şifre reset bağlantısı
- [x] İşletme yönetimi
- [x] İşletme detay ekranı
- [x] Salt okunur destek görünümü
- [x] Manuel abonelik yönetimi
- [x] Manuel erişim aç/kapat
- [x] Super Admin WhatsApp Merkezi

---

## 🆕 Son Eklenen Yönetim Özellikleri

### Super Admin Yönetimi

- [x] İşletme detay ekranında manuel abonelik başlatma
- [x] Starter / Pro plan seçimi
- [x] Aylık / yıllık faturalama seçimi
- [x] Ödeme durumu yönetimi
- [x] Abonelik durumu yönetimi
- [x] Abonelik başlangıç / bitiş / trial tarihleri
- [x] Manuel erişim açma / kapatma
- [x] Erişim kapatıldığında işletme paneli ve public booking sayfasının engellenmesi
- [x] Aktivite logları
- [x] Super Admin tarafından yapılan kritik işlemlerin kayıt altına alınması

### AI Sekreter / İstatistikler

- [x] Super Admin AI Sekreter paneli
- [x] Toplam / tamamlanan / bekleyen / iptal randevu analizi
- [x] Randevu geliri analizi
- [x] İptal oranı
- [x] En yoğun saat analizi
- [x] En çok tercih edilen hizmetler
- [x] En aktif işletmeler
- [x] Otomatik işletme içgörüleri ve önerileri

### Kupon Sistemi

- [x] Super Admin kupon yönetimi
- [x] Yüzde veya sabit tutarlı indirim
- [x] Tüm işletmelere veya belirli işletmeye özel kupon
- [x] Başlangıç / bitiş tarihi
- [x] Kullanım limiti
- [x] Kullanım sayısı takibi
- [x] Kuponu aktif / pasif yapma
- [x] Public booking sayfasında kupon uygulama
- [x] İndirimli toplam fiyat gösterimi
- [x] Kupon kullanımının transaction ile kaydedilmesi

### Duyuru Sistemi

- [x] Super Admin duyuru yönetimi
- [x] Yeni duyuru oluşturma
- [x] Duyuru düzenleme / silme
- [x] Aktif / pasif duyuru
- [x] Bilgi / başarılı / uyarı duyuru tipleri
- [x] Tüm işletmelere veya belirli işletmeye özel duyuru
- [x] Başlangıç / bitiş tarihi
- [x] Duyuruların aktivite loglarına kaydedilmesi
- [x] İşletme tarafının aktif duyuruları çekebilmesi için API

> Not: **Çoklu Super Admin yapılmayacaktır.** ALINDA'nın yönetimi tek Super Admin hesabı üzerinden sürdürülecektir.

---

# 🗺️ Sırada Ne Var?

Detaylı yol haritası: `docs/roadmap.md`

ALINDA'nın bir sonraki büyük hedefi, mevcut randevu motorunu bozmadan sistemi farklı sektörlere açmaktır.

## FAZ 1 — Sektör Altyapısı
- [ ] Business modeline sektör (industry) desteği
- [ ] Theme altyapısı
- [ ] Super Admin'de sektör seçimi
- [ ] Eski işletmeler için geriye dönük uyumluluk (default: beauty)
- [ ] Public booking'e sektör bilgisinin aktarılması
- [ ] Build + tenant regression testi

## FAZ 2 — Theme Engine
- [ ] Sektör bazlı renk / tipografi / layout sistemi
- [ ] Header, hero, hizmet, uzman ve booking bileşeni varyasyonları
- [ ] İşletme bazlı tema seçimi
- [ ] Mevcut beauty tasarımını koruma

## FAZ 3 — İlk Yeni Sektörler
- [ ] Kuaför
- [ ] Berber
- [ ] Veteriner
- [ ] Diş Kliniği

## FAZ 4 — Sağlık Sektörü
- [ ] Özel Doktor
- [ ] Psikolog
- [ ] Fizyoterapist
- [ ] Diyetisyen
- [ ] Göz Kliniği / Klinik

## FAZ 5 — Otomotiv
- [ ] Oto Servis
- [ ] Lastikçi
- [ ] Oto Yıkama
- [ ] Oto Detailing
- [ ] Oto Ekspertiz

## FAZ 6 — Sektöre Özel Modüller
- [ ] Veteriner: hayvan profili
- [ ] Oto servis: araç profili
- [ ] Doktor: uzmanlık / muayene türü
- [ ] Spor / Pilates: ders ve grup kapasitesi

## FAZ 7 — Ticari Ölçekleme
- [ ] Sektör bazlı onboarding
- [ ] Hazır hizmet / tema şablonları
- [ ] Kurulum sihirbazı
- [ ] Custom domain
- [ ] Online ödeme
- [ ] Otomatik abonelik tahsilatı
- [ ] İlk gerçek işletme pilotları
- [ ] Production E2E
- [ ] Security audit
- [ ] Monitoring / operasyon

> **Önemli:** Manuel abonelik ve erişim yönetimi zaten mevcut. Roadmap'teki ödeme maddeleri online ödeme ve otomatik tahsilat anlamına gelir.

### Çalışma prensibi

Her faz **tek tek uygulanacak ve test edilecek**. Yeni sektör özellikleri mevcut güzellik merkezi işletmesini ve mevcut booking motorunu bozmamalıdır.

# 🚧 Şimdilik Kapsam Dışı

İlk gerçek müşterilerden geri bildirim gelmeden ürün gereksiz büyütülmeyecektir.

Şimdilik ana MVP kapsamı dışında:

- Online ödeme
- iyzico / Stripe
- Otomatik abonelik tahsilatı
- SMS
- Native mobil uygulama
- Gelişmiş CRM
- Kampanya sistemi
- Sadakat sistemi
- Gelişmiş raporlama
- Çoklu şube
- Gelişmiş personel/bordro sistemi

---

# 🧪 Temel Demo Testi

1. Ana siteyi aç.
2. Demo işletmesine gir.
3. Hizmet seç.
4. Uzman seç.
5. Tarih seç.
6. Saat seç.
7. Müşteri bilgilerini gir.
8. Randevu oluştur.
9. Referans numarasını kontrol et.
10. İşletme paneline login ol.
11. Randevuyu kontrol et.
12. Onayla veya iptal et.
13. İptal sonrası slotun tekrar açıldığını kontrol et.
14. Super Admin'den yeni işletme oluştur.
15. Yeni owner ile login ol.
16. Yeni işletmede hizmet/uzman/saat oluştur.
17. Public booking üzerinden randevu al.
18. Tenant izolasyonunu kontrol et.

---

# 📊 Güncel Ürün Durumu

| Alan | Durum |
|---|---|
| Core Firebase | 🟢 Hazır |
| Public booking | 🟢 Hazır |
| Uzman bazlı booking | 🟢 Hazır |
| Hizmet / süre sistemi | 🟢 Hazır |
| Slot locking | 🟢 Hazır |
| İşletme paneli | 🟢 Hazır |
| Owner tabanlı multi-tenant | 🟢 Kod tarafı hazır / E2E test bekliyor |
| Super Admin | 🟢 Geliştirildi / canlı E2E doğrulaması bekliyor |
| İşletme detayları | 🟢 Hazır |
| Destek görünümü | 🟢 Hazır |
| Manuel abonelik | 🟢 Hazır |
| Manuel erişim aç/kapat | 🟢 Hazır |
| Aktivite logları | 🟢 Hazır |
| AI Sekreter / istatistikler | 🟢 Hazır |
| Kupon sistemi | 🟢 Hazır |
| Duyuru sistemi | 🟢 Hazır |
| WhatsApp Merkezi | 🟢 Kodlandı / canlı doğrulama bekliyor |
| Logo / branding | 🟢 Hazır |
| WhatsApp altyapısı | 🟢 Kod hazır / Meta production bekliyor |
| WhatsApp secretary | 🟢 Deterministic akış hazır |
| AI WhatsApp secretary | 🟡 İzin + 10 dk fallback + Gemini kodu entegre / gerçek API + WhatsApp E2E test bekliyor |
| WhatsApp sorgulama | 🟢 Kod hazır |
| WhatsApp iptal | 🟢 Kod hazır |
| Pro günlük özet | 🟡 Kod hazır / template + secret + gerçek test bekliyor |
| Security audit | 🟡 Yapılacak |
| Production E2E | 🟡 Yapılacak |
| Custom domain | 🔴 Yapılacak |
| Ödeme / abonelik | 🔴 Yapılacak |
| İlk gerçek işletme | 🔴 Yapılacak |

---

# 🗺️ Ürün Geliştirme Sırası

Öncelik sırası artık şudur:

    1. Build + deployment doğrulaması
             ↓
    2. Multi-tenant gerçek işletme testi
             ↓
    3. Security audit
             ↓
    4. WhatsApp Meta production
             ↓
    5. AI secretary gerçek WhatsApp testi
             ↓
    6. Pro günlük özet gerçek testi
             ↓
    7. Production E2E
             ↓
    8. İlk gerçek işletme pilotu
             ↓
    9. Custom domain
             ↓
    10. Ödeme / abonelik

---

# 📜 Geliştirme Prensipleri

1. GitHub Actions build yeşil olmadan production deployment kabul edilmez.
2. Tenant izolasyonu temel güvenlik gereksinimidir.
3. AI doğrudan booking/cancel işlemi yapmaz; gerçek işlem deterministic Firestore akışından geçer.
4. Secret/API key değerleri repository'ye yazılmaz.
5. Gerçek işletme verisiyle test edilmemiş özellik production-ready kabul edilmez.
6. Önce booking + multi-tenant + WhatsApp core stabil hale getirilir.
7. Ödeme ve gelişmiş özellikler ilk gerçek müşterilerden sonra önceliklendirilir.
8. MVP gereksiz özelliklerle şişirilmez.

---

# 📞 Destek

- E-posta: destek.fkdigital@gmail.com
- WhatsApp: 05421523805
- WhatsApp bağlantısı: https://wa.me/905421523805

---

# 👑 Super Admin

- Panel: https://alinda-booking--alinda-booking-9e0d8.europe-west4.hosted.app/admin
- E-posta: admin@alindabooking.com
- Şifre: Firebase Authentication'da belirlenen şifre

Super Admin şifresi güvenlik nedeniyle repository içinde tutulmaz.

---

## 🗺️ Public Randevu Haritası

Public randevu sayfasındaki işletme konumu haritası güncellendi.

- [x] İşletme latitude / longitude bilgilerinin public booking'e aktarılması
- [x] Randevu sayfasında işletme adresinin gösterilmesi
- [x] Randevu sayfasında gömülü harita gösterimi
- [x] Harita üzerinde işletme konumunun işaretlenmesi
- [x] Haritadan Google Maps yol tarifi bağlantısı
- [x] Harita için API anahtarı gerektirmeyen OpenStreetMap embed kullanımı
- [x] Mobil uyumlu harita yüksekliği ve taşma kontrolü

İşletme konumu, panelde **İşletme Ayarları → İletişim ve adres → Haritada konumu bul** üzerinden adres aranarak latitude / longitude olarak kaydedilir.

## Son Durum

**ALINDA artık yalnızca bir booking prototipi değildir.**

Core booking, multi-tenant yapı, işletme paneli, Super Admin, işletme detayları, salt okunur destek görünümü, manuel abonelik yönetimi, erişim kontrolü, aktivite logları, AI Sekreter/istatistikler, kupon sistemi, duyuru sistemi, WhatsApp altyapısı, WhatsApp secretary, randevu sorgulama/iptal, AI intent katmanı ve Pro günlük özet altyapısı kurulmuştur.

Core randevu sistemi, işletme paneli, owner tabanlı multi-tenant yapı, Super Admin, WhatsApp server/webhook altyapısı, gerçek WhatsApp randevu akışı, randevu sorgulama/iptal ve AI intent katmanı kurulmuş durumdadır.

Bundan sonraki ana hedef yeni özellik eklemekten çok **multi-tenant + WhatsApp + AI akışını gerçek işletmeyle uçtan uca doğrulamak ve production'a güvenli şekilde çıkmaktır.**

**ALINDA Booking — Online randevu + WhatsApp otomasyonu + AI destekli sekreter.**
