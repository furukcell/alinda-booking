"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock3, Scissors, Settings2, Store, Users } from "lucide-react";
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
  status: "pending" | "confirmed" | "cancelled";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardStat label="Bugünkü randevu" value={bookings.length} detail="İptal edilmeyen randevular" icon={CalendarDays} />
            <DashboardStat label="Bekleyen" value={pendingCount} detail="Onay bekliyor" icon={Clock3} />
            <DashboardStat label="Hizmet" value={serviceCount} detail="Tanımlı hizmet" icon={Scissors} />
            <DashboardStat label="Müşteri" value={customerCount} detail="Kayıtlı randevulardaki müşteriler" icon={Users} />
          </div>

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

function DashboardStat({ label, value, detail, icon: Icon }: { label: string; value: number; detail: string; icon: typeof CalendarDays }) {
  return <div className="rounded-2xl border border-alinda-line bg-white p-5 shadow-card"><div className="flex items-center justify-between"><span className="text-sm text-alinda-muted">{label}</span><Icon size={18} className="text-alinda-muted" /></div><p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-xs text-alinda-muted">{detail}</p></div>;
}