import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

async function requireSuperAdmin(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return null;
  try {
    const decoded = await getAdminAuth().verifyIdToken(authorization.slice(7));
    const admin = await getAdminDb().doc(`superadmins/${decoded.uid}`).get();
    return admin.exists ? decoded : null;
  } catch {
    return null;
  }
}

function dateValue(value: any) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  return null;
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const admin = await requireSuperAdmin(request);
  if (!admin) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });

  try {
    const { id } = await context.params;
    const db = getAdminDb();
    const businessRef = db.collection("businesses").doc(id);
    const businessSnapshot = await businessRef.get();
    if (!businessSnapshot.exists) return NextResponse.json({ error: "İşletme bulunamadı." }, { status: 404 });

    const business = businessSnapshot.data() || {};
    let owner = null;
    if (typeof business.ownerId === "string" && business.ownerId) {
      try {
        const user = await getAdminAuth().getUser(business.ownerId);
        owner = {
          uid: user.uid,
          email: user.email || "",
          emailVerified: user.emailVerified,
          disabled: user.disabled,
          createdAt: user.metadata.creationTime || null,
          lastSignInAt: user.metadata.lastSignInTime || null,
        };
      } catch {}
    }

    const [services, specialists, bookings, integration] = await Promise.all([
      businessRef.collection("services").get(),
      businessRef.collection("specialists").get(),
      businessRef.collection("bookings").get(),
      businessRef.collection("integrations").doc("whatsapp").get(),
    ]);

    const bookingRows = bookings.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        referenceNo: typeof data.referenceNo === "string" ? data.referenceNo : doc.id,
        customerName: typeof data.customerName === "string" ? data.customerName : "",
        customerPhone: typeof data.customerPhone === "string" ? data.customerPhone : "",
        serviceName: typeof data.serviceName === "string" ? data.serviceName : "",
        specialistName: typeof data.specialistName === "string" ? data.specialistName : "",
        date: typeof data.date === "string" ? data.date : "",
        time: typeof data.time === "string" ? data.time : "",
        status: typeof data.status === "string" ? data.status : "pending",
        total: typeof data.servicePrice === "number" ? data.servicePrice : 0,
        createdAt: dateValue(data.createdAt),
      };
    }).sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));

    const activeBookings = bookingRows.filter((item) => item.status !== "cancelled");
    const cancelledBookings = bookingRows.filter((item) => item.status === "cancelled");

    return NextResponse.json({
      business: {
        id,
        ...business,
        createdAt: dateValue(business.createdAt),
        updatedAt: dateValue(business.updatedAt),
      },
      owner,
      counts: {
        services: services.size,
        specialists: specialists.size,
        bookings: bookingRows.length,
        activeBookings: activeBookings.length,
        cancelledBookings: cancelledBookings.length,
      },
      whatsapp: integration.exists ? {
        connected: true,
        phoneNumber: integration.data()?.displayPhoneNumber || integration.data()?.phoneNumber || "",
        phoneNumberId: integration.data()?.phoneNumberId || "",
        wabaId: integration.data()?.wabaId || "",
      } : {
        connected: false,
        phoneNumber: "",
        phoneNumberId: "",
        wabaId: "",
      },
      recentBookings: bookingRows.slice(0, 20),
    });
  } catch (error) {
    console.error("Admin business detail failed", error);
    return NextResponse.json({ error: "İşletme detayları alınamadı." }, { status: 500 });
  }
}
