import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

async function requireSuperAdmin(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return false;
  try {
    const decoded = await getAdminAuth().verifyIdToken(authorization.slice(7));
    const snapshot = await getAdminDb().doc(`superadmins/${decoded.uid}`).get();
    return snapshot.exists;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!(await requireSuperAdmin(request))) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
  }

  try {
    const db = getAdminDb();
    const businessSnapshot = await db.collection("businesses").get();
    const businesses = businessSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const now = new Date();
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(now);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let activeCount = 0;
    let starterCount = 0;
    let proCount = 0;
    let newThisMonth = 0;
    let totalAppointments = 0;
    let todayAppointments = 0;
    let cancelledThisMonth = 0;
    let estimatedMrr = 0;

    for (const business of businesses) {
      const active = business.active !== false;
      const plan = business.plan === "pro" ? "pro" : "starter";

      if (active) {
        activeCount += 1;
        estimatedMrr += plan === "pro" ? 750 : 499;
      }
      if (plan === "pro") proCount += 1;
      else starterCount += 1;

      const createdAt = business.createdAt instanceof Date
        ? business.createdAt
        : business.createdAt?.toDate?.();
      if (createdAt && createdAt >= monthStart) newThisMonth += 1;

      const bookingsSnapshot = await db.collection("businesses").doc(business.id).collection("bookings").get();
      totalAppointments += bookingsSnapshot.size;

      for (const bookingDoc of bookingsSnapshot.docs) {
        const booking = bookingDoc.data();
        if (booking.date === today && booking.status !== "cancelled") todayAppointments += 1;

        if (booking.status === "cancelled") {
          const cancelledAt = booking.cancelledAt?.toDate?.();
          if (cancelledAt && cancelledAt >= monthStart) cancelledThisMonth += 1;
        }
      }
    }

    return NextResponse.json({
      businesses: businesses.length,
      activeBusinesses: activeCount,
      starterBusinesses: starterCount,
      proBusinesses: proCount,
      newBusinessesThisMonth: newThisMonth,
      totalAppointments,
      todayAppointments,
      cancelledThisMonth,
      estimatedMrr,
      note: "Tahmini MRR aktif işletmelerin mevcut aylık Starter/Pro plan fiyatlarına göre hesaplanır; ödeme kayıtları henüz sisteme bağlı değildir.",
    });
  } catch (error) {
    console.error("Admin dashboard failed", error);
    return NextResponse.json({ error: "Dashboard verileri alınamadı." }, { status: 500 });
  }
}
