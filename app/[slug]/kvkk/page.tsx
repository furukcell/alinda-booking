import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicBusiness } from "@/lib/businesses/public";

export const dynamic = "force-dynamic";

export default async function BusinessKvkkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const business = await getPublicBusiness(slug);
  if (!business) notFound();

  return (
    <main className="min-h-screen bg-[#FFF6F4] px-4 py-8 text-[#2D2625] sm:px-8">
      <article className="mx-auto max-w-3xl rounded-[28px] border border-[#F0DFDC] bg-white p-6 shadow-[0_18px_60px_rgba(45,38,37,0.06)] sm:p-10">
        <Link href={"/" + business.slug} className="text-sm font-semibold text-[#B96862]">← Randevu sayfasına dön</Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-[#B96862]">KVKK Aydınlatma Metni</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{business.name} · Kişisel Verilerin İşlenmesi Hakkında</h1>
        <p className="mt-4 text-sm leading-7 text-[#6F6562]">
          Bu aydınlatma metni, {business.name} tarafından online randevu sürecinde işlenen kişisel veriler hakkında bilgi vermek amacıyla hazırlanmıştır.
        </p>

        <section className="mt-8 space-y-7 text-sm leading-7">
          <div><h2 className="text-lg font-bold">1. Veri sorumlusu</h2><p className="mt-2 text-[#6F6562]">{business.name}, randevu hizmeti kapsamında kendi adına yürüttüğü kişisel veri işleme faaliyetleri bakımından ilgili mevzuat kapsamında veri sorumlusu sıfatıyla hareket eder. İletişim: {business.phone || "İşletmenin iletişim kanalı"}{business.address ? " · " + business.address : ""}.</p></div>
          <div><h2 className="text-lg font-bold">2. İşlenen kişisel veriler</h2><p className="mt-2 text-[#6F6562]">Randevu oluşturma sırasında ad soyad, telefon numarası, seçilen hizmet, uzman, randevu tarihi ve saati, randevu referans numarası ve varsa kupon/indirim bilgileri işlenebilir. WhatsApp bildirimi tercih edilirse bu tercih ve ilgili iletişim bilgileri de işlenebilir.</p></div>
          <div><h2 className="text-lg font-bold">3. İşleme amaçları</h2><p className="mt-2 text-[#6F6562]">Randevunun oluşturulması ve yönetilmesi, uygunluk kontrolü, hizmetin sunulması, randevu hakkında bilgilendirme, randevu iptal/değişiklik işlemleri, müşteri taleplerinin karşılanması ve hizmet güvenliğinin sağlanması amaçlarıyla işleme yapılabilir.</p></div>
          <div><h2 className="text-lg font-bold">4. Hukuki sebep</h2><p className="mt-2 text-[#6F6562]">Kişisel veriler, somut işleme faaliyetine göre KVKK'da öngörülen hukuki sebeplerden uygulanabilir olanına dayanılarak işlenir. Açık rıza gereken ayrı bir işlem bulunması halinde bu rıza, aydınlatma metninden ayrı olarak alınır.</p></div>
          <div><h2 className="text-lg font-bold">5. Aktarım ve hizmet sağlayıcılar</h2><p className="mt-2 text-[#6F6562]">Randevunun teknik olarak oluşturulması ve işletmeye iletilmesi için ALINDA Booking gibi hizmet sağlayıcılarından yararlanılabilir. Teknik hizmet sağlayıcılarına yapılan aktarımlar, ilgili mevzuata ve işletmenin kendi veri işleme düzenlemelerine uygun şekilde yürütülmelidir.</p></div>
          <div><h2 className="text-lg font-bold">6. Saklama süresi</h2><p className="mt-2 text-[#6F6562]">Kişisel veriler, ilgili işleme amacı ve mevzuatta öngörülen sürelerle sınırlı olarak saklanır; saklama süresi sona erdiğinde mevzuata uygun şekilde silinir, yok edilir veya anonim hale getirilir.</p></div>
          <div><h2 className="text-lg font-bold">7. KVKK kapsamındaki haklarınız</h2><p className="mt-2 text-[#6F6562]">KVKK kapsamındaki talepleriniz için öncelikle {business.name} ile iletişime geçebilirsiniz. Başvurular, ilgili mevzuatta öngörülen usul ve esaslara göre değerlendirilir.</p></div>
        </section>

        <div className="mt-9 rounded-2xl bg-[#FFF6F4] p-4 text-xs leading-6 text-[#8F817E]">
          Bu metin ALINDA Booking tarafından teknik taslak olarak sunulmuştur. İşletmenin gerçek unvanı, veri işleme süreçleri, hukuki sebepleri, saklama süreleri, aktarım süreçleri ve başvuru kanalları işletme tarafından satışa sunulmadan önce kontrol edilip gerekiyorsa hukuk danışmanı tarafından özelleştirilmelidir.
        </div>
      </article>
    </main>
  );
}
