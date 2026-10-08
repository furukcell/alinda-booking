import { NextRequest, NextResponse } from "next/server";
import { FieldValue, type DocumentReference } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function minutes(value: string) {
  const [hours, mins] = value.split(":").map(Number);
  return hours * 60 + mins;
}

function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function validTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function normalizeTurkishPhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("90")) digits = "0" + digits.slice(2);
  if (digits.length === 10 && digits.startsWith("5")) digits = "0" + digits;
  return digits;
}

function todayInIstanbul() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function getSlotId(date: string, time: string, specialistId: string) {
  return `${date}_${time}_${specialistId}`.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function generateReferenceNo() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let value = "";
  for (let index = 0; index < 5; index += 1) {
    value += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return value;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const businessId = clean(body.businessId);
    const serviceId = clean(body.serviceId);
    const specialistId = clean(body.specialistId);
    const date = clean(body.date);
    const time = clean(body.time);
    const customerName = clean(body.customerName);
    const customerPhone = normalizeTurkishPhone(clean(body.customerPhone));
    const couponCode = clean(body.couponCode).toUpperCase();
    const whatsappOptIn = body.whatsappOptIn === true;
    const privacyAccepted = body.privacyAccepted === true;
    const termsAccepted = body.termsAccepted === true;

    if (!businessId || !serviceId || !specialistId || !validDate(date) || !validTime(time) || !customerName || !customerPhone || !privacyAccepted || !termsAccepted) {
      return NextResponse.json({ error: !privacyAccepted ? "Randevu oluşturmak için KVKK Aydınlatma Metnini okuduğunuzu belirtmeniz gerekir." : !termsAccepted ? "Randevu oluşturmak için Randevu ve Hizmet Koşullarını kabul etmeniz gerekir." : "Randevu bilgileri eksik veya geçersiz." }, { status: 400 });
    }

    if (date < todayInIstanbul()) {
      return NextResponse.json({ error: "Geçmiş bir tarih için randevu alınamaz." }, { status: 400 });
    }

    if (!/^05\d{9}$/.test(customerPhone)) {
      return NextResponse.json({ error: "Geçerli bir Türkiye telefon numarası girin." }, { status: 400 });
    }

    const db = getAdminDb();
    const businessRef = db.collection("businesses").doc(businessId);
    const serviceRef = businessRef.collection("services").doc(serviceId);
    const specialistRef = businessRef.collection("specialists").doc(specialistId);
    const dayId = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][new Date(`${date}T12:00:00`).getDay()];
    const hoursRef = businessRef.collection("hours").doc(dayId);
    const bookingRef = businessRef.collection("bookings").doc(generateReferenceNo());
    let couponRef: DocumentReference | null = null;
    if (couponCode) {
      const couponQuery = await db.collection("coupons").where("code", "==", couponCode).limit(1).get();
      if (couponQuery.empty) throw new Error("COUPON_INVALID");
      couponRef = couponQuery.docs[0].ref;
    }

    const transactionResult = await db.runTransaction(async (transaction) => {
      const [businessSnap, serviceSnap, specialistSnap, hoursSnap, couponSnap] = await Promise.all([
        transaction.get(businessRef),
        transaction.get(serviceRef),
        transaction.get(specialistRef),
        transaction.get(hoursRef),
        couponRef ? transaction.get(couponRef) : Promise.resolve(null)
      ]);

      if (!businessSnap.exists || businessSnap.data()?.active === false || businessSnap.data()?.accessEnabled === false) {
        throw new Error("BUSINESS_UNAVAILABLE");
      }
      if (!serviceSnap.exists) throw new Error("SERVICE_NOT_FOUND");
      if (!specialistSnap.exists) throw new Error("SPECIALIST_NOT_FOUND");

      const service = serviceSnap.data() || {};
      const specialist = specialistSnap.data() || {};
      const duration = Math.max(30, Math.ceil(Number(service.durationMinutes || 0) / 30) * 30);
      const requestedTime = minutes(time);
      if (!Number.isFinite(requestedTime) || requestedTime % 30 !== 0) throw new Error("INVALID_TIME");

      const businessHours = hoursSnap.exists ? hoursSnap.data() || {} : { enabled: false };
      const specialistDay = specialist.schedule?.[dayId];
      const working = specialistDay || businessHours;

      if (Array.isArray(specialist.timeOffDates) && specialist.timeOffDates.includes(date)) throw new Error("NOT_WORKING");
      if (working.enabled === false) throw new Error("NOT_WORKING");

      const open = minutes(typeof working.open === "string" ? working.open : "00:00");
      const close = minutes(typeof working.close === "string" ? working.close : "00:00");
      if (requestedTime < open || requestedTime + duration > close) throw new Error("OUTSIDE_HOURS");

      const breakStart = specialistDay?.breakStart ? minutes(specialistDay.breakStart) : null;
      const breakEnd = specialistDay?.breakEnd ? minutes(specialistDay.breakEnd) : null;
      if (breakStart !== null && breakEnd !== null && requestedTime < breakEnd && requestedTime + duration > breakStart) throw new Error("BREAK_TIME");

      const serviceIds = Array.isArray(specialist.serviceIds) ? specialist.serviceIds : [];
      if (!serviceIds.includes(serviceId)) throw new Error("SPECIALIST_SERVICE_MISMATCH");

      const segmentTimes = Array.from({ length: duration / 30 }, (_, index) => {
        const value = requestedTime + index * 30;
        return [String(Math.floor(value / 60)).padStart(2, "0"), String(value % 60).padStart(2, "0")].join(":");
      });
      const slotRefs = segmentTimes.map((segment) => businessRef.collection("slots").doc(getSlotId(date, segment, specialistId)));
      const bookingExisting = await transaction.get(bookingRef);
      const slotSnapshots = await Promise.all(slotRefs.map((ref) => transaction.get(ref)));

      if (bookingExisting.exists || slotSnapshots.some((snapshot) => snapshot.exists)) throw new Error("SLOT_TAKEN");

      let discount = 0;
      let couponId = "";
      let appliedCouponCode = "";
      let totalPrice = Number(service.price || 0);

      if (couponCode) {
        if (!couponSnap || !couponSnap.exists) throw new Error("COUPON_INVALID");
        const couponDoc = couponSnap;
        const coupon = couponDoc.data() || {};
        if (coupon.active === false || (coupon.businessId && coupon.businessId !== businessId)) throw new Error("COUPON_INVALID");
        const today = todayInIstanbul();
        if ((coupon.startDate && today < coupon.startDate) || (coupon.endDate && today > coupon.endDate)) throw new Error("COUPON_INVALID");
        if (coupon.usageLimit != null && Number(coupon.usageCount || 0) >= Number(coupon.usageLimit)) throw new Error("COUPON_LIMIT");
        const rawDiscount = coupon.type === "fixed" ? Number(coupon.value || 0) : totalPrice * Number(coupon.value || 0) / 100;
        discount = Math.min(totalPrice, Math.max(0, Math.round(rawDiscount * 100) / 100));
        totalPrice = Math.max(0, totalPrice - discount);
        couponId = couponDoc.id;
        appliedCouponCode = coupon.code;
        transaction.update(couponDoc.ref, { usageCount: FieldValue.increment(1), updatedAt: new Date() });
      }

      slotRefs.forEach((slotRef, index) => {
        transaction.set(slotRef, {
          slotId: slotRef.id,
          date,
          time: segmentTimes[index],
          specialistId,
          status: "confirmed",
          createdAt: new Date()
        });
      });

      transaction.set(bookingRef, {
        businessId,
        referenceNo: bookingRef.id,
        serviceId,
        serviceName: service.name || "",
        serviceDurationMinutes: Number(service.durationMinutes || 0),
        servicePrice: Number(service.price || 0),
        discount,
        totalPrice,
        couponId: couponId || null,
        couponCode: appliedCouponCode || null,
        specialistId,
        specialistName: specialist.name || "",
        customerName,
        customerPhone,
        date,
        time,
        whatsappOptIn,
        privacyAccepted: true,
        privacyConsentAt: new Date(),
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        status: "confirmed",
        slotId: slotRefs[0].id,
        createdAt: new Date()
      });

      return { referenceNo: bookingRef.id, discount, totalPrice };
    });

    return NextResponse.json({ ok: true, ...transactionResult });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const map: Record<string, { error: string; status: number }> = {
      BUSINESS_UNAVAILABLE: { error: "Bu işletme şu anda online randevu almıyor.", status: 403 },
      SERVICE_NOT_FOUND: { error: "Hizmet bulunamadı.", status: 400 },
      SPECIALIST_NOT_FOUND: { error: "Uzman bulunamadı.", status: 400 },
      SPECIALIST_SERVICE_MISMATCH: { error: "Bu uzman seçilen hizmeti vermiyor.", status: 400 },
      INVALID_TIME: { error: "Seçilen saat geçersiz.", status: 400 },
      NOT_WORKING: { error: "Uzman bu tarihte çalışmıyor.", status: 400 },
      OUTSIDE_HOURS: { error: "Seçilen saat çalışma saatleri dışında.", status: 400 },
      BREAK_TIME: { error: "Seçilen saat mola aralığına denk geliyor.", status: 400 },
      SLOT_TAKEN: { error: "Bu saat az önce başka bir müşteri tarafından alındı. Lütfen başka bir saat seçin.", status: 409 },
      COUPON_INVALID: { error: "Kupon artık geçerli değil. Lütfen tekrar kontrol edin.", status: 400 },
      COUPON_LIMIT: { error: "Kupon kullanım limiti dolmuş.", status: 400 }
    };
    const known = map[message];
    if (known) return NextResponse.json({ error: known.error }, { status: known.status });
    console.error("Booking creation failed", error);
    return NextResponse.json({ error: "Randevu oluşturulamadı. Lütfen tekrar deneyin." }, { status: 500 });
  }
}
