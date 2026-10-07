"use client";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Building2, CheckCircle2, ChevronRight, LogOut, Plus, ShieldCheck, Store, Users } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";

type Business = {
  id: string;
  name: string;
  slug: string;
  category: string;
  city: string;
  district: string;
  phone: string;
  ownerId: string;
};

const emptyForm = {
  name: "",
  slug: "",
  category: "Güzellik Salonu",
  city: "Muğla",
  district: "Bodrum",
  phone: "",
  ownerEmail: "",
  ownerPassword: "",
};

export default function AdminPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState(emptyForm);

  async function loadBusinesses(user = getFirebaseAuth().currentUser) {
    if (!user) return;
    const token = await user.getIdToken();
    const response = await fetch("/api/admin/businesses", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) throw new Error("İşletmeler alınamadı.");
    const data = await response.json();
    setBusinesses(data.businesses || []);
  }

  useEffect(() => {
    return onAuthStateChanged(getFirebaseAuth(), async (user) => {
      if (!user) {
        window.location.href = "/login";
        return;
      }

      try {
        const adminDoc = await getDoc(doc(getFirebaseDb(), "superadmins", user.uid));
        if (!adminDoc.exists()) {
          setAuthorized(false);
          setLoading(false);
          return;
        }

        setAuthorized(true);
        await loadBusinesses(user);
      } catch {
        setError("Süper admin bilgileri doğrulanamadı.");
      } finally {
        setLoading(false);
      }
    });
  }, []);

  async function createBusiness(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const user = getFirebaseAuth().currentUser;
      if (!user) throw new Error("Oturum bulunamadı.");
      const token = await user.getIdToken();

      const response = await fetch("/api/admin/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "İşletme oluşturulamadı.");

      setBusinesses((current) => [...current, data.business].sort((a, b) => a.name.localeCompare(b.name, "tr")));
      setForm(emptyForm);
      setShowCreate(false);
      setSuccess("İşletme ve işletme sahibi hesabı oluşturuldu.");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "İşletme oluşturulamadı.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-alinda-cream text-sm text-alinda-muted">Süper admin paneli hazırlanıyor…</main>;
  }

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-alinda-cream px-4">
        <section className="max-w-md rounded-[28px] border border-alinda-line bg-white p-8 text-center shadow-card">
          <ShieldCheck className="mx-auto text-alinda-accent" size={34} />
          <h1 className="mt-5 text-2xl font-semibold">Yetkisiz erişim</h1>
          <p className="mt-2 text-sm leading-6 text-alinda-muted">Bu alan yalnızca ALINDA süper yöneticilerine açıktır.</p>
          <a href="/" className="mt-6 inline-flex h-11 items-center rounded-full bg-alinda-ink px-5 text-sm font-semibold text-white">Ana sayfaya dön</a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-alinda-cream text-alinda-ink">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <aside className="hidden w-72 shrink-0 border-r border-alinda-line bg-white p-6 lg:flex lg:flex-col">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-alinda-ink text-white"><ShieldCheck size={21} /></div>
            <div>
              <p className="font-semibold tracking-tight">ALINDA</p>
              <p className="text-xs text-alinda-muted">Süper Admin</p>
            </div>
          </div>
          <div className="mt-9 rounded-[22px] bg-alinda-ink p-5 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">Yönetim merkezi</p>
            <p className="mt-2 text-lg font-semibold">İşletmelerinizi yönetin.</p>
            <p className="mt-2 text-xs leading-5 text-white/60">Yeni salon oluşturun, işletme sahiplerini tanımlayın ve ALINDA ağını tek panelden takip edin.</p>
          </div>
          <nav className="mt-7 space-y-1">
            <div className="flex items-center gap-3 rounded-xl bg-alinda-cream px-3 py-2.5 text-sm font-medium"><Building2 size={18} /> İşletmeler</div>
          </nav>
          <div className="mt-auto">
            <button onClick={() => signOut(getFirebaseAuth())} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-alinda-muted hover:bg-alinda-cream hover:text-alinda-ink"><LogOut size={17} /> Çıkış yap</button>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
          <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-alinda-accent">Sistem yönetimi</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">İşletmeler</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-alinda-muted">ALINDA'ya bağlı tüm işletmeleri ve işletme hesaplarını buradan yönetin.</p>
            </div>
            <button onClick={() => { setShowCreate(true); setError(""); setSuccess(""); }} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-alinda-ink px-5 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5"><Plus size={17} /> Yeni işletme</button>
          </header>

          {success ? <div className="mt-6 flex items-center gap-2 rounded-2xl border border-[#CBE8D4] bg-[#EAF6EE] px-4 py-3 text-sm text-[#4E8762]"><CheckCircle2 size={18} />{success}</div> : null}
          {error ? <div className="mt-6 rounded-2xl border border-[#E8CACA] bg-[#FBEEEE] px-4 py-3 text-sm text-alinda-danger">{error}</div> : null}

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[22px] border border-alinda-line bg-white p-5 shadow-card"><p className="text-xs text-alinda-muted">Toplam işletme</p><p className="mt-2 text-3xl font-semibold">{businesses.length}</p></div>
            <div className="rounded-[22px] border border-alinda-line bg-white p-5 shadow-card"><p className="text-xs text-alinda-muted">Aktif işletme</p><p className="mt-2 text-3xl font-semibold">{businesses.length}</p></div>
            <div className="rounded-[22px] border border-alinda-line bg-white p-5 shadow-card"><p className="text-xs text-alinda-muted">İşletme sahipleri</p><p className="mt-2 text-3xl font-semibold">{businesses.length}</p></div>
          </div>

          <section className="mt-6 overflow-hidden rounded-[26px] border border-alinda-line bg-white shadow-card">
            <div className="border-b border-alinda-line px-5 py-5 sm:px-6">
              <h2 className="font-semibold">İşletme listesi</h2>
              <p className="mt-1 text-xs text-alinda-muted">Her işletmenin kendi randevu sayfası ve yönetici hesabı bulunur.</p>
            </div>
            <div className="divide-y divide-alinda-line">
              {businesses.map((business) => (
                <div key={business.id} className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-alinda-accent-soft text-alinda-accent"><Store size={20} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{business.name}</p>
                      <span className="rounded-full bg-[#EAF6EE] px-2.5 py-1 text-[10px] font-semibold text-[#4E8762]">Aktif</span>
                    </div>
                    <p className="mt-1 text-xs text-alinda-muted">{business.city}{business.district ? ` · ${business.district}` : ""} · {business.category}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs font-medium">/{business.slug}</p>
                    <p className="mt-1 text-[11px] text-alinda-muted">{business.phone || "Telefon eklenmemiş"}</p>
                  </div>
                  <a href={`/${business.slug}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center gap-1 rounded-xl border border-alinda-line px-3 text-xs font-semibold hover:border-alinda-ink">Randevu sayfası <ChevronRight size={15} /></a>
                </div>
              ))}
              {businesses.length === 0 ? <div className="px-6 py-12 text-center text-sm text-alinda-muted">Henüz işletme yok. İlk işletmeyi ekleyin.</div> : null}
            </div>
          </section>

          {showCreate ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-alinda-ink/30 p-4 backdrop-blur-sm">
              <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[30px] border border-alinda-line bg-white p-6 shadow-elevated sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-alinda-accent">Yeni kayıt</p><h2 className="mt-2 text-2xl font-semibold">İşletme oluştur</h2><p className="mt-2 text-sm leading-6 text-alinda-muted">İşletme kaydıyla birlikte işletme sahibinin Firebase hesabı da oluşturulur.</p></div>
                  <button onClick={() => setShowCreate(false)} className="text-sm text-alinda-muted hover:text-alinda-ink">Kapat</button>
                </div>

                <form onSubmit={createBusiness} className="mt-7 space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      ["name", "İşletme adı", "Meltem Beauty Studio"],
                      ["slug", "Randevu bağlantısı", "meltem_beauty"],
                      ["category", "Kategori", "Güzellik Salonu"],
                      ["phone", "Telefon", "05xx xxx xx xx"],
                      ["city", "İl", "Muğla"],
                      ["district", "İlçe", "Bodrum"],
                    ].map(([key, label, placeholder]) => (
                      <label key={key} className="block">
                        <span className="mb-2 block text-sm font-medium">{label}</span>
                        <input required={["name", "slug"].includes(key)} value={form[key as keyof typeof form]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} placeholder={placeholder} className="h-11 w-full rounded-xl border border-alinda-line bg-white px-3 text-sm outline-none focus:border-alinda-ink focus:ring-4 focus:ring-black/5" />
                      </label>
                    ))}
                  </div>

                  <div className="border-t border-alinda-line pt-5">
                    <div className="flex items-center gap-2"><Users size={18} className="text-alinda-accent" /><p className="font-semibold">İşletme sahibi hesabı</p></div>
                    <p className="mt-1 text-xs leading-5 text-alinda-muted">Bu bilgilerle işletme sahibi doğrudan /login ekranından giriş yapabilir.</p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <label className="block"><span className="mb-2 block text-sm font-medium">E-posta</span><input type="email" required value={form.ownerEmail} onChange={(event) => setForm((current) => ({ ...current, ownerEmail: event.target.value }))} placeholder="sahibi@salon.com" className="h-11 w-full rounded-xl border border-alinda-line px-3 text-sm outline-none focus:border-alinda-ink focus:ring-4 focus:ring-black/5" /></label>
                      <label className="block"><span className="mb-2 block text-sm font-medium">Geçici şifre</span><input type="password" required minLength={6} value={form.ownerPassword} onChange={(event) => setForm((current) => ({ ...current, ownerPassword: event.target.value }))} placeholder="En az 6 karakter" className="h-11 w-full rounded-xl border border-alinda-line px-3 text-sm outline-none focus:border-alinda-ink focus:ring-4 focus:ring-black/5" /></label>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button type="button" onClick={() => setShowCreate(false)} className="h-11 rounded-xl border border-alinda-line px-5 text-sm font-semibold">Vazgeç</button>
                    <button type="submit" disabled={saving} className="h-11 rounded-xl bg-alinda-ink px-5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Oluşturuluyor…" : "İşletmeyi oluştur"}</button>
                  </div>
                </form>
              </section>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
