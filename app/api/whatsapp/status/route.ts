import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { deleteWhatsAppConnection, getWhatsAppConnection } from "@/lib/whatsapp/server";

async function getBusinessId(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const decoded = await getAdminAuth().verifyIdToken(header.slice(7));

  const snapshot = await getAdminDb()
    .collection("businesses")
    .where("ownerId", "==", decoded.uid)
    .limit(1)
    .get();

  if (snapshot.empty) throw new Error("NO_BUSINESS");
  return snapshot.docs[0].id;
}

export async function GET(request: Request) {
  try {
    const businessId = await getBusinessId(request);
    const connection = await getWhatsAppConnection(businessId);

    return NextResponse.json({
      connected: Boolean(connection?.wabaId && connection?.phoneNumberId),
      displayPhoneNumber: connection?.displayPhoneNumber || "",
      verifiedName: connection?.verifiedName || ""
    });
  } catch {
    return NextResponse.json({ error: "WhatsApp bağlantı durumu okunamadı." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const businessId = await getBusinessId(request);
    await deleteWhatsAppConnection(businessId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "WhatsApp bağlantısı kaldırılamadı." }, { status: 400 });
  }
}
