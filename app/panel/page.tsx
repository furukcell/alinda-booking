"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarDays, Check, Clock3, Copy, ExternalLink, Menu, Scissors, Settings2, Store, Users, X } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";


type BusinessInfo = {
  id: string;
  name: string;
  slug: string;
  city: string;
  district: string;
  initials: string;
  logoUrl?: string;
};

type DashboardBooking = {
  id: string;
  date: string;
  time: string;
  customerName: string;
  serviceName: string;
  specialistName: string;
  status: "pending" | "confirmed" | "cancelled";
  serviceDurationMinutes: number;
  servicePrice: number;
  totalPrice: number;
};

const nav = [
  { href: "/panel", label: "Genel Bakış", icon: Store },
  { href: "/panel/appointments", label: "Randevular", icon: CalendarDays },
  { href: "/panel/services", label: "Hizmetler", icon: Scissors },
  { href: "/panel/specialists", label: "Uzmanlar", icon: Users },
  { href: "/panel/hours", label: "Çalışma Saatleri", icon: Clock3 },
  { href: "/panel/settings", label: "İşletme Ayarları", icon: Settings2 }
];

export default function PanelPage() {
  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [serviceCount, setServiceCount] = useState(0);
  const [specialistCount, setSpecialistCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [todaySummary, setTodaySummary] = useState({ total: 0, pending: 0, confirmed: 0, estimatedRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function loadDashboard(uid: string) {
    setLoading(true);
    setError("");

    try {
      const auth = getFirebaseAuth();
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Oturum doğrulanamadı.");

      const response = await fetch("/api/panel/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "İşletme paneli verileri yüklenemedi.");

      setBusiness(result.business);
      setBookings(Array.isArray(result.bookings) ? result.bookings : []);
      setServiceCount(typeof result.serviceCount === "number" ? result.serviceCount : 0);
      setSpecialistCount(typeof result.specialistCount === "number" ? result.specialistCount : 0);
      setCustomerCount(typeof result.customerCount === "number" ? result.customerCount : 0);
      setTodaySummary({
        total: Number(result.todaySummary?.total || 0),
        pending: Number(result.todaySummary?.pending || 0),
        confirmed: Number(result.todaySummary?.confirmed || 0),
        estimatedRevenue: Number(result.todaySummary?.estimatedRevenue || 0),
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "İşletme paneli verileri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    return onAuthStateChanged(getFirebaseAuth(), (user) => {
      if (!user) {
        setLoading(false);
        return;
      }
      void loadDashboard(user.uid);
    });
  }, []);

  const pendingCount = useMemo(() => bookings.filter((item) => item.status === "pending").length, [bookings]);
  const bookingUrl = business ? (typeof window !== "undefined" ? window.location.origin + "/" + business.slug : "/" + business.slug) : "";
  const setupSteps = business ? [
    { label: "En az bir hizmet ekleyin", done: serviceCount > 0, href: "/panel/services" },
    { label: "En az bir uzman ekleyin", done: specialistCount > 0, href: "/panel/specialists" },
    { label: "Randevu sayfanızı kontrol edin", done: true, href: "/" + business.slug },
  ] : [];
  const setupDone = setupSteps.filter((item) => item.done).length;
  const nextBooking = bookings[0];

  async function copyBookingLink() {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-alinda-cream text-sm text-alinda-muted">İşletme paneli hazırlanıyor…</main>;
  }

  if (!business) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-alinda-cream px-4">
        <section className="max-w-md rounded-[28px] border border-alinda-line bg-white p-8 text-center shadow-card">
          <Store className="mx-auto text-alinda-accent" size={34} />
          <h1 className="mt-5 text-2xl font-semibold">İşletme bulunamadı</h1>
          <p className="mt-2 text-sm leading-6 text-alinda-muted">{error || "Bu kullanıcıya bağlı bir işletme hesabı bulunamadı."}</p>
          <div className="mt-6 flex justify-center gap-2">
            <Link href="/" className="inline-flex h-11 items-center rounded-full border border-alinda-line px-5 text-sm font-semibold">Ana sayfa</Link>
            <LogoutButton />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-alinda-cream">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="hidden w-64 shrink-0 border-r border-alinda-line bg-white px-5 py-6 lg:block">
          <div className="flex items-center gap-3 px-2">
            {business.logoUrl ? (
              <img src={business.logoUrl} alt={business.name} className="h-9 w-9 rounded-xl object-contain" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-alinda-accent-soft text-sm font-semibold text-alinda-accent">{business.initials}</div>
            )}
            <div>
              <p className="text-sm font-semibold">{business.name}</p>
              <p className="text-[10px] text-alinda-muted">İşletme paneli</p>
            </div>
          </div>

          <div className="mt-9 rounded-2xl bg-alinda-cream p-4">
            <p className="text-xs text-alinda-muted">İşletme</p>
            <p className="mt-1 font-semibold">{business.name}</p>
            <p className="mt-1 text-xs text-alinda-muted">{business.district}{business.district && business.city ? ", " : ""}{business.city}</p>
          </div>

          <nav className="mt-7 space-y-1">
            {nav.map((item, index) => {
              const Icon = item.icon;
              return <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${index === 0 ? "bg-alinda-ink text-white" : "text-alinda-muted hover:bg-alinda-cream hover:text-alinda-ink"}`}><Icon size={18} />{item.label}</Link>;
            })}
          </nav>

          <Link href={`/${business.slug}`} className="mt-8 flex items-center justify-between rounded-xl border border-alinda-line px-3 py-3 text-sm font-medium hover:border-alinda-ink">
            <span>Randevu sayfası</span><ArrowUpRight size={16} />
          </Link>
          <div className="mt-3"><LogoutButton /></div>
        </aside>

        <section className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
          <div className="mb-5 flex items-center justify-between lg:hidden">
            <div className="flex min-w-0 items-center gap-3">
              {business.logoUrl ? (
                <img src={business.logoUrl} alt={business.name} className="h-10 w-10 rounded-xl object-contain" />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-alinda-accent-soft text-sm font-semibold text-alinda-accent">{business.initials}</div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{business.name}</p>
                <p className="text-[10px] text-alinda-muted">İşletme paneli</p>
              </div>
            </div>
            <button
              type="button"
              aria-label={mobileMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((value) => !value)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-alinda-line bg-white text-alinda-ink shadow-sm"
            >
              {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="mb-5 rounded-2xl border border-alinda-line bg-white p-3 shadow-card lg:hidden">
              <div className="mb-3 rounded-xl bg-alinda-cream px-3 py-2.5">
                <p className="text-xs text-alinda-muted">İşletme</p>
                <p className="mt-0.5 text-sm font-semibold">{business.name}</p>
              </div>
              <nav className="space-y-1">
                {nav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${item.href === "/panel" ? "bg-alinda-ink text-white" : "text-alinda-muted hover:bg-alinda-cream hover:text-alinda-ink"}`}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <Link
                href={`/${business.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="mt-3 flex items-center justify-between rounded-xl border border-alinda-line px-3 py-3 text-sm font-medium"
              >
                <span>Randevu sayfası</span>
                <ArrowUpRight size={16} />
              </Link>
              <div className="mt-2">
                <LogoutButton />
              </div>
            </div>
          )}

          <header className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-alinda-accent">Genel Bakış</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Günaydın 👋</h1>
              <p className="mt-1 text-sm text-alinda-muted">{business.name} işletmenizin bugünkü durumuna hızlıca göz atın.</p>
            </div>
            <div className="flex items-center gap-2">
              <LogoutButton />
              <Link href={`/${business.slug}`} className="hidden items-center gap-2 rounded-xl border border-alinda-line bg-white px-4 py-2.5 text-sm font-medium sm:flex">Sayfayı görüntüle <ArrowUpRight size={16} /></Link>
            </div>
          </header>

          {error && <div role="alert" className="mt-6 rounded-xl border border-[#E8CACA] bg-[#FBEEEE] px-4 py-3 text-sm text-alinda-danger">{error}</div>}

          <section className="mt-6 rounded-[24px] border border-alinda-line bg-white p-5 shadow-card sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-alinda-accent">Randevu sayfanız</p>
                  <span className="rounded-full bg-[#E8F0EB] px-2 py-1 text-[10px] font-bold text-alinda-success">Aktif</span>
                </div>
                <p className="mt-2 truncate text-sm font-semibold">{bookingUrl}</p>
                <p className="mt-1 text-xs text-alinda-muted">Bu bağlantıyı Instagram, WhatsApp veya Google işletme profilinizde paylaşabilirsiniz.</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <button type="button" onClick={() => void copyBookingLink()} className="inline-flex h-11 items-center gap-2 rounded-xl border border-alinda-line bg-white px-4 text-sm font-semibold hover:border-alinda-ink">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Kopyalandı" : "Linki kopyala"}
                </button>
                <Link href={"/" + business.slug} target="_blank" className="inline-flex h-11 items-center gap-2 rounded-xl bg-alinda-ink px-4 text-sm font-semibold text-white hover:opacity-90">
                  <ExternalLink size={16} /> Sayfayı aç
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-[24px] border border-alinda-line bg-white p-5 shadow-card sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-alinda-accent">Kuruluma hazır mısınız?</p>
                <h2 className="mt-1 text-lg font-semibold">İlk randevuyu almaya hazırlayın.</h2>
                <p className="mt-1 text-xs text-alinda-muted">{setupDone} / {setupSteps.length} adım tamamlandı</p>
              </div>
              <div className="h-2 w-full max-w-48 overflow-hidden rounded-full bg-alinda-line">
                <div className="h-full rounded-full bg-alinda-accent transition-all" style={{ width: ((setupDone / setupSteps.length) * 100) + "%" }} />
              </div>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {setupSteps.map((step) => (
                <Link key={step.label} href={step.href} className="flex items-center gap-3 rounded-2xl border border-alinda-line px-4 py-3 transition hover:border-alinda-accent hover:bg-alinda-cream">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${step.done ? "bg-[#E8F0EB] text-alinda-success" : "bg-alinda-accent-soft text-alinda-accent"}`}>
                    {step.done ? <Check size={15} /> : <span className="text-xs font-bold">!</span>}
                  </span>
                  <span className="text-xs font-semibold">{step.label}</span>
                  <ArrowUpRight size={14} className="ml-auto shrink-0 text-alinda-muted" />
                </Link>
              ))}
            </div>
          </section>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardStat label="Bugünkü randevu" value={todaySummary.total} detail="İptal edilmeyen randevular" icon={CalendarDays} />
            <DashboardStat label="Bekleyen" value={todaySummary.pending} detail="Onay bekliyor" icon={Clock3} />
            <DashboardStat label="Onaylanan" value={todaySummary.confirmed} detail="Bugün kesinleşen" icon={Check} />
            <DashboardStat label="Tahmini ciro" value={todaySummary.estimatedRevenue} detail="Onaylanan randevular" icon={Scissors} currency />
          </div>

          <section className="mt-5 rounded-[24px] border border-alinda-line bg-white p-5 shadow-card sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-alinda-accent-soft text-alinda-accent">
                  <Clock3 size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-alinda-accent">Sıradaki randevu</p>
                  {nextBooking ? (
                    <>
                      <p className="mt-1 truncate text-base font-semibold">{nextBooking.time} · {nextBooking.customerName}</p>
                      <p className="mt-1 truncate text-xs text-alinda-muted">{nextBooking.serviceName} · {nextBooking.specialistName || "Uzman seçilmedi"}</p>
                    </>
                  ) : (
                    <p className="mt-1 text-sm font-semibold">Bugün için sırada randevu yok.</p>
                  )}
                </div>
              </div>
              <Link href="/panel/appointments" className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-alinda-line px-4 text-sm font-semibold hover:border-alinda-ink">
                Randevuları aç
              </Link>
            </div>
          </section>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_320px]">
            <section className="rounded-[24px] border border-alinda-line bg-white shadow-card">
              <div className="flex items-center justify-between border-b border-alinda-line px-5 py-5 sm:px-6">
                <div>
                  <h2 className="font-semibold">Bugünkü randevular</h2>
                  <p className="mt-1 text-xs text-alinda-muted">{bookings.length} randevu</p>
                </div>
                <Link href="/panel/appointments" className="text-sm font-semibold">Tümünü gör</Link>
              </div>
              <div className="divide-y divide-alinda-line">
                {bookings.slice(0, 6).map((item) => (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-4 sm:px-6">
                    <div className="w-12 shrink-0 text-sm font-semibold">{item.time}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.customerName}</p>
                      <p className="mt-1 truncate text-xs text-alinda-muted">{item.serviceName}</p>
                    </div>
                    <span className={`hidden rounded-full px-2.5 py-1 text-xs font-medium sm:inline-flex ${item.status === "pending" ? "bg-alinda-accent-soft text-alinda-accent" : "bg-[#E8F0EB] text-alinda-success"}`}>
                      {item.status === "pending" ? "Bekliyor" : "Onaylandı"}
                    </span>
                  </div>
                ))}
                {bookings.length === 0 && <div className="px-6 py-12 text-center text-sm text-alinda-muted">Bugün için randevu bulunmuyor.</div>}
              </div>
            </section>

            <aside className="rounded-[24px] border border-alinda-line bg-alinda-ink p-6 text-white shadow-card">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">Hızlı işlem</p>
              <h2 className="mt-3 text-xl font-semibold">İşletmenizi güncel tutun.</h2>
              <p className="mt-2 text-sm leading-6 text-white/60">Hizmetlerinizi, çalışma saatlerinizi ve randevu sayfanızı tek yerden yönetin.</p>
              <div className="mt-6 space-y-2">
                <Link href="/panel/services" className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-semibold text-alinda-ink">Hizmet ekle <ArrowUpRight size={16} /></Link>
                <Link href="/panel/specialists" className="flex items-center justify-between rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white">Uzmanları yönet <ArrowUpRight size={16} /></Link>
                <Link href="/panel/hours" className="flex items-center justify-between rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white">Çalışma saatleri <ArrowUpRight size={16} /></Link>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

function DashboardStat({ label, value, detail, icon: Icon, currency = false }: { label: string; value: number; detail: string; icon: typeof CalendarDays; currency?: boolean }) {
  const displayValue = currency ? "₺" + new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value) : value;
  return <div className="rounded-2xl border border-alinda-line bg-white p-5 shadow-card"><div className="flex items-center justify-between"><span className="text-sm text-alinda-muted">{label}</span><Icon size={18} className="text-alinda-muted" /></div><p className="mt-4 text-3xl font-semibold tracking-tight">{displayValue}</p><p className="mt-1 text-xs text-alinda-muted">{detail}</p></div>;
}