import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  Check,
  Clock3,
  LayoutDashboard,
  Mail,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  UserRound,
} from "lucide-react";

const benefits = [
  {
    icon: CalendarCheck2,
    title: "Telefon trafiğini azaltın",
    text: "Müşterileriniz uygun gün ve saati kendileri seçsin. Siz sürekli telefonla randevu ayarlamak zorunda kalmayın.",
  },
  {
    icon: LayoutDashboard,
    title: "Her şeyi tek panelden yönetin",
    text: "Hizmetlerinizi, fiyatlarınızı, çalışma saatlerinizi, uzmanlarınızı ve gelen randevuları tek yerden kontrol edin.",
  },
  {
    icon: Clock3,
    title: "Boş saatler otomatik gösterilsin",
    text: "Mesai saatleriniz ve alınmış randevular dikkate alınır. Müşteriye yalnızca uygun zamanlar sunulur.",
  },
  {
    icon: Smartphone,
    title: "Müşteriniz için çok kolay",
    text: "Uygulama indirmeye gerek yok. İşletmenize özel bağlantıyı Instagram, WhatsApp veya Google üzerinden paylaşmanız yeterli.",
  },
  {
    icon: UserRound,
    title: "Uzman bazlı randevu",
    text: "Birden fazla çalışanınız varsa müşteriniz hizmeti seçtikten sonra istediği uzmanı seçebilir.",
  },
  {
    icon: ShieldCheck,
    title: "İşletmenize özel sistem",
    text: "Kendi işletme bilgileriniz, hizmetleriniz, çalışma düzeniniz ve randevu sayfanız size özel çalışır.",
  },
];

const planFeatures = [
  "İşletmenize özel online randevu sayfası",
  "Hizmet ve fiyat yönetimi",
  "Çalışma saatleri yönetimi",
  "Uzman / personel yönetimi",
  "Uzmanlara özel çalışma saatleri",
  "Randevu takvimi ve dolu saat kontrolü",
  "Müşteri adı ve telefon bilgileri",
  "Mobil uyumlu randevu deneyimi",
  "WhatsApp randevu bildirim altyapısı",
  "İşletme yönetim paneli",
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-alinda-cream text-alinda-ink">
      <header className="sticky top-0 z-30 border-b border-alinda-line/80 bg-alinda-cream/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="ALINDA ana sayfa">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-alinda-accent text-sm font-semibold text-white">A</span>
            <span className="text-sm font-semibold tracking-[0.2em]">ALINDA</span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-3" aria-label="Ana navigasyon">
            <a href="#neden-alinda" className="hidden rounded-full px-3 py-2 text-sm font-medium text-alinda-muted transition hover:text-alinda-ink sm:inline-flex">Neden ALINDA?</a>
            <a href="#fiyatlar" className="hidden rounded-full px-3 py-2 text-sm font-medium text-alinda-muted transition hover:text-alinda-ink sm:inline-flex">Fiyatlar</a>
            <a href="#iletisim" className="hidden rounded-full px-3 py-2 text-sm font-medium text-alinda-muted transition hover:text-alinda-ink sm:inline-flex">İletişim</a>
            <Link href="/login" className="inline-flex h-10 items-center rounded-full bg-alinda-ink px-4 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-alinda-ink-soft">İşletme girişi</Link>
          </nav>
        </div>
      </header>

      <section className="relative">
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-alinda-accent-soft/60 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-20 text-center sm:px-6 sm:pb-28 sm:pt-28 lg:px-8">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-alinda-line bg-white/75 px-4 py-2 text-xs font-semibold text-alinda-muted shadow-card">
            <span className="h-2 w-2 rounded-full bg-alinda-accent" />
            ALINDA Booking · FK Digital
          </div>
          <h1 className="mx-auto mt-7 max-w-4xl text-4xl font-semibold tracking-[-0.045em] sm:text-6xl sm:leading-[1.04] lg:text-[72px]">
            Randevu yönetimini<br />
            <span className="text-alinda-accent">işletmeniz için kolaylaştırıyoruz.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-alinda-muted sm:text-lg sm:leading-8">
            ALINDA Booking; güzellik salonu, kuaför, berber, bakım merkezi ve randevu ile çalışan işletmeler için geliştirilmiş online randevu ve işletme yönetim sistemidir.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="#fiyatlar" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-alinda-accent px-6 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(216,137,130,0.2)] transition hover:-translate-y-0.5 hover:opacity-90">
              Paketleri incele <ArrowRight size={17} />
            </a>
            <a href="#neden-alinda" className="inline-flex h-12 items-center justify-center rounded-full border border-alinda-line bg-white px-6 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-alinda-accent">
              Neleri çözüyoruz?
            </a>
          </div>

          <div className="mx-auto mt-14 grid max-w-4xl gap-3 sm:grid-cols-3">
            {[
              ["24/7", "Online randevu erişimi"],
              ["Tek panel", "İşletme yönetimi"],
              ["Mobil", "Müşteri deneyimi"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-[22px] border border-alinda-line bg-white/80 px-5 py-5 shadow-card">
                <p className="text-2xl font-semibold tracking-tight text-alinda-accent">{value}</p>
                <p className="mt-1 text-xs text-alinda-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="neden-alinda" className="scroll-mt-20 border-y border-alinda-line bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-alinda-accent">Neyi çözüyoruz?</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Randevu almak kolay olmalı. Yönetmek de öyle.</h2>
            <p className="mt-5 text-base leading-7 text-alinda-muted sm:text-lg">
              Bir işletme büyüdükçe telefon, WhatsApp mesajları, kağıt ajandalar ve farklı uygulamalar arasında randevu takibi zorlaşır. ALINDA'nın amacı tam olarak bu karmaşayı ortadan kaldırmak.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <article key={benefit.title} className="rounded-[26px] border border-alinda-line bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-elevated">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-alinda-accent-soft text-alinda-accent">
                    <Icon size={21} />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-alinda-muted">{benefit.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#F5ECE9]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-alinda-accent">Neden biz?</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Karmaşık bir yazılım değil, işletmenizin günlük yardımcısı.</h2>
            <p className="mt-5 text-base leading-7 text-alinda-muted">
              Size onlarca gereksiz özellik sunup sistemi zorlaştırmak yerine, randevu alan bir işletmenin gerçekten ihtiyaç duyduğu temel süreçlere odaklanıyoruz.
            </p>
          </div>
          <div className="rounded-[30px] border border-white bg-white p-6 shadow-card sm:p-8">
            <div className="space-y-5">
              {[
                ["Kolay kurulum", "İşletme bilgilerinizi, hizmetlerinizi ve çalışma saatlerinizi tanımlayın."],
                ["Kolay paylaşım", "Size özel randevu bağlantınızı Instagram, WhatsApp ve diğer kanallarda paylaşın."],
                ["Daha az telefon trafiği", "Müşteriler uygun zamanı kendileri seçsin, siz işinize odaklanın."],
                ["Daha düzenli işletme", "Randevular, uzmanlar ve çalışma saatleri tek bir sistemde toplansın."],
              ].map(([title, text]) => (
                <div key={title} className="flex gap-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EAF6EE] text-[#4E8762]">
                    <Check size={15} strokeWidth={2.5} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="mt-1 text-sm leading-5 text-alinda-muted">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="fiyatlar" className="scroll-mt-20 border-y border-alinda-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-alinda-accent">Abonelikler</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">İşletmeniz için ihtiyacınız olan her şey.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-alinda-muted">
              Aylık veya yıllık planı seçin. Her iki planda da ALINDA Booking'in tüm temel işletme özellikleri bulunur.
            </p>
          </div>

          <div className="mt-12 grid items-start gap-5 lg:grid-cols-2">
            {[
              { name: "Aylık", price: "₺499", suffix: "/ ay", badge: "" },
              { name: "Yıllık", price: "₺4.999", suffix: "/ yıl", badge: "2 ay ücretsiz avantajı" },
            ].map((plan) => (
              <div key={plan.name} className={`relative rounded-[30px] border p-7 shadow-card sm:p-9 ${plan.name === "Yıllık" ? "border-alinda-accent bg-[#FFF8F6] shadow-[0_18px_55px_rgba(216,137,130,0.13)]" : "border-alinda-line bg-alinda-cream"}`}>
                {plan.badge && (
                  <span className="absolute right-6 top-6 rounded-full bg-[#EAF6EE] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#4E8762]">
                    {plan.badge}
                  </span>
                )}
                <p className="text-sm font-semibold text-alinda-muted">{plan.name}</p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-5xl font-semibold tracking-[-0.04em]">{plan.price}</span>
                  <span className="pb-1 text-sm text-alinda-muted">{plan.suffix}</span>
                </div>
                <p className="mt-3 text-sm text-alinda-muted">Tüm temel ALINDA Booking özellikleri dahil.</p>

                <div className="mt-7 border-t border-alinda-line pt-6">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-alinda-muted">Pakete dahil</p>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {planFeatures.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm leading-5">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EAF6EE] text-[#4E8762]">
                          <Check size={12} strokeWidth={3} />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a href="https://wa.me/905421523805" target="_blank" rel="noreferrer" className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-alinda-accent px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-90">
                  WhatsApp'tan bilgi al <MessageCircle size={17} />
                </a>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-alinda-muted">Kurulum ve abonelik hakkında detaylı bilgi için WhatsApp üzerinden bize ulaşabilirsiniz.</p>
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
          <div>
            <p className="font-semibold tracking-[0.18em] text-alinda-ink">ALINDA Booking</p>
            <p className="mt-2 max-w-sm text-xs leading-5 text-alinda-muted">FK Digital tarafından geliştirilmiştir. İşletmeler için sade ve modern online randevu yönetimi.</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-alinda-ink">Hızlı bağlantılar</p>
            <div className="mt-3 flex flex-col gap-2 text-xs text-alinda-muted">
              <a href="#neden-alinda" className="transition hover:text-alinda-ink">Neden ALINDA?</a>
              <a href="#fiyatlar" className="transition hover:text-alinda-ink">Fiyatlar & Abonelikler</a>
              <a href="#iletisim" className="transition hover:text-alinda-ink">İletişim</a>
              <Link href="/login" className="transition hover:text-alinda-ink">İşletme girişi</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-alinda-ink">Bize ulaşın</p>
            <div className="mt-3 flex flex-col gap-2 text-xs text-alinda-muted">
              <a href="https://wa.me/905421523805" target="_blank" rel="noreferrer" className="transition hover:text-alinda-ink">WhatsApp · 0542 152 38 05</a>
              <a href="mailto:destek.fkdigital@gmail.com" className="break-all transition hover:text-alinda-ink">destek.fkdigital@gmail.com</a>
            </div>
          </div>
        </div>
        <div className="border-t border-alinda-line px-4 py-4 text-center text-[11px] text-alinda-muted">© {new Date().getFullYear()} FK Digital · ALINDA Booking</div>
      </footer>
    </main>
  );
}
