"use client";

import { collection, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { ArrowLeft, Clock3, Save } from "@lucide/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";
import { getOwnedBusinessId } from "@/lib/businesses/owner";

type Day = { id: string; label: string; enabled: boolean; open: string; close: string };

const defaultDays: Day[] = [
  { id: "monday", label: "Pazartesi", enabled: true, open: "09:00", close: "18:00" },
  { id: "tuesday", label: "Salı", enabled: true, open: "09:00", close: "18:00" },
  { id: "wednesday", label: "Çarşamba", enabled: true, open: "09:00", close: "18:00" },
  { id: "thursday", label: "Perşembe", enabled: true, open: "09:00", close: "18:00" },
  { id: "friday", label: "Cuma", enabled: true, open: "09:00", close: "18:00" },
  { id: "saturday", label: "Cumartesi", enabled: false, open: "10:00", close: "16:00" },
  { id: "sunday", label: "Pazar", enabled: false, open: "10:00", close: "16:00" }
];

export default function HoursPage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [days, setDays] = useState<Day[]>(defaultDays);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
        if (!user) return;
        void loadHours(user.uid);
      });
    } catch {
      setError("Firebase yapılandırılmamış.");
      setLoading(false);
    }
    return () => unsubscribe();
  }, []);

  async function loadHours(uid: string) {
    setLoading(true);
    setError("");
    try {
      const id = await getOwnedBusinessId(uid);
      setBusinessId(id);
      if (!id) {
        setError("Bu kullanıcıya bağlı bir işletme bulunamadı.");
        return;
      }
      const snapshot = await getDocs(collection(getFirebaseDb(), "businesses", id, "hours"));
      const savedById = new Map(snapshot.docs.map((item) => [item.id, item.data()]));
      setDays(defaultDays.map((day) => {
        const data = savedById.get(day.id);
        return data ? {
          ...day,
          enabled: data.enabled !== false,
          open: typeof data.open === "string" ? data.open : day.open,
          close: typeof data.close === "string" ? data.close : day.close
        } : day;
      }));
    } catch {
      setError("Çalışma saatleri yüklenemedi. Firestore ayarlarınızı kontrol edin.");
    } finally {
      setLoading(false);
    }
  }

  function updateDay(id: string, patch: Partial<Day>) {
    setSaved(false);
    setDays((current) => current.map((day) => day.id === id ? { ...day, ...patch } : day));
  }

  async function saveHours() {
    if (!businessId) return;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const db = getFirebaseDb();
      await Promise.all(days.map((day) => setDoc(doc(db, "businesses", businessId, "hours", day.id), {
        dayOfWeek: day.id,
        enabled: day.enabled,
        open: day.open,
        close: day.close,
        updatedAt: serverTimestamp()
      }, { merge: true })));
      setSaved(true);
    } catch {
      setError("Çalışma saatleri kaydedilemedi. Firestore kurallarını kontrol edin.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-alinda-cream">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-10">
        <Link href="/panel" className="inline-flex items-center gap-2 text-sm text-alinda-muted hover:text-alinda-ink"><ArrowLeft size={16} /> Dashboard</Link>
        <header className="mt-8 flex items-start justify-between gap-4"><div><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-alinda-ink text-white"><Clock3 size={19} /></div><h1 className="text-3xl font-semibold tracking-tight">Çalışma Saatleri</h1></div><p className="mt-3 text-sm text-alinda-muted">Müşterilerinizin randevu alabileceği gün ve saatleri belirleyin.</p></div><button onClick={() => void saveHours()} disabled={saving || loading || !businessId} className="hidden items-center gap-2 rounded-xl bg-alinda-ink px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 sm:inline-flex"><Save size={16} />{saving ? "Kaydediliyor…" : "Kaydet"}</button></header>

        {error && <div role="alert" className="mt-6 rounded-xl border border-[#E8CACA] bg-[#FBEEEE] px-4 py-3 text-sm text-alinda-danger">{error}</div>}
        {saved && <div role="status" className="mt-6 rounded-xl border border-[#CFE2D5] bg-[#EEF7F0] px-4 py-3 text-sm text-alinda-success">Çalışma saatleri kaydedildi.</div>}

        <section className="mt-8 overflow-hidden rounded-[24px] border border-alinda-line bg-white shadow-card">
          {loading ? <div className="p-6 text-sm text-alinda-muted">Çalışma saatleri yükleniyor…</div> : days.map((day, index) => <div key={day.id} className={`px-5 py-5 sm:px-6 ${index ? "border-t border-alinda-line" : ""}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-3"><input type="checkbox" checked={day.enabled} onChange={(e) => updateDay(day.id, { enabled: e.target.checked })} className="h-5 w-5 rounded border-alinda-line accent-black" /><span className="w-24 text-sm font-semibold">{day.label}</span></label>
              {day.enabled ? <div className="flex items-center gap-3"><label className="flex items-center gap-2"><span className="text-xs text-alinda-muted">Açılış</span><input type="time" value={day.open} onChange={(e) => updateDay(day.id, { open: e.target.value })} className="h-10 rounded-xl border border-alinda-line px-3 text-sm outline-none focus:border-alinda-ink focus:ring-4 focus:ring-black/5" /></label><span className="text-alinda-muted">—</span><label className="flex items-center gap-2"><span className="text-xs text-alinda-muted">Kapanış</span><input type="time" value={day.close} onChange={(e) => updateDay(day.id, { close: e.target.value })} className="h-10 rounded-xl border border-alinda-line px-3 text-sm outline-none focus:border-alinda-ink focus:ring-4 focus:ring-black/5" /></label></div> : <span className="text-sm text-alinda-muted">Kapalı</span>}
            </div>
          </div>)}
        </section>
        <button onClick={() => void saveHours()} disabled={saving || loading || !businessId} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-alinda-ink text-sm font-semibold text-white disabled:opacity-50 sm:hidden"><Save size={16} />{saving ? "Kaydediliyor…" : "Çalışma saatlerini kaydet"}</button>
      </div>
    </main>
  );
}
