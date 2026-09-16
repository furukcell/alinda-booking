"use client";

import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { ArrowLeft, CalendarDays } from "@lucide/react";
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
    return () => unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-alinda-cream">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-10">
        <Link href="/panel" className="inline-flex items-center gap-2 text-sm text-alinda-muted hover:text-alinda-ink"><ArrowLeft size={16} /> Dashboard</Link>
        <header className="mt-8 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-alinda-ink text-white"><CalendarDays size={19} /></div><div><h1 className="text-3xl font-semibold tracking-tight">Randevular</h1><p className="mt-1 text-sm text-alinda-muted">Müşterilerden gelen randevu taleplerini görüntüleyin.</p></div></header>
        {error && <div role="alert" className="mt-6 rounded-xl border border-[#E8CACA] bg-[#FBEEEE] px-4 py-3 text-sm text-alinda-danger">{error}</div>}
        <section className="mt-8 overflow-hidden rounded-[24px] border border-alinda-line bg-white shadow-card">
          {loading ? <div className="p-6 text-sm text-alinda-muted">Randevular yükleniyor…</div> : bookings.length === 0 ? <div className="p-10 text-center"><p className="font-semibold">Henüz randevu yok</p><p className="mt-1 text-sm text-alinda-muted">Public randevu sayfanızdan gelen talepler burada görünecek.</p></div> : bookings.map((booking, index) => <div key={booking.id} className={`grid gap-3 px-5 py-5 sm:grid-cols-[110px_1fr_auto] sm:items-center sm:px-6 ${index ? "border-t border-alinda-line" : ""}`}><div><p className="text-sm font-semibold">{booking.date}</p><p className="mt-1 text-xs text-alinda-muted">{booking.time}</p></div><div><p className="text-sm font-semibold">{booking.customerName}</p><p className="mt-1 text-xs text-alinda-muted">{booking.serviceName} · {booking.customerPhone}</p></div><span className="w-fit rounded-full bg-alinda-accent-soft px-3 py-1 text-xs font-medium text-alinda-accent">{booking.status === "pending" ? "Bekliyor" : booking.status === "confirmed" ? "Onaylandı" : "İptal"}</span></div>)}
        </section>
      </div>
    </main>
  );
}
