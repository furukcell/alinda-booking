import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getWhatsAppConnection, sendWhatsAppText } from "@/lib/whatsapp/server";
import {
  delayedAssistantOffer,
  getAiPreference,
  markAiOfferSent,
  markOutbound,
  shouldOfferAiAfterDelay
} from "@/lib/whatsapp/ai-access";

export async function POST(request: Request) {
  const auth = request.headers.get("authorization") || "";
  const secret = process.env.CRON_SECRET || process.env.ALINDA_CRON_SECRET;
  if (!secret || auth !== "Bearer " + secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const businesses = await getAdminDb()
    .collection("businesses")
    .where("plan", "==", "pro")
    .where("accessEnabled", "==", true)
    .get();

  let sent = 0;

  for (const business of businesses.docs) {
    const businessId = business.id;
    const sessions = await business.ref
      .collection("whatsappAiPreferences")
      .where("aiEnabled", "==", false)
      .limit(100)
      .get();

    const connection = await getWhatsAppConnection(businessId);
    if (!connection) continue;

    for (const session of sessions.docs) {
      const phone = session.id;
      const preference = await getAiPreference(businessId, phone);
      if (!shouldOfferAiAfterDelay(preference)) continue;

      await sendWhatsAppText(
        connection.phoneNumberId,
        connection.accessToken,
        phone,
        delayedAssistantOffer
      );

      await markAiOfferSent(businessId, phone);
      await markOutbound(businessId, phone);
      sent += 1;
    }
  }

  return NextResponse.json({ ok: true, sent });
}
