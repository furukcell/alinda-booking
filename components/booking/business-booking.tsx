"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, MapPin, Phone } from "@lucide/react";
import type { Business } from "@/types/business";
import { createBooking } from "@/lib/bookings/create";

const dates = [
  { day: "Pzt", date: "16" },
  { day: "Sal", date: "17" },
  { day: "Çar", date: "18" },
  { day: "Per", date: "19" },
  { day: "Cum", date: "20" }
];

const times = ["09:30", "10:00", "10:30", "11:30", "13:00", "14:30", "15:00", "16:30"];

export function BusinessBooking({ business }: { business: Business }) {
  const [selectedService, setSelectedService] = useState(business.services[0]?.id ?? "");
  const [selectedDate, setSelectedDate] = useState("17");
  const [selectedTime, setSelectedTime] = useState("10:30");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const service = useMemo(
    () => business.services.find((item) => item.id === selectedService),
    [business.services, selectedService]
  );

  async function confirmBooking() {
    if (!service || !name.trim() || !phone.trim() || saving) return;
    setSaving(true);
    setError("");

    try {
      await createBooking({
        businessId: business.id,
        service,
        customerName: name,
        customerPhone: phone,
        date: selectedDate,
        time: selectedTime
      });
      setConfirmed(true);
    } catch {
      setError("Randevu oluşturulamadı. Lütfen bilgilerinizi ve bağlantınızı kontrol edip tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  }

  if (confirmed && service) {
    return (
      <main className="min-h-screen bg-alinda-cream px-4 py-8 sm:px-6">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl items-center justify-center">
          <section className="w-full rounded-[28px] border border-alinda-line bg-white p-7 text-center shadow-elevated sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-alinda-accent-soft text-alinda-accent"><Check size={30} /></div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-alinda-muted">Randevu talebi alındı</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Görüşmek üzere, {name.split(" ")[0]}.</h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-alinda-muted">{business.name} için randevu talebiniz oluşturuldu. İşletme onayından sonra randevunuz kesinleşecektir.</p>
            <div className="mt-7 rounded-2xl bg-alinda-cream p-5 text-left">
              <div className="flex items-center justify-between gap-4 border-b border-alinda-line pb-4"><span className="text-sm text-alinda-muted">Hizmet</span><span className="text-sm font-semibold">{service.name}</span></div>
              <div className="flex items-center justify-between gap-4 border-b border-alinda-line py-4"><span className="text-sm text-alinda-muted">Tarih</span><span className="text-sm font-semibold">{selectedDate} Eylül</span></div>
              <div className="flex items-center justify-between gap-4 pt-4"><span className="text-sm text-alinda-muted">Saat</span><span className="text-sm font-semibold">{selectedTime}</span></div>
            </div>
            <button onClick={() => setConfirmed(false)} className="mt-6 text-sm font-semibold underline underline-offset-4">Yeni randevu oluştur</button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-alinda-cream">
      <header className="border-b border-alinda-line bg-white/85 backdrop-blur"><div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-alinda-ink text-sm font-semibold text-white">A</div><span className="text-sm font-semibold tracking-[0.18em]">ALINDA</span></div><span className="hidden text-xs text-alinda-muted sm:block">Online Randevu</span></div></header>
      <section className="mx-auto max-w-3xl px-4 pb-32 pt-8 sm:px-6 sm:pt-12">
        <div className="rounded-[28px] border border-alinda-line bg-white p-5 shadow-card sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center"><div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl text-2xl font-semibold" style={{ backgroundColor: business.primaryColorSoft, color: business.primaryColor }}>{business.initials}</div><div className="min-w-0"><div className="mb-2 inline-flex rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: business.primaryColorSoft, color: business.primaryColor }}>{business.category}</div><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{business.name}</h1><p className="mt-2 text-sm text-alinda-muted">{business.city}, {business.district} · {business.description}</p><div className="mt-3 flex flex-wrap gap-4 text-xs text-alinda-muted"><span className="inline-flex items-center gap-1.5"><MapPin size={14} />{business.address}</span><span className="inline-flex items-center gap-1.5"><Phone size={14} />{business.phone}</span></div></div></div>
          <div className="my-8 h-px bg-alinda-line" />
          <section><div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-medium uppercase tracking-[0.14em] text-alinda-muted">01</p><h2 className="mt-1 text-xl font-semibold">Hizmet seçin</h2></div><span className="text-xs text-alinda-muted">{business.services.length} hizmet</span></div><div className="space-y-3">{business.services.map((item) => { const active = item.id === selectedService; return <button key={item.id} onClick={() => setSelectedService(item.id)} className={`group flex w-full items-center justify-between rounded-2xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 ${active ? "border-alinda-ink bg-alinda-cream" : "border-alinda-line bg-white hover:border-alinda-ink"}`}><span className="min-w-0 pr-4"><span className="block font-medium">{item.name}</span><span className="mt-1 block text-sm text-alinda-muted">{item.description} · {item.durationMinutes} dk</span></span><span className="shrink-0 text-sm font-semibold">₺{item.price.toLocaleString("tr-TR")}</span></button>; })}</div></section>
          <div className="my-8 h-px bg-alinda-line" />
          <section><div className="mb-4"><p className="text-xs font-medium uppercase tracking-[0.14em] text-alinda-muted">02</p><h2 className="mt-1 text-xl font-semibold">Tarih seçin</h2></div><div className="grid grid-cols-5 gap-2">{dates.map((item) => { const active = item.date === selectedDate; return <button key={item.date} onClick={() => setSelectedDate(item.date)} className={`rounded-2xl border px-2 py-3 text-center transition ${active ? "border-alinda-ink bg-alinda-ink text-white" : "border-alinda-line bg-white hover:border-alinda-ink"}`}><span className={`block text-[11px] ${active ? "text-white/65" : "text-alinda-muted"}`}>{item.day}</span><span className="mt-1 block text-lg font-semibold">{item.date}</span></button>; })}</div></section>
          <div className="my-8 h-px bg-alinda-line" />
          <section><div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-medium uppercase tracking-[0.14em] text-alinda-muted">03</p><h2 className="mt-1 text-xl font-semibold">Uygun saatler</h2></div><span className="text-xs text-alinda-muted">{selectedDate} Eylül</span></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{times.map((time) => { const active = time === selectedTime; return <button key={time} onClick={() => setSelectedTime(time)} className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${active ? "border-alinda-accent bg-alinda-accent text-white" : "border-alinda-line bg-white hover:border-alinda-ink"}`}>{time}</button>; })}</div></section>
          <div className="my-8 h-px bg-alinda-line" />
          <section><div className="mb-4"><p className="text-xs font-medium uppercase tracking-[0.14em] text-alinda-muted">04</p><h2 className="mt-1 text-xl font-semibold">Bilgileriniz</h2></div><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium">Ad Soyad<input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-alinda-line bg-white px-4 text-sm outline-none transition focus:border-alinda-ink" placeholder="Adınız ve soyadınız" /></label><label className="text-sm font-medium">Telefon<input value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-alinda-line bg-white px-4 text-sm outline-none transition focus:border-alinda-ink" placeholder="05xx xxx xx xx" /></label></div></section>
          {error && <div role="alert" className="mt-5 rounded-xl border border-[#E8CACA] bg-[#FBEEEE] px-4 py-3 text-sm text-alinda-danger">{error}</div>}
        </div>
      </section>
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-alinda-line bg-white/90 p-3 backdrop-blur sm:bottom-5 sm:left-1/2 sm:w-full sm:max-w-xl sm:-translate-x-1/2 sm:rounded-2xl sm:border sm:p-3 sm:shadow-elevated"><button onClick={() => void confirmBooking()} disabled={!service || !name.trim() || !phone.trim() || saving} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-alinda-ink text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">{saving ? "Randevu oluşturuluyor…" : "Randevuyu Onayla"}{!saving && <ArrowRight size={17} />}</button></div>
    </main>
  );
}
