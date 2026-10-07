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

function dateOnly(value: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function addPeriod(start: string, cycle: "monthly" | "annual") {
  const [year, month, day] = start.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (cycle === "annual") date.setUTCFullYear(date.getUTCFullYear() + 1);
  else date.setUTCMonth(date.getUTCMonth() + 1);
  return date.toISOString().slice(0, 10);
}

export default function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [data, setData] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [accessBusy, setAccessBusy] = useState(false);
  const [subscriptionBusy, setSubscriptionBusy] = useState(false);
  const [subscription, setSubscription] = useState({
    plan: "starter" as "starter" | "pro",
    billingCycle: "monthly" as "monthly" | "annual",
    subscriptionStatus: "active" as "active" | "trialing" | "past_due" | "cancelled" | "expired",
    paymentStatus: "pending" as "paid" | "pending" | "failed" | "comped",
    startDate: "",
    endDate: "",
    trialEndDate: "",
  });

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
        const b = result.business || {};
        setSubscription({
          plan: b.plan === "pro" ? "pro" : "starter",
          billingCycle: b.billingCycle === "annual" ? "annual" : "monthly",
          subscriptionStatus: ["active", "trialing", "past_due", "cancelled", "expired"].includes(b.subscriptionStatus) ? b.subscriptionStatus : "active",
          paymentStatus: ["paid", "pending", "failed", "comped"].includes(b.paymentStatus) ? b.paymentStatus : "pending",
          startDate: dateOnly(b.subscriptionStartDate),
          endDate: dateOnly(b.subscriptionEndDate),
          trialEndDate: dateOnly(b.trialEndDate),
        });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "İşletme detayları alınamadı.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [params]);

  async function updateSubscription(startNow = false) {
    if (!data) return;
    setSubscriptionBusy(true);
    setError("");
    setSuccess("");

    try {
      const user = getFirebaseAuth().currentUser;
      if (!user) throw new Error("Oturum bulunamadı.");
      const token = await user.getIdToken();

      const startDate = subscription.startDate || new Date().toISOString().slice(0, 10);
      const endDate = startNow
        ? addPeriod(startDate, subscription.billingCycle)
        : subscription.endDate || null;

      const payload = {
        businessId: data.business.id,
        plan: subscription.plan,
        billingCycle: subscription.billingCycle,
        subscriptionStatus: startNow ? "active" : subscription.subscriptionStatus,
        paymentStatus: startNow ? "paid" : subscription.paymentStatus,
        subscriptionStartDate: startDate,
        ...(endDate ? { subscriptionEndDate: endDate } : {}),
        ...(subscription.trialEndDate ? { trialEndDate: subscription.trialEndDate } : {}),
        ...(startNow ? { accessEnabled: true, active: true } : {}),
      };

      const response = await fetch("/api/admin/businesses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Abonelik güncellenemedi.");

      setSubscription((current) => ({
        ...current,
        startDate,
        endDate: endDate || current.endDate,
        subscriptionStatus: startNow ? "active" : current.subscriptionStatus,
        paymentStatus: startNow ? "paid" : current.paymentStatus,
      }));
      setData((current) => current ? {
        ...current,
        business: {
          ...current.business,
          ...payload,
          subscriptionEndDate: endDate,
        },
        accessEnabled: startNow ? true : current.accessEnabled,
      } : current);
      setSuccess(startNow
        ? `${subscription.billingCycle === "annual" ? "Yıllık" : "Aylık"} abonelik başlatıldı. Erişim açıldı ve ödeme "ödendi" olarak kaydedildi.`
        : "Abonelik bilgileri güncellendi.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Abonelik güncellenemedi.");
    } finally {
      setSubscriptionBusy(false);
    }
  }

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-alinda-cream text-sm text-alinda-muted">İşletme detayları hazırlanıyor…</main>;
  if (!data) return <main className="flex min-h-screen items-center justify-center bg-alinda-cream px-4"><div className="rounded-2xl border border-alinda-line bg-white p-6 text-sm text-alinda-danger">{error}</div></main>;

  const b = data.business;
  const plan = b.plan === "pro" ? "PRO" : "STARTER";

  return (
    <main className="min-h-screen bg-alinda-cream text-alinda-ink">
      <div className="mx-auto min-h-screen max-w-[1500px] px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-alinda-muted hover:text-alinda-ink"><ArrowLeft size={17} /> İşletmelere dön</Link>
          <Link href={`/admin/businesses/${b.id}/support`} className="inline-flex h-10 items-center gap-2 rounded-full border border-alinda-line bg-white px-4 text-sm font-semibold"><UserRound size={15} /> Destek görünümü</Link>
          <a href={`/${b.slug}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full border border-alinda-line bg-white px-4 text-sm font-semibold"><ExternalLink size={15} /> Randevu sayfası</a>
        </div>

        {success ? <div className="mt-5 rounded-2xl border border-[#CBE8D4] bg-[#EAF6EE] px-4 py-3 text-sm text-[#4E8762]">{success}</div> : null}
        {error ? <div className="mt-5 rounded-2xl border border-[#E8CACA] bg-[#FBEEEE] px-4 py-3 text-sm text-alinda-danger">{error}</div> : null}

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
                setError("");
                setSuccess("");
                try {
                  const token = await user.getIdToken();
                  const response = await fetch("/api/admin/businesses", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ businessId: b.id, accessEnabled: !data.accessEnabled }),
                  });
                  const result = await response.json().catch(() => ({}));
                  if (!response.ok) throw new Error(result.error || "Erişim güncellenemedi.");
                  setData((current) => current ? { ...current, accessEnabled: !current.accessEnabled } : current);
                  setSuccess(!data.accessEnabled ? "İşletme erişimi açıldı." : "İşletme erişimi kesildi. Panel ve randevu sayfası kapandı.");
                } catch (accessError) {
                  setError(accessError instanceof Error ? accessError.message : "Erişim güncellenemedi.");
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

        <section className="mt-5 rounded-[24px] border border-alinda-line bg-white p-5 shadow-card sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-alinda-accent">8. Adım · Manuel abonelik</p>
              <h2 className="mt-2 text-xl font-semibold">Aboneliği yönet</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-alinda-muted">Ödemeyi IBAN üzerinden sen aldıktan sonra planı seç, aboneliği başlat. Süre dolduğunda otomatik ödeme alınmaz; erişimi sen kesersin.</p>
            </div>
            <div className={`rounded-full px-3 py-1.5 text-xs font-semibold ${data.accessEnabled ? "bg-[#EAF6EE] text-[#4E8762]" : "bg-[#F4EAEA] text-[#A55E63]"}`}>
              {data.accessEnabled ? "Erişim açık" : "Erişim kapalı"}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SelectField label="Plan" value={subscription.plan} onChange={(value) => setSubscription({ ...subscription, plan: value as "starter" | "pro" })} options={[["starter", "Starter · ₺499/ay"], ["pro", "Pro · ₺750/ay"]]} />
            <SelectField label="Faturalama" value={subscription.billingCycle} onChange={(value) => setSubscription({ ...subscription, billingCycle: value as "monthly" | "annual" })} options={[["monthly", "Aylık"], ["annual", "Yıllık · ₺4.999"]]} />
            <SelectField label="Ödeme durumu" value={subscription.paymentStatus} onChange={(value) => setSubscription({ ...subscription, paymentStatus: value as typeof subscription.paymentStatus })} options={[["paid", "Ödendi"], ["pending", "Bekliyor"], ["failed", "Başarısız"], ["comped", "Ücretsiz / manuel"]]} />
            <SelectField label="Abonelik durumu" value={subscription.subscriptionStatus} onChange={(value) => setSubscription({ ...subscription, subscriptionStatus: value as typeof subscription.subscriptionStatus })} options={[["active", "Aktif"], ["trialing", "Deneme"], ["past_due", "Gecikmiş"], ["cancelled", "İptal"], ["expired", "Süresi doldu"]]} />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <DateField label="Başlangıç tarihi" value={subscription.startDate} onChange={(value) => setSubscription({ ...subscription, startDate: value })} />
            <DateField label="Bitiş tarihi" value={subscription.endDate} onChange={(value) => setSubscription({ ...subscription, endDate: value })} />
            <DateField label="Deneme bitişi (opsiyonel)" value={subscription.trialEndDate} onChange={(value) => setSubscription({ ...subscription, trialEndDate: value })} />
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-alinda-cream p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs leading-5 text-alinda-muted">
              <strong className="text-alinda-ink">Aboneliği başlat</strong> butonu başlangıç tarihinden itibaren seçilen aylık/yıllık dönemi hesaplar, ödemeyi "ödendi" yapar ve işletme erişimini açar.
            </div>
            <button type="button" onClick={() => void updateSubscription(true)} disabled={subscriptionBusy} className="h-11 shrink-0 rounded-full bg-alinda-ink px-5 text-sm font-semibold text-white disabled:opacity-50">
              {subscriptionBusy ? "Başlatılıyor…" : "Aboneliği başlat"}
            </button>
          </div>

          <div className="mt-3 flex justify-end">
            <button type="button" onClick={() => void updateSubscription(false)} disabled={subscriptionBusy} className="h-10 rounded-xl border border-alinda-line px-4 text-xs font-semibold disabled:opacity-50">
              {subscriptionBusy ? "Kaydediliyor…" : "Sadece bilgileri kaydet"}
            </button>
          </div>
        </section>

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

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<[string, string]> }) {
  return <label className="block"><span className="mb-2 block text-xs font-semibold text-alinda-muted">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-xl border border-alinda-line bg-white px-3 text-sm outline-none focus:border-alinda-accent">{options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}</select></label>;
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block text-xs font-semibold text-alinda-muted">{label}</span><input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-xl border border-alinda-line bg-white px-3 text-sm outline-none focus:border-alinda-accent" /></label>;
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
