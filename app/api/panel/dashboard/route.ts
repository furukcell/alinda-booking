import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(authorization.slice(7));
    const db = getAdminDb();

    const businessSnapshot = await db
      .collection("businesses")
      .where("ownerId", "==", decoded.uid)
      .limit(1)
      .get();

    if (businessSnapshot.empty) {
      return NextResponse.json({ error: "Bu kullanıcıya bağlı işletme bulunamadı." }, { status: 404 });
    }

    const businessDoc = businessSnapshot.docs[0];
    const businessId = businessDoc.id;
    const data = businessDoc.data();

    const [bookingsSnapshot, servicesSnapshot, specialistsSnapshot] = await Promise.all([
      db.collection("businesses").doc(businessId).collection("bookings").get(),
      db.collection("businesses").doc(businessId).collection("services").get(),
      db.collection("businesses").doc(businessId).collection("specialists").get(),
    ]);

    const bookings = bookingsSnapshot.docs.map((item) => {
      const value = item.data();
      return {
        id: item.id,
        date: stringValue(value.date),
        time: stringValue(value.time),
        customerName: stringValue(value.customerName),
        serviceName: stringValue(value.serviceName),
        status: value.status === "confirmed" || value.status === "cancelled" ? value.status : "pending",
      };
    });

    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(new Date());
    const todayBookings = bookings
      .filter((item) => item.date === today && item.status !== "cancelled")
      .sort((a, b) => a.time.localeCompare(b.time));

    return NextResponse.json({
      business: {
        id: businessId,
        name: stringValue(data.name, "İşletme"),
        slug: stringValue(data.slug, businessId),
        city: stringValue(data.city),
        district: stringValue(data.district),
        initials: stringValue(data.initials, "AL"),
        logoUrl: stringValue(data.logoUrl) || undefined,
      },
      bookings: todayBookings,
      serviceCount: servicesSnapshot.size,
      specialistCount: specialistsSnapshot.size,
      customerCount: new Set(bookings.map((item) => item.customerName.trim()).filter(Boolean)).size,
    });
  } catch (error) {
    console.error("Panel dashboard failed", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Panel verileri alınamadı.",
    }, { status: 500 });
  }
}
