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

  function goNext() {
    if (step === 1 && service) setStep(2);
    else if (step === 2 && selectedTime) setStep(3);
  }

  function goBack() {
    if (step > 1) setStep((current) => current - 1);
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
}
