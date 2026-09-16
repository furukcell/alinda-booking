"use client";

import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { ArrowLeft, Pencil, Plus, Scissors, Trash2, X } from "@lucide/react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { getFirebaseDb } from "@/lib/firebase/client";
import { getOwnedBusinessId } from "@/lib/businesses/owner";
import type { Service } from "@/types/business";

const emptyForm = { name: "", description: "", durationMinutes: "30", price: "" };

type FormState = typeof emptyForm;

export default function ServicesPage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadServices(uid: string) {
    setLoading(true);
    setError("");
    try {
      const id = await getOwnedBusinessId(uid);
      setBusinessId(id);
      if (!id) {
        setServices([]);
        setError("Bu kullanıcıya bağlı bir işletme bulunamadı.");
        return;
      }
      const snapshot = await getDocs(collection(getFirebaseDb(), "businesses", id, "services"));
      setServices(snapshot.docs.map((item) => {
        const data = item.data();
        return {
          id: item.id,
          name: typeof data.name === "string" ? data.name : "",
          description: typeof data.description === "string" ? data.description : "",
          durationMinutes: typeof data.durationMinutes === "number" ? data.durationMinutes : 30,
          price: typeof data.price === "number" ? data.price : 0,
          currency: "TRY"
        };
      }));
    } catch {
      setError("Hizmetler yüklenemedi. Firebase ve Firestore ayarlarınızı kontrol edin.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    import("firebase/auth").then(({ onAuthStateChanged }) => {
      import("@/lib/firebase/client").then(({ getFirebaseAuth }) => {
        try {
          return onAuthStateChanged(getFirebaseAuth(), (user) => {
            if (user) void loadServices(user.uid);
            else setLoading(false);
          });
        } catch {
          setError("Firebase yapılandırılmamış.");
          setLoading(false);
        }
      });
    });
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!businessId || !form.name.trim()) return;
    setSaving(true);
    setError("");
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      durationMinutes: Math.max(5, Number(form.durationMinutes) || 30),
      price: Math.max(0, Number(form.price) || 0),
      currency: "TRY",
      updatedAt: serverTimestamp()
    };

    try {
      const servicesRef = collection(getFirebaseDb(), "businesses", businessId, "services");
      if (editingId) await updateDoc(doc(servicesRef, editingId), payload);
      else await addDoc(servicesRef, { ...payload, createdAt: serverTimestamp() });
      resetForm();
      const auth = (await import("@/lib/firebase/client")).getFirebaseAuth();
      if (auth.currentUser) await loadServices(auth.currentUser.uid);
    } catch {
      setError("Hizmet kaydedilemedi. Firestore kurallarını ve bağlantıyı kontrol edin.");
    } finally {
      setSaving(false);
    }
  }

  async function removeService(id: string) {
    if (!businessId || !window.confirm("Bu hizmet silinsin mi?")) return;
    try {
      await deleteDoc(doc(getFirebaseDb(), "businesses", businessId, "services", id));
      setServices((items) => items.filter((item) => item.id !== id));
    } catch {
      setError("Hizmet silinemedi.");
    }
  }

  function editService(service: Service) {
    setEditingId(service.id);
    setForm({ name: service.name, description: service.description, durationMinutes: String(service.durationMinutes), price: String(service.price) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen bg-alinda-cream">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-10">
        <Link href="/panel" className="inline-flex items-center gap-2 text-sm text-alinda-muted hover:text-alinda-ink"><ArrowLeft size={16} /> Dashboard</Link>
        <header className="mt-8 flex items-start justify-between gap-4">
          <div><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-alinda-ink text-white"><Scissors size={19} /></div><h1 className="text-3xl font-semibold tracking-tight">Hizmetler</h1></div><p className="mt-3 text-sm text-alinda-muted">Hizmetlerinizi, sürelerini ve fiyatlarını gerçek zamanlı yönetin.</p></div>
          {!editingId && <a href="#service-form" className="hidden items-center gap-2 rounded-xl bg-alinda-ink px-4 py-2.5 text-sm font-semibold text-white sm:inline-flex"><Plus size={16} /> Yeni hizmet</a>}
        </header>

        {error && <div role="alert" className="mt-6 rounded-xl border border-[#E8CACA] bg-[#FBEEEE] px-4 py-3 text-sm text-alinda-danger">{error}</div>}

        <section id="service-form" className="mt-8 rounded-[24px] border border-alinda-line bg-white p-5 shadow-card sm:p-6">
          <div className="flex items-center justify-between"><div><h2 className="font-semibold">{editingId ? "Hizmeti düzenle" : "Yeni hizmet"}</h2><p className="mt-1 text-xs text-alinda-muted">Müşterinin göreceği hizmet bilgilerini girin.</p></div>{editingId && <button onClick={resetForm} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-alinda-cream" aria-label="Düzenlemeyi iptal et"><X size={18} /></button>}</div>
          <form onSubmit={handleSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2"><span className="mb-2 block text-sm font-medium">Hizmet adı</span><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11 w-full rounded-xl border border-alinda-line px-3 text-sm outline-none focus:border-alinda-ink focus:ring-4 focus:ring-black/5" placeholder="Örn. Saç Kesimi" /></label>
            <label className="block sm:col-span-2"><span className="mb-2 block text-sm font-medium">Açıklama <span className="font-normal text-alinda-muted">(opsiyonel)</span></span><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-24 w-full rounded-xl border border-alinda-line px-3 py-3 text-sm outline-none focus:border-alinda-ink focus:ring-4 focus:ring-black/5" placeholder="Hizmet hakkında kısa bilgi" /></label>
            <label className="block"><span className="mb-2 block text-sm font-medium">Süre (dakika)</span><input required type="number" min="5" step="5" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} className="h-11 w-full rounded-xl border border-alinda-line px-3 text-sm outline-none focus:border-alinda-ink focus:ring-4 focus:ring-black/5" /></label>
            <label className="block"><span className="mb-2 block text-sm font-medium">Fiyat (₺)</span><input required type="number" min="0" step="10" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="h-11 w-full rounded-xl border border-alinda-line px-3 text-sm outline-none focus:border-alinda-ink focus:ring-4 focus:ring-black/5" placeholder="600" /></label>
            <div className="flex gap-2 sm:col-span-2"><button disabled={saving || !businessId} className="inline-flex h-11 items-center justify-center rounded-xl bg-alinda-ink px-5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Kaydediliyor…" : editingId ? "Değişiklikleri kaydet" : "Hizmeti ekle"}</button>{editingId && <button type="button" onClick={resetForm} className="h-11 rounded-xl border border-alinda-line px-5 text-sm font-semibold">İptal</button>}</div>
          </form>
        </section>

        <section className="mt-5 overflow-hidden rounded-[24px] border border-alinda-line bg-white shadow-card">
          {loading ? <div className="p-6 text-sm text-alinda-muted">Hizmetler yükleniyor…</div> : services.length === 0 ? <div className="p-8 text-center"><p className="font-semibold">Henüz hizmet yok</p><p className="mt-1 text-sm text-alinda-muted">İlk hizmetinizi yukarıdaki formdan ekleyin.</p></div> : services.map((service, index) => <div key={service.id} className={`flex items-center gap-4 px-5 py-4 sm:px-6 ${index ? "border-t border-alinda-line" : ""}`}><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{service.name}</p><p className="mt-1 truncate text-xs text-alinda-muted">{service.description || "Açıklama eklenmemiş"}</p></div><div className="hidden text-right sm:block"><p className="text-sm font-medium">{service.durationMinutes} dk</p><p className="text-xs text-alinda-muted">Süre</p></div><div className="text-right"><p className="text-sm font-semibold">₺{service.price.toLocaleString("tr-TR")}</p><p className="text-xs text-alinda-muted">TRY</p></div><button onClick={() => editService(service)} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-alinda-cream" aria-label={`${service.name} düzenle`}><Pencil size={16} /></button><button onClick={() => void removeService(service.id)} className="flex h-9 w-9 items-center justify-center rounded-lg text-alinda-danger hover:bg-[#FBEEEE]" aria-label={`${service.name} sil`}><Trash2 size={16} /></button></div>)}
        </section>
      </div>
    </main>
  );
}
