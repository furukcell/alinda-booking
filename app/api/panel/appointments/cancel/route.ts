import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { createBusinessNotification } from "@/lib/notifications/business";

function minutes(value: string) {
  const [hours, mins] = value.split(":").map(Number);
  return hours * 60 + mins;
}

function slotId(date: string, time: string, specialistId: string) {
  return `${date}_${time}_${specialistId}`.replace(/[^a-zA-Z0-9_-]/g, "-");
}

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(authorization.slice(7));
    const body = await request.json();
    const bookingId = typeof body.bookingId === "string" ? body.bookingId.trim() : "";
    if (!bookingId) return NextResponse.json({ error: "Randevu bilgisi eksik." }, { status: 400 });

    const db = getAdminDb();
    const businesses = await db.collection("businesses").where("ownerId", "==", decoded.uid).limit(1).get();
    if (businesses.empty) return NextResponse.json({ error: "İşletme bulunamadı." }, { status: 404 });

    const businessRef = businesses.docs[0].ref;
    const businessId = businessRef.id;
    const bookingRef = businessRef.collection("bookings").doc(bookingId);
    const result = await db.runTransaction(async (transaction) => {
      const [businessSnapshot, bookingSnapshot] = await Promise.all([
        transaction.get(businessRef),
        transaction.get(bookingRef),
      ]);
      const business = businessSnapshot.data() || {};
      if (!businessSnapshot.exists || business.active === false || business.accessEnabled === false) {
        throw new Error("BUSINESS_UNAVAILABLE");
      }
      if (!bookingSnapshot.exists) throw new Error("BOOKING_NOT_FOUND");

      const booking = bookingSnapshot.data() || {};
      if (booking.businessId !== businessId) throw new Error("BOOKING_NOT_FOUND");
      if (booking.status === "cancelled") return { alreadyCancelled: true, booking };
      if (booking.status !== "confirmed") throw new Error("CANNOT_CANCEL");

      const duration = Math.max(30, Math.ceil(Number(booking.serviceDurationMinutes || 30) / 30) * 30);
      const start = minutes(String(booking.time || ""));
      const specialistId = String(booking.specialistId || "");
      const slotRefs = Number.isFinite(start) && specialistId
        ? Array.from({ length: duration / 30 }, (_, index) => {
            const value = start + index * 30;
            const time = `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
            return businessRef.collection("slots").doc(slotId(String(booking.date || ""), time, specialistId));
          })
        : [];
      const slotSnapshots = await Promise.all(slotRefs.map((ref) => transaction.get(ref)));
      const cancelledAt = new Date();
      transaction.update(bookingRef, { status: "cancelled", cancelledAt, cancelledBy: "owner" });
      slotSnapshots.forEach((snapshot, index) => {
        if (snapshot.exists) transaction.delete(slotRefs[index]);
      });
      return { alreadyCancelled: false, booking: { ...booking, cancelledAt, cancelledBy: "owner" } };
    });

    if (!result.alreadyCancelled) {
      const booking = result.booking;
      try {
        await createBusinessNotification(businessId, {
          type: "booking_cancelled",
          title: "Randevu işletme tarafından iptal edildi",
          message: `${booking.customerName || "Müşteri"} · ${booking.referenceNo || bookingId} referanslı randevu iptal edildi.`,
          bookingId,
          referenceNo: typeof booking.referenceNo === "string" ? booking.referenceNo : bookingId,
          details: {
            customerName: booking.customerName || "",
            serviceName: booking.serviceName || "",
            specialistName: booking.specialistName || "",
            date: booking.date || "",
            time: booking.time || "",
            cancelledBy: "owner",
          },
        });
      } catch (notificationError) {
        console.error("Owner cancellation notification failed", notificationError);
      }
    }

    return NextResponse.json({ ok: true, alreadyCancelled: result.alreadyCancelled });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const errors: Record<string, { error: string; status: number }> = {
      BUSINESS_UNAVAILABLE: { error: "İşletme erişimi şu anda aktif değil.", status: 403 },
      BOOKING_NOT_FOUND: { error: "Randevu bulunamadı.", status: 404 },
      CANNOT_CANCEL: { error: "Bu randevu iptal edilemiyor.", status: 400 },
    };
    if (errors[message]) return NextResponse.json({ error: errors[message].error }, { status: errors[message].status });
    console.error("Owner booking cancellation failed", error);
    return NextResponse.json({ error: "Randevu iptal edilemedi." }, { status: 500 });
  }
}
