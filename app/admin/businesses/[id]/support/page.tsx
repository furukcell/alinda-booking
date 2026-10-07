"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, CheckCircle2, ExternalLink, MessageCircle, Scissors, ShieldCheck, Store, Users, XCircle } from "lucide-react";
import { getFirebaseAuth } from "@/lib/firebase/client";

type Detail = {
  business: Record<string, any>;
  owner: { email: string; emailVerified: boolean; disabled: boolean; lastSignInAt: string | null } | null;
  counts: { services: number; specialists: number; bookings: number; activeBookings: number; cancelledBookings: number };
  whatsapp: { connected: boolean; phoneNumber: string };
  recentBookings: Array<{ id: string; customerName: string; serviceName: string; specialistName: string; date: string; time: string; status: string; total: number }>;
  accessEnabled: boolean;
};

export default function SupportView({ params }: { params: Promise<{ id: string }> }) {
  const [data, setData] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    void (async () => {
      try {
        const user = getFirebaseAuth().currentUser;
        if (!user) { window.location.href = "/login"; return; }
        const { id } = await params;
        const token = await user.getIdToken();
        const response = await fetch(`/api/admin/businesses/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Destek görünümü yüklenemedi.");
        setData(result);
      } catch (e) { setError(e instanceof Error ? e.message : "Destek görünümü yüklenemedi."); }
    })();
  }, [params]);

  if (!data) return <main className="flex min-h-screen items-center justify-center bg-alinda-cream text-sm text-alinda-muted">{error || "Destek görünümü hazırlanıyor…"}</main>;

  const b = data.business;
  return (
    <main className="min-h-screen bg-alinda-cream text-alinda-ink">
      <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
        <div className="sticky top-0 z-20 mb-5 rounded-2xl border border-[#E8CACA] bg-[#FBEEEE] px-4 py-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3"><ShieldCheck size={19} className="text-[#A55E63]" /><div><p className="text-sm font-semibold">DESTEK GÖRÜNÜMÜ — {b.name}</p><p className="text-xs text-[#8F686A]">Salt okunur. Bu görünümden işletme verileri değiştirilemez.</p></div></div>
            <Link href={`/admin/businesses/${b.id}`} className="text-sm font-semibold">Yönetim ekranına dön</Link>
          </div>
        </div>

        <header className="rounded-[28px] bg-white p-6 shadow-card sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-alinda-accent">İşletme paneli önizleme</p><h1 className="mt-2 text-3xl font-semibold">{b.name}</h1><p className="mt-2 text-sm text-alinda-muted">{b.city || "—"}{b.district ? ` · ${b.district}` : ""} · {b.category || "İşletme"}</p></div>
            <a href={`/${b.slug}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full border border-alinda-line px-4 text-sm font-semibold"><ExternalLink size={15} /> Public randevu</a>
          </div>
        </header>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={CalendarDays} label="Randevular" value={data.counts.bookings} detail={`${data.counts.activeBookings} aktif`} />
          <Metric icon={Scissors} label="Hizmetler" value={data.counts.services} detail="Tanımlı hizmet" />
          <Metric icon={Users} label="Uzmanlar" value={data.counts.specialists} detail="Tanımlı uzman" />
          <Metric icon={MessageCircle} label="WhatsApp" value={data.whatsapp.connected ? "Bağlı" : "Kapalı"} detail={data.whatsapp.phoneNumber || "Entegrasyon yok"} />
        </section>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_360px]">
          <section className="rounded-[24px] border border-alinda-line bg-white shadow-card">
            <div className="border-b border-alinda-line px-6 py-5"><h2 className="font-semibold">Randevular</h2><p className="mt-1 text-xs text-alinda-muted">Destek amacıyla görüntülenebilir.</p></div>
            <div className="divide-y divide-alinda-line">{data.recentBookings.map((x) => <div key={x.id} className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center"><div className="w-28 shrink-0"><p className="text-sm font-semibold">{x.date}</p><p className="text-xs text-alinda-muted">{x.time}</p></div><div className="flex-1"><p className="text-sm font-medium">{x.customerName}</p><p className="text-xs text-alinda-muted">{x.serviceName} · {x.specialistName}</p></div><span className={`inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${x.status === "cancelled" ? "bg-[#F4EAEA] text-[#A55E63]" : "bg-[#EAF6EE] text-[#4E8762]"}`}>{x.status === "cancelled" ? <XCircle size={12}/> : <CheckCircle2 size={12}/>} {x.status === "cancelled" ? "İptal" : x.status === "confirmed" ? "Onaylı" : "Bekliyor"}</span></div>)}</div>
          </section>

          <aside className="space-y-5">
            <Info title="Hesap" icon={Store}><Row label="Owner" value={data.owner?.email || "—"} /><Row label="Plan" value={b.plan === "pro" ? "Pro" : "Starter"} /><Row label="Erişim" value={data.accessEnabled ? "Açık" : "Kapalı"} /></Info>
            <Info title="WhatsApp" icon={MessageCircle}><Row label="Durum" value={data.whatsapp.connected ? "Bağlı" : "Bağlı değil"} /><Row label="Telefon" value={data.whatsapp.phoneNumber || "—"} /></Info>
            <div className="rounded-[22px] border border-alinda-line bg-white p-5"><p className="text-sm font-semibold">Güvenli destek modu</p><p className="mt-2 text-xs leading-5 text-alinda-muted">Bu ekran sadece bilgi görüntüler. Plan, randevu, hizmet veya işletme ayarı değiştirilemez.</p></div>
          </aside>
        </div>
      </div>
    </main>
  );
}
function Metric({ icon: Icon, label, value, detail }: { icon: typeof Store; label: string; value: string | number; detail: string }) { return <div className="rounded-[22px] border border-alinda-line bg-white p-5 shadow-card"><div className="flex justify-between"><span className="text-sm text-alinda-muted">{label}</span><Icon size={18} className="text-alinda-muted"/></div><p className="mt-4 text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-alinda-muted">{detail}</p></div>; }
function Info({ title, icon: Icon, children }: { title: string; icon: typeof Store; children: React.ReactNode }) { return <section className="rounded-[22px] border border-alinda-line bg-white p-5 shadow-card"><div className="flex items-center gap-3"><Icon size={18} className="text-alinda-accent"/><h2 className="font-semibold">{title}</h2></div><div className="mt-5 space-y-3">{children}</div></section>; }
function Row({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-3 border-b border-alinda-line pb-3 text-sm last:border-0 last:pb-0"><span className="text-xs text-alinda-muted">{label}</span><span className="text-right font-medium">{value}</span></div>; }
