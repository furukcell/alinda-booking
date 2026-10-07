"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Activity, Bot, CheckCircle2, ChevronRight, Edit3, ExternalLink, KeyRound, LayoutDashboard, LogOut, MessageCircle, Plus, ShieldCheck, Store, Ticket, Trash2, Users, X } from "lucide-react";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";

type AdminBusiness = {
  id: string;
  name: string;
  slug: string;
  category: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  ownerId: string;
  ownerEmail: string;
  plan: "starter" | "pro";
  active: boolean;
  billingCycle: "monthly" | "annual";
  subscriptionStatus: "active" | "trialing" | "past_due" | "cancelled" | "expired";
  paymentStatus: "paid" | "pending" | "failed" | "comped";
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  trialEndDate: string | null;
};

const emptyForm = {
  name: "", slug: "", category: "Güzellik Salonu", phone: "", city: "", district: "",
  ownerEmail: "", ownerPassword: "",
};

const emptyEdit = {
  name: "", category: "", phone: "", city: "", district: "", address: "",
  plan: "starter" as "starter" | "pro", active: true,
  billingCycle: "monthly" as "monthly" | "annual",
  subscriptionStatus: "active" as AdminBusiness["subscriptionStatus"],
  paymentStatus: "comped" as AdminBusiness["paymentStatus"],
  subscriptionStartDate: new Date().toISOString().slice(0, 10),
  subscriptionEndDate: "", trialEndDate: "",
};

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AdminBusiness | null>(null);
  const [deleting, setDeleting] = useState<AdminBusiness | null>(null);
  const [resetting, setResetting] = useState<AdminBusiness | null>(null);
  const [resetLink, setResetLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyEdit);

  async function api(path: string, init?: RequestInit) {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error("Oturum bulunamadı.");
    const token = await user.getIdToken();
    const response = await fetch(path, {
      ...init,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(init?.headers || {}) },
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "İşlem başarısız.");
    return data;
  }

  async function loadBusinesses() {
    const data = await api("/api/admin/businesses");
    setBusinesses(data.businesses || []);
  }

  useEffect(() => {
    return onAuthStateChanged(getFirebaseAuth(), async (user) => {
      if (!user) {
        window.location.href = "/login";
        return;
      }
      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/admin/session", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const data = await response.json().catch(() => ({ authorized: false }));
        if (!response.ok || !data.authorized) {
          setAuthorized(false);
          setLoading(false);
          return;
        }
        setAuthorized(true);
        await loadBusinesses();
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Süper admin bilgileri doğrulanamadı.");
      } finally {
        setLoading(false);
      }
    });
  }, []);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  async function createBusiness(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); clearMessages();
    try {
      const data = await api("/api/admin/businesses", { method: "POST", body: JSON.stringify(form) });
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

  function openEdit(business: AdminBusiness) {
    setEditing(business);
    setEditForm({
      name: business.name, category: business.category, phone: business.phone,
      city: business.city, district: business.district, address: business.address,
      plan: business.plan, active: business.active,
      billingCycle: business.billingCycle, subscriptionStatus: business.subscriptionStatus,
      paymentStatus: business.paymentStatus, subscriptionStartDate: business.subscriptionStartDate || "",
      subscriptionEndDate: business.subscriptionEndDate || "", trialEndDate: business.trialEndDate || "",
    });
    clearMessages();
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    setSaving(true); clearMessages();
    try {
      await api("/api/admin/businesses", { method: "PATCH", body: JSON.stringify({ businessId: editing.id, ...editForm }) });
      setBusinesses((current) => current.map((item) => item.id === editing.id ? { ...item, ...editForm } : item));
      setEditing(null);
      setSuccess("İşletme bilgileri güncellendi.");
    } catch (editError) {
      setError(editError instanceof Error ? editError.message : "İşletme güncellenemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteBusiness() {
    if (!deleting) return;
    setSaving(true); clearMessages();
    try {
      await api("/api/admin/businesses", { method: "DELETE", body: JSON.stringify({ businessId: deleting.id, confirmation: deleting.id }) });
      setBusinesses((current) => current.filter((item) => item.id !== deleting.id));
      setDeleting(null);
      setSuccess("İşletme, alt koleksiyonları ve işletme sahibi hesabı silindi.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "İşletme silinemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function createResetLink() {
    if (!resetting) return;
    setSaving(true); clearMessages(); setResetLink("");
    try {
      const data = await api("/api/admin/businesses/reset-password", { method: "POST", body: JSON.stringify({ businessId: resetting.id }) });
      setResetLink(data.link);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Şifre sıfırlama bağlantısı oluşturulamadı.");
    } finally {
      setSaving(false);
    }
  }

  const activeCount = useMemo(() => businesses.filter((item) => item.active).length, [businesses]);

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
            <div><p className="font-semibold tracking-tight">ALINDA</p><p className="text-xs text-alinda-muted">Süper Admin</p></div>
          </div>
          <div className="mt-9 rounded-[22px] bg-alinda-ink p-5 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">Yönetim merkezi</p>
            <p className="mt-2 text-lg font-semibold">İşletmelerinizi yönetin.</p>
            <p className="mt-2 text-xs leading-5 text-white/60">Plan, durum, işletme bilgileri ve owner hesapları tek panelde.</p>
          </div>
          <nav className="mt-7 space-y-1">
            <a href="/admin/dashboard" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-alinda-muted hover:bg-alinda-cream hover:text-alinda-ink"><LayoutDashboard size={18} /> Dashboard</a>
            <a href="/admin/whatsapp" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-alinda-muted hover:bg-alinda-cream hover:text-alinda-ink"><MessageCircle size={18} /> WhatsApp Merkezi</a>
                  <a href="/admin/activity-logs" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-alinda-muted hover:bg-alinda-cream hover:text-alinda-ink"><Activity size={18} /> Aktivite Logları</a>
                  <a href="/admin/ai-secretary" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-alinda-muted hover:bg-alinda-cream hover:text-alinda-ink"><Bot size={18} /> AI Sekreter</a>
                  <a href="/admin/coupons" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-alinda-muted hover:bg-alinda-cream hover:text-alinda-ink"><Ticket size={18} /> Kuponlar</a>
            <div className="flex items-center gap-3 rounded-xl bg-alinda-cream px-3 py-2.5 text-sm font-medium"><Store size={18} /> İşletmeler</div>
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
              <p className="mt-2 max-w-2xl text-sm leading-6 text-alinda-muted">ALINDA'ya bağlı işletmeleri, planlarını ve owner hesaplarını buradan yönetin.</p>
            </div>
            <button onClick={() => { setShowCreate(true); clearMessages(); }} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-alinda-ink px-5 text-sm font-semibold text-white shadow-card"><Plus size={17} /> Yeni işletme</button>
          </header>

          {success ? <div className="mt-6 flex items-center gap-2 rounded-2xl border border-[#CBE8D4] bg-[#EAF6EE] px-4 py-3 text-sm text-[#4E8762]"><CheckCircle2 size={18} />{success}</div> : null}
          {error ? <div className="mt-6 rounded-2xl border border-[#E8CACA] bg-[#FBEEEE] px-4 py-3 text-sm text-alinda-danger">{error}</div> : null}

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <Stat label="Toplam işletme" value={businesses.length} />
            <Stat label="Aktif işletme" value={activeCount} />
            <Stat label="Pro işletme" value={businesses.filter((item) => item.plan === "pro").length} />
          </div>

          <section className="mt-6 overflow-hidden rounded-[26px] border border-alinda-line bg-white shadow-card">
            <div className="border-b border-alinda-line px-5 py-5 sm:px-6">
              <h2 className="font-semibold">İşletme listesi</h2>
              <p className="mt-1 text-xs text-alinda-muted">Her işletmenin owner hesabı, planı ve public randevu bağlantısı burada görünür.</p>
            </div>
            <div className="divide-y divide-alinda-line">
              {businesses.map((business) => (
                <div key={business.id} className="px-5 py-5 sm:px-6">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-alinda-accent-soft text-alinda-accent"><Store size={20} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{business.name}</p>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${business.active ? "bg-[#EAF6EE] text-[#4E8762]" : "bg-[#F4EAEA] text-[#A55E63]"}`}>{business.active ? "Aktif" : "Pasif"}</span>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${business.plan === "pro" ? "bg-alinda-accent-soft text-alinda-accent" : "bg-alinda-cream text-alinda-muted"}`}>{business.plan === "pro" ? "PRO" : "STARTER"}</span>
                      </div>
                      <p className="mt-1 text-xs text-alinda-muted">{business.city}{business.district ? ` · ${business.district}` : ""} · {business.category}</p>
                    </div>
                    <div className="min-w-0 xl:w-60">
                      <p className="truncate text-xs font-medium">{business.ownerEmail || "Owner e-postası yok"}</p>
                      <p className="mt-1 text-[11px] text-alinda-muted">/{business.slug} · {business.phone || "Telefon yok"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a href={`/admin/businesses/${business.id}`} className="inline-flex h-9 items-center gap-1 rounded-xl border border-alinda-line px-3 text-xs font-semibold hover:border-alinda-ink"><ChevronRight size={14} /> Detay</a>\n                      <a href={`/${business.slug}`} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1 rounded-xl border border-alinda-line px-3 text-xs font-semibold hover:border-alinda-ink"><ExternalLink size={14} /> Sayfa</a>
                      <button onClick={() => openEdit(business)} className="inline-flex h-9 items-center gap-1 rounded-xl border border-alinda-line px-3 text-xs font-semibold hover:border-alinda-ink"><Edit3 size={14} /> Düzenle</button>
                      <button onClick={() => { setResetting(business); setResetLink(""); clearMessages(); }} className="inline-flex h-9 items-center gap-1 rounded-xl border border-alinda-line px-3 text-xs font-semibold hover:border-alinda-ink"><KeyRound size={14} /> Şifre</button>
                      <button onClick={() => { setDeleting(business); clearMessages(); }} className="inline-flex h-9 items-center gap-1 rounded-xl border border-[#E8CACA] px-3 text-xs font-semibold text-[#A55E63] hover:bg-[#FBEEEE]"><Trash2 size={14} /> Sil</button>
                    </div>
                  </div>
                </div>
              ))}
              {businesses.length === 0 ? <div className="px-6 py-12 text-center text-sm text-alinda-muted">Henüz işletme yok. İlk işletmeyi ekleyin.</div> : null}
            </div>
          </section>
        </section>
      </div>

      {showCreate ? <Modal title="Yeni işletme" onClose={() => setShowCreate(false)}>
        <form onSubmit={createBusiness} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="İşletme adı" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Meltem Beauty Studio" />
            <Input label="Randevu bağlantısı" required value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} placeholder="meltem_beauty" />
            <Input label="Kategori" value={form.category} onChange={(v) => setForm({ ...form, category: v })} placeholder="Güzellik Salonu" />
            <Input label="Telefon" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="05xx xxx xx xx" />
            <Input label="İl" value={form.city} onChange={(v) => setForm({ ...form, city: v })} placeholder="Muğla" />
            <Input label="İlçe" value={form.district} onChange={(v) => setForm({ ...form, district: v })} placeholder="Bodrum" />
            <Input label="Owner e-posta" required type="email" value={form.ownerEmail} onChange={(v) => setForm({ ...form, ownerEmail: v })} placeholder="sahibi@salon.com" />
            <Input label="Geçici şifre" required type="password" value={form.ownerPassword} onChange={(v) => setForm({ ...form, ownerPassword: v })} placeholder="En az 6 karakter" />
          </div>
          <Actions saving={saving} onCancel={() => setShowCreate(false)} submit="İşletmeyi oluştur" />
        </form>
      </Modal> : null}

      {editing ? <Modal title="İşletmeyi düzenle" onClose={() => setEditing(null)}>
        <form onSubmit={saveEdit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="İşletme adı" required value={editForm.name} onChange={(v) => setEditForm({ ...editForm, name: v })} />
            <Input label="Kategori" value={editForm.category} onChange={(v) => setEditForm({ ...editForm, category: v })} />
            <Input label="Telefon" value={editForm.phone} onChange={(v) => setEditForm({ ...editForm, phone: v })} />
            <Input label="İl" value={editForm.city} onChange={(v) => setEditForm({ ...editForm, city: v })} />
            <Input label="İlçe" value={editForm.district} onChange={(v) => setEditForm({ ...editForm, district: v })} />
            <Input label="Adres" value={editForm.address} onChange={(v) => setEditForm({ ...editForm, address: v })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><span className="mb-2 block text-sm font-medium">Plan</span><select value={editForm.plan} onChange={(e) => setEditForm({ ...editForm, plan: e.target.value as "starter" | "pro" })} className="h-11 w-full rounded-xl border border-alinda-line bg-white px-3 text-sm"><option value="starter">Starter</option><option value="pro">Pro</option></select></label>
            <label className="flex h-11 items-center gap-3 rounded-xl border border-alinda-line px-3 text-sm"><input type="checkbox" checked={editForm.active} onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })} /> İşletme aktif</label>
          </div>
          <Actions saving={saving} onCancel={() => setEditing(null)} submit="Değişiklikleri kaydet" />
        </form>
      </Modal> : null}

      {resetting ? <Modal title="Owner şifre sıfırlama" onClose={() => setResetting(null)}>
        <p className="text-sm leading-6 text-alinda-muted"><strong>{resetting.name}</strong> için Firebase'in güvenli şifre sıfırlama bağlantısı oluşturulacak.</p>
        <p className="mt-2 text-xs text-alinda-muted">Owner: {resetting.ownerEmail || "E-posta bulunamadı"}</p>
        {resetLink ? <div className="mt-5 rounded-2xl border border-alinda-line bg-alinda-cream p-4"><p className="text-xs font-semibold">Sıfırlama bağlantısı</p><textarea readOnly value={resetLink} className="mt-2 min-h-28 w-full resize-none rounded-xl border border-alinda-line bg-white p-3 text-xs" /><button type="button" onClick={() => navigator.clipboard?.writeText(resetLink)} className="mt-3 h-10 rounded-xl bg-alinda-ink px-4 text-xs font-semibold text-white">Bağlantıyı kopyala</button></div> : <button type="button" onClick={createResetLink} disabled={saving} className="mt-6 h-11 rounded-xl bg-alinda-ink px-5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Oluşturuluyor…" : "Sıfırlama bağlantısı oluştur"}</button>}
      </Modal> : null}

      {deleting ? <Modal title="İşletmeyi sil" onClose={() => setDeleting(null)}>
        <div className="rounded-2xl border border-[#E8CACA] bg-[#FBEEEE] p-4 text-sm leading-6 text-[#8F5156]"><strong>{deleting.name}</strong> işletmesi, alt koleksiyonları ve Firebase owner hesabı kalıcı olarak silinecek.</div>
        <p className="mt-4 text-sm text-alinda-muted">Devam etmek için işletme ID'sini aynen yazın:</p>
        <div className="mt-2 rounded-xl bg-alinda-cream px-3 py-3 font-mono text-xs">{deleting.id}</div>
        <DeleteConfirm business={deleting} saving={saving} onDelete={deleteBusiness} onCancel={() => setDeleting(null)} />
      </Modal> : null}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-[22px] border border-alinda-line bg-white p-5 shadow-card"><p className="text-xs text-alinda-muted">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></div>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-alinda-ink/30 p-4 backdrop-blur-sm"><section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[30px] border border-alinda-line bg-white p-6 shadow-elevated sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-alinda-accent">Super Admin</p><h2 className="mt-2 text-2xl font-semibold">{title}</h2></div><button onClick={onClose} className="rounded-full p-2 text-alinda-muted hover:bg-alinda-cream"><X size={18} /></button></div><div className="mt-7">{children}</div></section></div>;
}

function Input({ label, value, onChange, placeholder, required, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean; type?: string }) {
  return <label className="block"><span className="mb-2 block text-sm font-medium">{label}</span><input type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-11 w-full rounded-xl border border-alinda-line bg-white px-3 text-sm outline-none focus:border-alinda-ink focus:ring-4 focus:ring-black/5" /></label>;
}

function Actions({ saving, onCancel, submit }: { saving: boolean; onCancel: () => void; submit: string }) {
  return <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={onCancel} className="h-11 rounded-xl border border-alinda-line px-5 text-sm font-semibold">Vazgeç</button><button type="submit" disabled={saving} className="h-11 rounded-xl bg-alinda-ink px-5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Kaydediliyor…" : submit}</button></div>;
}

function DeleteConfirm({ business, saving, onDelete, onCancel }: { business: AdminBusiness; saving: boolean; onDelete: () => void; onCancel: () => void }) {
  const [value, setValue] = useState("");
  return <div className="mt-5"><input value={value} onChange={(e) => setValue(e.target.value)} placeholder={business.id} className="h-11 w-full rounded-xl border border-alinda-line px-3 font-mono text-xs outline-none" /><div className="mt-4 flex justify-end gap-3"><button type="button" onClick={onCancel} className="h-11 rounded-xl border border-alinda-line px-5 text-sm font-semibold">Vazgeç</button><button type="button" disabled={saving || value !== business.id} onClick={onDelete} className="h-11 rounded-xl bg-[#A55E63] px-5 text-sm font-semibold text-white disabled:opacity-40">{saving ? "Siliniyor…" : "Kalıcı olarak sil"}</button></div></div>;
}
