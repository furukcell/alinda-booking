"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, CalendarDays, CircleDollarSign, Clock3, RefreshCw, TrendingUp } from "lucide-react";
import { getFirebaseAuth } from "@/lib/firebase/client";

type Data = {
  businesses: number; total: number; completed: number; pending: number; cancelled: number;
  revenue: number; cancellationRate: number;
  topBusinesses: Array<{ name: string; appointments: number; cancelled: number; revenue: number }>;
  topServices: Array<{ name: string; count: number }>;
  peakHours: Array<{ hour: string; count: number }>;
  peakWeekdays: Array<{ day: string; count: number }>;
  recommendations: string[];
  generatedAt: string;
};

function money(value: number) { return `₺${value.toLocaleString("tr-TR")}`; }

function Card({ label, value, detail, icon: Icon }: { label: string; value: string | number; detail: string; icon: typeof Bot }) {
  return <div className="rounded-[22px] border border-alinda-line bg-white p-5 shadow-card">
    <div className="flex items-center justify-between"><span className="text-sm text-alinda-muted">{label}</span><Icon size={18} className="text-alinda-accent" /></div>
    <p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p>
    <p className="mt-1 text-xs text-alinda-muted">{detail}</p>
  </div>;
}

export default function AdminAiPage() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      const user = getFirebaseAuth().currentUser;
      if (!user) { window.location.href = "/login"; return; }
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/ai-insights", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "İstatistikler alınamadı.");
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "İstatistikler alınamadı.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { void load(); }, []);

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-alinda-cream text-sm text-alinda-muted">AI Sekreter hazırlanıyor…</main>;
  if (!data) return <main className="flex min-h-screen items-center justify-center bg-alinda-cream px-4"><div className="rounded-2xl border border-alinda-line bg-white p-6 text-sm text-alinda-danger">{error}</div></main>;

  return <main className="min-h-screen bg-alinda-cream text-alinda-ink">
    <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-alinda-muted hover:text-alinda-ink"><ArrowLeft size={16}/> İşletmelere dön</Link>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-alinda-accent">Akıllı analiz</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">AI Sekreter</h1>
          <p className="mt-2 text-sm text-alinda-muted">Randevu verilerinden otomatik içgörü, yoğunluk ve satış fırsatları çıkar.</p>
        </div>
        <button onClick={() => { setRefreshing(true); void load(); }} disabled={refreshing} className="inline-flex h-10 items-center gap-2 rounded-full border border-alinda-line bg-white px-4 text-sm font-semibold disabled:opacity-50"><RefreshCw size={15}/> Yenile</button>
      </header>

      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card label="Toplam randevu" value={data.total} detail={`${data.completed} tamamlandı · ${data.pending} bekliyor`} icon={CalendarDays}/>
        <Card label="Randevu geliri" value={money(data.revenue)} detail="Onaylı/tamamlanan randevular" icon={CircleDollarSign}/>
        <Card label="İptal oranı" value={`%${data.cancellationRate}`} detail={`${data.cancelled} iptal randevu`} icon={TrendingUp}/>
        <Card label="En yoğun saat" value={data.peakHours[0]?.hour || "—"} detail={`${data.peakHours[0]?.count || 0} randevu`} icon={Clock3}/>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="🤖 Sekreterin önerileri">
          <div className="space-y-3">{data.recommendations.map((item, index) => <div key={index} className="rounded-2xl bg-alinda-cream p-4 text-sm leading-6">{item}</div>)}</div>
        </Panel>
        <Panel title="🏆 En aktif işletmeler">
          <div className="space-y-3">{data.topBusinesses.map((item) => <div key={item.name} className="flex items-center justify-between gap-4 border-b border-alinda-line pb-3 last:border-0"><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.name}</p><p className="text-xs text-alinda-muted">{item.cancelled} iptal</p></div><div className="text-right"><p className="text-sm font-semibold">{item.appointments} randevu</p><p className="text-xs text-alinda-muted">{money(item.revenue)}</p></div></div>)}</div>
        </Panel>
        <Panel title="💇 En çok tercih edilen hizmetler">
          <div className="space-y-3">{data.topServices.map((item, index) => <div key={item.name} className="flex items-center justify-between"><span className="text-sm">{index + 1}. {item.name}</span><strong className="text-sm">{item.count}</strong></div>)}</div>
        </Panel>
        <Panel title="⏰ Yoğunluk analizi">
          <div className="space-y-3">{data.peakHours.map((item) => <div key={item.hour} className="flex items-center gap-3"><span className="w-12 text-sm font-semibold">{item.hour}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-alinda-cream"><div className="h-full rounded-full bg-alinda-accent" style={{ width: `${Math.min(100, Math.max(8, (item.count / Math.max(1, data.peakHours[0]?.count || 1)) * 100))}%` }}/></div><span className="w-10 text-right text-xs text-alinda-muted">{item.count}</span></div>)}</div>
        </Panel>
      </section>

      <p className="mt-5 text-xs text-alinda-muted">Son hesaplama: {new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(data.generatedAt))}</p>
    </div>
  </main>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-[24px] border border-alinda-line bg-white p-6 shadow-card"><h2 className="font-semibold">{title}</h2><div className="mt-5">{children}</div></section>;
}
