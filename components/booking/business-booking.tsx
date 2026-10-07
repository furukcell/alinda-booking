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
  const [step, setStep] = useState(1);
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

  const service = useMemo(
    () => business.services.find((item) => item.id === selectedService),
    [business.services, selectedService]
  );
  const selectedDateInfo = useMemo<AvailableDate | undefined>(
    () => dates.find((item) => item.id === selectedDate),
    [dates, selectedDate]
  );

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
        const slots = await getAvailableSlots(
          business.id,
          selectedDateInfo.id,
          selectedDateInfo.dayId,
          service.durationMinutes
        );
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
    return () => {
      cancelled = true;
    };
  }, [business.id, selectedDateInfo, service]);

  async function confirmBooking() {
    if (!service || !selectedDateInfo || !selectedTime || !name.trim() || !phone.trim() || saving) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await createBooking({
        businessId: business.id,
        service,
        customerName: name,
        customerPhone: phone,
        date: selectedDateInfo.id,
        time: selectedTime,
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

  function goNext() {
    if (step === 1 && service) setStep(2);
    else if (step === 2 && selectedTime) setStep(3);
  }

  function goBack() {
    if (step > 1) setStep((current) => current - 1);
  }

  if (confirmed && service && selectedDateInfo) {
    return (
      <main className="min-h-screen px-4 py-8" style={{ background: rosePale, color: text }}>
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl items-center justify-center">
          <section className="w-full rounded-[32px] border bg-white p-7 text-center shadow-[0_18px_60px_rgba(185,104,98,0.14)] sm:p-10" style={{ borderColor: line }}>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ background: roseSoft, color: roseDark }}>
              <Check size={30} />
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>
              Randevu talebi alındı
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Görüşmek üzere, {name.split(" ")[0]}.</h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6" style={{ color: muted }}>
              {business.name} için randevu talebiniz oluşturuldu. İşletme onayından sonra randevunuz kesinleşecektir.
            </p>
            <div className="mt-7 rounded-[22px] p-5 text-left" style={{ background: rosePale }}>
              <div className="flex items-center justify-between gap-4 border-b pb-4" style={{ borderColor: line }}>
                <span className="text-sm" style={{ color: muted }}>Hizmet</span>
                <span className="text-right text-sm font-bold">{service.name}</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-b py-4" style={{ borderColor: line }}>
                <span className="text-sm" style={{ color: muted }}>Tarih</span>
                <span className="text-sm font-bold">{selectedDateInfo.dateLabel}</span>
              </div>
              <div className="flex items-center justify-between gap-4 pt-4">
                <span className="text-sm" style={{ color: muted }}>Saat</span>
                <span className="text-sm font-bold">{selectedTime}</span>
              </div>
            </div>
            <button
              onClick={() => {
                setConfirmed(false);
                setStep(1);
              }}
              className="mt-6 text-sm font-bold underline underline-offset-4"
              style={{ color: roseDark }}
            >
              Yeni randevu oluştur
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: "#F8F2F1", color: text }}>
      <div className="mx-auto min-h-screen w-full max-w-[440px] bg-[#FFFDFC] shadow-[0_0_70px_rgba(45,38,37,0.08)]">
        <header className="sticky top-0 z-30 border-b bg-[#FFFDFC]/95 px-5 py-4 backdrop-blur-xl" style={{ borderColor: line }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step > 1 ? (
                <button onClick={goBack} className="flex h-10 w-10 items-center justify-center rounded-full border" style={{ borderColor: line }} aria-label="Geri">
                  <ArrowRight size={17} className="rotate-180" />
                </button>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-[14px] text-sm font-bold text-white" style={{ background: rose }}>
                  A
                </div>
              )}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: muted }}>ALINDA</p>
                <p className="text-xs font-semibold">{business.name}</p>
              </div>
            </div>
            <span className="rounded-full px-3 py-1.5 text-[11px] font-bold" style={{ background: roseSoft, color: roseDark }}>
              {step}/3
            </span>
          </div>
          <div className="mt-4 flex gap-1.5">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-1 flex-1 rounded-full" style={{ background: item <= step ? rose : "#F0E7E5" }} />
            ))}
          </div>
        </header>

        <div className="px-5 pb-32 pt-7">
          <div className="mb-7">
            <p className="text-sm font-medium" style={{ color: roseDark }}>
              {step === 1 ? "Merhaba 👋" : step === 2 ? "Neredeyse hazır ✨" : "Son bir adım"}
            </p>
            <h1 className="mt-1 text-[30px] font-bold leading-[1.08] tracking-[-0.04em]">
              {step === 1 ? "Randevunuzu oluşturalım." : step === 2 ? "Gün ve saatinizi seçin." : "Bilgilerinizi bırakın."}
            </h1>
            <p className="mt-2 text-sm leading-6" style={{ color: muted }}>
              {step === 1 ? "Size uygun hizmeti seçerek başlayın." : step === 2 ? "Size en uygun zamanı seçin." : "Randevunuzu oluşturmak için son bilgileri girin."}
            </p>
          </div>

          <div className="mb-7 flex items-center gap-3 rounded-[22px] border p-4" style={{ borderColor: line, background: rosePale }}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] text-sm font-bold" style={{ background: roseSoft, color: roseDark }}>
              {business.initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{business.name}</p>
              <p className="mt-0.5 truncate text-xs" style={{ color: muted }}>{business.category} · {business.district}, {business.city}</p>
            </div>
          </div>

          {step === 1 && (
            <section>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: roseDark }}>01 / HİZMET</p>
              <h2 className="mt-1 text-xl font-bold">Ne yaptırmak istersiniz?</h2>
              <div className="mt-4 space-y-3">
                {business.services.map((item) => {
                  const active = item.id === selectedService;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedService(item.id);
                        setError("");
                      }}
                      className="flex w-full items-center gap-4 rounded-[24px] border p-4 text-left transition active:scale-[0.99]"
                      style={{
                        borderColor: active ? rose : line,
                        background: active ? roseSoft : "#fff",
                        boxShadow: active ? "0 10px 30px rgba(216,137,130,0.12)" : "0 3px 14px rgba(45,38,37,0.035)",
                      }}
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px]" style={{ background: active ? "#fff" : rosePale, color: roseDark }}>
                        <Sparkles size={18} />
                      </div>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold">{item.name}</span>
                        <span className="mt-1 block text-xs leading-5" style={{ color: muted }}>
                          {item.durationMinutes} dk · ₺{item.price.toLocaleString("tr-TR")}
                        </span>
                      </span>
                      {active && <Check size={19} style={{ color: roseDark }} />}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {step === 2 && (
            <section>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: roseDark }}>02 / TARİH & SAAT</p>
              <h2 className="mt-1 text-xl font-bold">Size uygun zamanı seçin</h2>

              <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {dates.map((item) => {
                  const active = item.id === selectedDate;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedDate(item.id);
                        setError("");
                      }}
                      className="min-w-[68px] shrink-0 rounded-[19px] border px-3 py-3 text-center"
                      style={{
                        borderColor: active ? rose : line,
                        background: active ? rose : "#fff",
                        color: active ? "#fff" : text,
                      }}
                    >
                      <span className="block text-[10px] font-semibold uppercase" style={{ color: active ? "rgba(255,255,255,.75)" : muted }}>
                        {item.label}
                      </span>
                      <span className="mt-1 block text-xl font-bold">{item.id.slice(8)}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-7">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold">Uygun saatler</h3>
                  <span className="text-xs" style={{ color: muted }}>{selectedDateInfo?.dateLabel}</span>
                </div>

                {loadingSlots ? (
                  <div className="rounded-[22px] border px-4 py-6 text-center text-sm" style={{ borderColor: line, background: rosePale, color: muted }}>
                    Uygun saatler kontrol ediliyor…
                  </div>
                ) : availableTimes.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {availableTimes.map((time) => {
                      const active = time === selectedTime;
                      return (
                        <button
                          key={time}
                          onClick={() => {
                            setSelectedTime(time);
                            setError("");
                          }}
                          className="flex items-center justify-center gap-2 rounded-[17px] border px-2 py-3.5 text-sm font-bold"
                          style={{ borderColor: active ? rose : line, background: active ? roseSoft : "#fff", color: active ? roseDark : text }}
                        >
                          <Clock3 size={15} />
                          {time}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-[22px] border px-4 py-6 text-center text-sm" style={{ borderColor: line, background: rosePale, color: muted }}>
                    Bu gün için uygun saat bulunmuyor.
                  </div>
                )}
              </div>
            </section>
          )}

          {step === 3 && (
            <section>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: roseDark }}>03 / BİLGİLER</p>
              <h2 className="mt-1 text-xl font-bold">Randevunuzu tamamlayın</h2>

              <div className="mt-5 rounded-[24px] p-5" style={{ background: rosePale }}>
                <div className="flex justify-between gap-4 border-b pb-4" style={{ borderColor: line }}>
                  <span className="text-xs" style={{ color: muted }}>Hizmet</span>
                  <span className="text-right text-sm font-bold">{service?.name}</span>
                </div>
                <div className="flex justify-between gap-4 border-b py-4" style={{ borderColor: line }}>
                  <span className="text-xs" style={{ color: muted }}>Tarih</span>
                  <span className="text-sm font-bold">{selectedDateInfo?.dateLabel}</span>
                </div>
                <div className="flex justify-between gap-4 pt-4">
                  <span className="text-xs" style={{ color: muted }}>Saat</span>
                  <span className="text-sm font-bold">{selectedTime}</span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <label className="block text-sm font-bold">
                  Ad Soyad
                  <input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-14 w-full rounded-[18px] border bg-white px-4 text-sm outline-none" style={{ borderColor: line }} placeholder="Adınız ve soyadınız" />
                </label>
                <label className="block text-sm font-bold">
                  Telefon
                  <input value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-2 h-14 w-full rounded-[18px] border bg-white px-4 text-sm outline-none" style={{ borderColor: line }} placeholder="05xx xxx xx xx" inputMode="tel" />
                </label>
              </div>

              <div className="mt-5 space-y-2 text-xs" style={{ color: muted }}>
                <span className="flex items-center gap-2"><MapPin size={14} />{business.address}</span>
                <span className="flex items-center gap-2"><Phone size={14} />{business.phone}</span>
              </div>
            </section>
          )}

          {error && (
            <div role="alert" className="mt-5 rounded-[17px] border px-4 py-3 text-sm" style={{ borderColor: "#E9C5C2", background: "#FFF0EE", color: "#A54D47" }}>
              {error}
            </div>
          )}
        </div>

        <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[440px] border-t bg-[#FFFDFC]/95 p-4 backdrop-blur-xl" style={{ borderColor: line }}>
          <button
            onClick={() => (step < 3 ? goNext() : void confirmBooking())}
            disabled={step === 1 ? !service : step === 2 ? !selectedTime || loadingSlots : !name.trim() || !phone.trim() || saving}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-[18px] text-sm font-bold text-white shadow-[0_10px_24px_rgba(216,137,130,0.22)] disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: rose }}
          >
            {step === 3 ? (saving ? "Randevu oluşturuluyor…" : "Randevuyu Onayla") : "Devam Et"}
            {step < 3 && <ArrowRight size={17} />}
          </button>
        </div>
      </div>
    </main>
  );
}
