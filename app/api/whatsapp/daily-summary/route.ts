import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  getWhatsAppConnection,
  getWhatsAppTemplateConfig,
  sendWhatsAppTemplate
} from "@/lib/whatsapp/server";
import { createBusinessNotification } from "@/lib/notifications/business";

export const dynamic = "force-dynamic";

function todayIstanbul() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(new Date(`${date}T12:00:00+03:00`));
}

function buildSummary(date: string, bookings: Array<{
  time: string;
  customerName: string;
  referenceNo: string;
  serviceName: string;
  specialistName: string;
}>) {
  const header = `🌸 Günaydın! Bugünkü randevularınız\n📅 ${formatDate(date)}\n`;
  if (!bookings.length) {
    return `${header}\nBugün planlanmış randevunuz bulunmuyor. İyi çalışmalar! 🌿`;
  }

  const lines = bookings.map((booking, index) =>
    `${index + 1}. ${booking.time} — ${booking.customerName}\n💅 ${booking.serviceName}\n👩 ${booking.specialistName}\n🔖 Ref: ${booking.referenceNo}`
  );

  const footer = `\n\nToplam: ${bookings.length} randevu\n🌸 İyi çalışmalar!`;
  return `${header}\n${lines.join("\n\n")}${footer}`.slice(0, 4000);
}

export async function POST(request: Request) {
  const expected = process.env.CRON_SECRET;
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!expected || !provided || provided !== expected) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const date = todayIstanbul();
    const businesses = await db.collection("businesses").where("plan", "==", "pro").get();

    let sent = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const businessDoc of businesses.docs) {
      const business = businessDoc.data();
      if (business.whatsappDailySummaryEnabled !== true) {
        skipped++;
        continue;
      }

      try {
        const connection = await getWhatsAppConnection(businessDoc.id);
        const templates = getWhatsAppTemplateConfig();
        const phone = typeof business.whatsappNotificationPhone === "string"
          ? business.whatsappNotificationPhone
          : typeof business.phone === "string" ? business.phone : "";

        if (!connection || !phone || !templates.dailySummaryTemplate) {
          skipped++;
          continue;
        }

        const snapshot = await db.collection(`businesses/${businessDoc.id}/bookings`)
          .where("date", "==", date)
          .get();

        const bookings = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              time: typeof data.time === "string" ? data.time : "",
              customerName: typeof data.customerName === "string" ? data.customerName : "",
              referenceNo: typeof data.referenceNo === "string" ? data.referenceNo : doc.id,
              serviceName: typeof data.serviceName === "string" ? data.serviceName : "",
              specialistName: typeof data.specialistName === "string" ? data.specialistName : "",
              status: typeof data.status === "string" ? data.status : "pending"
            };
          })
          .filter((booking) => booking.status !== "cancelled")
          .sort((a, b) => a.time.localeCompare(b.time));

        const message = buildSummary(date, bookings);
        await sendWhatsAppTemplate(
          connection.phoneNumberId,
          connection.accessToken,
          phone,
          templates.dailySummaryTemplate,
          templates.language,
          [message]
        );

        const sentAt = new Date();
        await businessDoc.ref.update({
          whatsappDailySummarySentAt: sentAt.toISOString(),
          whatsappDailySummaryDate: date
        });
        await createBusinessNotification(businessDoc.id, {
          type: "daily_summary",
          title: "Günlük iş özeti WhatsApp'a gönderildi",
          message: message,
          eventAt: sentAt,
          details: { date, bookingCount: bookings.length, channel: "whatsapp" },
        });
        sent++;
      } catch (error) {
        errors.push(`${businessDoc.id}: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`);
      }
    }

    return NextResponse.json({
      ok: true,
      date,
      sent,
      skipped,
      errors
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : "Günlük WhatsApp özeti gönderilemedi."
    }, { status: 500 });
  }
}
