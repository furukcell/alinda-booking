import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  CalendarDays,
  Check,
  Clock3,
  LayoutDashboard,
  Link2,
  Mail,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  Store,
  UserRound,
} from "lucide-react";

const benefits = [
  { icon: CalendarCheck2, title: "Telefon trafiğini azaltın", text: "Müşterileriniz uygun gün ve saati kendileri seçsin. Siz sürekli telefonla randevu ayarlamak zorunda kalmayın." },
  { icon: LayoutDashboard, title: "Her şeyi tek panelden yönetin", text: "Hizmetlerinizi, fiyatlarınızı, çalışma saatlerinizi, uzmanlarınızı ve gelen randevuları tek yerden kontrol edin." },
  { icon: Clock3, title: "Boş saatler otomatik gösterilsin", text: "Mesai saatleriniz ve alınmış randevular dikkate alınır. Müşteriye yalnızca uygun zamanlar sunulur." },
  { icon: Smartphone, title: "Müşteriniz için çok kolay", text: "Uygulama indirmeye gerek yok. İşletmenize özel bağlantıyı Instagram, WhatsApp veya Google üzerinden paylaşmanız yeterli." },
  { icon: UserRound, title: "Uzman bazlı randevu", text: "Birden fazla çalışanınız varsa müşteriniz hizmeti seçtikten sonra istediği uzmanı seçebilir." },
  { icon: ShieldCheck, title: "İşletmenize özel sistem", text: "Kendi işletme bilgileriniz, hizmetleriniz, çalışma düzeniniz ve randevu sayfanız size özel çalışır." },
];

const planFeatures = [
  "Size özel online randevu sayfası",
  "Hizmet, fiyat ve süre yönetimi",
  "Çalışma gün ve saatleri yönetimi",
  "Uzman / personel yönetimi",
  "Uzmanlara özel çalışma saatleri",
  "Randevu takvimi ve dolu saat kontrolü",
  "Müşteri adı ve telefon bilgileri",
  "Mobil uyumlu randevu deneyimi",
  "WhatsApp randevu bildirim altyapısı",
  "İşletme yönetim paneli",
];

const steps = [
  { icon: Store, number: "01", title: "İşletmenizi tanımlayın", text: "Hizmetlerinizi, fiyatlarınızı, uzmanlarınızı ve çalışma saatlerinizi ekleyin." },
  { icon: Link2, number: "02", title: "Randevu linkinizi paylaşın", text: "Size özel bağlantınızı Instagram, WhatsApp, Google veya web sitenizde paylaşın." },
  { icon: CalendarDays, number: "03", title: "Randevularınızı yönetin", text: "Müşteriler kendi randevusunu alsın, siz tüm randevuları tek panelden takip edin." },
];

const actionFeatures = [
  { title: "Randevuları otomatik toplayın", text: "Müşteriniz bağlantınıza girsin, hizmeti ve uzmanı seçsin, uygun gün ve saati kendisi belirlesin." },
  { title: "Ekibinizi yönetin", text: "Birden fazla uzman çalıştırıyorsanız her uzmanın hangi hizmeti verdiğini ve ne zaman çalıştığını tanımlayın." },
  { title: "Boş saatleri satışa açın", text: "Alınan randevular ve mesai saatleri dikkate alınarak müşteriye seçilebilir uygun saatler gösterilsin." },
  { title: "Müşteriye anında bilgi verin", text: "Randevu oluşturulduğunda işletme ve izin veren müşteri için WhatsApp bildirim altyapısını kullanın." },
];

function BookingPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[760px] lg:mr-[-18px] xl:mr-[-30px]">
      <div className="absolute -right-2 top-8 z-10 rounded-2xl border border-alinda-line bg-white/95 px-4 py-3 shadow-elevated backdrop-blur sm:-right-5 sm:top-12">
        <p className="text-[10px] font-semibold text-alinda-muted">Müşteriniz</p>
        <p className="mt-1 text-xs font-bold">Böyle randevu alır.</p>
      </div>
      <div className="absolute -left-3 bottom-8 z-10 hidden rounded-2xl border border-alinda-line bg-white/95 px-4 py-3 shadow-card backdrop-blur sm:block">
        <p className="text-xs font-semibold text-[#4E8762]">✓ Uygulama indirmeye gerek yok</p>
      </div>
      <div className="overflow-hidden rounded-[38px] border border-white/80 bg-white shadow-[0_30px_90px_rgba(45,38,37,0.18)]">
        <Image
          src="/alinda-salon-hero.png"
          alt="ALINDA online randevu deneyimi"
          width={1536}
          height={1024}
          priority
          className="h-auto w-full object-cover"
        />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-alinda-cream text-alinda-ink">
      <header className="sticky top-0 z-30 border-b border-alinda-line/80 bg-alinda-cream/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="ALINDA Booking ana sayfa">
            <Image src="/alinda-logo.png" alt="ALINDA" width={40} height={40} className="h-10 w-10 object-contain" priority />
            <span className="text-[17px] font-semibold tracking-[-0.02em] text-alinda-accent">
              ALINDA <span className="font-medium text-alinda-ink/75">Booking</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-3" aria-label="Ana navigasyon">
            <a href="#neden-alinda" className="hidden rounded-full px-3 py-2 text-sm font-medium text-alinda-muted transition hover:text-alinda-ink sm:inline-flex">Neden ALINDA?</a>
            <a href="#nasil-calisir" className="hidden rounded-full px-3 py-2 text-sm font-medium text-alinda-muted transition hover:text-alinda-ink sm:inline-flex">Nasıl çalışır?</a>
            <a href="#fiyatlar" className="hidden rounded-full px-3 py-2 text-sm font-medium text-alinda-muted transition hover:text-alinda-ink sm:inline-flex">Fiyatlar</a>
            <Link href="/login" className="inline-flex h-10 items-center rounded-full bg-alinda-ink px-4 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-alinda-ink-soft">İşletme girişi</Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute -left-40 top-10 h-[500px] w-[500px] rounded-full bg-alinda-accent-soft/70 blur-3xl" aria-hidden="true" />
        <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-[#F1E8E5] blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:grid-cols-[.82fr_1.18fr] lg:gap-8 lg:px-8 lg:py-20">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-alinda-line bg-white/80 px-4 py-2 text-xs font-semibold text-alinda-muted shadow-card">
              <span className="h-2 w-2 rounded-full bg-alinda-accent" /> ALINDA Booking · FK Digital
            </div>
            <h1 className="mt-7 max-w-2xl text-4xl font-semibold leading-[1.04] tracking-[-0.05em] sm:text-6xl lg:text-[64px]">
              İşletmenizin<br />randevu işini<br /><span className="text-alinda-accent">ALINDA yönetsin.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-alinda-muted sm:text-lg sm:leading-8">
              Telefon ve WhatsApp trafiğini azaltın, müşterilerinize 7/24 online randevu verin ve ekibinizin takvimini tek panelden yönetin.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="#fiyatlar" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-alinda-accent px-6 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(216,137,130,0.2)] transition hover:-translate-y-0.5 hover:opacity-90">Paketleri incele <ArrowRight size={17} /></a>
              <a href="#nasil-calisir" className="inline-flex h-12 items-center justify-center rounded-full border border-alinda-line bg-white px-6 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-alinda-accent">Nasıl çalışır?</a>
            </div>
            <div className="mt-7 flex flex-wrap gap-3 text-xs text-alinda-muted">
              {["Kolay kurulum", "7/24 online randevu", "Mobil uyumlu"].map((item) => (
                <span key={item} className="rounded-full border border-alinda-line bg-white/75 px-3 py-2">✓ {item}</span>
              ))}
            </div>
          </div>
          <BookingPreview />
        </div>
      </section>

      <section id="neden-alinda" className="scroll-mt-20 border-y border-alinda-line bg-white/70">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[.9fr_1.5fr] lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-alinda-accent">Neyi çözüyoruz?</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Randevu almak kolay olmalı. Yönetmek de öyle.</h2>
            <p className="mt-5 text-base leading-7 text-alinda-muted">Telefon, WhatsApp mesajları, kağıt ajandalar ve farklı uygulamalar arasında randevu takibini zorlaştıran karmaşayı tek yerde topluyoruz.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <article key={benefit.title} className="rounded-[24px] border border-alinda-line bg-white p-5 shadow-card transition hover:-translate-y-1 hover:shadow-elevated">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-alinda-accent-soft text-alinda-accent"><Icon size={19} /></div>
                  <h3 className="mt-4 text-base font-semibold">{benefit.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-alinda-muted">{benefit.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="nasil-calisir" className="scroll-mt-20 bg-[#F5ECE9]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.7fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-alinda-accent">Nasıl çalışır?</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Sadece 3 adımda kullanmaya başlayın.</h2>
              <p className="mt-5 text-base leading-7 text-alinda-muted">Teknik bilgiye gerek yok. İşletmenizi tanımlayın, bağlantınızı paylaşın ve randevularınızı tek panelden yönetin.</p>
              <a href="#fiyatlar" className="mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-alinda-accent px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5">Hemen başlayın <ArrowRight size={16} /></a>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.number} className="relative rounded-[26px] border border-white bg-white p-6 shadow-card">
                    <span className="absolute right-5 top-5 text-xs font-bold text-alinda-accent">{step.number}</span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-alinda-accent-soft text-alinda-accent"><Icon size={22} /></div>
                    <h3 className="mt-6 text-base font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-alinda-muted">{step.text}</p>
                    {index < steps.length - 1 && <span className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white text-alinda-accent shadow-card md:flex">→</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-alinda-line bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-alinda-accent">Neden biz?</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Karmaşık bir yazılım değil, işletmenizin günlük yardımcısı.</h2>
            <p className="mt-5 text-base leading-7 text-alinda-muted">Size onlarca gereksiz özellik sunup sistemi zorlaştırmak yerine, randevu alan bir işletmenin gerçekten ihtiyaç duyduğu temel süreçlere odaklanıyoruz.</p>
          </div>
          <div className="rounded-[30px] border border-alinda-line bg-alinda-cream p-6 shadow-card sm:p-8">
            <div className="space-y-5">
              {[
                ["Kolay kurulum", "İşletme bilgilerinizi, hizmetlerinizi ve çalışma saatlerinizi tanımlayın."],
                ["Kolay paylaşım", "Size özel randevu bağlantınızı Instagram, WhatsApp ve diğer kanallarda paylaşın."],
                ["Daha az telefon trafiği", "Müşteriler uygun zamanı kendileri seçsin, siz işinize odaklanın."],
                ["Daha düzenli işletme", "Randevular, uzmanlar ve çalışma saatleri tek bir sistemde toplansın."],
              ].map(([title, text]) => (
                <div key={title} className="flex gap-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EAF6EE] text-[#4E8762]"><Check size={15} strokeWidth={2.5} /></span>
                  <div><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-sm leading-5 text-alinda-muted">{text}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="fiyatlar" className="scroll-mt-20 border-y border-alinda-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.5fr] lg:items-start">
            <div className="lg:sticky lg:top-24">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-alinda-accent">Abonelikler</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">İşletmeniz için ihtiyacınız olan her şey.</h2>
              <p className="mt-4 text-base leading-7 text-alinda-muted">Aylık ve yıllık planda aynı ALINDA Booking özelliklerinin tamamını kullanın. Yıllık planda daha avantajlı fiyatla devam edin.</p>
              <div className="mt-7 rounded-2xl bg-alinda-cream p-5">
                <p className="text-sm font-semibold">Abonelikle neler yapabilirsiniz?</p>
                <ul className="mt-4 space-y-2.5 text-sm text-alinda-muted">
                  {actionFeatures.map((item) => <li key={item.title} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-[#4E8762]" />{item.title}</li>)}
                </ul>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: "Starter",
                  oldPrice: "₺999",
                  price: "₺499",
                  suffix: "/ ay",
                  badge: "Başlangıç",
                  description: "Online randevu sisteminin tüm temel özellikleriyle işletmenizi dijitale taşıyın.",
                  features: planFeatures,
                },
                {
                  name: "Pro",
                  oldPrice: "₺2.000",
                  price: "₺999",
                  suffix: "/ ay",
                  badge: "PRO",
                  description: "AI destekli WhatsApp sekreteri ve işletme özetleriyle randevu işini daha da otomatikleştirin.",
                  features: [...planFeatures, "AI destekli WhatsApp randevu sekreteri", "WhatsApp üzerinden randevu sorgulama ve iptal", "Günlük WhatsApp randevu özeti", "24 saat önce otomatik WhatsApp randevu hatırlatması", "Doğal dil ile randevu talebi anlama"],
                },
                {
                  name: "Starter Yıllık",
                  oldPrice: "₺10.000",
                  price: "₺4.999",
                  suffix: "/ yıl",
                  badge: "YILLIK",
                  description: "Starter özelliklerinin 12 aylık kullanımı. Aylık Starter'a göre 989 TL daha avantajlı.",
                  features: planFeatures,
                },
                {
                  name: "Pro Yıllık",
                  oldPrice: "₺20.000",
                  price: "₺10.000",
                  suffix: "/ yıl",
                  badge: "EN AVANTAJLI",
                  description: "Pro özelliklerinin 12 aylık kullanımı. Aylık Pro'ya göre 1.988 TL daha avantajlı.",
                  features: [...planFeatures, "AI destekli WhatsApp randevu sekreteri", "WhatsApp üzerinden randevu sorgulama ve iptal", "Günlük WhatsApp randevu özeti", "Doğal dil ile randevu talebi anlama"],
                },
              ].map((plan) => (
                <div key={plan.name} className={`relative rounded-[30px] border p-7 shadow-card sm:p-8 ${plan.name.includes("Yıllık") ? "border-alinda-accent bg-[#FFF8F6] shadow-[0_18px_55px_rgba(216,137,130,0.13)]" : "border-alinda-line bg-alinda-cream"}`}>
                  <span className="absolute right-5 top-5 rounded-full bg-[#EAF6EE] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[#4E8762]">{plan.badge}</span>
                  <p className="text-sm font-semibold text-alinda-muted">{plan.name}</p>
                  <div className="mt-3 flex flex-wrap items-end gap-2">
                    <span className="text-lg font-medium text-alinda-muted line-through decoration-alinda-accent/70">{plan.oldPrice}</span>
                    <span className="text-5xl font-semibold tracking-[-0.04em]">{plan.price}</span>
                    <span className="pb-1 text-sm text-alinda-muted">{plan.suffix}</span>
                  </div>
                  <p className="mt-3 text-sm leading-5 text-alinda-muted">{plan.description}</p>
                  <div className="mt-6 border-t border-alinda-line pt-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-alinda-muted">Pakete dahil</p>
                    <ul className="mt-4 space-y-2.5">
                      {plan.features.map((feature) => <li key={feature} className="flex items-start gap-2 text-xs leading-5"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EAF6EE] text-[#4E8762]"><Check size={11} strokeWidth={3} /></span><span>{feature}</span></li>)}
                    </ul>
                  </div>
                  <a href="https://wa.me/905421523805" target="_blank" rel="noreferrer" className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-alinda-accent px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-90">WhatsApp'tan bilgi al <MessageCircle size={16} /></a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="iletisim" className="scroll-mt-20 bg-gradient-to-br from-[#FFF7F4] via-white to-[#F4ECEA]">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-alinda-accent">FK Digital</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">İşletmenizi dijitale taşıyalım.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-alinda-muted">ALINDA Booking hakkında bilgi almak, sistemi işletmeniz için kurdurmak veya destek almak için bize ulaşabilirsiniz.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="https://wa.me/905421523805" target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-alinda-accent px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-90"><MessageCircle size={17} /> WhatsApp</a>
            <a href="mailto:destek.fkdigital@gmail.com" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-alinda-line bg-white px-6 text-sm font-semibold text-alinda-ink transition hover:-translate-y-0.5 hover:border-alinda-accent"><Mail size={17} /> E-posta</a>
          </div>
        </div>
      </section>

      <footer className="border-t border-alinda-line bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_.8fr_.8fr] lg:px-8">
          <div><p className="font-semibold tracking-[0.18em]">ALINDA Booking</p><p className="mt-2 max-w-sm text-xs leading-5 text-alinda-muted">FK Digital tarafından geliştirilmiştir. İşletmeler için sade ve modern online randevu yönetimi.</p></div>
          <div><p className="text-xs font-semibold">Hızlı bağlantılar</p><div className="mt-3 flex flex-col gap-2 text-xs text-alinda-muted"><a href="#neden-alinda">Neden ALINDA?</a><a href="#nasil-calisir">Nasıl çalışır?</a><a href="#fiyatlar">Fiyatlar & Abonelikler</a><Link href="/login">İşletme girişi</Link></div></div>
          <div><p className="text-xs font-semibold">Bize ulaşın</p><div className="mt-3 flex flex-col gap-2 text-xs text-alinda-muted"><a href="https://wa.me/905421523805" target="_blank" rel="noreferrer">WhatsApp · 0542 152 38 05</a><a href="mailto:destek.fkdigital@gmail.com" className="break-all">destek.fkdigital@gmail.com</a></div></div>
        </div>
        <div className="border-t border-alinda-line px-4 py-4 text-center text-[11px] text-alinda-muted">© {new Date().getFullYear()} FK Digital · ALINDA Booking</div>
      </footer>
    </main>
  );
}
