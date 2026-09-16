import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CalendarDays, Clock3, Scissors, Settings2, Store } from "@lucide/react";

const content = {
  appointments: {
    title: "Randevular",
    description: "İşletmenizin yaklaşan ve geçmiş randevularını yönetin.",
    icon: CalendarDays,
    rows: ["09:30 · Ayşe Yılmaz · Signature Saç Kesimi", "10:30 · Merve Kaya · Hydra Cilt Bakımı", "13:00 · Elif Demir · Manikür"]
  },
  services: {
    title: "Hizmetler",
    description: "Sunduğunuz hizmetleri, sürelerini ve fiyatlarını yönetin.",
    icon: Scissors,
    rows: ["Signature Saç Kesimi · 45 dk · ₺600", "Hydra Cilt Bakımı · 60 dk · ₺900", "Manikür · 35 dk · ₺450"]
  },
  hours: {
    title: "Çalışma Saatleri",
    description: "Müşterilerinizin randevu alabileceği çalışma aralıklarını belirleyin.",
    icon: Clock3,
    rows: ["Pazartesi · 09:00 — 18:00", "Salı · 09:00 — 18:00", "Çarşamba · 09:00 — 18:00", "Perşembe · 09:00 — 18:00", "Cuma · 09:00 — 18:00"]
  },
  settings: {
    title: "İşletme Ayarları",
    description: "İşletme bilgilerinizin ve randevu sayfanızın temel ayarları.",
    icon: Settings2,
    rows: ["İşletme adı · Meltem Beauty Studio", "Konum · Bodrum, Muğla", "Telefon · 0555 000 00 01", "Randevu adresi · /meltem-guzellik"]
  }
} as const;

export default async function PanelSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const data = content[section as keyof typeof content];
  if (!data) return <main className="min-h-screen bg-alinda-cream p-8"><h1 className="text-2xl font-semibold">Sayfa bulunamadı</h1></main>;
  const Icon = data.icon;

  return (
    <main className="min-h-screen bg-alinda-cream">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-10">
        <Link href="/panel" className="inline-flex items-center gap-2 text-sm text-alinda-muted hover:text-alinda-ink"><ArrowLeft size={16} /> Dashboard</Link>
        <header className="mt-8 flex items-start justify-between gap-4">
          <div><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-alinda-ink text-white"><Icon size={19} /></div><h1 className="text-3xl font-semibold tracking-tight">{data.title}</h1></div><p className="mt-3 text-sm text-alinda-muted">{data.description}</p></div>
          <button className="hidden rounded-xl bg-alinda-ink px-4 py-2.5 text-sm font-semibold text-white sm:block">Yeni ekle</button>
        </header>
        <section className="mt-8 overflow-hidden rounded-[24px] border border-alinda-line bg-white shadow-card">
          {data.rows.map((row, index) => <div key={row} className={`flex items-center justify-between gap-4 px-5 py-4 sm:px-6 ${index ? "border-t border-alinda-line" : ""}`}><span className="text-sm">{row}</span><ArrowUpRight size={16} className="shrink-0 text-alinda-muted" /></div>)}
        </section>
        <div className="mt-5 flex flex-wrap gap-2 text-sm">
          <Link href="/meltem-guzellik" className="inline-flex items-center gap-2 rounded-xl border border-alinda-line bg-white px-4 py-2.5 font-medium">Public sayfa <Store size={16} /></Link>
        </div>
      </div>
    </main>
  );
}
