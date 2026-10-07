"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, CheckCircle2, ExternalLink, KeyRound, MessageCircle, Scissors, Store, UserRound, Users, XCircle } from "lucide-react";
import { getFirebaseAuth } from "@/lib/firebase/client";

type Detail = {
  business: Record<string, any>;
  owner: { uid: string; email: string; emailVerified: boolean; disabled: boolean; createdAt: string | null; lastSignInAt: string | null } | null;
  counts: { services: number; specialists: number; bookings: number; activeBookings: number; cancelledBookings: number };
  whatsapp: { connected: boolean; phoneNumber: string; phoneNumberId: string; wabaId: string };
  accessEnabled: boolean;
  recentBookings: Array<{ id: string; referenceNo: string; customerName: string; customerPhone: string; serviceName: string; specialistName: string; date: string; time: string; status: string; total: number; createdAt: string | null }>;
};

function money(value: number) {
  return `₺${value.toLocaleString("tr-TR")}`;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [data, setData] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [accessBusy, setAccessBusy] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const user = getFirebaseAuth().currentUser;
        if (!user) {
          window.location.href = "/login";
          return;
        }
        const { id } = await params;
        const token = await user.getIdToken();
        const response = await fetch(`/api/admin/businesses/${encodeURIComponent(id)}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "İşletme detayları alınamadı.");
        setData(result);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "İşletme detayları alınamadı.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [params]);

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-alinda-cream text-sm text-alinda-muted">İşletme detayları hazırlanıyor…</main>;
  if (!data) return <main className="flex min-h-screen items-center justify-center bg-alinda-cream px-4"><div className="rounded-2xl border border-alinda-line bg-white p-6 text-sm text-alinda-danger">{error}</div></main>;

  const b = data.business;
  const plan = b.plan === "pro" ? "PRO" : "STARTER";

  return (
    <main className="min-h-screen bg-alinda-cream text-alinda-ink">
      <div className="mx-auto min-h-screen max-w-[1500px] px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-alinda-muted hover:text-alinda-ink"><ArrowLeft size={17} /> İşletmelere dön</Link>
          <a href={`/${b.slug}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full border border-alinda-line bg-white px-4 text-sm font-semibold"><ExternalLink size={15} /> Randevu sayfası</a>
        </div>

        <header className="mt-7 rounded-[28px] bg-alinda-ink p-6 text-white shadow-card sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div>
              <p className="text-sm font-semibold">İşletme erişimi</p>
              <p className="mt-1 text-xs text-white/50">{data.accessEnabled ? "Panel ve public randevu sayfası açık." : "Panel ve public randevu sayfası kapalı."}</p>
            </div>
            <button
              type="button"
              disabled={accessBusy}
              onClick={async () => {
                const user = getFirebaseAuth().currentUser;
                if (!user) return;
                setAccessBusy(true);
                try {
                  const token = await user.getIdToken();
                  const response = await fetch("/api/admin/businesses", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ businessId: b.id, accessEnabled: !data.accessEnabled }),
                  });
                  if (!response.ok) throw new Error();
                  setData((current) => current ? { ...current, accessEnabled: !current.accessEnabled } : current);
                } finally {
                  setAccessBusy(false);
                }
              }}
              className={`rounded-full px-4 py-2 text-xs font-semibold ${data.accessEnabled ? "bg-white text-alinda-ink" : "bg-[#B96862] text-white"} disabled:opacity-50`}
            >
              {accessBusy ? "İşleniyor…" : data.accessEnabled ? "Erişimi kes" : "Erişimi aç"}
            </button>
          </div>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold">{b.active !== false ? "AKTİF" : "PASİF"}</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold">{plan}</span>
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{b.name}</h1>
              <p className="mt-2 text-sm text-white/60">{b.city || "—"}{b.district ? ` · ${b.district}` : ""} · {b.category || "İşletme"}</p>
            </div>
            <div className="text-sm text-white/60">
              <p>Slug: <span className="text-white">{b.slug}</span></p>
              <p className="mt-1">Oluşturulma: <span className="text-white">{formatDate(b.createdAt)}</span></p>
            </div>
          </div>
        </header>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={CalendarDays} label="Toplam randevu" value={data.counts.bookings} detail={`${data.counts.cancelledBookings} iptal`} />
          <Metric icon={Scissors} label="Hizmet" value={data.counts.services} detail="Tanımlı hizmet" />
          <Metric icon={Users} label="Uzman" value={data.counts.specialists} detail="Tanımlı uzman" />
          <Metric icon={MessageCircle} label="WhatsApp" value={data.whatsapp.connected ? "Bağlı" : "Bağlı değil"} detail={data.whatsapp.phoneNumber || "Entegrasyon yok"} />
        </section>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_380px]">
          <section className="rounded-[24px] border border-alinda-line bg-white shadow-card">
            <div className="border-b border-alinda-line px-5 py-5 sm:px-6">
              <h2 className="font-semibold">Son randevular</h2>
              <p className="mt-1 text-xs text-alinda-muted">İşletmenin son 20 randevusu.</p>
            </div>
            <div className="divide-y divide-alinda-line">
              {data.recentBookings.map((booking) => (
                <div key={booking.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                  <div className="w-24 shrink-0"><p className="text-sm font-semibold">{booking.date}</p><p className="text-xs text-alinda-muted">{booking.time}</p></div>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{booking.customerName || "Müşteri"}</p><p className="truncate text-xs text-alinda-muted">{booking.serviceName} · {booking.specialistName}</p></div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold">{money(booking.total)}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${booking.status === "cancelled" ? "bg-[#F4EAEA] text-[#A55E63]" : "bg-[#EAF6EE] text-[#4E8762]"}`}>
                      {booking.status === "cancelled" ? <XCircle size={12} /> : <CheckCircle2 size={12} />}
                      {booking.status === "cancelled" ? "İptal" : booking.status === "confirmed" ? "Onaylı" : "Bekliyor"}
                    </span>
                  </div>
                </div>
              ))}
              {data.recentBookings.length === 0 ? <div className="px-6 py-12 text-center text-sm text-alinda-muted">Henüz randevu yok.</div> : null}
            </div>
          </section>

          <div className="space-y-5">
            <InfoCard title="Owner hesabı" icon={UserRound}>
              <Info label="E-posta" value={data.owner?.email || "—"} />
              <Info label="Durum" value={data.owner?.disabled ? "Devre dışı" : "Aktif"} />
              <Info label="E-posta doğrulandı" value={data.owner?.emailVerified ? "Evet" : "Hayır"} />
              <Info label="Son giriş" value={formatDate(data.owner?.lastSignInAt || null)} />
              <Info label="Hesap oluşturuldu" value={formatDate(data.owner?.createdAt || null)} />
            </InfoCard>

            <InfoCard title="İşletme bilgileri" icon={Store}>
              <Info label="Telefon" value={b.phone || "—"} />
              <Info label="Adres" value={b.address || "—"} />
              <Info label="Plan" value={plan} />
              <Info label="Aktiflik" value={b.active !== false ? "Aktif" : "Pasif"} />
            </InfoCard>

            <InfoCard title="WhatsApp" icon={MessageCircle}>
              <Info label="Durum" value={data.whatsapp.connected ? "Bağlı" : "Bağlı değil"} />
              <Info label="Telefon" value={data.whatsapp.phoneNumber || "—"} />
              <Info label="WABA ID" value={data.whatsapp.wabaId || "—"} />
            </InfoCard>

            <div className="rounded-[22px] bg-white p-5 shadow-card">
              <div className="flex items-center gap-3"><KeyRound size={18} className="text-alinda-accent" /><div><p className="font-semibold">Hızlı işlemler</p><p className="text-xs text-alinda-muted">Yönetim için kısayollar</p></div></div>
              <Link href="/admin" className="mt-4 flex h-10 items-center justify-center rounded-xl border border-alinda-line text-sm font-semibold">İşletme yönetimine dön</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Metric({ icon: Icon, label, value, detail }: { icon: typeof Store; label: string; value: string | number; detail: string }) {
  return <div className="rounded-[22px] border border-alinda-line bg-white p-5 shadow-card"><div className="flex items-center justify-between"><span className="text-sm text-alinda-muted">{label}</span><Icon size={18} className="text-alinda-muted" /></div><p className="mt-4 text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-alinda-muted">{detail}</p></div>;
}

function InfoCard({ title, icon: Icon, children }: { title: string; icon: typeof Store; children: React.ReactNode }) {
  return <section className="rounded-[22px] border border-alinda-line bg-white p-5 shadow-card"><div className="flex items-center gap-3"><Icon size={18} className="text-alinda-accent" /><h2 className="font-semibold">{title}</h2></div><div className="mt-5 space-y-3">{children}</div></section>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4 border-b border-alinda-line pb-3 last:border-0 last:pb-0"><span className="text-xs text-alinda-muted">{label}</span><span className="max-w-[65%] text-right text-sm font-medium break-words">{value}</span></div>;
}
