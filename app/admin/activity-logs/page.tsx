"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowLeft, CheckCircle2, CircleDollarSign, Eye, ShieldOff, Store, UserPlus, Trash2 } from "lucide-react";
import { waitForFirebaseUser } from "@/lib/firebase/auth-ready";

type Log = {
  id: string;
  adminEmail: string;
  action: string;
  businessId: string | null;
  businessName: string | null;
  summary: string;
  details: Record<string, unknown>;
  createdAt: string | null;
};

const actionMeta: Record<string, { label: string; icon: typeof Activity }> = {
  business_created: { label: "İşletme oluşturuldu", icon: UserPlus },
  business_updated: { label: "İşletme güncellendi", icon: Store },
  business_deleted: { label: "İşletme silindi", icon: Trash2 },
  subscription_updated: { label: "Abonelik güncellendi", icon: CircleDollarSign },
  access_changed: { label: "Erişim değiştirildi", icon: ShieldOff },
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function actionInfo(action: string) {
  return actionMeta[action] || { label: action, icon: Activity };
}

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const user = await waitForFirebaseUser();
        if (!user) {
          window.location.href = "/login";
          return;
        }
        const token = await user.getIdToken();
        const response = await fetch("/api/admin/activity-logs", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Loglar alınamadı.");
        setLogs(data.logs || []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Loglar alınamadı.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  return (
    <main className="min-h-screen bg-alinda-cream text-alinda-ink">
      <div className="mx-auto min-h-screen max-w-[1200px]">
        <header className="border-b border-alinda-line bg-white px-4 py-5 sm:px-6 lg:px-10 lg:py-7">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-alinda-muted hover:text-alinda-ink">
            <ArrowLeft size={16} /> İşletmelere dön
          </Link>
          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-alinda-accent">Sistem yönetimi</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Aktivite Logları</h1>
              <p className="mt-2 text-sm text-alinda-muted">Super Admin tarafından yapılan kritik işlemlerin son 100 kaydı.</p>
            </div>
            <div className="hidden rounded-2xl border border-alinda-line bg-white px-4 py-3 text-sm shadow-card sm:block">
              <div className="flex items-center gap-2"><Activity size={17} /> {logs.length} kayıt</div>
            </div>
          </div>
        </header>

        <section className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {loading ? (
            <div className="rounded-[24px] border border-alinda-line bg-white p-8 text-sm text-alinda-muted shadow-card">Loglar yükleniyor…</div>
          ) : error ? (
            <div className="rounded-[24px] border border-alinda-line bg-white p-8 text-sm text-alinda-danger shadow-card">{error}</div>
          ) : logs.length === 0 ? (
            <div className="rounded-[24px] border border-alinda-line bg-white p-10 text-center shadow-card">
              <Activity size={28} className="mx-auto text-alinda-muted" />
              <p className="mt-4 font-semibold">Henüz aktivite kaydı yok.</p>
              <p className="mt-2 text-sm text-alinda-muted">Super Admin işlemleri burada görünmeye başlayacak.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[24px] border border-alinda-line bg-white shadow-card">
              <div className="divide-y divide-alinda-line">
                {logs.map((log) => {
                  const meta = actionInfo(log.action);
                  const Icon = meta.icon;
                  return (
                    <article key={log.id} className="flex gap-4 p-5 sm:p-6">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-alinda-cream text-alinda-accent">
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold">{log.summary || meta.label}</p>
                            <p className="mt-1 text-xs text-alinda-muted">{meta.label} · {log.businessName || "Sistem"}</p>
                          </div>
                          <p className="text-xs text-alinda-muted">{formatDate(log.createdAt)}</p>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-alinda-cream px-3 py-1">{log.adminEmail || "Super Admin"}</span>
                          {log.businessId && (
                            <Link href={`/admin/businesses/${log.businessId}`} className="inline-flex items-center gap-1 rounded-full border border-alinda-line px-3 py-1 font-medium hover:border-alinda-ink">
                              <Eye size={12} /> İşletmeyi görüntüle
                            </Link>
                          )}
                        </div>
                        {Object.keys(log.details || {}).length > 0 && (
                          <details className="mt-3">
                            <summary className="cursor-pointer text-xs font-semibold text-alinda-muted">Detayları göster</summary>
                            <pre className="mt-2 overflow-x-auto rounded-xl bg-alinda-cream p-3 text-[11px] leading-5">{JSON.stringify(log.details, null, 2)}</pre>
                          </details>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
