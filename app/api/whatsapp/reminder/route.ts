import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  getWhatsAppConnection,
  getWhatsAppTemplateConfig,
  sendWhatsAppTemplate
} from "@/lib/whatsapp/server";

export const dynamic = "force-dynamic";

function nowIstanbul() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:00+03:00`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(new Date(`${date}T12:00:00+03:00`));
}

function bookingDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00+03:00`);
}

export async function POST(request: Request) {
  const expected = process.env.CRON_SECRET || process.env.ALINDA_CRON_SECRET;
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!expected || !provided || provided !== expected) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const templates = getWhatsAppTemplateConfig();
    const now = new Date(nowIstanbul());
    const windowStart = new Date(now.getTime() + 23.5 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 24.5 * 60 * 60 * 1000);

    if (!templates.customerReminderTemplate) {
      return NextResponse.json({ ok: true, sent: 0, skipped: 0, reason: "REMINDER_TEMPLATE_NOT_READY" });
    }

    const businesses = await db.collection("businesses").where("plan", "==", "pro").get();
    let sent = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const businessDoc of businesses.docs) {
      try {
        const connection = await getWhatsAppConnection(businessDoc.id);
        if (!connection) {
          skipped++;
          continue;
        }

        const bookingsSnapshot = await db.collection(`businesses/${businessDoc.id}/bookings`)
          .where("status", "==", "confirmed")
          .get();

        const business = businessDoc.data() as { name?: string };

        for (const bookingDoc of bookingsSnapshot.docs) {
          const booking = bookingDoc.data();
          if (booking.whatsappOptIn !== true || booking.whatsappReminder24hSentAt) {
            skipped++;
            continue;
          }

          const customerPhone = typeof booking.customerPhone === "string" ? booking.customerPhone : "";
          const date = typeof booking.date === "string" ? booking.date : "";
          const time = typeof booking.time === "string" ? booking.time : "";
          if (!customerPhone || !date || !/^\d{2}:\d{2}$/.test(time)) {
            skipped++;
            continue;
          }

          const appointmentAt = bookingDateTime(date, time);
          if (appointmentAt < windowStart || appointmentAt >= windowEnd) {
            continue;
          }

          await sendWhatsAppTemplate(
            connection.phoneNumberId,
            connection.accessToken,
            customerPhone,
            templates.customerReminderTemplate,
            templates.language,
            [
              business.name || "ALINDA",
              typeof booking.serviceName === "string" ? booking.serviceName : "",
              typeof booking.specialistName === "string" ? booking.specialistName : "",
              formatDate(date),
              time
            ]
          );

          await bookingDoc.ref.update({
            whatsappReminder24hSentAt: new Date().toISOString()
          });
          sent++;
        }
      } catch (error) {
        errors.push(`${businessDoc.id}: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`);
      }
    }

    return NextResponse.json({ ok: true, sent, skipped, windowStart: windowStart.toISOString(), windowEnd: windowEnd.toISOString(), errors });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : "WhatsApp hatırlatmaları gönderilemedi."
    }, { status: 500 });
  }
}
