"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, CirclePlus, Edit3, Ticket, Trash2, X } from "lucide-react";
import { waitForFirebaseUser } from "@/lib/firebase/auth-ready";

type Coupon = {
  id: string; code: string; name: string; type: "percent" | "fixed"; value: number;
  businessId: string | null; startDate: string | null; endDate: string | null; active: boolean;
  usageLimit: number | null; usageCount: number;
};

type Business = { id: string; name: string };

const empty = { code: "", name: "", type: "percent" as "percent" | "fixed", value: "10", businessId: "", startDate: "", endDate: "", usageLimit: "" };

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function authFetch(url: string, options: RequestInit = {}) {
    const user = await waitForFirebaseUser();
    if (!user) { window.location.href = "/login"; throw new Error("Oturum bulunamadı."); }
    const token = await user.getIdToken();
    return fetch(url, { ...options, headers: { ...(options.headers || {}), Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
  }

  async function load() {
    setLoading(true); setError("");
    try {
      const [couponResponse, businessResponse] = await Promise.all([
        authFetch("/api/admin/coupons"),
        authFetch("/api/admin/businesses"),
      ]);
      const couponData = await couponResponse.json();
      const businessData = await businessResponse.json();
      if (!couponResponse.ok) throw new Error(couponData.error || "Kuponlar alınamadı.");
      if (!businessResponse.ok) throw new Error(businessData.error || "İşletmeler alınamadı.");
      setCoupons(couponData.coupons || []);
      setBusinesses((businessData.businesses || []).map((x: Business) => ({ id: x.id, name: x.name })));
    } catch (e) { setError(e instanceof Error ? e.message : "Veriler alınamadı."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  function openCreate() { setEditing(null); setForm(empty); setShowForm(true); setError(""); setSuccess(""); }
  function openEdit(coupon: Coupon) {
    setEditing(coupon);
    setForm({ code: coupon.code, name: coupon.name || "", type: coupon.type, value: String(coupon.value), businessId: coupon.businessId || "", startDate: coupon.startDate || "", endDate: coupon.endDate || "", usageLimit: coupon.usageLimit == null ? "" : String(coupon.usageLimit) });
    setShowForm(true); setError(""); setSuccess("");
  }

  async function save() {
    setSaving(true); setError(""); setSuccess("");
    try {
      const payload = { ...form, value: Number(form.value), usageLimit: form.usageLimit ? Number(form.usageLimit) : null };
      const response = await authFetch("/api/admin/coupons", { method: editing ? "PATCH" : "POST", body: JSON.stringify(editing ? { ...payload, id: editing.id, code: undefined } : payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Kupon kaydedilemedi.");
      setSuccess(editing ? "Kupon güncellendi." : "Kupon oluşturuldu.");
      setShowForm(false); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Kupon kaydedilemedi."); }
    finally { setSaving(false); }
  }

  async function toggle(coupon: Coupon) {
    setBusyId(coupon.id); setError("");
    try {
      const response = await authFetch("/api/admin/coupons", { method: "PATCH", body: JSON.stringify({ id: coupon.id, active: !coupon.active }) });
      if (!response.ok) throw new Error("Kupon durumu değiştirilemedi.");
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "İşlem başarısız."); }
    finally { setBusyId(null); }
  }

  async function remove(coupon: Coupon) {
    if (!window.confirm(`“${coupon.code}” kuponu silinsin mi?`)) return;
    setBusyId(coupon.id); setError("");
    try {
      const response = await authFetch("/api/admin/coupons", { method: "DELETE", body: JSON.stringify({ id: coupon.id }) });
      if (!response.ok) { const data = await response.json(); throw new Error(data.error || "Kupon silinemedi."); }
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Kupon silinemedi."); }
    finally { setBusyId(null); }
  }

  function businessName(id: string | null) { return id ? businesses.find((x) => x.id === id)?.name || id : "Tüm işletmeler"; }

  return <main className="min-h-screen bg-alinda-cream text-alinda-ink">
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><Link href="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-alinda-muted hover:text-alinda-ink"><ArrowLeft size={16}/> İşletmelere dön</Link><p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-alinda-accent">Pazarlama</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Kuponlar</h1><p className="mt-2 text-sm text-alinda-muted">Tüm işletmelere veya tek bir işletmeye özel indirim kodları oluşturun.</p></div>
        <button onClick={openCreate} className="inline-flex h-10 items-center gap-2 rounded-full bg-alinda-ink px-4 text-sm font-semibold text-white"><CirclePlus size={16}/> Yeni kupon</button>
      </header>

      {error && <div className="mt-5 rounded-2xl border border-[#E8CACA] bg-[#FBEEEE] px-4 py-3 text-sm text-[#A55E63]">{error}</div>}
      {success && <div className="mt-5 rounded-2xl border border-[#CBE8D4] bg-[#EAF6EE] px-4 py-3 text-sm text-[#4E8762]">{success}</div>}

      <section className="mt-6 overflow-hidden rounded-[26px] border border-alinda-line bg-white shadow-card">
        {loading ? <div className="p-10 text-center text-sm text-alinda-muted">Kuponlar yükleniyor…</div> : coupons.length === 0 ? <div className="p-12 text-center"><Ticket size={30} className="mx-auto text-alinda-muted"/><p className="mt-4 font-semibold">Henüz kupon yok.</p><p className="mt-2 text-sm text-alinda-muted">İlk kampanyanızı oluşturabilirsiniz.</p></div> :
        <div className="divide-y divide-alinda-line">{coupons.map((coupon) => <div key={coupon.id} className="p-5 sm:p-6"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex min-w-0 items-center gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-alinda-cream text-alinda-accent"><Ticket size={20}/></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-mono font-bold tracking-wider">{coupon.code}</p><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${coupon.active ? "bg-[#EAF6EE] text-[#4E8762]" : "bg-[#F4EAEA] text-[#A55E63]"}`}>{coupon.active ? "Aktif" : "Pasif"}</span></div><p className="mt-1 text-xs text-alinda-muted">{coupon.name} · {businessName(coupon.businessId)}</p></div></div><div className="flex flex-wrap items-center gap-2 text-xs"><span className="rounded-xl border border-alinda-line px-3 py-2 font-semibold">{coupon.type === "percent" ? `%${coupon.value}` : `₺${coupon.value.toLocaleString("tr-TR")}`} indirim</span><span className="rounded-xl border border-alinda-line px-3 py-2">{coupon.usageCount || 0}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""} kullanım</span><button onClick={() => void toggle(coupon)} className="rounded-xl border border-alinda-line px-3 py-2 font-semibold">{busyId === coupon.id && <Loader2 size={14} className="mr-1 inline animate-spin" />}{coupon.active ? "Pasifleştir" : "Aktifleştir"}</button><button onClick={() => openEdit(coupon)} className="rounded-xl border border-alinda-line px-3 py-2"><Edit3 size={14}/></button><button disabled={busyId === coupon.id} onClick={() => void remove(coupon)} className="rounded-xl border border-alinda-line px-3 py-2 text-alinda-danger disabled:opacity-50">{busyId === coupon.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14}/>}</button></div></div></div>)}</div>}
      </section>

      {showForm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-alinda-ink/30 p-4 backdrop-blur-sm"><section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[30px] border border-alinda-line bg-white p-6 shadow-elevated sm:p-8"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-alinda-accent">Kupon</p><h2 className="mt-2 text-2xl font-semibold">{editing ? "Kuponu düzenle" : "Yeni kupon"}</h2></div><button onClick={() => setShowForm(false)} className="rounded-full p-2 text-alinda-muted hover:bg-alinda-cream"><X size={18}/></button></div><div className="mt-7 grid gap-4 sm:grid-cols-2">
        <Field label="Kupon kodu" value={form.code} disabled={!!editing} onChange={(v) => setForm({ ...form, code: v.toUpperCase().replace(/\s+/g, "") })} placeholder="ALINDA20"/>
        <Field label="Kampanya adı" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="İlk randevu indirimi"/>
        <label className="text-sm font-semibold"><span>İndirim tipi</span><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "percent" | "fixed" })} className="mt-2 h-11 w-full rounded-xl border border-alinda-line bg-white px-3"><option value="percent">Yüzde (%)</option><option value="fixed">Sabit tutar (₺)</option></select></label>
        <Field label="İndirim değeri" type="number" value={form.value} onChange={(v) => setForm({ ...form, value: v })} placeholder="20"/>
        <label className="text-sm font-semibold sm:col-span-2"><span>İşletme</span><select value={form.businessId} onChange={(e) => setForm({ ...form, businessId: e.target.value })} className="mt-2 h-11 w-full rounded-xl border border-alinda-line bg-white px-3"><option value="">Tüm işletmeler</option>{businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
        <Field label="Başlangıç" type="date" value={form.startDate} onChange={(v) => setForm({ ...form, startDate: v })}/>
        <Field label="Bitiş" type="date" value={form.endDate} onChange={(v) => setForm({ ...form, endDate: v })}/>
        <Field label="Kullanım limiti" type="number" value={form.usageLimit} onChange={(v) => setForm({ ...form, usageLimit: v })} placeholder="Sınırsız"/>
      </div><button onClick={() => void save()} disabled={saving} className="mt-6 h-12 w-full rounded-2xl bg-alinda-ink text-sm font-semibold text-white disabled:opacity-50">{saving && <Loader2 size={16} className="mr-2 inline animate-spin" />}{saving ? "Kaydediliyor…" : editing ? "Değişiklikleri kaydet" : "Kupon oluştur"}</button></section></div>}
    </div>
  </main>;
}

function Field({ label, value, onChange, placeholder, type = "text", disabled = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; disabled?: boolean }) {
  return <label className="text-sm font-semibold"><span>{label}</span><input disabled={disabled} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-2 h-11 w-full rounded-xl border border-alinda-line bg-white px-3 outline-none disabled:bg-alinda-cream"/></label>;
}
