import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  const sinceParam = request.nextUrl.searchParams.get("since");
  const rawSince = sinceParam === null ? null : Number(sinceParam);
  if (rawSince !== null && (!Number.isFinite(rawSince) || rawSince <= 0)) {
    return NextResponse.json({ error: "Bildirim başlangıç zamanı geçersiz." }, { status: 400 });
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(authorization.slice(7));
    const db = getAdminDb();
    const businesses = await db.collection("businesses")
      .where("ownerId", "==", decoded.uid)
      .limit(1)
      .get();

    if (businesses.empty) {
      return NextResponse.json({ error: "İşletme bulunamadı." }, { status: 404 });
    }

    const businessDoc = businesses.docs[0];
    const business = businessDoc.data();
    if (business.active === false || business.accessEnabled === false) {
      return NextResponse.json({ error: "İşletme erişimi şu anda aktif değil." }, { status: 403 });
    }

    if (rawSince === null) {
      const snapshot = await businessDoc.ref.collection("notifications")
        .orderBy("createdAt", "desc")
        .limit(100)
        .get();
      const notifications = snapshot.docs.map((doc) => {
        const value = doc.data();
        const createdAt = value.eventAt?.toDate?.() || value.createdAt?.toDate?.();
        const type = value.type === "booking_created" || value.type === "booking_cancelled" || value.type === "daily_summary"
          ? value.type : "booking_created";
        return {
          id: doc.id,
          type,
          title: text(value.title) || "Bildirim",
          message: text(value.message),
          referenceNo: text(value.referenceNo),
          bookingId: text(value.bookingId),
          createdAt: createdAt instanceof Date ? createdAt.toISOString() : null,
          details: value.details && typeof value.details === "object" ? value.details : {},
        };
      });
      return NextResponse.json({ notifications, businessName: text(business.name) });
    }

    const snapshot = await businessDoc.ref.collection("bookings")
      .where("createdAt", ">", Timestamp.fromMillis(rawSince))
      .orderBy("createdAt", "asc")
      .limit(10)
      .get();

    const notifications = snapshot.docs.map((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate?.();
      return {
        id: doc.id,
        referenceNo: text(data.referenceNo) || doc.id,
        customerName: text(data.customerName) || "Yeni müşteri",
        serviceName: text(data.serviceName) || "Hizmet",
        specialistName: text(data.specialistName),
        date: text(data.date),
        time: text(data.time),
        totalPrice: Number(data.totalPrice ?? data.servicePrice ?? 0),
        createdAt: createdAt instanceof Date ? createdAt.getTime() : null,
      };
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Panel booking notifications failed", error);
    return NextResponse.json({ error: "Yeni randevu bildirimleri alınamadı." }, { status: 500 });
  }
}
