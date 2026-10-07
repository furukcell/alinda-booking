"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Check, Clock3, MapPin, Phone, Sparkles } from "lucide-react";
import type { Business } from "@/types/business";
import { createBooking } from "@/lib/bookings/create";
import { getAvailableSlots, getNextDates, type AvailableDate } from "@/lib/bookings/availability";

const rose = "#D88982";
const roseDark = "#B96862";
const roseSoft = "#FBE5E3";
const rosePale = "#FFF6F4";
const text = "#2D2625";
const muted = "#8F817E";
const line = "#F0DFDC";

export function BusinessBooking({ business }: { business: Business }) {
  const dates = useMemo(() => getNextDates(14), []);
  const [selectedService, setSelectedService] = useState(business.services[0]?.id ?? "");
  const [selectedDate, setSelectedDate] = useState(dates[0]?.id ?? "");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const service = useMemo(() => business.services.find((item) => item.id === selectedService), [business.services, selectedService]);
  const selectedDateInfo = useMemo<AvailableDate | undefined>(() => dates.find((item) => item.id === selectedDate), [dates, selectedDate]);

  useEffect(() => {
    let cancelled = false;

    async function loadSlots() {
      if (!service || !selectedDateInfo) {
        setAvailableTimes([]);
        setSelectedTime("");
        setLoadingSlots(false);
        return;
      }

      setLoadingSlots(true);
      setSelectedTime("");
      setError("");

      try {
        const slots = await getAvailableSlots(business.id, selectedDateInfo.id, selectedDateInfo.dayId, service.durationMinutes);
        if (cancelled) return;
        setAvailableTimes(slots);
        setSelectedTime(slots[0] ?? "");
      } catch {
        if (cancelled) return;
        setAvailableTimes([]);
        setSelectedTime("");
        setError("Uygun saatler yüklenemedi. Lütfen tekrar deneyin.");
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    }

    void loadSlots();
    return () => { cancelled = true; };
  }, [business.id, selectedDateInfo, service]);

  async function confirmBooking() {
    if (!service || !selectedDateInfo || !selectedTime || !name.trim() || !phone.trim() || saving) return;

    setSaving(true);
    setError("");

    try {
      await createBooking({
        businessId: business.id,
        service,
        customerName: name,
        customerPhone: phone,
        date: selectedDateInfo.id,
        time: selectedTime
      });
      setConfirmed(true);
    } catch (bookingError) {
      if (bookingError instanceof Error && bookingError.message === "SLOT_TAKEN") {
        setAvailableTimes((current) => current.filter((time) => time !== selectedTime));
        setSelectedTime("");
        setError("Bu saat az önce başka bir müşteri tarafından alındı. Lütfen başka bir saat seçin.");
      } else {
        setError("Randevu oluşturulamadı. Lütfen bilgilerinizi ve bağlantınızı kontrol edip tekrar deneyin.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (confirmed && service && selectedDateInfo) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6" style={{ background: rosePale, color: text }}>
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl items-center justify-center">
          <section className="w-full rounded-[32px] border bg-white p-7 text-center shadow-[0_18px_60px_rgba(185,104,98,0.14)] sm:p-10" style={{ borderColor: line }}>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ background: roseSoft, color: roseDark }}><Check size={30} /></div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Randevu talebi alındı</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Görüşmek üzere, {name.split(" ")[0]}.</h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6" style={{ color: muted }}>{business.name} için randevu talebiniz oluşturuldu. İşletme onayından sonra randevunuz kesinleşecektir.</p>
            <div className="mt-7 rounded-[22px] p-5 text-left" style={{ background: rosePale }}>
              <div className="flex items-center justify-between gap-4 border-b pb-4" style={{ borderColor: line }}><span className="text-sm" style={{ color: muted }}>Hizmet</span><span className="text-right text-sm font-bold">{service.name}</span></div>
              <div className="flex items-center justify-between gap-4 border-b py-4" style={{ borderColor: line }}><span className="text-sm" style={{ color: muted }}>Tarih</span><span className="text-sm font-bold">{selectedDateInfo.dateLabel}</span></div>
              <div className="flex items-center justify-between gap-4 pt-4"><span className="text-sm" style={{ color: muted }}>Saat</span><span className="text-sm font-bold">{selectedTime}</span></div>
            </div>
            <button onClick={() => setConfirmed(false)} className="mt-6 text-sm font-bold underline underline-offset-4" style={{ color: roseDark }}>Yeni randevu oluştur</button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-28" style={{ background: rosePale, color: text }}>
      <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur-xl" style={{ borderColor: line }}>
        <div className="mx-auto flex h-[68px] max-w-3xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold text-white shadow-sm" style={{ background: rose }}>A</div>
            <div><p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: muted }}>ALINDA</p><p className="text-xs font-medium">Online Randevu</p></div>
          </div>
          <div className="hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold sm:flex" style={{ background: roseSoft, color: roseDark }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: rose }} />Online</div>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 pt-5 sm:px-6 sm:pt-8">
        <div className="overflow-hidden rounded-[30px] border bg-white shadow-[0_18px_60px_rgba(185,104,98,0.10)]" style={{ borderColor: line }}>
          <div className="relative overflow-hidden px-5 pb-6 pt-6 sm:px-8">
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full opacity-60" style={{ background: roseSoft }} />
            <div className="pointer-events-none absolute -left-24 bottom-0 h-40 w-40 rounded-full opacity-50" style={{ background: "#FCEEEB" }} />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-sm font-medium" style={{ color: roseDark }}>Merhaba 👋</p><h1 className="mt-1 text-[28px] font-bold leading-tight tracking-tight sm:text-3xl">Randevunuzu kolayca oluşturun</h1></div>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] text-base font-bold sm:h-16 sm:w-16 sm:text-lg" style={{ background: roseSoft, color: roseDark }}>{business.initials}</div>
              </div>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: rosePale, color: roseDark }}><Sparkles size={18} /></div>
                <div className="min-w-0"><p className="truncate text-sm font-bold">{business.name}</p><p className="mt-0.5 truncate text-xs" style={{ color: muted }}>{business.category} · {business.district}, {business.city}</p></div>
              </div>
            </div>
          </div>

          <div className="border-t px-5 py-6 sm:px-8" style={{ borderColor: line }}>
            <section>
              <div className="mb-4 flex items-end justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: roseDark }}>01</p><h2 className="mt-1 text-xl font-bold">Hizmet seçin</h2></div><span className="text-xs" style={{ color: muted }}>{business.services.length} hizmet</span></div>
              <div className="grid gap-3 sm:grid-cols-2">
                {business.services.map((item) => {
                  const active = item.id === selectedService;
                  return <button key={item.id} onClick={() => { setSelectedService(item.id); setError(""); }} className="relative flex min-h-[92px] w-full items-center justify-between gap-3 rounded-[22px] border p-4 text-left transition duration-200 hover:-translate-y-0.5" style={{ borderColor: active ? rose : line, background: active ? roseSoft : "#fff", boxShadow: active ? "0 8px 22px rgba(216,137,130,0.12)" : "none" }}>
                    <span className="min-w-0"><span className="block font-bold">{item.name}</span><span className="mt-1 block text-xs leading-5" style={{ color: muted }}>{item.description} · {item.durationMinutes} dk</span></span>
                    <span className="shrink-0 text-sm font-bold" style={{ color: roseDark }}>₺{item.price.toLocaleString("tr-TR")}</span>
                  </button>;
                })}
              </div>
            </section>

            <div className="my-7 h-px" style={{ background: line }} />

            <section>
              <div className="mb-4 flex items-end justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: roseDark }}>02</p><h2 className="mt-1 text-xl font-bold">Tarih seçin</h2></div><span className="text-xs" style={{ color: muted }}>Önümüzdeki 14 gün</span></div>
              <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {dates.map((item) => {
                  const active = item.id === selectedDate;
                  return <button key={item.id} onClick={() => { setSelectedDate(item.id); setError(""); }} className="min-w-[72px] shrink-0 rounded-[20px] border px-3 py-3 text-center transition" style={{ borderColor: active ? rose : line, background: active ? rose : "#fff", color: active ? "#fff" : text, boxShadow: active ? "0 8px 20px rgba(216,137,130,0.18)" : "none" }}>
                    <span className="block text-[10px] font-semibold uppercase" style={{ color: active ? "rgba(255,255,255,.72)" : muted }}>{item.label}</span><span className="mt-1 block text-xl font-bold">{item.id.slice(8)}</span>
                  </button>;
                })}
              </div>
            </section>

            <div className="my-7 h-px" style={{ background: line }} />

            <section>
              <div className="mb-4 flex items-end justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: roseDark }}>03</p><h2 className="mt-1 text-xl font-bold">Saat seçin</h2></div><span className="text-xs" style={{ color: muted }}>{selectedDateInfo?.dateLabel ?? ""}</span></div>
              {loadingSlots ? <div className="rounded-[20px] border px-4 py-5 text-center text-sm" style={{ borderColor: line, background: rosePale, color: muted }}>Uygun saatler kontrol ediliyor…</div> : availableTimes.length > 0 ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{availableTimes.map((time) => {
                const active = time === selectedTime;
                return <button key={time} onClick={() => { setSelectedTime(time); setError(""); }} className="flex items-center justify-center gap-2 rounded-[16px] border px-3 py-3.5 text-sm font-bold transition" style={{ borderColor: active ? rose : line, background: active ? roseSoft : "#fff", color: active ? roseDark : text }}><Clock3 size={15} />{time}</button>;
              })}</div> : <div className="rounded-[20px] border px-4 py-5 text-center text-sm" style={{ borderColor: line, background: rosePale, color: muted }}>Bu gün için uygun randevu saati bulunmuyor. Başka bir tarih seçin.</div>}
            </section>

            <div className="my-7 h-px" style={{ background: line }} />

            <section>
              <div className="mb-4"><p className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: roseDark }}>04</p><h2 className="mt-1 text-xl font-bold">Bilgileriniz</h2></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold">Ad Soyad<input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-13 w-full rounded-[17px] border bg-white px-4 text-sm outline-none transition" style={{ borderColor: line }} placeholder="Adınız ve soyadınız" /></label>
                <label className="text-sm font-semibold">Telefon<input value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-2 h-13 w-full rounded-[17px] border bg-white px-4 text-sm outline-none transition" style={{ borderColor: line }} placeholder="05xx xxx xx xx" inputMode="tel" /></label>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-xs" style={{ color: muted }}><span className="inline-flex items-center gap-1.5"><MapPin size={14} />{business.address}</span><span className="inline-flex items-center gap-1.5"><Phone size={14} />{business.phone}</span></div>
            </section>

            {error && <div role="alert" className="mt-5 rounded-[17px] border px-4 py-3 text-sm" style={{ borderColor: "#E9C5C2", background: "#FFF0EE", color: "#A54D47" }}>{error}</div>}
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 p-3 backdrop-blur-xl sm:bottom-5 sm:left-1/2 sm:w-full sm:max-w-xl sm:-translate-x-1/2 sm:rounded-[22px] sm:border sm:p-3 sm:shadow-[0_18px_50px_rgba(45,38,37,0.16)]" style={{ borderColor: line }}>
        <button onClick={() => void confirmBooking()} disabled={!service || !selectedDateInfo || !selectedTime || !name.trim() || !phone.trim() || saving} className="flex h-13 w-full items-center justify-center gap-2 rounded-[17px] text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40" style={{ background: rose }}>
          <CalendarDays size={17} />{saving ? "Randevu oluşturuluyor…" : "Randevu Al"}{!saving && <ArrowRight size={17} />}
        </button>
      </div>
    </main>
  );
}
