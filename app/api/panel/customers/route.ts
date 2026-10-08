import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

function normalizePhone(value: unknown) {
  let digits = typeof value === "string" ? value.replace(/\D/g, "") : "";
  if (digits.startsWith("90")) digits = "0" + digits.slice(2);
  if (digits.length === 10 && digits.startsWith("5")) digits = "0" + digits;
  return digits;
}

function bookingTimestamp(date: string, time: string) {
  return date + " " + time;
}

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(authorization.slice(7));
    const businessSnapshot = await getAdminDb().collection("businesses").where("ownerId", "==", decoded.uid).limit(1).get();
    if (businessSnapshot.empty) {
      return NextResponse.json({ error: "Bu kullanıcıya bağlı işletme bulunamadı." }, { status: 404 });
    }

    const businessId = businessSnapshot.docs[0].id;
    const requestedPhone = normalizePhone(request.nextUrl.searchParams.get("phone"));
    const snapshot = await getAdminDb().collection("businesses").doc(businessId).collection("bookings").get();

    const grouped = new Map<string, {
      id: string;
      name: string;
      phone: string;
      bookingCount: number;
      confirmedCount: number;
      cancelledCount: number;
      totalSpent: number;
      lastBookingDate: string;
      lastBookingTime: string;
      lastServiceName: string;
      bookings: Array<{
        id: string;
        referenceNo: string;
        date: string;
        time: string;
        serviceName: string;
        specialistName: string;
        servicePrice: number;
        totalPrice: number;
        status: string;
      }>;
    }>();

    for (const document of snapshot.docs) {
      const data = document.data();
      const phone = normalizePhone(data.customerPhone);
      if (!phone || (requestedPhone && phone !== requestedPhone)) continue;

      const existing = grouped.get(phone) || {
        id: phone,
        name: typeof data.customerName === "string" ? data.customerName : "Müşteri",
        phone,
        bookingCount: 0,
        confirmedCount: 0,
        cancelledCount: 0,
        totalSpent: 0,
        lastBookingDate: "",
        lastBookingTime: "",
        lastServiceName: "",
        bookings: []
      };

      const status = typeof data.status === "string" ? data.status : "pending";
      const totalPrice = Number(data.totalPrice ?? data.servicePrice ?? 0);
      existing.name = typeof data.customerName === "string" && data.customerName.trim() ? data.customerName : existing.name;
      existing.bookingCount += status !== "cancelled" ? 1 : 0;
      existing.confirmedCount += status === "confirmed" ? 1 : 0;
      existing.cancelledCount += status === "cancelled" ? 1 : 0;
      existing.totalSpent += status === "confirmed" ? Math.max(0, totalPrice) : 0;

      const date = typeof data.date === "string" ? data.date : "";
      const time = typeof data.time === "string" ? data.time : "";
      if (bookingTimestamp(date, time) > bookingTimestamp(existing.lastBookingDate, existing.lastBookingTime)) {
        existing.lastBookingDate = date;
        existing.lastBookingTime = time;
        existing.lastServiceName = typeof data.serviceName === "string" ? data.serviceName : "";
      }

      existing.bookings.push({
        id: document.id,
        referenceNo: typeof data.referenceNo === "string" ? data.referenceNo : document.id,
        date,
        time,
        serviceName: typeof data.serviceName === "string" ? data.serviceName : "",
        specialistName: typeof data.specialistName === "string" ? data.specialistName : "",
        servicePrice: Number(data.servicePrice || 0),
        totalPrice,
        status
      });

      grouped.set(phone, existing);
    }

    const customers = Array.from(grouped.values())
      .map((customer) => ({
        ...customer,
        bookings: customer.bookings.sort((a, b) => bookingTimestamp(b.date, b.time).localeCompare(bookingTimestamp(a.date, a.time)))
      }))
      .sort((a, b) => bookingTimestamp(b.lastBookingDate, b.lastBookingTime).localeCompare(bookingTimestamp(a.lastBookingDate, a.lastBookingTime)));

    if (requestedPhone) {
      return NextResponse.json({ businessId, customer: customers[0] || null });
    }

    return NextResponse.json({
      businessId,
      customers: customers.map(({ bookings, ...customer }) => customer)
    });
  } catch (error) {
    console.error("Customer lookup failed", error);
    return NextResponse.json({ error: "Müşteri bilgileri alınamadı." }, { status: 500 });
  }
}
