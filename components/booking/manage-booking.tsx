"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, Check, Loader2, Search, X } from "lucide-react";

type ManagedBooking = {
  referenceNo: string;
  serviceName: string;
  specialistName: string;
  customerName: string;
  date: string;
  time: string;
  serviceDurationMinutes: number;
  servicePrice: number;
  discount: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | string;
};

export function ManageBooking({ businessId }: { businessId: string }) {
  const [open, setOpen] = useState(false);
  const [referenceNo, setReferenceNo] = useState("");
  const [phone, setPhone] = useState("");
  const [booking, setBooking] = useState<ManagedBooking | null>(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function formatPhone(value: string) {
    let digits = value.replace(/\D/g, "");
    if (digits.startsWith("90")) digits = "0" + digits.slice(2);
    if (digits.startsWith("5")) digits = "0" + digits;
    digits = digits.slice(0, 11);
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    if (digits.length <= 9) return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`;
  }

  function openDialog() {
    setOpen(true);
    setError("");
    setSuccess("");
  }

  function closeDialog() {
    if (loading || cancelling) return;
    setOpen(false);
  }

  async function lookup() {
    const ref = referenceNo.trim().toUpperCase();
    const normalizedPhone = phone.replace(/\D/g, "");
    if (!/^[A-Z2-9]{5}$/.test(ref)) {
      setError("5 karakterli randevu referansınızı girin.");
      return;
    }
    if (!/^05\d{9}$/.test(normalizedPhone)) {
      setError("Geçerli bir Türkiye telefon numarası girin.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setBooking(null);

    try {
      const params = new URLSearchParams({
        businessId,
        referenceNo: ref,
        phone: normalizedPhone
      });
      const response = await fetch(`/api/bookings/manage?${params.toString()}`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Randevu bulunamadı.");
      setBooking(data.booking);
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : "Randevu bulunamadı.");
    } finally {
      setLoading(false);
    }
  }

  async function cancelBooking() {
    if (!booking || cancelling || booking.status === "cancelled") return;
    if (!window.confirm("Bu randevuyu iptal etmek istediğinize emin misiniz?")) return;

    setCancelling(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/bookings/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, referenceNo: booking.referenceNo, phone })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Randevu iptal edilemedi.");
      setBooking(data.booking);
      setSuccess(data.booking.alreadyCancelled ? "Randevunuz zaten iptal edilmiş." : "Randevunuz iptal edildi.");
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : "Randevu iptal edilemedi.");
    } finally {
      setCancelling(false);
    }
  }

  const dialog = open ? (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/35 p-3 sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-label="Randevumu bul">
      <div className="max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:max-h-[90vh] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "#B96862" }}>Randevu yönetimi</p>
            <h2 className="mt-1 text-xl font-bold">Randevumu bul</h2>
            <p className="mt-1 text-xs leading-5" style={{ color: "#8F817E" }}>Randevu referansınız ve randevuda kullandığınız telefon numarası yeterlidir.</p>
          </div>
          <button type="button" onClick={closeDialog} disabled={loading || cancelling} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF6F4] disabled:opacity-50" aria-label="Kapat">
            <X size={17} />
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_1.4fr]">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold">Referans</span>
            <input value={referenceNo} onChange={(event) => setReferenceNo(event.target.value.toUpperCase().replace(/[^A-Z2-9]/g, "").slice(0, 5))} maxLength={5} placeholder="AB12C" className="h-12 w-full rounded-xl border px-3 font-mono text-sm uppercase outline-none" style={{ borderColor: "#F0DFDC" }} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold">Telefon</span>
            <input value={phone} onChange={(event) => setPhone(formatPhone(event.target.value))} maxLength={14} inputMode="tel" autoComplete="tel" placeholder="05xx xxx xx xx" className="h-12 w-full rounded-xl border px-3 text-sm outline-none" style={{ borderColor: "#F0DFDC" }} />
          </label>
        </div>

        <button type="button" onClick={() => void lookup()} disabled={loading} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: "#D88982" }}>
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Randevu aranıyor…" : "Randevumu bul"}
        </button>

        {error && <div role="alert" className="mt-4 rounded-xl border border-[#E9C5C2] bg-[#FFF0EE] px-4 py-3 text-sm text-[#A54D47]">{error}</div>}
        {success && <div role="status" className="mt-4 flex items-center gap-2 rounded-xl border border-[#CBE8D4] bg-[#EAF6EE] px-4 py-3 text-sm text-[#4E8762]"><Check size={16} />{success}</div>}

        {booking && (
          <div className="mt-5 rounded-[22px] border p-5" style={{ borderColor: "#F0DFDC", background: "#FFF6F4" }}>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-sm font-bold tracking-[0.16em]" style={{ color: "#B96862" }}>{booking.referenceNo}</span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold">
                {booking.status === "pending" ? "Bekliyor" : booking.status === "confirmed" ? "Onaylandı" : "İptal"}
              </span>
            </div>
            <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div><p className="text-xs" style={{ color: "#8F817E" }}>Hizmet</p><p className="mt-1 font-bold">{booking.serviceName}</p></div>
              <div><p className="text-xs" style={{ color: "#8F817E" }}>Uzman</p><p className="mt-1 font-bold">{booking.specialistName || "—"}</p></div>
              <div><p className="text-xs" style={{ color: "#8F817E" }}>Tarih</p><p className="mt-1 font-bold">{booking.date}</p></div>
              <div><p className="text-xs" style={{ color: "#8F817E" }}>Saat</p><p className="mt-1 font-bold">{booking.time} · {booking.serviceDurationMinutes} dk</p></div>
            </div>
            <div className="mt-5 flex items-center justify-between border-t pt-4" style={{ borderColor: "#F0DFDC" }}>
              <span className="text-sm" style={{ color: "#8F817E" }}>Toplam</span>
              <span className="text-lg font-bold">₺{booking.totalPrice.toLocaleString("tr-TR")}</span>
            </div>

            {(booking.status === "pending" || booking.status === "confirmed") && (
              <button type="button" onClick={() => void cancelBooking()} disabled={cancelling} className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#F0C7CA] bg-white text-sm font-bold text-[#B96A70] disabled:opacity-50">
                {cancelling && <Loader2 size={15} className="animate-spin" />}
                {cancelling ? "İptal ediliyor…" : "Randevuyu iptal et"}
              </button>
            )}
            {booking.status === "cancelled" && (
              <div className="mt-5 rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-[#B96A70]">Bu randevu iptal edilmiş.</div>
            )}
          </div>
        )}

        <div className="mt-5 flex items-center justify-center gap-2 text-[11px]" style={{ color: "#8F817E" }}>
          <CalendarDays size={13} /> Referans numaranızı randevu onay ekranından bulabilirsiniz.
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2.5 text-xs font-bold shadow-sm transition hover:-translate-y-0.5"
        style={{ borderColor: "#F0DFDC", color: "#B96862" }}
      >
        <Search size={14} />
        Randevum var
      </button>

      {open && createPortal(dialog, document.body)}
    </>
  );
}
