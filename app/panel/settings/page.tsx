"use client";

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ArrowLeft, Check, Loader2, Settings2 } from "@lucide/react";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";
import { getOwnedBusinessId } from "@/lib/businesses/owner";

type BusinessForm = {
  name: string;
  slug: string;
  category: string;
  description: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  initials: string;
  primaryColor: string;
  primaryColorSoft: string;
};

const emptyForm: BusinessForm = {
  name: "",
  slug: "",
  category: "",
  description: "",
  city: "",
  district: "",
  address: "",
  phone: "",
  initials: "",
  primaryColor: "#B86F61",
  primaryColorSoft: "#F3E4E0"
};

export default function BusinessSettingsPage() {
  const [businessId, setBusinessId] = useState("");
  const [form, setForm] = useState<BusinessForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let unsubscribe = () => {};

    try {
      unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (user) => {
        if (!user) {
          setLoading(false);
          return;
        }

        try {
          const id = await getOwnedBusinessId(user.uid);
          if (!id) throw new Error("NO_BUSINESS");

          const snapshot = await getDoc(doc(getFirebaseDb(), "businesses", id));
          if (!snapshot.exists()) throw new Error("BUSINESS_NOT_FOUND");

          const data = snapshot.data();
          setBusinessId(id);
          setForm({
            name: data.name ?? "",
            slug: data.slug ?? "",
            category: data.category ?? "",
            description: data.description ?? "",
            city: data.city ?? "",
            district: data.district ?? "",
            address: data.address ?? "",
            phone: data.phone ?? "",
            initials: data.initials ?? "",
            primaryColor: data.primaryColor ?? emptyForm.primaryColor,
            primaryColorSoft: data.primaryColorSoft ?? emptyForm.primaryColorSoft
          });
        } catch {
          setError("İşletme bilgileri yüklenemedi. Firestore bağlantısını ve kuralları kontrol edin.");
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

  function updateField(field: keyof BusinessForm, value: string) {
    setSaved(false);
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!businessId) return;

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      await updateDoc(doc(getFirebaseDb(), "businesses", businessId), {
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase(),
        category: form.category.trim(),
        description: form.description.trim(),
        city: form.city.trim(),
        district: form.district.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        initials: form.initials.trim().slice(0, 3).toUpperCase(),
        primaryColor: form.primaryColor,
        primaryColorSoft: form.primaryColorSoft
      });
      setSaved(true);
    } catch {
      setError("Değişiklikler kaydedilemedi. Firestore Rules ve sahiplik bilgisini kontrol edin.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-alinda-cream">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:py-10">
        <Link href="/panel" className="inline-flex items-center gap-2 text-sm text-alinda-muted hover:text-alinda-ink">
          <ArrowLeft size={16} /> Dashboard
        </Link>

        <header className="mt-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-alinda-ink text-white"><Settings2 size={19} /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-alinda-accent">İşletme</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">İşletme Ayarları</h1>
            <p className="mt-1 text-sm text-alinda-muted">Müşterilerin randevu sayfasında göreceği temel işletme bilgilerini yönetin.</p>
          </div>
        </header>

        {error && <div role="alert" className="mt-6 rounded-xl border border-[#E8CACA] bg-[#FBEEEE] px-4 py-3 text-sm text-alinda-danger">{error}</div>}

        {loading ? (
          <section className="mt-8 rounded-[24px] border border-alinda-line bg-white p-8 shadow-card">
            <div className="flex items-center gap-2 text-sm text-alinda-muted"><Loader2 size={16} className="animate-spin" /> İşletme bilgileri yükleniyor…</div>
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <section className="rounded-[24px] border border-alinda-line bg-white p-5 shadow-card sm:p-6">
              <div><h2 className="font-semibold">Temel bilgiler</h2><p className="mt-1 text-xs text-alinda-muted">İşletmenizin müşterilere gösterilecek ana bilgileri.</p></div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="İşletme adı" value={form.name} onChange={(value) => updateField("name", value)} required />
                <Field label="Kategori" value={form.category} onChange={(value) => updateField("category", value)} required />
                <Field label="Slug / randevu adresi" value={form.slug} onChange={(value) => updateField("slug", value)} required hint="Örn. meltem-guzellik" />
                <Field label="Kısa isim" value={form.initials} onChange={(value) => updateField("initials", value)} maxLength={3} hint="Örn. MB" />
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">Açıklama</label>
                  <textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} rows={4} className="mt-2 w-full resize-none rounded-xl border border-alinda-line px-3 py-2.5 text-sm outline-none transition focus:border-alinda-ink" />
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border border-alinda-line bg-white p-5 shadow-card sm:p-6">
              <div><h2 className="font-semibold">İletişim ve adres</h2><p className="mt-1 text-xs text-alinda-muted">Randevu sayfanızda müşterilerin göreceği iletişim bilgileri.</p></div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="Şehir" value={form.city} onChange={(value) => updateField("city", value)} required />
                <Field label="İlçe" value={form.district} onChange={(value) => updateField("district", value)} required />
                <Field label="Telefon" value={form.phone} onChange={(value) => updateField("phone", value)} />
                <div className="sm:col-span-2"><Field label="Adres" value={form.address} onChange={(value) => updateField("address", value)} /></div>
              </div>
            </section>

            <section className="rounded-[24px] border border-alinda-line bg-white p-5 shadow-card sm:p-6">
              <div><h2 className="font-semibold">Marka renkleri</h2><p className="mt-1 text-xs text-alinda-muted">Şimdilik temel tema renkleri. Görsel yükleme Phase 12'de eklenecek.</p></div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <ColorField label="Ana renk" value={form.primaryColor} onChange={(value) => updateField("primaryColor", value)} />
                <ColorField label="Yumuşak renk" value={form.primaryColorSoft} onChange={(value) => updateField("primaryColorSoft", value)} />
              </div>
            </section>

            <div className="sticky bottom-4 flex items-center justify-end gap-3 rounded-2xl border border-alinda-line bg-white/95 p-3 shadow-card backdrop-blur">
              {saved && <span className="mr-auto inline-flex items-center gap-1.5 text-sm font-medium text-alinda-success"><Check size={16} /> Kaydedildi</span>}
              <button type="submit" disabled={saving || loading} className="inline-flex items-center gap-2 rounded-xl bg-alinda-ink px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                {saving && <Loader2 size={16} className="animate-spin" />}
                {saving ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

function Field({ label, value, onChange, required, hint, maxLength }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; hint?: string; maxLength?: number }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}{required ? " *" : ""}</label>
      <input value={value} onChange={(event) => onChange(event.target.value)} required={required} maxLength={maxLength} className="mt-2 w-full rounded-xl border border-alinda-line px-3 py-2.5 text-sm outline-none transition focus:border-alinda-ink" />
      {hint && <p className="mt-1.5 text-xs text-alinda-muted">{hint}</p>}
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="mt-2 flex gap-2">
        <input type="color" value={/^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#B86F61"} onChange={(event) => onChange(event.target.value)} className="h-11 w-14 cursor-pointer rounded-xl border border-alinda-line bg-white p-1" />
        <input value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-alinda-line px-3 py-2.5 text-sm uppercase outline-none transition focus:border-alinda-ink" />
      </div>
    </div>
  );
}
