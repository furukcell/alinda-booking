import { NextRequest, NextResponse } from "next/server";
import { type DocumentData } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("90")) digits = "0" + digits.slice(2);
  if (digits.length === 10 && digits.startsWith("5")) digits = "0" + digits;
  return digits;
}

function validReference(value: string) {
  return /^[A-Z2-9]{5}$/.test(value.toUpperCase());
}

function minutes(value: string) {
  const [hours, mins] = value.split(":").map(Number);
  return hours * 60 + mins;
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

function responseData(data: DocumentData) {
  return {
    referenceNo: data.referenceNo || "",
    serviceName: data.serviceName || "",
    specialistName: data.specialistName || "",
    customerName: data.customerName || "",
    date: data.date || "",
    time: data.time || "",
    serviceDurationMinutes: Number(data.serviceDurationMinutes || 0),
    servicePrice: Number(data.servicePrice || 0),
    discount: Number(data.discount || 0),
    totalPrice: Number(data.totalPrice ?? data.servicePrice ?? 0),
    status: data.status || "pending"
  };
}

export async function GET(request: NextRequest) {
  try {
    const businessId = clean(request.nextUrl.searchParams.get("businessId"));
    const referenceNo = clean(request.nextUrl.searchParams.get("referenceNo")).toUpperCase();
    const phone = normalizePhone(clean(request.nextUrl.searchParams.get("phone")));

    if (!businessId || !validReference(referenceNo) || !/^05\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "Randevu referansı ve telefon numarası geçerli olmalıdır." }, { status: 400 });
    }

    const db = getAdminDb();
    const businessRef = db.collection("businesses").doc(businessId);
    const [businessSnap, bookingSnap] = await Promise.all([
      businessRef.get(),
      businessRef.collection("bookings").doc(referenceNo).get()
    ]);

    if (!businessSnap.exists || businessSnap.data()?.active === false || businessSnap.data()?.accessEnabled === false) {
      return NextResponse.json({ error: "Bu işletme şu anda online randevu işlemlerine kapalı." }, { status: 403 });
    }

    if (!bookingSnap.exists) {
      return NextResponse.json({ error: "Randevu bulunamadı." }, { status: 404 });
    }

    const booking = bookingSnap.data() || {};
    if (normalizePhone(String(booking.customerPhone || "")) !== phone) {
      return NextResponse.json({ error: "Randevu bulunamadı. Referans ve telefon numaranızı kontrol edin." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, booking: responseData(booking) });
  } catch (error) {
    console.error("Booking lookup failed", error);
    return NextResponse.json({ error: "Randevu sorgulanamadı. Lütfen tekrar deneyin." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const businessId = clean(body.businessId);
    const referenceNo = clean(body.referenceNo).toUpperCase();
    const phone = normalizePhone(clean(body.phone));

    if (!businessId || !validReference(referenceNo) || !/^05\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "Randevu referansı ve telefon numarası geçerli olmalıdır." }, { status: 400 });
    }

    const db = getAdminDb();
    const businessRef = db.collection("businesses").doc(businessId);
    const bookingRef = businessRef.collection("bookings").doc(referenceNo);
    const result = await db.runTransaction(async (transaction) => {
      const businessSnap = await transaction.get(businessRef);
      const bookingSnap = await transaction.get(bookingRef);

      if (!businessSnap.exists || businessSnap.data()?.active === false || businessSnap.data()?.accessEnabled === false) {
        throw new Error("BUSINESS_UNAVAILABLE");
      }
      if (!bookingSnap.exists) throw new Error("BOOKING_NOT_FOUND");

      const booking = bookingSnap.data() || {};
      if (normalizePhone(String(booking.customerPhone || "")) !== phone) throw new Error("BOOKING_NOT_FOUND");
      if (booking.status === "cancelled") return { ...responseData(booking), alreadyCancelled: true };
      if (booking.status !== "pending" && booking.status !== "confirmed") throw new Error("CANNOT_CANCEL");
      if (String(booking.date || "") < todayInIstanbul()) throw new Error("PAST_BOOKING");

      const duration = Math.max(30, Math.ceil(Number(booking.serviceDurationMinutes || 0) / 30) * 30);
      const specialistId = String(booking.specialistId || "");
      const start = minutes(String(booking.time || ""));
      const slotRefs = Number.isFinite(start) && specialistId
        ? Array.from({ length: duration / 30 }, (_, index) => {
            const value = start + index * 30;
            const time = [String(Math.floor(value / 60)).padStart(2, "0"), String(value % 60).padStart(2, "0")].join(":");
            return businessRef.collection("slots").doc(getSlotId(String(booking.date), time, specialistId));
          })
        : [];

      const slotSnapshots = await Promise.all(slotRefs.map((ref) => transaction.get(ref)));
      transaction.update(bookingRef, { status: "cancelled", cancelledAt: new Date(), cancelledBy: "customer" });
      slotSnapshots.forEach((snapshot, index) => {
        if (snapshot.exists) transaction.delete(slotRefs[index]);
      });

      return { ...responseData(booking), status: "cancelled", alreadyCancelled: false };
    });

    return NextResponse.json({ ok: true, booking: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const map: Record<string, { error: string; status: number }> = {
      BUSINESS_UNAVAILABLE: { error: "Bu işletme şu anda online randevu işlemlerine kapalı.", status: 403 },
      BOOKING_NOT_FOUND: { error: "Randevu bulunamadı. Referans ve telefon numaranızı kontrol edin.", status: 404 },
      CANNOT_CANCEL: { error: "Bu randevu artık müşteri tarafından iptal edilemez.", status: 400 },
      PAST_BOOKING: { error: "Geçmiş tarihli randevu iptal edilemez.", status: 400 }
    };
    const known = map[message];
    if (known) return NextResponse.json({ error: known.error }, { status: known.status });
    console.error("Booking cancellation failed", error);
    return NextResponse.json({ error: "Randevu iptal edilemedi. Lütfen tekrar deneyin." }, { status: 500 });
  }
}
