import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FFFDFC] px-5 py-10 text-[#2D2625] sm:px-8">
      <article className="mx-auto max-w-3xl rounded-[28px] border border-[#F0DFDC] bg-white p-6 shadow-[0_18px_60px_rgba(45,38,37,0.06)] sm:p-10">
        <Link href="/" className="text-sm font-semibold text-[#B96862]">← ALINDA ana sayfa</Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-[#B96862]">ALINDA Kullanım ve Hizmet Koşulları</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">ALINDA Booking · Kullanım Koşulları</h1>
        <section className="mt-8 space-y-7 text-sm leading-7 text-[#6F6562]">
          <div><h2 className="text-lg font-bold text-[#2D2625]">1. Hizmetin kapsamı</h2><p className="mt-2">ALINDA Booking, işletmelerin online randevu, müşteri ve işletme süreçlerini yönetmesine yardımcı olan yazılım hizmetidir.</p></div>
          <div><h2 className="text-lg font-bold text-[#2D2625]">2. İşletme hesabı ve sorumluluk</h2><p className="mt-2">İşletme sahibi; hesabındaki bilgilerin, hizmetlerin, çalışma saatlerinin, fiyatların, müşteri iletişiminin ve yayınladığı randevu koşullarının doğruluğundan sorumludur.</p></div>
          <div><h2 className="text-lg font-bold text-[#2D2625]">3. Abonelik ve erişim</h2><p className="mt-2">Abonelik, işletmenin seçtiği plana ve ALINDA tarafından tanımlanan kullanım koşullarına göre sunulur. Ödeme ve abonelik durumu, işletmenin erişiminin devam edip etmeyeceğini etkileyebilir.</p></div>
          <div><h2 className="text-lg font-bold text-[#2D2625]">4. Kişisel veriler</h2><p className="mt-2">İşletmenin müşterilerine ait kişisel veriler bakımından işletmenin veri sorumlusu olarak üstlendiği yükümlülükler ile ALINDA'nın teknik hizmet sağlayıcı olarak yürüttüğü faaliyetler işlem bazında değerlendirilir. İşletme, sistemi kullanırken KVKK ve ilgili mevzuata uygun hareket etmekle yükümlüdür.</p></div>
          <div><h2 className="text-lg font-bold text-[#2D2625]">5. WhatsApp ve yapay zeka özellikleri</h2><p className="mt-2">WhatsApp bildirimleri ve ALINDA AI gibi özellikler ilgili plan, teknik bağlantılar ve üçüncü taraf servislerin çalışma koşullarına bağlıdır. İşletme, müşterileriyle yapılan iletişimde gerekli bilgilendirme ve tercih süreçlerini yürütmekten sorumludur.</p></div>
          <div><h2 className="text-lg font-bold text-[#2D2625]">6. Kötüye kullanım</h2><p className="mt-2">Hizmet; hukuka aykırı, yanıltıcı, spam niteliğinde veya üçüncü kişilerin haklarını ihlal eden amaçlarla kullanılamaz.</p></div>
          <div><h2 className="text-lg font-bold text-[#2D2625]">7. Güncellemeler</h2><p className="mt-2">ALINDA hizmet özelliklerini, teknik altyapısını ve bu koşulları mevzuat ve ürün ihtiyaçlarına göre güncelleyebilir. Önemli değişiklikler uygun kanallardan duyurulur.</p></div>
        </section>
        <div className="mt-9 rounded-2xl bg-[#FFF6F4] p-4 text-xs leading-6 text-[#8F817E]">
          Bu metin ürünün başlangıç kullanım koşulları için hazırlanmıştır. Ticari sözleşme, veri işleme sözleşmesi ve özel abonelik koşulları gerekiyorsa ayrıca düzenlenmelidir.
        </div>
      </article>
    </main>
  );
}
