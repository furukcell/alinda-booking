import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import {
  exchangeEmbeddedSignupCode,
  getPhoneDetails,
  saveWhatsAppConnection,
  subscribeWaba
} from "@/lib/whatsapp/server";

async function getBusinessId(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");

  const token = header.slice(7);
  const decoded = await getAdminAuth().verifyIdToken(token);
  const snapshot = await getAdminDb()
    .collection("businesses")
    .where("ownerId", "==", decoded.uid)
    .limit(1)
    .get();

  if (snapshot.empty) throw new Error("NO_BUSINESS");
  return snapshot.docs[0].id;
}

export async function POST(request: Request) {
  try {
    const businessId = await getBusinessId(request);
    const body = await request.json();
    const code = typeof body.code === "string" ? body.code.trim() : "";
    const wabaId = typeof body.wabaId === "string" ? body.wabaId.trim() : "";
    const phoneNumberId = typeof body.phoneNumberId === "string" ? body.phoneNumberId.trim() : "";

    if (!code || !wabaId || !phoneNumberId) {
      return NextResponse.json({ error: "Eksik WhatsApp bağlantı bilgisi." }, { status: 400 });
    }

    const accessToken = await exchangeEmbeddedSignupCode(code);
    await subscribeWaba(wabaId, accessToken);
    const phone = await getPhoneDetails(phoneNumberId, accessToken);

    await saveWhatsAppConnection(
      businessId,
      {
        wabaId,
        phoneNumberId,
        displayPhoneNumber: phone.display_phone_number || "",
        verifiedName: phone.verified_name || ""
      },
      accessToken
    );

    return NextResponse.json({
      ok: true,
      displayPhoneNumber: phone.display_phone_number || "",
      verifiedName: phone.verified_name || ""
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "WhatsApp bağlantısı kurulamadı.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
