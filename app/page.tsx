import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck2,
  CalendarDays,
  Check,
  Clock3,
  LayoutDashboard,
  Scissors,
  ShieldCheck,
  Store,
  UserRound,
} from "@lucide/react";
import { businesses } from "@/lib/mock/businesses";

const features = [
  {
    icon: CalendarCheck2,
    title: "Online randevu",
    text: "Müşteriler hizmet seçer, uygun zamanı belirler ve randevu talebini gönderir.",
  },
  {
    icon: LayoutDashboard,
    title: "İşletme paneli",
    text: "Hizmetleri, çalışma saatlerini ve gelen randevuları tek bir panelden yönet.",
  },
  {
    icon: ShieldCheck,
    title: "İşletmeye özel",
    text: "Her işletme kendi adresine ve kendi hizmet yapısına sahip ayrı bir deneyim sunar.",
  },
];

const steps = [
  ["01", "İşletmeni oluştur", "İşletme bilgilerini ve hizmetlerini tanımla."],
  ["02", "Randevu sayfanı paylaş", "Sana özel bağlantıyı müşterilerinle paylaş."],
  ["03", "Randevuları yönet", "Gelen talepleri panelden takip et ve işletmeni düzenle."],
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-alinda-cream">
      <header className="sticky top-0 z-20 border-b border-alinda-line/80 bg-alinda-cream/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="ALINDA ana sayfa">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-alinda-ink text-sm font-semibold text-white">A</span>
            <span className="text-sm font-semibold tracking-[0.2em]">ALINDA</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4" aria-label="Ana navigasyon">
            <a href="#demolar" className="hidden px-3 py-2 text-sm font-medium text-alinda-muted transition hover:text-alinda-ink sm:inline-flex">Demolar</a>
            <Link href="/login" className="inline-flex h-10 items-center rounded-full bg-alinda-ink px-4 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-alinda-ink-soft">İşletme girişi</Link>
          </nav>
        </div>
      </header>

      <section className="relative">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-24 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:px-8 lg:pt-28">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-alinda-line bg-white/70 px-3 py-1.5 text-xs font-semibold text-alinda-muted shadow-card">
              <span className="h-1.5 w-1.5 rounded-full bg-alinda-accent" />
              ALINDA Booking
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-alinda-ink sm:text-6xl sm:leading-[1.04] lg:text-[68px]">
              Randevuları işletmen için daha kolay yönet.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-alinda-muted sm:text-lg sm:leading-8">
              İşletmene özel randevu sayfası oluştur, hizmetlerini ve çalışma saatlerini yönet, müşterilerinden gelen randevuları tek yerde takip et.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#demolar" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-alinda-ink px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-alinda-ink-soft">
                Demoyu incele <ArrowRight size={17} />
              </a>
              <Link href="/login" className="inline-flex h-12 items-center justify-center rounded-full border border-alinda-line bg-white px-6 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-alinda-ink">
                İşletme paneline giriş
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs text-alinda-muted">
              <span className="inline-flex items-center gap-2"><Check size={15} /> Mobil uyumlu</span>
              <span className="inline-flex items-center gap-2"><Check size={15} /> İşletmeye özel sayfa</span>
              <span className="inline-flex items-center gap-2"><Check size={15} /> Firebase altyapısı</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -inset-10 rounded-full bg-alinda-accent-soft/70 blur-3xl" aria-hidden="true" />
            <div className="relative rounded-[32px] border border-alinda-line bg-white p-4 shadow-elevated sm:p-5">
              <div className="rounded-[24px] border border-alinda-line bg-alinda-cream p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3E4E0] text-sm font-semibold text-[#B86F61]">MB</div>
                    <div>
                      <p className="text-sm font-semibold">Meltem Beauty Studio</p>
                      <p className="mt-0.5 text-xs text-alinda-muted">Bodrum · Güzellik</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-alinda-muted">Randevu</span>
                </div>

                <div className="mt-5 rounded-2xl border border-alinda-line bg-white p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-alinda-muted"><Scissors size={14} /> Hizmet</div>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">Signature Saç Kesimi</p>
                      <p className="mt-1 text-xs text-alinda-muted">45 dakika</p>
                    </div>
                    <span className="text-sm font-semibold">₺600</span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-alinda-line bg-white p-4">
                    <CalendarDays size={17} className="text-alinda-accent" />
                    <p className="mt-3 text-xs text-alinda-muted">Tarih</p>
                    <p className="mt-1 text-sm font-semibold">18 Eylül</p>
                  </div>
                  <div className="rounded-2xl border border-alinda-line bg-white p-4">
                    <Clock3 size={17} className="text-alinda-accent" />
                    <p className="mt-3 text-xs text-alinda-muted">Saat</p>
                    <p className="mt-1 text-sm font-semibold">14:30</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-2xl bg-alinda-ink px-4 py-3.5 text-white">
                  <span className="text-sm font-medium">Randevu talebi</span>
                  <ArrowUpRight size={17} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-alinda-line bg-white/55">
        <div className="mx-auto grid max-w-6xl gap-px bg-alinda-line md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="bg-white px-6 py-8 sm:px-8 sm:py-10">
                <Icon size={22} className="text-alinda-accent" />
                <h2 className="mt-5 text-lg font-semibold">{feature.title}</h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-alinda-muted">{feature.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="demolar" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-alinda-accent">Canlı demo deneyimi</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">İşletmenin müşteriye görünen yüzü.</h2>
            <p className="mt-4 text-base leading-7 text-alinda-muted">Aşağıdaki örnek işletmelerden birini aç ve müşterinin randevu oluştururken yaşayacağı akışı incele.</p>
          </div>
          <span className="text-sm text-alinda-muted">/{"{işletme-slug}"}</span>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {businesses.map((business) => (
            <Link key={business.id} href={`/${business.slug}`} className="group rounded-[28px] border border-alinda-line bg-white p-6 shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-elevated sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-semibold" style={{ backgroundColor: business.primaryColorSoft, color: business.primaryColor }}>{business.initials}</div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-alinda-line text-alinda-muted transition group-hover:border-alinda-ink group-hover:text-alinda-ink"><ArrowUpRight size={17} /></span>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs text-alinda-muted"><Store size={14} />{business.category}</div>
              <h3 className="mt-2 text-2xl font-semibold">{business.name}</h3>
              <p className="mt-2 text-sm leading-6 text-alinda-muted">{business.description}</p>
              <div className="mt-6 flex items-center gap-2 text-sm font-medium">Randevu sayfasını aç <ArrowRight size={16} className="transition group-hover:translate-x-1" /></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-alinda-ink text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Basit akış</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Kur, paylaş, yönet.</h2>
          </div>
          <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-6">
            {steps.map(([number, title, text]) => (
              <div key={number} className="border-t border-white/15 pt-5">
                <span className="text-xs font-semibold tracking-[0.16em] text-white/45">{number}</span>
                <h3 className="mt-6 text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/55">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="rounded-[32px] border border-alinda-line bg-white px-6 py-10 text-center shadow-card sm:px-10 sm:py-14">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-alinda-accent-soft text-alinda-accent"><UserRound size={22} /></div>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight">İşletme panelini keşfet.</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-alinda-muted">Hizmetlerini ve çalışma saatlerini düzenle, gelen randevuları panelden takip et.</p>
          <Link href="/login" className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-alinda-ink px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-alinda-ink-soft">İşletme girişi <ArrowRight size={17} /></Link>
        </div>
      </section>

      <footer className="border-t border-alinda-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-7 text-xs text-alinda-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span className="font-semibold tracking-[0.18em] text-alinda-ink">ALINDA</span>
          <span>Randevu yönetimini sadeleştir.</span>
        </div>
      </footer>
    </main>
  );
}
