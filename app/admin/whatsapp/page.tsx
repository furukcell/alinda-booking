import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, MessageCircle, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import { getFirebaseAuth } from "@/lib/firebase/client";

type Row = { id: string; name: string; ownerEmail: string; plan: "starter" | "pro"; accessEnabled: boolean; connected: boolean; displayPhoneNumber: string; verifiedName: string; phoneNumberId: string; wabaId: string; dailySummaryEnabled: boolean };

export default function AdminWhatsAppPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function load() {
    setLoading(true); setError("");
    try {
      const user = getFirebaseAuth().currentUser;
      if (!user) throw new Error("Oturum bulunamadı.");
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/whatsapp", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Veriler alınamadı.");
      setRows(data.businesses || []);
    } catch (e) { setError(e instanceof Error ? e.message : "Veriler alınamadı."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  const connected = rows.filter((x) => x.connected).length;
  const pro = rows.filter((x) => x.plan === "pro").length;
  const summary = rows.filter((x) => x.dailySummaryEnabled).length;
  return <main className="min-h-screen bg-alinda-cream text-alinda-ink"><div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-alinda-accent">Sistem yönetimi</p><h1 className="mt-2 text-3xl font-semibold">WhatsApp Merkezi</h1><p className="mt-2 text-sm text-alinda-muted">İşletmelerin WhatsApp bağlantılarını ve Pro otomasyon durumlarını tek ekrandan takip edin.</p></div><button onClick={() => void load()} className="inline-flex h-10 items-center gap-2 rounded-full border border-alinda-line bg-white px-4 text-sm font-semibold"><RefreshCw size={15}/> Yenile</button></header>
    <div className="mt-7 grid gap-4 sm:grid-cols-3"><Stat label="Bağlı WhatsApp" value={connected}/><Stat label="Pro işletme" value={pro}/><Stat label="Günlük özet açık" value={summary}/></div>
    {error && <div className="mt-5 rounded-2xl border border-[#E8CACA] bg-[#FBEEEE] px-4 py-3 text-sm text-[#A55E63]">{error}</div>}
    <section className="mt-6 overflow-hidden rounded-[26px] border border-alinda-line bg-white shadow-card"><div className="border-b border-alinda-line px-5 py-5"><h2 className="font-semibold">WhatsApp bağlantıları</h2><p className="mt-1 text-xs text-alinda-muted">Token ve gizli bilgiler gösterilmez.</p></div>
      {loading ? <div className="px-6 py-12 text-center text-sm text-alinda-muted">Yükleniyor…</div> : <div className="divide-y divide-alinda-line">{rows.map((x) => <div key={x.id} className="px-5 py-5 sm:px-6"><div className="flex flex-col gap-4 xl:flex-row xl:items-center"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-alinda-accent-soft text-alinda-accent"><MessageCircle size={20}/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{x.name}</p><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${x.connected ? "bg-[#EAF6EE] text-[#4E8762]" : "bg-[#F4EAEA] text-[#A55E63]"}`}>{x.connected ? "Bağlı" : "Bağlı değil"}</span><span className="rounded-full bg-alinda-cream px-2.5 py-1 text-[10px] font-semibold">{x.plan === "pro" ? "PRO" : "STARTER"}</span></div><p className="mt-1 text-xs text-alinda-muted">{x.ownerEmail || "Owner e-postası yok"}</p></div><div className="text-sm"><p className="font-medium">{x.displayPhoneNumber || "Telefon yok"}</p><p className="mt-1 text-xs text-alinda-muted">{x.verifiedName || "Doğrulanmış isim yok"}</p></div><div className="flex flex-wrap gap-2 text-xs"><span className="inline-flex items-center gap-1 rounded-xl border border-alinda-line px-3 py-2">{x.dailySummaryEnabled ? <CheckCircle2 size={14} className="text-alinda-success"/> : <XCircle size={14} className="text-alinda-muted"/>} Günlük özet</span><Link href={`/admin/businesses/${x.id}`} className="rounded-xl border border-alinda-line px-3 py-2 font-semibold">Detay</Link></div></div></div>)}</div>}
    </section>
  </div></main>;
}
function Stat({label,value}:{label:string;value:number}){return <div className="rounded-[22px] border border-alinda-line bg-white p-5 shadow-card"><p className="text-xs text-alinda-muted">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></div>}