"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Phone,
  Sparkles,
  UserRound
} from "lucide-react";
import type { Business, Specialist } from "@/types/business";
import { createBooking } from "@/lib/bookings/create";
import { ManageBooking } from "@/components/booking/manage-booking";
import { getDailySlots, getNextDates, getSelectableDateIds, type AvailableDate, type BookingSlot } from "@/lib/bookings/availability";

const rose = "#D88982";
const roseDark = "#B96862";
const roseSoft = "#FBE5E3";
const rosePale = "#FFF6F4";
const availableGreen = "#EAF6EE";
const availableGreenBorder = "#CBE8D4";
const availableGreenText = "#4E8762";
const bookedPink = "#FBE8E9";
const bookedPinkBorder = "#F0C7CA";
const bookedPinkText = "#B96A70";
const text = "#2D2625";
const muted = "#8F817E";
const line = "#F0DFDC";

function formatTurkishPhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("90")) digits = "0" + digits.slice(2);
  if (digits.startsWith("5")) digits = "0" + digits;
  digits = digits.slice(0, 11);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  if (digits.length <= 9) return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`;
}


function BookingFooter() {
  return (
    <footer className="border-t px-5 py-8 sm:px-8" style={{ borderColor: line, background: "linear-gradient(180deg, #FFFDFC 0%, #FBF5F3 100%)" }}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: roseDark }}>ALINDA Booking · FK Digital</p>
          <p className="mt-2 max-w-md text-xs leading-5" style={{ color: muted }}>
            İşletmeniz için böyle bir randevu sayfası mı istiyorsunuz? Kendi online randevu sisteminizi oluşturun.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="/#fiyatlar" className="rounded-full border bg-white/70 px-4 py-2 text-xs font-semibold transition hover:-translate-y-0.5 hover:bg-white" style={{ borderColor: line, color: text }}>Fiyatlar</a>
          <a href="https://wa.me/905421523805" target="_blank" rel="noreferrer" className="rounded-full px-4 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5" style={{ background: `linear-gradient(135deg, ${rose}, ${roseDark})`, boxShadow: "0 8px 20px rgba(185,104,98,0.18)" }}>WhatsApp</a>
          <a href="mailto:destek.fkdigital@gmail.com" className="rounded-full border bg-white/70 px-4 py-2 text-xs font-semibold transition hover:-translate-y-0.5 hover:bg-white" style={{ borderColor: line, color: text }}>E-posta</a>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-[10px]" style={{ borderColor: line, color: muted }}>
        <a href="/" className="font-semibold transition hover:opacity-70">ALINDA ana sayfa</a>
        <span>FK Digital tarafından geliştirilmiştir.</span>
      </div>
    </footer>
  );
}

export function BusinessBooking({ business }: { business: Business }) {
  const dates = useMemo(() => getNextDates(366), []);
  const [selectedService, setSelectedService] = useState(business.services[0]?.id ?? "");
  const [selectedSpecialist, setSelectedSpecialist] = useState("");
  const [selectedDate, setSelectedDate] = useState(dates[0]?.id ?? "");
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [working, setWorking] = useState(true);
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectableDateIds, setSelectableDateIds] = useState<Set<string>>(new Set());
  const [loadingDates, setLoadingDates] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<{ couponId: string; code: string; discount: number; total: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedReference, setConfirmedReference] = useState("");
  const [error, setError] = useState("");

  const service = useMemo(
    () => business.services.find((item) => item.id === selectedService),
    [business.services, selectedService]
  );

  const specialists = useMemo(
    () => business.specialists.filter((item) => item.serviceIds.includes(selectedService)),
    [business.specialists, selectedService]
  );

  const specialist = useMemo(
    () => specialists.find((item) => item.id === selectedSpecialist) ?? specialists[0],
    [specialists, selectedSpecialist]
  );

  const selectedDateInfo = useMemo<AvailableDate | undefined>(
    () => dates.find((item) => item.id === selectedDate),
    [dates, selectedDate]
  );

  const monthGroups = useMemo(() => {
    const groups: { key: string; label: string; dates: AvailableDate[] }[] = [];
    for (const date of dates) {
      const key = date.id.slice(0, 7);
      let group = groups.find((item) => item.key === key);
      if (!group) {
        const parsed = new Date(date.id + "T12:00:00");
        group = { key, label: parsed.toLocaleDateString("tr-TR", { month: "long", year: "numeric" }), dates: [] };
        groups.push(group);
      }
      group.dates.push(date);
    }
    return groups.slice(0, 12);
  }, [dates]);

  const [selectedMonth, setSelectedMonth] = useState(dates[0]?.id.slice(0, 7) ?? "");
  const activeMonthIndex = monthGroups.findIndex((group) => group.key === selectedMonth);
  const activeMonth = monthGroups[activeMonthIndex] ?? monthGroups[0];
  const activeMonthDates = activeMonth?.dates ?? [];

  function changeMonth(direction: -1 | 1) {
    const nextIndex = Math.min(Math.max(activeMonthIndex + direction, 0), monthGroups.length - 1);
    const nextMonth = monthGroups[nextIndex];
    if (!nextMonth) return;
    setSelectedMonth(nextMonth.key);
    if (!nextMonth.dates.some((item) => item.id === selectedDate)) {
      const nextAvailable = nextMonth.dates.find((item) => selectableDateIds.has(item.id));
      if (nextAvailable) chooseDate(nextAvailable.id, false);
    }
  }

  useEffect(() => {
    setSelectedSpecialist(specialists[0]?.id ?? "");
    setSelectedTime("");
    setCouponCode("");
    setCoupon(null);
    setCouponError("");
    setPrivacyAccepted(false);
  }, [selectedService, specialists]);

  useEffect(() => {
    let cancelled = false;
    async function loadSelectableDates() {
      if (!specialist) {
        setSelectableDateIds(new Set());
        setLoadingDates(false);
        return;
      }
      setLoadingDates(true);
      try {
        const ids = await getSelectableDateIds(business.id, dates, specialist);
        if (cancelled) return;
        setSelectableDateIds(ids);
        if (!ids.has(selectedDate)) {
          const firstAvailable = dates.find((date) => ids.has(date.id));
          if (firstAvailable) {
            setSelectedDate(firstAvailable.id);
            setSelectedMonth(firstAvailable.id.slice(0, 7));
          }
        }
      } catch {
        if (!cancelled) setSelectableDateIds(new Set());
      } finally {
        if (!cancelled) setLoadingDates(false);
      }
    }
    void loadSelectableDates();
    return () => { cancelled = true; };
  }, [business.id, dates, specialist]);

  useEffect(() => {
    let cancelled = false;

    async function loadSlots() {
      if (!service || !specialist || !selectedDateInfo) {
        setSlots([]);
        setLoadingSlots(false);
        setWorking(false);
        setSelectedTime("");
        return;
      }

      setLoadingSlots(true);
      setSelectedTime("");
      setError("");

      try {
        const result = await getDailySlots(
          business.id,
          selectedDateInfo.id,
          selectedDateInfo.dayId,
          specialist,
          service.durationMinutes
        );
        if (cancelled) return;
        setSlots(result.slots);
        setWorking(result.working);
        setOpenTime(result.open);
        setCloseTime(result.close);
      } catch {
        if (cancelled) return;
        setSlots([]);
        setWorking(false);
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
  }, [business.id, selectedDateInfo, service, specialist]);

  async function applyCoupon() {
    const code = couponCode.trim().toUpperCase();
    if (!code || !service || couponLoading) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const response = await fetch(`/api/coupons/validate?businessId=${encodeURIComponent(business.id)}&code=${encodeURIComponent(code)}&subtotal=${encodeURIComponent(service.price)}`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Kupon uygulanamadı.");
      setCoupon({ couponId: data.couponId, code: data.code, discount: data.discount, total: data.total });
    } catch (error) {
      setCoupon(null);
      setCouponError(error instanceof Error ? error.message : "Kupon uygulanamadı.");
    } finally {
      setCouponLoading(false);
    }
  }

  async function confirmBooking() {
    if (!service || !specialist || !selectedDateInfo || !selectedTime || !name.trim() || !/^05\d{9}$/.test(phone.replace(/\D/g, "")) || saving) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const bookingRef = await createBooking({
        businessId: business.id,
        service,
        specialistId: specialist.id,
        customerName: name,
        customerPhone: phone,
        whatsappOptIn,
        date: selectedDateInfo.id,
        time: selectedTime,
        couponCode: coupon?.code || couponCode.trim().toUpperCase(),
        privacyAccepted
      });

      setConfirmedReference(bookingRef.id);
      setConfirmed(true);

      // WhatsApp bildirimi randevuyu geciktirmemeli; bağlantı hazır değilse
      // randevu yine başarıyla oluşturulmuş olarak kalır.
      void fetch("/api/whatsapp/booking-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: business.id, bookingId: bookingRef.id })
      }).catch(() => undefined);
    } catch (bookingError) {
      if (bookingError instanceof Error && bookingError.message === "SLOT_TAKEN") {
        setSelectedTime("");
        setError("Bu saat az önce başka bir müşteri tarafından alındı. Uygun saatler yenileniyor…");
        try {
          const refreshed = await getDailySlots(
            business.id,
            selectedDateInfo.id,
            selectedDateInfo.dayId,
            specialist,
            service.durationMinutes
          );
          setSlots(refreshed.slots);
          setWorking(refreshed.working);
          setOpenTime(refreshed.open);
          setCloseTime(refreshed.close);
          setError("Bu saat az önce başka bir müşteri tarafından alındı. Lütfen başka bir saat seçin.");
        } catch {
          setError("Bu saat az önce başka bir müşteri tarafından alındı. Lütfen sayfayı yenileyip tekrar deneyin.");
        }
      } else {
        setError(bookingError instanceof Error ? bookingError.message : "Randevu oluşturulamadı. Lütfen bilgilerinizi ve bağlantınızı kontrol edip tekrar deneyin.");
      }
    } finally {
      setSaving(false);
    }
  }

  function chooseService(id: string) {
    setSelectedService(id);
    setError("");
    setSelectedTime("");
    setCouponCode("");
    setCoupon(null);
    setCouponError("");
    setPrivacyAccepted(false);
    const first = business.specialists.find((item) => item.serviceIds.includes(id));
    setSelectedSpecialist(first?.id ?? "");
  }

  function chooseDate(id: string, scroll = true) {
    if (!selectableDateIds.has(id)) return;
    setSelectedDate(id);
    setSelectedMonth(id.slice(0, 7));
    setSelectedTime("");
    setError("");
    setCouponCode("");
    setCoupon(null);
    setCouponError("");
    if (scroll) {
      document.getElementById("alinda-hours")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  if (business.services.length === 0) {
    return (
      <main className="min-h-screen px-4 py-8" style={{ background: rosePale, color: text }}>
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
          <section className="w-full rounded-[30px] border bg-white p-8 text-center shadow-[0_18px_60px_rgba(185,104,98,0.10)] sm:p-10" style={{ borderColor: line }}>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ background: roseSoft, color: roseDark }}>
              <Sparkles size={28} />
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: roseDark }}>Online randevu</p>
            <h1 className="mt-2 text-2xl font-bold">Henüz randevu alınamıyor.</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6" style={{ color: muted }}>
              {business.name} henüz online randevu için hizmet tanımlamamış. Lütfen işletmeyle iletişime geçin.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {business.phone && <a href={"tel:" + business.phone} className="rounded-full border bg-white px-5 py-3 text-sm font-bold" style={{ borderColor: line, color: roseDark }}>İşletmeyi ara</a>}
              <ManageBooking businessId={business.id} />
            </div>
          </section>
        </div>
        <BookingFooter />
      </main>
    );
  }

  if (confirmed && service && specialist && selectedDateInfo) {
    return (
      <main className="min-h-screen px-4 py-8" style={{ background: rosePale, color: text }}>
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl items-center justify-center">
          <section className="w-full rounded-[32px] border bg-white p-7 text-center shadow-[0_18px_60px_rgba(185,104,98,0.14)] sm:p-10" style={{ borderColor: line }}>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ background: roseSoft, color: roseDark }}>
              <Check size={30} />
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: muted }}>Randevu talebi alındı</p>
            <div className="mx-auto mt-4 max-w-sm rounded-[18px] border px-4 py-3 text-left" style={{ borderColor: line, background: rosePale }}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: muted }}>Randevu referansı</span>
                <span className="font-mono text-sm font-bold tracking-[0.18em]" style={{ color: roseDark }}>{confirmedReference}</span>
              </div>
              <p className="mt-2 text-xs leading-5" style={{ color: muted }}>
                <strong style={{ color: text }}>Bu referans numarasını saklayın.</strong> Randevunuzla ilgili işlem gerektiğinde bu numara ile randevunuzu bulabilirsiniz.
              </p>
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Görüşmek üzere, {name.split(" ")[0]}.</h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6" style={{ color: muted }}>{business.name} için randevu talebiniz oluşturuldu.</p>
            <div className="mt-7 rounded-[22px] p-5 text-left" style={{ background: rosePale }}>
              <div className="flex items-center justify-between gap-4 border-b pb-4" style={{ borderColor: line }}>
                <span className="text-sm" style={{ color: muted }}>Hizmet</span>
                <span className="text-right text-sm font-bold">{service.name}</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-b py-4" style={{ borderColor: line }}>
                <span className="text-sm" style={{ color: muted }}>Uzman</span>
                <span className="text-right text-sm font-bold">{specialist.name}</span>
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
            <div className="mt-6 flex flex-col items-center gap-3"><ManageBooking businessId={business.id} /><button onClick={() => { setConfirmed(false); setConfirmedReference(""); setSelectedTime(""); setName(""); setPhone(""); setPrivacyAccepted(false); }} className="text-sm font-bold underline underline-offset-4" style={{ color: roseDark }}>Yeni randevu oluştur</button></div>
          </section>
        </div>
        <BookingFooter />
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: "#F8F2F1", color: text }}>
      <div className="mx-auto min-h-screen w-full max-w-[920px] bg-[#FFFDFC] shadow-[0_0_70px_rgba(45,38,37,0.08)]">
        <header className="sticky top-0 z-30 border-b bg-[#FFFDFC]/95 px-5 py-4 backdrop-blur-xl sm:px-8" style={{ borderColor: line }}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {business.logoUrl ? (
                <img src={business.logoUrl} alt={business.name} className="h-10 w-10 rounded-[14px] object-contain" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-[14px] text-sm font-bold" style={{ background: roseSoft, color: roseDark }}>{business.initials}</div>
              )}
              <div>
                <p className="text-xs font-semibold">{business.name}</p>
                <p className="mt-0.5 text-[10px]" style={{ color: muted }}>{business.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-2"><ManageBooking businessId={business.id} /><span className="hidden rounded-full px-3 py-1.5 text-[11px] font-bold sm:inline" style={{ background: roseSoft, color: roseDark }}>Online Randevu</span></div>
          </div>
        </header>

        <div className="px-5 pb-20 pt-7 sm:px-8">
          <section className="rounded-[26px] border p-5 sm:p-6" style={{ borderColor: line, background: rosePale }}>
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-medium" style={{ color: roseDark }}>Merhaba 👋</p>
                <h1 className="mt-1 text-[27px] font-bold leading-tight tracking-[-0.04em] sm:text-3xl">Randevunuzu seçin.</h1>
                <p className="mt-2 max-w-xl text-xs leading-5 sm:text-sm sm:leading-6" style={{ color: muted }}>Hizmeti ve uzmanı seçin. Ardından takvimden uygun gün ve saati seçerek randevunuzu oluşturun.</p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
                {business.logoUrl ? (
                  <img src={business.logoUrl} alt={business.name} className="h-11 w-11 rounded-[15px] object-contain" />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-[15px]" style={{ background: roseSoft, color: roseDark }}>{business.initials}</div>
                )}
                <div>
                  <p className="text-sm font-bold">{business.name}</p>
                  <p className="mt-0.5 text-xs" style={{ color: muted }}>{business.district}, {business.city}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: roseDark }}>01 / HİZMET</p>
                <h2 className="mt-1 text-xl font-bold">Hizmet seçin</h2>
              </div>
              <span className="text-xs" style={{ color: muted }}>{business.services.length} hizmet</span>
            </div>
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {business.services.map((item) => {
                const active = item.id === selectedService;
                return (
                  <button key={item.id} onClick={() => chooseService(item.id)} className="min-w-[220px] rounded-[22px] border p-4 text-left transition active:scale-[0.99]" style={{ borderColor: active ? rose : line, background: active ? roseSoft : "#fff", boxShadow: active ? "0 10px 30px rgba(216,137,130,0.12)" : "0 3px 14px rgba(45,38,37,0.035)" }}>
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-[14px]" style={{ background: active ? "#fff" : rosePale, color: roseDark }}><Sparkles size={17} /></span>
                      {active && <Check size={18} style={{ color: roseDark }} />}
                    </div>
                    <p className="mt-4 text-sm font-bold">{item.name}</p>
                    <p className="mt-1 text-xs" style={{ color: muted }}>{item.durationMinutes} dk · ₺{item.price.toLocaleString("tr-TR")}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mt-9">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: roseDark }}>02 / UZMAN</p>
                <h2 className="mt-1 text-xl font-bold">Bu hizmeti kim yapsın?</h2>
              </div>
              <span className="text-xs" style={{ color: muted }}>{specialists.length} uzman</span>
            </div>

            {specialists.length > 0 ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {specialists.map((item: Specialist) => {
                  const active = item.id === specialist?.id;
                  return (
                    <button key={item.id} onClick={() => { setSelectedSpecialist(item.id); setSelectedTime(""); }} className="flex items-center gap-3 rounded-[22px] border p-3 text-left transition active:scale-[0.99]" style={{ borderColor: active ? rose : line, background: active ? roseSoft : "#fff" }}>
                      {item.photoUrl ? (
                        <img src={item.photoUrl} alt={item.name} className="h-16 w-16 shrink-0 rounded-[18px] object-cover" />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[18px] text-sm font-bold" style={{ background: roseSoft, color: roseDark }}>{item.name.slice(0, 1).toUpperCase()}</div>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold">{item.name}</span>
                        <span className="mt-1 block truncate text-xs" style={{ color: muted }}>{item.title}</span>
                      </span>
                      {active && <Check size={18} style={{ color: roseDark }} />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4 rounded-[22px] border p-6 text-center" style={{ borderColor: line, background: rosePale }}>
                <p className="text-sm font-bold">Bu hizmet için henüz uzman tanımlanmamış.</p>
                <p className="mt-1 text-xs leading-5" style={{ color: muted }}>Lütfen başka bir hizmet seçin veya işletmeyle iletişime geçin.</p>
                {business.phone && <a href={"tel:" + business.phone} className="mt-4 inline-flex rounded-full border bg-white px-4 py-2 text-xs font-bold" style={{ borderColor: line, color: roseDark }}>İşletmeyi ara</a>}
              </div>
            )}
          </section>

          <section className="mt-9" id="alinda-calendar">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: roseDark }}>03 / TAKVİM</p>
                <h2 className="mt-1 text-xl font-bold">Gün seçin</h2>
              </div>
              <div className="hidden items-center gap-4 text-[11px] sm:flex">
                <span className="flex items-center gap-1.5" style={{ color: availableGreenText }}><span className="h-2.5 w-2.5 rounded-full" style={{ background: availableGreenBorder }} /> Müsait</span>
                <span className="flex items-center gap-1.5" style={{ color: bookedPinkText }}><span className="h-2.5 w-2.5 rounded-full" style={{ background: bookedPinkBorder }} /> Dolu</span>
              </div>
            </div>

            {activeMonth && (
              <div className="mt-4 rounded-[24px] border p-4 sm:p-5" style={{ borderColor: line }}>
                <div className="flex items-center justify-between gap-3 border-b pb-4" style={{ borderColor: line }}>
                  <button type="button" onClick={() => changeMonth(-1)} disabled={activeMonthIndex <= 0} className="flex h-10 w-10 items-center justify-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-30" style={{ borderColor: line, background: rosePale }} aria-label="Önceki ay">
                    <ChevronLeft size={18} />
                  </button>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <CalendarDays size={17} style={{ color: roseDark }} />
                      <p className="text-base font-bold capitalize">{activeMonth.label}</p>
                    </div>
                    <p className="mt-1 text-[11px]" style={{ color: muted }}>{activeMonthIndex + 1} / {monthGroups.length} ay</p>
                  </div>
                  <button type="button" onClick={() => changeMonth(1)} disabled={activeMonthIndex >= monthGroups.length - 1} className="flex h-10 w-10 items-center justify-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-30" style={{ borderColor: line, background: rosePale }} aria-label="Sonraki ay">
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-7 gap-1.5">
                  {["P", "S", "Ç", "P", "C", "C", "P"].map((day, index) => (
                    <span key={"day-" + index} className="pb-1 text-center text-[10px] font-bold" style={{ color: muted }}>{day}</span>
                  ))}
                  {activeMonthDates.length > 0 && Array.from(
                    { length: (new Date(activeMonthDates[0].id + "T12:00:00").getDay() + 6) % 7 },
                    (_, index) => <span key={"empty-" + index} />
                  )}
                  {activeMonthDates.map((date) => {
                    const active = date.id === selectedDate;
                    return (
                      <button key={date.id} onClick={() => chooseDate(date.id)} disabled={loadingDates || !selectableDateIds.has(date.id)} className="rounded-[15px] border px-1 py-2.5 text-center transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-35" style={{ borderColor: active ? rose : line, background: active ? rose : "#fff", color: active ? "#fff" : text }}>
                        <span className="block text-[9px] font-semibold uppercase" style={{ color: active ? "rgba(255,255,255,.72)" : muted }}>{date.label}</span>
                        <span className="mt-0.5 block text-sm font-bold">{Number(date.id.slice(8))}</span>
                        {active && <span className="mt-1 block text-[8px] font-bold uppercase tracking-wide text-white/90">Seçildi</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          <section className="mt-9" id="alinda-hours">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: roseDark }}>04 / SAAT</p>
                <h2 className="mt-1 text-xl font-bold">{selectedDateInfo?.dateLabel}</h2>
              </div>
              <div className="flex items-center gap-3">
                {working && <span className="text-xs" style={{ color: muted }}>{openTime} – {closeTime}</span>}
              </div>
            </div>

            <div className="mt-3 flex items-center gap-4 text-[10px] sm:hidden">
              <span className="flex items-center gap-1.5" style={{ color: availableGreenText }}><span className="h-2 w-2 rounded-full" style={{ background: availableGreenBorder }} /> Müsait</span>
              <span className="flex items-center gap-1.5" style={{ color: bookedPinkText }}><span className="h-2 w-2 rounded-full" style={{ background: bookedPinkBorder }} /> Dolu</span>
            </div>

            {loadingSlots ? (
              <div className="mt-4 rounded-[22px] border p-7 text-center text-sm" style={{ borderColor: line, background: rosePale, color: muted }}>Saatler kontrol ediliyor…</div>
            ) : !specialist ? (
              <div className="mt-4 rounded-[22px] border p-7 text-center text-sm" style={{ borderColor: line, background: rosePale, color: muted }}>Önce bu hizmet için bir uzman seçin.</div>
            ) : !working ? (
              <div className="mt-4 rounded-[22px] border p-7 text-center" style={{ borderColor: line, background: "#F7F4F3" }}>
                <p className="font-bold">Mesai dışı</p>
                <p className="mt-1 text-sm" style={{ color: muted }}>{specialist.name} bu gün çalışmıyor.</p>
              </div>
            ) : slots.length === 0 ? (
              <div className="mt-4 rounded-[22px] border p-7 text-center text-sm" style={{ borderColor: line, background: rosePale, color: muted }}>Bu gün için uygun saat bulunmuyor.</div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {slots.map((slot) => {
                  const booked = slot.status === "booked";
                  const active = slot.time === selectedTime;
                  return (
                    <button key={slot.time} disabled={booked} onClick={() => { setSelectedTime(slot.time); setError(""); setTimeout(() => document.getElementById("alinda-booking-form")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0); }} className="relative rounded-[17px] border px-3 py-4 text-center transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-75" style={{ borderColor: active ? rose : booked ? bookedPinkBorder : availableGreenBorder, background: active ? roseSoft : booked ? bookedPink : availableGreen, color: booked ? bookedPinkText : active ? roseDark : availableGreenText, boxShadow: active ? "0 8px 20px rgba(216,137,130,0.12)" : "none" }}>
                      <span className="flex items-center justify-center gap-1.5 text-sm font-bold"><Clock3 size={14} />{slot.time}</span>
                      <span className="mt-1 block text-[10px] font-semibold">{booked ? "Dolu" : active ? "Seçildi" : "Müsait"}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {selectedTime && specialist && service && (
            <section id="alinda-booking-form" className="mt-8 rounded-[28px] border p-5 sm:p-7" style={{ borderColor: rose, background: rosePale }}>
              <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: line }}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: roseDark }}>05 / RANDEVU</p>
                  <h2 className="mt-1 text-xl font-bold">Randevunuzu tamamlayın</h2>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 text-sm">
                  <p className="font-bold">{selectedTime} · {specialist.name}</p>
                  <p className="mt-1 text-xs" style={{ color: muted }}>{service.name} · {selectedDateInfo?.dateLabel} · {coupon ? <><span className="line-through">₺{service.price.toLocaleString("tr-TR")}</span> · <strong style={{ color: roseDark }}>₺{coupon.total.toLocaleString("tr-TR")}</strong></> : <>₺{service.price.toLocaleString("tr-TR")}</>}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-bold">
                  <span className="flex items-center gap-2"><UserRound size={15} /> Ad Soyad</span>
                  <input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-14 w-full rounded-[18px] border bg-white px-4 text-sm outline-none" style={{ borderColor: line }} placeholder="Adınız ve soyadınız" />
                </label>
                <label className="block text-sm font-bold">
                  <span className="flex items-center gap-2"><Phone size={15} /> Telefon</span>
                  <input value={phone} onChange={(event) => setPhone(formatTurkishPhone(event.target.value))} className="mt-2 h-14 w-full rounded-[18px] border bg-white px-4 text-sm outline-none" style={{ borderColor: line }} placeholder="05xx xxx xx xx" inputMode="tel" autoComplete="tel" maxLength={14} />
                </label>
              </div>
              <div className="mt-4 rounded-[18px] border bg-white p-4" style={{ borderColor: line }}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <label className="block flex-1 text-sm font-bold">
                    <span>🎟️ İndirim kuponu</span>
                    <input value={couponCode} onChange={(event) => { setCouponCode(event.target.value.toUpperCase()); setCoupon(null); setCouponError(""); }} className="mt-2 h-12 w-full rounded-[15px] border bg-white px-4 text-sm font-mono uppercase outline-none" style={{ borderColor: line }} placeholder="KUPON KODU" />
                  </label>
                  <button type="button" onClick={() => void applyCoupon()} disabled={!couponCode.trim() || couponLoading} className="h-12 rounded-[15px] border px-5 text-sm font-bold disabled:opacity-40" style={{ borderColor: rose, color: roseDark }}>
                    {couponLoading ? "Kontrol…" : "Uygula"}
                  </button>
                </div>
                {couponError && <p role="alert" className="mt-2 text-xs font-medium" style={{ color: "#A54D47" }}>{couponError}</p>}
                {coupon && <div className="mt-3 flex items-center justify-between rounded-[14px] px-3 py-2 text-xs" style={{ background: availableGreen, color: availableGreenText }}>
                  <span><strong>{coupon.code}</strong> uygulandı · ₺{coupon.discount.toLocaleString("tr-TR")} indirim</span>
                  <strong>₺{coupon.total.toLocaleString("tr-TR")}</strong>
                </div>}
              </div>

              <label className="mt-4 flex items-start gap-3 rounded-[17px] border bg-white px-4 py-3 text-xs leading-5" style={{ borderColor: line }}>
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(event) => setPrivacyAccepted(event.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#D88982]"
                />
                <span>
                  <span className="font-semibold">Kişisel verilerimin işlenmesine ilişkin <a href="/gizlilik" target="_blank" rel="noreferrer" className="underline underline-offset-2" style={{ color: roseDark }}>Gizlilik ve KVKK metnini</a> okudum ve kabul ediyorum.</span>
                  <span className="mt-0.5 block" style={{ color: muted }}>Randevu oluşturabilmek için bu onay gereklidir.</span>
                </span>
              </label>

              <label className="mt-3 flex items-start gap-3 rounded-[17px] border bg-white px-4 py-3 text-xs leading-5" style={{ borderColor: line }}>
                <input
                  type="checkbox"
                  checked={whatsappOptIn}
                  onChange={(event) => setWhatsappOptIn(event.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#D88982]"
                />
                <span>
                  <span className="font-semibold">Randevu bilgilerini WhatsApp'tan almak istiyorum.</span>
                  <span className="mt-0.5 block" style={{ color: muted }}>Telefon numaranızı verdiğiniz işletmeden randevu bildirimi almayı kabul ediyorum.</span>
                </span>
              </label>

              {error && <div role="alert" className="mt-4 rounded-[17px] border px-4 py-3 text-sm" style={{ borderColor: "#E9C5C2", background: "#FFF0EE", color: "#A54D47" }}>{error}</div>}

              <button onClick={() => void confirmBooking()} disabled={!name.trim() || !/^05\d{9}$/.test(phone.replace(/\D/g, "")) || !privacyAccepted || saving} className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-[18px] text-sm font-bold text-white shadow-[0_10px_24px_rgba(216,137,130,0.22)] disabled:cursor-not-allowed disabled:opacity-40" style={{ background: rose }}>
                {saving ? "Randevu oluşturuluyor…" : "Randevuyu Al"}{saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" /> : <ChevronRight size={17} />}
              </button>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs" style={{ color: muted }}>
                <span className="flex items-center gap-1.5"><MapPin size={13} />{business.address}</span>
                <span className="flex items-center gap-1.5"><Phone size={13} />{business.phone}</span>
              </div>

              {business.latitude && business.longitude && (
                <div className="mt-5 overflow-hidden rounded-[20px] border" style={{ borderColor: line }}>
                  <iframe
                    title={business.name + " konumu"}
                    src={"https://maps.google.com/maps?q=" + encodeURIComponent(String(business.latitude) + "," + String(business.longitude)) + "&z=16&output=embed"}
                    className="h-56 w-full border-0"
                    loading="lazy"
                  />
                  <a
                    href={"https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(String(business.latitude) + "," + String(business.longitude))}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 border-t bg-white px-4 py-3 text-xs font-bold"
                    style={{ borderColor: line, color: roseDark }}
                  >
                    <MapPin size={14} /> Google Maps'te yol tarifi al
                  </a>
                </div>
              )}
            </section>
          )}

          {error && !selectedTime && <div role="alert" className="mt-5 rounded-[17px] border px-4 py-3 text-sm" style={{ borderColor: "#E9C5C2", background: "#FFF0EE", color: "#A54D47" }}>{error}</div>}
        </div>
        <BookingFooter />
      </div>
    </main>
  );
}
