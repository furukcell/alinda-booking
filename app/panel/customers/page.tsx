"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Check, Loader2, Phone, Search, UserRound, X } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase/client";

type Customer = {
  id: string;
  name: string;
  phone: string;
  bookingCount: number;
  confirmedCount: number;
  cancelledCount: number;
  totalSpent: number;
  lastBookingDate: string;
  lastBookingTime: string;
  lastServiceName: string;
};

type CustomerDetail = Customer & {
  bookings: Array<{
    id: string;
    referenceNo: string;
    date: string;
    time: string;
    serviceName: string;
    specialistName: string;
    servicePrice: number;
    totalPrice: number;
    status: string;
  }>;
};

function formatPhone(phone: string) {
  if (/^0\d{10}$/.test(phone)) return phone.replace(/^(0\d)(\d{3})(\d{3})(\d{2})(\d{2})$/, "$1 $2 $3 $4 $5");
  return phone;
}

function formatDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value || "—";
  const [year, month, day] = value.split("-");
  return day + "." + month + "." + year;
}

function money(value: number) {
  return "₺" + new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value);
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<CustomerDetail | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadCustomers() {
    const user = getFirebaseAuth().currentUser;
    if (!user) return;
    const token = await user.getIdToken();
    const response = await fetch("/api/panel/customers", {
      headers: { Authorization: "Bearer " + token },
      cache: "no-store"
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Müşteriler alınamadı.");
    setCustomers(Array.isArray(result.customers) ? result.customers : []);
  }

  async function openCustomer(customer: Customer) {
    setDetailLoading(true);
    setError("");
    try {
      const user = getFirebaseAuth().currentUser;
      if (!user) throw new Error("Oturum bulunamadı.");
      const token = await user.getIdToken();
      const response = await fetch("/api/panel/customers?phone=" + encodeURIComponent(customer.phone), {
        headers: { Authorization: "Bearer " + token },
        cache: "no-store"
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.customer) throw new Error(result.error || "Müşteri detayı alınamadı.");
      setSelected(result.customer);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : "Müşteri detayı alınamadı.");
    } finally {
      setDetailLoading(false);
    }
  }

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (user) => {
        if (!user) return;
        try {
          await loadCustomers();
        } catch (loadError) {
          setError(loadError instanceof Error ? loadError.message : "Müşteriler yüklenemedi.");
        } finally {
          setLoading(false);
        }
      });
    } catch {
      setError("Firebase yapılandırılmamış.");
      setLoading(false);
    }
    return () => unsubscribe();
  }, []);

  const filtered = useMemo(() => {
    const value = search.trim().toLocaleLowerCase("tr-TR");
    if (!value) return customers;
    return customers.filter((customer) =>
      (customer.name + " " + customer.phone).toLocaleLowerCase("tr-TR").includes(value)
    );
  }, [customers, search]);

  return (
    <main className="min-h-screen bg-alinda-cream">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
        <Link href="/panel" className="inline-flex items-center gap-2 text-sm text-alinda-muted hover:text-alinda-ink">
          <ArrowLeft size={16} /> Dashboard
        </Link>

        <header className="mt-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-alinda-ink text-white"><UserRound size={19} /></div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Müşteriler</h1>
            <p className="mt-1 text-sm text-alinda-muted">Randevu geçmişini ve müşteri değerini tek yerden takip edin.</p>
          </div>
        </header>

        {error && <div role="alert" className="mt-6 rounded-xl border border-[#E8CACA] bg-[#FBEEEE] px-4 py-3 text-sm text-alinda-danger">{error}</div>}

        <section className="mt-6 rounded-[24px] border border-alinda-line bg-white p-4 shadow-card">
          <div className="relative">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-alinda-muted" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Müşteri adı veya telefon ara…" className="h-12 w-full rounded-xl border border-alinda-line bg-white pl-10 pr-4 text-sm outline-none focus:border-alinda-accent" />
          </div>
          <p className="mt-3 text-xs text-alinda-muted">{filtered.length} müşteri gösteriliyor · Toplam {customers.length}</p>
        </section>

        <section className="mt-5 overflow-hidden rounded-[24px] border border-alinda-line bg-white shadow-card">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-12 text-sm text-alinda-muted"><Loader2 size={17} className="animate-spin" /> Müşteriler yükleniyor…</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <UserRound className="mx-auto text-alinda-accent" size={32} />
              <p className="mt-4 font-semibold">{customers.length === 0 ? "Henüz müşteri yok" : "Müşteri bulunamadı"}</p>
              <p className="mt-1 text-sm text-alinda-muted">{customers.length === 0 ? "İlk randevudan sonra müşterileriniz burada görünecek." : "Arama kelimesini değiştirip tekrar deneyin."}</p>
            </div>
          ) : (
            <div className="divide-y divide-alinda-line">
              {filtered.map((customer) => (
                <button key={customer.id} type="button" onClick={() => void openCustomer(customer)} className="grid w-full gap-4 px-5 py-5 text-left transition hover:bg-alinda-cream/50 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-center sm:px-6">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{customer.name}</p>
                    <p className="mt-1 text-xs text-alinda-muted">{formatPhone(customer.phone)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-alinda-muted">Randevu</p>
                    <p className="mt-1 text-sm font-semibold">{customer.bookingCount} <span className="font-normal text-alinda-muted">({customer.confirmedCount} onaylı)</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-alinda-muted">Toplam harcama</p>
                    <p className="mt-1 text-sm font-semibold">{money(customer.totalSpent)}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-xs text-alinda-muted">Son randevu</p>
                    <p className="mt-1 text-sm font-semibold">{formatDate(customer.lastBookingDate)} · {customer.lastBookingTime || "—"}</p>
                    <p className="mt-1 text-xs text-alinda-muted">{customer.lastServiceName || "—"}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" role="dialog" aria-modal="true" aria-label="Müşteri detayları" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-alinda-accent">Müşteri</p>
                <h2 className="mt-1 text-2xl font-semibold">{selected.name}</h2>
                <p className="mt-1 text-sm text-alinda-muted">{formatPhone(selected.phone)}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-alinda-line" aria-label="Müşteri detayını kapat"><X size={18} /></button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-alinda-cream p-4"><p className="text-xs text-alinda-muted">Aktif randevu</p><p className="mt-2 text-2xl font-semibold">{selected.bookingCount}</p></div>
              <div className="rounded-2xl bg-alinda-cream p-4"><p className="text-xs text-alinda-muted">Onaylanan</p><p className="mt-2 text-2xl font-semibold">{selected.confirmedCount}</p></div>
              <div className="rounded-2xl bg-alinda-cream p-4"><p className="text-xs text-alinda-muted">Toplam harcama</p><p className="mt-2 text-2xl font-semibold">{money(selected.totalSpent)}</p></div>
            </div>

            <div className="mt-6 flex gap-2">
              <a href={"tel:" + selected.phone} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-alinda-line text-sm font-semibold"><Phone size={16} /> Ara</a>
              <a href={"https://wa.me/9" + selected.phone.replace(/^0/, "")} target="_blank" rel="noreferrer" className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] text-sm font-semibold text-white"><Phone size={16} /> WhatsApp</a>
            </div>

            <div className="mt-7">
              <h3 className="text-sm font-semibold">Randevu geçmişi</h3>
              <div className="mt-3 divide-y divide-alinda-line rounded-2xl border border-alinda-line">
                {selected.bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center gap-4 px-4 py-4">
                    <CalendarDays size={18} className="shrink-0 text-alinda-muted" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{formatDate(booking.date)} · {booking.time}</p>
                      <p className="mt-1 truncate text-xs text-alinda-muted">{booking.serviceName} · {booking.specialistName || "Uzman seçilmedi"}</p>
                      <p className="mt-1 font-mono text-[11px] text-alinda-accent">{booking.referenceNo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{money(booking.totalPrice)}</p>
                      <p className="mt-1 text-xs text-alinda-muted">{booking.status === "confirmed" ? "Onaylandı" : booking.status === "pending" ? "Bekliyor" : "İptal"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {detailLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20" aria-live="polite">
          <div className="rounded-2xl bg-white px-5 py-4 text-sm font-medium shadow-xl"><Loader2 size={17} className="mr-2 inline animate-spin" /> Müşteri detayı açılıyor…</div>
        </div>
      )}
    </main>
  );
}
