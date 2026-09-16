import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock3, Scissors, Settings2, Store, Users } from "@lucide/react";

const stats = [
  { label: "Bugünkü randevu", value: "8", detail: "+2 dünden", icon: CalendarDays },
  { label: "Bekleyen", value: "3", detail: "Onay bekliyor", icon: Clock3 },
  { label: "Hizmet", value: "12", detail: "Aktif hizmet", icon: Scissors },
  { label: "Müşteri", value: "146", detail: "Toplam müşteri", icon: Users }
];

const appointments = [
  { time: "09:30", customer: "Ayşe Yılmaz", service: "Signature Saç Kesimi", status: "Onaylandı" },
  { time: "10:30", customer: "Merve Kaya", service: "Hydra Cilt Bakımı", status: "Bekliyor" },
  { time: "13:00", customer: "Elif Demir", service: "Manikür", status: "Onaylandı" },
  { time: "14:30", customer: "Seda Arslan", service: "Signature Saç Kesimi", status: "Onaylandı" }
];

const nav = [
  { href: "/panel", label: "Genel Bakış", icon: Store },
  { href: "/panel/appointments", label: "Randevular", icon: CalendarDays },
  { href: "/panel/services", label: "Hizmetler", icon: Scissors },
  { href: "/panel/hours", label: "Çalışma Saatleri", icon: Clock3 },
  { href: "/panel/settings", label: "İşletme Ayarları", icon: Settings2 }
];

export default function PanelPage() {
  return (
    <main className="min-h-screen bg-alinda-cream">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="hidden w-64 shrink-0 border-r border-alinda-line bg-white px-5 py-6 lg:block">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-alinda-ink text-sm font-semibold text-white">A</div>
            <span className="text-sm font-semibold tracking-[0.18em]">ALINDA</span>
          </div>
          <div className="mt-9 rounded-2xl bg-alinda-cream p-4">
            <p className="text-xs text-alinda-muted">İşletme</p>
            <p className="mt-1 font-semibold">Meltem Beauty Studio</p>
            <p className="mt-1 text-xs text-alinda-muted">Bodrum, Muğla</p>
          </div>
          <nav className="mt-7 space-y-1">
            {nav.map((item, index) => {
              const Icon = item.icon;
              return <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${index === 0 ? "bg-alinda-ink text-white" : "text-alinda-muted hover:bg-alinda-cream hover:text-alinda-ink"}`}><Icon size={18} />{item.label}</Link>;
            })}
          </nav>
          <Link href="/meltem-guzellik" className="mt-8 flex items-center justify-between rounded-xl border border-alinda-line px-3 py-3 text-sm font-medium hover:border-alinda-ink"><span>Randevu sayfası</span><ArrowUpRight size={16} /></Link>
        </aside>

        <section className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
          <header className="flex items-center justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-alinda-accent">Genel Bakış</p><h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Günaydın 👋</h1><p className="mt-1 text-sm text-alinda-muted">Bugünkü randevularınıza hızlıca göz atın.</p></div>
            <Link href="/meltem-guzellik" className="hidden items-center gap-2 rounded-xl border border-alinda-line bg-white px-4 py-2.5 text-sm font-medium sm:flex">Sayfayı görüntüle <ArrowUpRight size={16} /></Link>
          </header>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => { const Icon = stat.icon; return <div key={stat.label} className="rounded-2xl border border-alinda-line bg-white p-5 shadow-card"><div className="flex items-center justify-between"><span className="text-sm text-alinda-muted">{stat.label}</span><Icon size={18} className="text-alinda-muted" /></div><p className="mt-4 text-3xl font-semibold tracking-tight">{stat.value}</p><p className="mt-1 text-xs text-alinda-muted">{stat.detail}</p></div>; })}
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_320px]">
            <section className="rounded-[24px] border border-alinda-line bg-white shadow-card">
              <div className="flex items-center justify-between border-b border-alinda-line px-5 py-5 sm:px-6"><div><h2 className="font-semibold">Bugünkü randevular</h2><p className="mt-1 text-xs text-alinda-muted">17 Eylül · 8 randevu</p></div><Link href="/panel/appointments" className="text-sm font-semibold">Tümünü gör</Link></div>
              <div className="divide-y divide-alinda-line">
                {appointments.map((item) => <div key={`${item.time}-${item.customer}`} className="flex items-center gap-4 px-5 py-4 sm:px-6"><div className="w-12 shrink-0 text-sm font-semibold">{item.time}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{item.customer}</p><p className="mt-1 truncate text-xs text-alinda-muted">{item.service}</p></div><span className={`hidden rounded-full px-2.5 py-1 text-xs font-medium sm:inline-flex ${item.status === "Bekliyor" ? "bg-alinda-accent-soft text-alinda-accent" : "bg-[#E8F0EB] text-alinda-success"}`}>{item.status}</span></div>)}
              </div>
            </section>

            <aside className="rounded-[24px] border border-alinda-line bg-alinda-ink p-6 text-white shadow-card">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">Hızlı işlem</p>
              <h2 className="mt-3 text-xl font-semibold">İşletmenizi güncel tutun.</h2>
              <p className="mt-2 text-sm leading-6 text-white/60">Hizmetlerinizi, çalışma saatlerinizi ve randevu sayfanızı tek yerden yönetin.</p>
              <div className="mt-6 space-y-2">
                <Link href="/panel/services" className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-semibold text-alinda-ink">Hizmet ekle <ArrowUpRight size={16} /></Link>
                <Link href="/panel/hours" className="flex items-center justify-between rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white">Çalışma saatleri <ArrowUpRight size={16} /></Link>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
