"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowRight, CalendarDays, CircleDollarSign, Plus, Store, TrendingUp, Users } from "lucide-react";
import { waitForFirebaseUser } from "@/lib/firebase/auth-ready";

type Stats = {
  businesses: number;
  activeBusinesses: number;
  starterBusinesses: number;
  proBusinesses: number;
  newBusinessesThisMonth: number;
  totalAppointments: number;
  todayAppointments: number;
  cancelledThisMonth: number;
  estimatedMrr: number;
  note: string;
};

function StatCard({ label, value, detail, icon: Icon }: { label: string; value: string | number; detail: string; icon: typeof Store }) {
  return (
    <div className="rounded-[22px] border border-alinda-line bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-sm text-alinda-muted">{label}</span>
        <Icon size={19} className="text-alinda-muted" />
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-alinda-muted">{detail}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const user = await waitForFirebaseUser();
        if (!user) {
          window.location.href = "/login";
          return;
        }
        const token = await user.getIdToken();
        const response = await fetch("/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Dashboard verileri alınamadı.");
        setStats(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Dashboard verileri alınamadı.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-alinda-cream text-sm text-alinda-muted">Dashboard hazırlanıyor…</main>;
  }

  if (!stats) {
    return <main className="flex min-h-screen items-center justify-center bg-alinda-cream px-4"><div className="rounded-2xl border border-alinda-line bg-white p-6 text-sm text-alinda-danger">{error || "Veriler alınamadı."}</div></main>;
  }

  return (
    <main className="min-h-screen bg-alinda-cream text-alinda-ink">
      <div className="mx-auto min-h-screen max-w-[1500px]">
        <header className="border-b border-alinda-line bg-white px-4 py-5 sm:px-6 lg:px-10 lg:py-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-alinda-accent">Sistem yönetimi</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Dashboard</h1>
              <p className="mt-2 text-sm text-alinda-muted">ALINDA'nın işletme, randevu ve tahmini gelir görünümü.</p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin" className="inline-flex h-10 items-center gap-2 rounded-full border border-alinda-line bg-white px-4 text-sm font-semibold">İşletmeler</Link>
              <Link href="/admin?new=1" className="inline-flex h-10 items-center gap-2 rounded-full bg-alinda-ink px-4 text-sm font-semibold text-white"><Plus size={16} /> Yeni işletme</Link>
            </div>
          </div>
        </header>

        <section className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Tahmini MRR" value={`₺${stats.estimatedMrr.toLocaleString("tr-TR")}`} detail="Aktif aylık planlara göre" icon={CircleDollarSign} />
            <StatCard label="Aktif işletme" value={stats.activeBusinesses} detail={`Toplam ${stats.businesses} işletme`} icon={Store} />
            <StatCard label="Bu ay yeni" value={stats.newBusinessesThisMonth} detail="Yeni işletme kayıtları" icon={TrendingUp} />
            <StatCard label="Bugünkü randevu" value={stats.todayAppointments} detail={`Toplam ${stats.totalAppointments} randevu`} icon={CalendarDays} />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <section className="rounded-[24px] border border-alinda-line bg-white p-6 shadow-card">
              <div className="flex items-center gap-3"><Users size={19} className="text-alinda-accent" /><h2 className="font-semibold">Plan dağılımı</h2></div>
              <div className="mt-6 space-y-4">
                <div><div className="flex justify-between text-sm"><span>Starter</span><strong>{stats.starterBusinesses}</strong></div><div className="mt-2 h-2 rounded-full bg-alinda-cream"><div className="h-2 rounded-full bg-alinda-accent" style={{ width: `${stats.businesses ? (stats.starterBusinesses / stats.businesses) * 100 : 0}%` }} /></div></div>
                <div><div className="flex justify-between text-sm"><span>Pro</span><strong>{stats.proBusinesses}</strong></div><div className="mt-2 h-2 rounded-full bg-alinda-cream"><div className="h-2 rounded-full bg-alinda-ink" style={{ width: `${stats.businesses ? (stats.proBusinesses / stats.businesses) * 100 : 0}%` }} /></div></div>
              </div>
            </section>

            <section className="rounded-[24px] border border-alinda-line bg-white p-6 shadow-card">
              <div className="flex items-center gap-3"><Activity size={19} className="text-alinda-accent" /><h2 className="font-semibold">Aktivite</h2></div>
              <div className="mt-6 space-y-4">
                <Row label="Toplam randevu" value={stats.totalAppointments} />
                <Row label="Bugünkü randevu" value={stats.todayAppointments} />
                <Row label="Bu ay iptal" value={stats.cancelledThisMonth} />
                <Row label="Aktif işletme" value={stats.activeBusinesses} />
              </div>
            </section>

            <section className="rounded-[24px] bg-alinda-ink p-6 text-white shadow-card">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">Sonraki adım</p>
              <h2 className="mt-3 text-xl font-semibold">İşletme detaylarını yönetin.</h2>
              <p className="mt-2 text-sm leading-6 text-white/60">Plan, owner, WhatsApp ve abonelik bilgilerini tek işletme ekranında toplamaya geçiyoruz.</p>
              <Link href="/admin" className="mt-6 flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-semibold text-alinda-ink">İşletmelere git <ArrowRight size={16} /></Link>
            </section>
          </div>

          <p className="mt-5 text-xs leading-5 text-alinda-muted">{stats.note}</p>
        </section>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return <div className="flex items-center justify-between border-b border-alinda-line pb-3 text-sm last:border-0 last:pb-0"><span className="text-alinda-muted">{label}</span><strong>{value}</strong></div>;
}
