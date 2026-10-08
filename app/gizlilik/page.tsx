import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FFFDFC] px-5 py-10 text-[#2D2625] sm:px-8">
      <article className="mx-auto max-w-3xl rounded-[28px] border border-[#F0DFDC] bg-white p-6 shadow-[0_18px_60px_rgba(45,38,37,0.06)] sm:p-10">
        <Link href="/" className="text-sm font-semibold text-[#B96862]">← ALINDA ana sayfa</Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-[#B96862]">Gizlilik ve KVKK</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Kişisel Verilerin İşlenmesi Hakkında Bilgilendirme</h1>
        <p className="mt-4 text-sm leading-7 text-[#8F817E]">
          Bu metin, ALINDA Booking üzerinden online randevu oluştururken paylaşılan kişisel verilerin
          nasıl kullanıldığını genel hatlarıyla açıklar. Randevu hizmetini sunan işletme, kendi veri
          sorumluluğu kapsamında ayrıca gerekli aydınlatma metinlerini ve iletişim tercihlerini düzenlemelidir.
        </p>

        <section className="mt-8 space-y-7 text-sm leading-7">
          <div>
            <h2 className="text-lg font-bold">1. İşlenen bilgiler</h2>
            <p className="mt-2 text-[#6F6562]">
              Randevu oluşturma sırasında ad soyad, telefon numarası, seçilen hizmet, uzman, tarih,
              saat, randevu referansı ve varsa kupon bilgisi işlenebilir. WhatsApp iletişimi için
              ayrıca tercih verdiğinizde bu tercih de randevu kaydında tutulabilir.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold">2. İşleme amacı</h2>
            <p className="mt-2 text-[#6F6562]">
              Veriler; randevuyu oluşturmak, uygunluğu kontrol etmek, randevu kaydını işletmeye
              iletmek, randevu hakkında iletişim kurmak, gerektiğinde randevu durumunu yönetmek ve
              hizmetin güvenli şekilde yürütülmesi amaçlarıyla kullanılır.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold">3. Saklama ve erişim</h2>
            <p className="mt-2 text-[#6F6562]">
              Randevu bilgileri, hizmeti sunan işletmenin hesabındaki randevu kaydında tutulur.
              İşletme yetkili kullanıcıları, hizmetin yürütülmesi için gerekli randevu bilgilerine erişebilir.
              Veriler yalnızca gerekli olduğu ölçüde ve ilgili mevzuata uygun şekilde saklanmalıdır.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold">4. Haklarınız</h2>
            <p className="mt-2 text-[#6F6562]">
              KVKK kapsamında kişisel verilerinizle ilgili bilgi alma, düzeltme, silme veya işleme
              faaliyetleriyle ilgili talepleriniz için öncelikle randevu aldığınız işletmeyle iletişime
              geçebilirsiniz. Talebinizin niteliğine göre ilgili veri sorumlusunun başvuru kanalları kullanılır.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold">5. İletişim tercihi</h2>
            <p className="mt-2 text-[#6F6562]">
              WhatsApp kutucuğu, randevu bilgilerinin WhatsApp üzerinden gönderilmesine ilişkin ayrı bir
              tercihtir. Bu kutunun işaretlenmemesi randevu oluşturmanıza engel değildir.
            </p>
          </div>
        </section>

        <div className="mt-9 rounded-2xl bg-[#FFF6F4] p-4 text-xs leading-6 text-[#8F817E]">
          <strong className="text-[#2D2625]">Önemli:</strong> Bu sayfa teknik ürün metni olarak hazırlanmıştır.
          İşletmenin unvanı, iletişim bilgileri, saklama süreleri, hukuki işleme şartları ve özel süreçleri
          satışa çıkmadan önce işletmeye özel olarak doldurulmalıdır.
        </div>
      </article>
    </main>
  );
}
