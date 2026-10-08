import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicBusiness } from "@/lib/businesses/public";

export const dynamic = "force-dynamic";

export default async function BusinessTermsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const business = await getPublicBusiness(slug);
  if (!business) notFound();

  return (
    <main className="min-h-screen bg-[#FFF6F4] px-4 py-8 text-[#2D2625] sm:px-8">
      <article className="mx-auto max-w-3xl rounded-[28px] border border-[#F0DFDC] bg-white p-6 shadow-[0_18px_60px_rgba(45,38,37,0.06)] sm:p-10">
        <Link href={"/" + business.slug} className="text-sm font-semibold text-[#B96862]">← Randevu sayfasına dön</Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-[#B96862]">Randevu ve Hizmet Koşulları</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{business.name} · Randevu ve Hizmet Koşulları</h1>

        <section className="mt-8 space-y-7 text-sm leading-7">
          <div><h2 className="text-lg font-bold">1. Randevu oluşturma</h2><p className="mt-2 text-[#6F6562]">Online randevu, seçilen hizmet, uzman, tarih ve saat için sistemde uygunluk bulunması halinde oluşturulur. Randevu referans numarası müşteriye gösterilir ve saklanması önerilir.</p></div>
          <div><h2 className="text-lg font-bold">2. Randevu değişikliği ve iptal</h2><p className="mt-2 text-[#6F6562]">Randevu değişikliği veya iptal işlemleri, işletmenin belirlediği uygulamaya göre yapılır. İşletme gerekli gördüğünde randevuyu iptal edebilir veya müşteriden yeniden randevu almasını isteyebilir.</p></div>
          <div><h2 className="text-lg font-bold">3. Hizmet ve fiyat</h2><p className="mt-2 text-[#6F6562]">Randevu sırasında gösterilen hizmet, süre ve fiyat bilgileri esas alınır. İşletme hizmet kapsamı ve fiyatlarda değişiklik yapma hakkını saklı tutar; mevcut randevular için müşteriye bildirilen koşullar dikkate alınır.</p></div>
          <div><h2 className="text-lg font-bold">4. Müşteri bilgileri</h2><p className="mt-2 text-[#6F6562]">Randevu oluştururken verilen bilgilerin doğru ve güncel olması müşterinin sorumluluğundadır. Telefon numarası, randevu hakkında iletişim kurulabilmesi için doğru girilmelidir.</p></div>
          <div><h2 className="text-lg font-bold">5. WhatsApp bildirimleri</h2><p className="mt-2 text-[#6F6562]">WhatsApp bildirimi ayrı bir tercihtir. Bu tercihin verilmemesi randevu oluşturmayı engellemez. Bildirimler, teknik ve operasyonel koşullara bağlı olarak gecikebilir veya gönderilemeyebilir.</p></div>
          <div><h2 className="text-lg font-bold">6. İletişim</h2><p className="mt-2 text-[#6F6562]">{business.name} ile iletişim için {business.phone || "işletmenin iletişim kanallarını"} kullanabilirsiniz.</p></div>
        </section>

        <div className="mt-9 rounded-2xl bg-[#FFF6F4] p-4 text-xs leading-6 text-[#8F817E]">
          Bu metin işletmeye özel hukuki hizmet sözleşmesi yerine ürün içinde kullanılmak üzere hazırlanmış bir taslaktır. İşletmenin gerçek iptal, geç kalma, ücret iadesi, no-show ve hizmet kuralları varsa bu alanlar ayrıca özelleştirilmelidir.
        </div>
      </article>
    </main>
  );
}
