"use client";

import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { ArrowLeft, CalendarDays, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";
import { getOwnedBusinessId } from "@/lib/businesses/owner";
import type { Booking } from "@/types/booking";

export default function AppointmentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [referenceSearch, setReferenceSearch] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (user) => {
        if (!user) return;
        try {
          const businessId = await getOwnedBusinessId(user.uid);
          if (!businessId) throw new Error("NO_BUSINESS");
          const ref = collection(getFirebaseDb(), "businesses", businessId, "bookings");
          const snapshot = await getDocs(query(ref, orderBy("date", "asc")));
          setBookings(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Booking)));
        } catch {
          setError("Randevular yüklenemedi. Firestore kurallarını ve bağlantıyı kontrol edin.");
        } finally {
          setLoading(false);
        }
      });
    } catch {
      setError("Firebase yapılandırılmamış.");
      setLoading(false);
    }
    async function searchByReference() {
    const value = referenceSearch.trim().toUpperCase();
    if (!value) return;
    setSearching(true);
    setError("");

    try {
      const user = getFirebaseAuth().currentUser;
      if (!user) throw new Error("AUTH");
      const businessId = await getOwnedBusinessId(user.uid);
      if (!businessId) throw new Error("NO_BUSINESS");
      const ref = collection(getFirebaseDb(), "businesses", businessId, "bookings");
      const snapshot = await getDocs(query(ref, where("referenceNo", "==", value)));
      setBookings(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Booking)));
      if (snapshot.empty) setError(`“${value}” referans numaralı randevu bulunamadı.`);
    } catch {
      setError("Referans numarasıyla arama yapılamadı.");
    } finally {
      setSearching(false);
    }
  }

  async function clearReferenceSearch() {
    setReferenceSearch("");
    setError("");
    setLoading(true);
    try {
      const user = getFirebaseAuth().currentUser;
      if (!user) return;
      const businessId = await getOwnedBusinessId(user.uid);
      if (!businessId) return;
      const ref = collection(getFirebaseDb(), "businesses", businessId, "bookings");
      const snapshot = await getDocs(query(ref, orderBy("date", "asc")));
      setBookings(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Booking)));
    } catch {
      setError("Randevular yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  return () => unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-alinda-cream">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-10">
        <Link href="/panel" className="inline-flex items-center gap-2 text-sm text-alinda-muted hover:text-alinda-ink"><ArrowLeft size={16} /> Dashboard</Link>
        <header className="mt-8 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-alinda-ink text-white"><CalendarDays size={19} /></div><div><h1 className="text-3xl font-semibold tracking-tight">Randevular</h1><p className="mt-1 text-sm text-alinda-muted">Müşterilerden gelen randevu taleplerini görüntüleyin.</p></div></header>
        {error && <div role="alert" className="mt-6 rounded-xl border border-[#E8CACA] bg-[#FBEEEE] px-4 py-3 text-sm text-alinda-danger">{error}</div>}
        <section className="mt-6 rounded-[24px] border border-alinda-line bg-white p-4 shadow-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-alinda-muted" />
              <input
                value={referenceSearch}
                onChange={(event) => setReferenceSearch(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5))}
                onKeyDown={(event) => { if (event.key === "Enter") void searchByReference(); }}
                placeholder="Randevu referansını girin · Örn. K7P2M"
                maxLength={5}
                className="h-12 w-full rounded-xl border border-alinda-line bg-white pl-10 pr-4 font-mono text-sm uppercase outline-none focus:border-alinda-accent"
              />
            </div>
            <button type="button" onClick={() => void searchByReference()} disabled={searching || referenceSearch.length !== 5} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-alinda-ink px-5 text-sm font-semibold text-white disabled:opacity-40">
              <Search size={16} /> {searching ? "Aranıyor…" : "Randevuyu bul"}
            </button>
            {referenceSearch && <button type="button" onClick={() => void clearReferenceSearch()} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-alinda-line px-3 text-xs font-semibold sm:h-12"><X size={15} /> Temizle</button>}
          </div>
          <p className="mt-2 text-xs text-alinda-muted">Müşterinin verdiği 5 karakterli randevu referansıyla ilgili randevuyu hızlıca bulun.</p>
        </section>

        <section className="mt-8 overflow-hidden rounded-[24px] border border-alinda-line bg-white shadow-card">
          {loading ? <div className="p-6 text-sm text-alinda-muted">Randevular yükleniyor…</div> : bookings.length === 0 ? <div className="p-10 text-center"><p className="font-semibold">Henüz randevu yok</p><p className="mt-1 text-sm text-alinda-muted">Public randevu sayfanızdan gelen talepler burada görünecek.</p></div> : bookings.map((booking, index) => <div key={booking.id} className={`grid gap-3 px-5 py-5 sm:grid-cols-[130px_1fr_auto] sm:items-center sm:px-6 ${index ? "border-t border-alinda-line" : ""}`}>
  <div>
    <p className="font-mono text-sm font-bold tracking-wider text-alinda-accent">{booking.referenceNo || "—"}</p>
    <p className="mt-2 text-sm font-semibold">{booking.date}</p>
    <p className="mt-1 text-xs text-alinda-muted">{booking.time}</p>
  </div>
  <div>
    <p className="text-sm font-semibold">{booking.customerName}</p>
    <p className="mt-1 text-xs text-alinda-muted">{booking.serviceName} · {booking.specialistName || "Uzman seçilmedi"}</p>
    <p className="mt-1 text-xs text-alinda-muted">{booking.customerPhone}</p>
  </div>
  <span className="w-fit rounded-full bg-alinda-accent-soft px-3 py-1 text-xs font-medium text-alinda-accent">{booking.status === "pending" ? "Bekliyor" : booking.status === "confirmed" ? "Onaylandı" : "İptal"}</span>
</div>)}
        </section>
      </div>
    </main>
  );
}
