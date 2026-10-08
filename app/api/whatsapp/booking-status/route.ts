import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { getWhatsAppConnection, getWhatsAppTemplateConfig, sendWhatsAppTemplate } from "@/lib/whatsapp/server";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(date + "T12:00:00"));
}

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization") || "";
    if (!authorization.startsWith("Bearer ")) return NextResponse.json({ ok: false }, { status: 401 });
    const decoded = await getAdminAuth().verifyIdToken(authorization.slice(7));
    const body = await request.json();
    const bookingId = typeof body.bookingId === "string" ? body.bookingId : "";
    const status = body.status === "confirmed" || body.status === "cancelled" ? body.status : "";
    if (!bookingId || !status) return NextResponse.json({ ok: false, reason: "INVALID_INPUT" }, { status: 400 });

    const db = getAdminDb();
    const businessQuery = await db.collection("businesses").where("ownerId", "==", decoded.uid).limit(1).get();
    if (businessQuery.empty) return NextResponse.json({ ok: true, sent: false, reason: "NO_BUSINESS" });
    const businessDoc = businessQuery.docs[0];
    const businessData = businessDoc.data();
    if (businessData.accessEnabled === false || businessData.active === false) {
      return NextResponse.json({ ok: false, sent: false, reason: "BUSINESS_UNAVAILABLE" }, { status: 403 });
    }
    const bookingRefDoc = db.doc(`businesses/${businessDoc.id}/bookings/${bookingId}`);
    const snapshot = await bookingRefDoc.get();
    if (!snapshot.exists) return NextResponse.json({ ok: true, sent: false, reason: "BOOKING_NOT_FOUND" });

    const booking = snapshot.data() as { customerPhone?: string; customerName?: string; serviceName?: string; specialistName?: string; date?: string; time?: string; whatsappOptIn?: boolean; businessId?: string };
    if (booking.businessId !== businessDoc.id || !booking.whatsappOptIn || !booking.customerPhone) return NextResponse.json({ ok: true, sent: false, reason: "CUSTOMER_NOT_OPTED_IN" });

    const connection = await getWhatsAppConnection(businessDoc.id);
    const templates = getWhatsAppTemplateConfig();
    const template = status === "confirmed" ? templates.customerConfirmedTemplate : templates.customerCancelledTemplate;
    if (!connection || !template) return NextResponse.json({ ok: true, sent: false, reason: "WHATSAPP_NOT_READY" });

    const business = businessDoc.data() as { name?: string };
    const parameters = status === "confirmed"
      ? [business.name || "ALINDA", booking.serviceName || "", booking.specialistName || "", formatDate(booking.date || ""), booking.time || ""]
      : [business.name || "ALINDA", booking.serviceName || "", formatDate(booking.date || ""), booking.time || ""];

    await sendWhatsAppTemplate(connection.phoneNumberId, connection.accessToken, booking.customerPhone, template, templates.language, parameters);
    await bookingRefDoc.update({ whatsappStatusNotificationSentAt: new Date().toISOString() });
    return NextResponse.json({ ok: true, sent: true });
  } catch (error) {
    return NextResponse.json({ ok: false, sent: false, error: error instanceof Error ? error.message : "WhatsApp bildirimi gönderilemedi." }, { status: 200 });
  }
}
