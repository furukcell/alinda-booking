import Link from "next/link";
import { ArrowUpRight, CalendarDays, Store } from "@lucide/react";
import { businesses } from "@/lib/mock/businesses";

export default function Home() {
  return (
    <main className="min-h-screen bg-alinda-cream">
      <header className="border-b border-alinda-line bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-alinda-ink text-sm font-semibold text-white">A</div>
            <span className="text-sm font-semibold tracking-[0.18em]">ALINDA</span>
          </div>
          <span className="text-xs text-alinda-muted">Demo işletmeler</span>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-alinda-accent">ALINDA Booking</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">Her işletmenin kendi randevu sayfası.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-alinda-muted sm:text-lg">Multi-tenant yapının ilk adımı hazır. Her işletme kendi benzersiz adresinden hizmetlerini sunuyor ve müşterilerini randevu akışına taşıyor.</p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {businesses.map((business) => (
            <Link key={business.id} href={`/${business.slug}`} className="group rounded-[28px] border border-alinda-line bg-white p-6 shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-elevated sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-semibold" style={{ backgroundColor: business.primaryColorSoft, color: business.primaryColor }}>{business.initials}</div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-alinda-line text-alinda-muted transition group-hover:border-alinda-ink group-hover:text-alinda-ink"><ArrowUpRight size={17} /></span>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs text-alinda-muted"><Store size={14} />{business.category}</div>
              <h2 className="mt-2 text-2xl font-semibold">{business.name}</h2>
              <p className="mt-2 text-sm leading-6 text-alinda-muted">{business.description}</p>
              <div className="mt-6 flex items-center gap-2 text-sm font-medium"><CalendarDays size={16} />Randevu sayfasını aç</div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
