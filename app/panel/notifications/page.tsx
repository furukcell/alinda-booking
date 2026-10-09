"use client";

import { onAuthStateChanged } from "firebase/auth";
import { Bell, CalendarCheck, CalendarX, RefreshCw, Sunrise } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase/client";

type NotificationItem = {
  id: string;
  type: "booking_created" | "booking_cancelled" | "daily_summary";
  title: string;
  message: string;
  referenceNo: string;
  bookingId: string;
  createdAt: string | null;
  details: Record<string, unknown>;
};

function formatDate(value: string | null) {
  if (!value) return "Tarih bilgisi yok";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tarih bilgisi yok";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
  }).format(date);
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [businessName, setBusinessName] = useState("");

  const loadNotifications = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const token = await getFirebaseAuth().currentUser?.getIdToken();
      if (!token) throw new Error("Oturum doğrulanamadı.");
      const response = await fetch("/api/panel/notifications", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Bildirimler yüklenemedi.");
      setNotifications(Array.isArray(result.notifications) ? result.notifications : []);
      setBusinessName(typeof result.businessName === "string" ? result.businessName : "");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Bildirimler yüklenemedi.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    return onAuthStateChanged(getFirebaseAuth(), (user) => {
      if (user) void loadNotifications();
      else setLoading(false);
    });
  }, [loadNotifications]);

  return (
    <main className="min-h-screen bg-alinda-cream">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:py-10">
        <Link href="/panel" className="inline-flex items-center gap-2 text-sm text-alinda-muted hover:text-alinda-ink">← Dashboard</Link>
        <header className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-alinda-ink text-white"><Bell size={20} /></div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Bildirim Merkezi</h1>
              <p className="mt-1 text-sm text-alinda-muted">{businessName ? businessName + " · " : ""}Randevu hareketleri ve günlük iş özetiniz.</p>
            </div>
          </div>
          <button type="button" onClick={() => void loadNotifications(true)} disabled={refreshing || loading} className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-alinda-line bg-white px-4 text-sm font-semibold disabled:opacity-50 sm:self-auto">
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> Yenile
          </button>
        </header>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <SummaryCard icon={CalendarCheck} label="Yeni randevular" count={notifications.filter((item) => item.type === "booking_created").length} />
          <SummaryCard icon={CalendarX} label="İptaller" count={notifications.filter((item) => item.type === "booking_cancelled").length} />
          <SummaryCard icon={Sunrise} label="Günlük özetler" count={notifications.filter((item) => item.type === "daily_summary").length} />
        </div>

        {error && <div role="alert" className="mt-6 rounded-xl border border-[#E8CACA] bg-[#FBEEEE] px-4 py-3 text-sm text-alinda-danger">{error}</div>}

        <section className="mt-6 overflow-hidden rounded-[24px] border border-alinda-line bg-white shadow-card">
          {loading ? (
            <div className="space-y-3 p-6">{[1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-xl bg-alinda-cream" />)}</div>
          ) : notifications.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-alinda-cream text-alinda-muted"><Bell size={24} /></div>
              <h2 className="mt-4 font-semibold">Henüz bildirim yok</h2>
              <p className="mt-1 text-sm text-alinda-muted">Yeni randevular, iptaller ve WhatsApp günlük özetleri burada görünecek.</p>
            </div>
          ) : (
            <div className="divide-y divide-alinda-line">
              {notifications.map((item) => {
                const Icon = item.type === "booking_created" ? CalendarCheck : item.type === "booking_cancelled" ? CalendarX : Sunrise;
                const iconClass = item.type === "booking_created" ? "bg-[#EAF6EE] text-[#4E8762]" : item.type === "booking_cancelled" ? "bg-[#FBEEEE] text-[#B96A70]" : "bg-alinda-accent-soft text-alinda-accent";
                const details = item.details || {};
                return (
                  <article key={item.id} className="flex gap-3 p-4 sm:gap-4 sm:p-6">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}><Icon size={19} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <h2 className="font-semibold">{item.title}</h2>
                        <time className="shrink-0 text-xs text-alinda-muted">{formatDate(item.createdAt)}</time>
                      </div>
                      {item.type === "daily_summary" ? (
                        <pre className="mt-3 whitespace-pre-wrap break-words rounded-xl bg-alinda-cream/70 p-4 font-sans text-sm leading-6 text-alinda-ink">{item.message}</pre>
                      ) : (
                        <>
                          <p className="mt-1 text-sm leading-6 text-alinda-muted">{item.message}</p>
                          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-alinda-muted">
                            {typeof details.date === "string" && <span>📅 {details.date}</span>}
                            {typeof details.time === "string" && <span>🕒 {details.time}</span>}
                            {typeof details.serviceName === "string" && <span>✂️ {details.serviceName}</span>}
                            {typeof details.specialistName === "string" && <span>👤 {details.specialistName}</span>}
                            {typeof details.totalPrice === "number" && <span>₺{details.totalPrice.toLocaleString("tr-TR")}</span>}
                            {typeof details.cancelledBy === "string" && <span>İptal eden: {details.cancelledBy === "owner" ? "İşletme" : "Müşteri"}</span>}
                          </div>
                        </>
                      )}
                      {item.referenceNo && <p className="mt-3 font-mono text-xs font-semibold tracking-wider text-alinda-accent">REFERANS: {item.referenceNo}</p>}
                      {item.type !== "daily_summary" && <Link href="/panel/appointments" className="mt-3 inline-flex text-xs font-semibold text-alinda-accent hover:underline">Randevulara git →</Link>}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
        <p className="mt-3 text-xs leading-5 text-alinda-muted">Son 100 bildirim gösterilir. Sabah özeti, WhatsApp gönderimi başarıyla tamamlandığında burada da kayıt altına alınır.</p>
      </div>
    </main>
  );
}

function SummaryCard({ icon: Icon, label, count }: { icon: typeof Bell; label: string; count: number }) {
  return <div className="rounded-2xl border border-alinda-line bg-white p-4 shadow-card"><div className="flex items-center gap-2 text-alinda-muted"><Icon size={16} /><span className="text-xs">{label}</span></div><p className="mt-2 text-2xl font-semibold tabular-nums">{count}</p></div>;
}
