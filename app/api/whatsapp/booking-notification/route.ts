import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  getWhatsAppConnection,
  getWhatsAppTemplateConfig,
  sendWhatsAppTemplate
} from "@/lib/whatsapp/server";

function formatDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(parsed);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const businessId = typeof body.businessId === "string" ? body.businessId : "";
    const bookingId = typeof body.bookingId === "string" ? body.bookingId : "";

    if (!businessId || !bookingId) {
      return NextResponse.json({ error: "Eksik randevu bilgisi." }, { status: 400 });
    }

    const db = getAdminDb();
    const bookingRef = db.doc(`businesses/${businessId}/bookings/${bookingId}`);
    const bookingSnapshot = await bookingRef.get();

    if (!bookingSnapshot.exists) {
      return NextResponse.json({ error: "Randevu bulunamadı." }, { status: 404 });
    }

    const booking = bookingSnapshot.data() as {
      businessId: string;
      serviceName: string;
      specialistName: string;
      customerName: string;
      customerPhone: string;
      whatsappOptIn?: boolean;
      date: string;
      time: string;
    };

    const connection = await getWhatsAppConnection(businessId);
    const templates = getWhatsAppTemplateConfig();

    if (!connection || !templates.ownerTemplate || !templates.customerTemplate) {
      return NextResponse.json({ ok: true, sent: false, reason: "WHATSAPP_NOT_READY" });
    }

    if (booking.businessId !== businessId) {
      return NextResponse.json({ error: "Randevu işletmeyle eşleşmiyor." }, { status: 400 });
    }

    const businessSnapshot = await db.doc(`businesses/${businessId}`).get();
    const business = businessSnapshot.data() as { name?: string; phone?: string; whatsappNotificationPhone?: string } | undefined;
    const ownerPhone = business?.whatsappNotificationPhone || business?.phone || "";

    const common = [
      booking.customerName,
      booking.serviceName,
      booking.specialistName,
      formatDate(booking.date),
      booking.time
    ];

    if (ownerPhone) {
      await sendWhatsAppTemplate(
        connection.phoneNumberId,
        connection.accessToken,
        ownerPhone,
        templates.ownerTemplate,
        templates.language,
        [...common, booking.customerPhone]
      );
    }

    if (booking.whatsappOptIn) {
      await sendWhatsAppTemplate(
        connection.phoneNumberId,
        connection.accessToken,
        booking.customerPhone,
        templates.customerTemplate,
        templates.language,
        [business?.name || "ALINDA", booking.serviceName, booking.specialistName, formatDate(booking.date), booking.time]
      );
    }

    await bookingRef.update({
      whatsappNotificationSentAt: new Date().toISOString()
    });

    return NextResponse.json({ ok: true, sent: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "WhatsApp bildirimi gönderilemedi.";
    return NextResponse.json({ ok: false, sent: false, error: message }, { status: 200 });
  }
}
