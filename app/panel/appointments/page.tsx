"use client";

import { collection, doc, getDocs, orderBy, query, where, writeBatch } from "firebase/firestore";
import { ArrowLeft, CalendarDays, Check, Loader2, Search, X, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";
import { getOwnedBusinessId } from "@/lib/businesses/owner";
import type { Booking } from "@/types/booking";

function minutes(value: string) { const [hours, mins] = value.split(":").map(Number); return hours * 60 + mins; }
function timeFromMinutes(value: number) { return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`; }
function getSlotId(date: string, time: string, specialistId: string) { return `${date}_${time}_${specialistId}`.replace(/[^a-zA-Z0-9_-]/g, "-"); }
function getSlotTimes(booking: Booking) { const duration = Math.max(30, Math.ceil((booking.serviceDurationMinutes || 30) / 30) * 30); const start = minutes(booking.time); return Array.from({ length: duration / 30 }, (_, index) => timeFromMinutes(start + index * 30)); }

export default function AppointmentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [referenceSearch, setReferenceSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Booking["status"]>("all");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  async function loadBookings() {
    const user = getFirebaseAuth().currentUser; if (!user) return;
    const token = await user.getIdToken();
    const response = await fetch("/api/panel/resources?type=bookings", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Randevular alınamadı.");
    setBookings((result.items || []).sort((a: any, b: any) => String(a.date || "").localeCompare(String(b.date || ""))) as Booking[]);
  }

  async function searchByReference() {
    const value = referenceSearch.trim().toUpperCase(); if (!value) return;
    setSearching(true); setError(""); setSuccess("");
    try {
      const user = getFirebaseAuth().currentUser; if (!user) throw new Error("AUTH");
      const businessId = await getOwnedBusinessId(user.uid); if (!businessId) throw new Error("NO_BUSINESS");
      const ref = collection(getFirebaseDb(), "businesses", businessId, "bookings");
      const snapshot = await getDocs(query(ref, where("referenceNo", "==", value)));
      setBookings(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Booking)));
      if (snapshot.empty) setError(`“${value}” referans numaralı randevu bulunamadı.`);
    } catch { setError("Referans numarasıyla arama yapılamadı."); } finally { setSearching(false); }
  }

  async function clearReferenceSearch() {
    setReferenceSearch(""); setError(""); setSuccess(""); setLoading(true);
    try { await loadBookings(); } catch { setError("Randevular yüklenemedi."); } finally { setLoading(false); }
  }

  const filteredBookings = useMemo(() => {
    const customer = customerSearch.trim().toLocaleLowerCase("tr-TR");
    return bookings.filter((booking) => {
      if (dateFilter && booking.date !== dateFilter) return false;
      if (statusFilter !== "all" && booking.status !== statusFilter) return false;
      if (customer && !(booking.customerName + " " + booking.customerPhone).toLocaleLowerCase("tr-TR").includes(customer)) return false;
      return true;
    });
  }, [bookings, customerSearch, dateFilter, statusFilter]);

  async function sendStatusWhatsApp(bookingId: string, status: "confirmed" | "cancelled") {
    try {
      const user = getFirebaseAuth().currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      await fetch("/api/whatsapp/booking-status", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookingId, status })
      });
    } catch {
      // WhatsApp is best-effort; appointment status must remain successful.
    }
  }

  async function updateStatus(booking: Booking, status: "confirmed" | "cancelled") {
    if (updatingId) return;
    const action = status === "confirmed" ? "onaylamak" : "iptal etmek";
    if (!window.confirm(`${booking.referenceNo} referanslı randevuyu ${action} istediğinize emin misiniz?`)) return;
    setUpdatingId(booking.id); setError(""); setSuccess("");
    try {
      const user = getFirebaseAuth().currentUser; if (!user) throw new Error("AUTH");
      const businessId = await getOwnedBusinessId(user.uid); if (!businessId) throw new Error("NO_BUSINESS");
      const db = getFirebaseDb(); const batch = writeBatch(db);
      batch.update(doc(db, "businesses", businessId, "bookings", booking.id), { status });
      for (const time of getSlotTimes(booking)) {
        const slotRef = doc(db, "businesses", businessId, "slots", getSlotId(booking.date, time, booking.specialistId));
        if (status === "cancelled") batch.delete(slotRef); else batch.update(slotRef, { status: "confirmed" });
      }
      await batch.commit();
      void sendStatusWhatsApp(booking.id, status);
      setBookings((current) => current.map((item) => item.id === booking.id ? { ...item, status } : item));
      setSuccess(status === "confirmed" ? "Randevu onaylandı." : "Randevu iptal edildi ve saatleri yeniden açıldı.");
    } catch { setError(status === "confirmed" ? "Randevu onaylanamadı. Randevu saatleri değişmiş olabilir." : "Randevu iptal edilemedi. Lütfen tekrar deneyin."); }
    finally { setUpdatingId(""); }
  }

  useEffect(() => {
    let unsubscribe = () => {};
    try { unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (user) => { if (!user) return; try { await loadBookings(); } catch { setError("Randevular yüklenemedi. Firestore kurallarını ve bağlantıyı kontrol edin."); } finally { setLoading(false); } }); }
    catch { setError("Firebase yapılandırılmamış."); setLoading(false); }
    return () => unsubscribe();
  }, []);

  return <main className="min-h-screen bg-alinda-cream"><div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-10">
    <Link href="/panel" className="inline-flex items-center gap-2 text-sm text-alinda-muted hover:text-alinda-ink"><ArrowLeft size={16} /> Dashboard</Link>
    <header className="mt-8 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-alinda-ink text-white"><CalendarDays size={19} /></div><div><h1 className="text-3xl font-semibold tracking-tight">Randevular</h1><p className="mt-1 text-sm text-alinda-muted">Randevuları görüntüleyin, onaylayın veya iptal edin.</p></div></header>
    {success && <div className="mt-6 flex items-center gap-2 rounded-xl border border-[#CBE8D4] bg-[#EAF6EE] px-4 py-3 text-sm text-[#4E8762]"><Check size={17} />{success}</div>}
    {error && <div role="alert" className="mt-6 rounded-xl border border-[#E8CACA] bg-[#FBEEEE] px-4 py-3 text-sm text-alinda-danger">{error}</div>}
    <section className="mt-6 rounded-[24px] border border-alinda-line bg-white p-4 shadow-card"><div className="flex flex-col gap-3 sm:flex-row sm:items-center"><div className="relative flex-1"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-alinda-muted" /><input value={referenceSearch} onChange={(event) => setReferenceSearch(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5))} onKeyDown={(event) => { if (event.key === "Enter") void searchByReference(); }} placeholder="Randevu referansını girin · Örn. K7P2M" maxLength={5} className="h-12 w-full rounded-xl border border-alinda-line bg-white pl-10 pr-4 font-mono text-sm uppercase outline-none focus:border-alinda-accent" /></div><button type="button" onClick={() => void searchByReference()} disabled={searching || referenceSearch.length !== 5} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-alinda-ink px-5 text-sm font-semibold text-white disabled:opacity-40"><Search size={16} /> {searching && <Loader2 size={16} className="animate-spin" />}{searching ? "Aranıyor…" : "Randevuyu bul"}</button>{referenceSearch && <button type="button" onClick={() => void clearReferenceSearch()} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-alinda-line px-3 text-xs font-semibold sm:h-12"><X size={15} /> Temizle</button>}</div><p className="mt-2 text-xs text-alinda-muted">Müşterinin verdiği 5 karakterli randevu referansıyla randevuyu hızlıca bulun.</p></section>
    <section className="mt-6 rounded-[24px] border border-alinda-line bg-white p-4 shadow-card"><div className="grid gap-3 sm:grid-cols-3"><label className="block"><span className="mb-1.5 block text-xs font-medium text-alinda-muted">Tarih</span><input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="h-11 w-full rounded-xl border border-alinda-line px-3 text-sm outline-none focus:border-alinda-accent" /></label><label className="block"><span className="mb-1.5 block text-xs font-medium text-alinda-muted">Durum</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="h-11 w-full rounded-xl border border-alinda-line bg-white px-3 text-sm outline-none focus:border-alinda-accent"><option value="all">Tüm durumlar</option><option value="pending">Bekleyen</option><option value="confirmed">Onaylanan</option><option value="cancelled">İptal edilen</option></select></label><label className="block"><span className="mb-1.5 block text-xs font-medium text-alinda-muted">Müşteri</span><input value={customerSearch} onChange={(event) => setCustomerSearch(event.target.value)} placeholder="Ad veya telefon" className="h-11 w-full rounded-xl border border-alinda-line px-3 text-sm outline-none focus:border-alinda-accent" /></label></div>{(dateFilter || statusFilter !== "all" || customerSearch) && <button type="button" onClick={() => { setDateFilter(""); setStatusFilter("all"); setCustomerSearch(""); }} className="mt-3 text-xs font-semibold text-alinda-accent">Filtreleri temizle</button>}</section><section className="mt-6 overflow-hidden rounded-[24px] border border-alinda-line bg-white shadow-card">{loading ? <div className="p-6 text-sm text-alinda-muted">Randevular yükleniyor…</div> : filteredBookings.length === 0 ? <div className="p-10 text-center"><p className="font-semibold">{bookings.length === 0 ? "Henüz randevu yok" : "Filtreye uygun randevu yok"}</p><p className="mt-1 text-sm text-alinda-muted">{bookings.length === 0 ? "Public randevu sayfanızdan gelen randevular burada görünecek." : "Tarih, durum veya müşteri filtresini değiştirerek tekrar deneyin."}</p></div> : filteredBookings.map((booking, index) => <button type="button" onClick={() => setSelectedBooking(booking)} className={`grid w-full gap-4 px-5 py-5 text-left transition hover:bg-alinda-cream/40 sm:grid-cols-[130px_1fr_auto] sm:items-center sm:px-6 ${index ? "border-t border-alinda-line" : ""}`}><div><p className="font-mono text-sm font-bold tracking-wider text-alinda-accent">{booking.referenceNo || "—"}</p><p className="mt-2 text-sm font-semibold">{booking.date}</p><p className="mt-1 text-xs text-alinda-muted">{booking.time}</p></div><div><p className="text-sm font-semibold">{booking.customerName}</p><p className="mt-1 text-xs text-alinda-muted">{booking.serviceName} · {booking.specialistName || "Uzman seçilmedi"}</p><p className="mt-1 text-xs text-alinda-muted">{booking.customerPhone}</p><p className="mt-1 text-xs text-alinda-muted">₺{booking.servicePrice}</p></div><div className="flex flex-wrap items-center gap-2 sm:justify-end"><span className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${booking.status === "pending" ? "bg-[#FFF3D9] text-[#9A711E]" : booking.status === "confirmed" ? "bg-[#EAF6EE] text-[#4E8762]" : "bg-[#FBE8E9] text-[#B96A70]"}`}>{booking.status === "pending" ? "Bekliyor" : booking.status === "confirmed" ? "Onaylandı" : "İptal"}</span>{booking.status === "pending" && <><button type="button" onClick={() => void updateStatus(booking, "confirmed")} disabled={updatingId === booking.id} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#4E8762] px-3 text-xs font-semibold text-white disabled:opacity-50"><Check size={14} /> {updatingId === booking.id && <Loader2 size={14} className="animate-spin" />}{updatingId === booking.id ? "İşleniyor…" : "Onayla"}</button><button type="button" onClick={() => void updateStatus(booking, "cancelled")} disabled={updatingId === booking.id} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#F0C7CA] bg-white px-3 text-xs font-semibold text-[#B96A70] disabled:opacity-50">{updatingId === booking.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} İptal</button></>}</div></button>)}</section>

    {selectedBooking && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center" role="dialog" aria-modal="true" aria-label="Randevu detayları" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedBooking(null); }}><div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[24px] bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-sm font-bold tracking-wider text-alinda-accent">{selectedBooking.referenceNo}</p><h2 className="mt-1 text-xl font-semibold">Randevu detayları</h2></div><button type="button" onClick={() => setSelectedBooking(null)} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-alinda-cream" aria-label="Detayları kapat"><X size={18} /></button></div><div className="mt-6 space-y-4 text-sm"><div className="grid grid-cols-2 gap-4"><div><p className="text-xs text-alinda-muted">Tarih</p><p className="mt-1 font-semibold">{selectedBooking.date}</p></div><div><p className="text-xs text-alinda-muted">Saat</p><p className="mt-1 font-semibold">{selectedBooking.time} · {selectedBooking.serviceDurationMinutes} dk</p></div></div><div><p className="text-xs text-alinda-muted">Müşteri</p><p className="mt-1 font-semibold">{selectedBooking.customerName}</p><p className="mt-1 text-alinda-muted">{selectedBooking.customerPhone}</p></div><div><p className="text-xs text-alinda-muted">Hizmet</p><p className="mt-1 font-semibold">{selectedBooking.serviceName}</p><p className="mt-1 text-alinda-muted">₺{selectedBooking.servicePrice}</p></div><div><p className="text-xs text-alinda-muted">Uzman</p><p className="mt-1 font-semibold">{selectedBooking.specialistName || "Uzman seçilmedi"}</p></div><div><p className="text-xs text-alinda-muted">Durum</p><p className="mt-1 font-semibold">{selectedBooking.status === "pending" ? "Bekliyor" : selectedBooking.status === "confirmed" ? "Onaylandı" : "İptal"}</p></div><div><p className="text-xs text-alinda-muted">WhatsApp izni</p><p className="mt-1 font-semibold">{selectedBooking.whatsappOptIn ? "Verildi" : "Verilmedi"}</p></div></div><div className="mt-6 flex flex-col gap-2 sm:flex-row"><a href={"tel:" + selectedBooking.customerPhone} className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-alinda-line text-sm font-semibold">Müşteriyi ara</a>{selectedBooking.status === "pending" && <><button type="button" onClick={() => { setSelectedBooking(null); void updateStatus(selectedBooking, "confirmed"); }} className="h-11 flex-1 rounded-xl bg-[#4E8762] text-sm font-semibold text-white">Onayla</button><button type="button" onClick={() => { setSelectedBooking(null); void updateStatus(selectedBooking, "cancelled"); }} className="h-11 flex-1 rounded-xl border border-[#F0C7CA] text-sm font-semibold text-[#B96A70]">İptal</button></>}</div></div></div>}
  </div></main>;
}
