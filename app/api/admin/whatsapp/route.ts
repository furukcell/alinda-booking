import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

async function isSuperAdmin(request: NextRequest) {
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) return false;
  try {
    const decoded = await getAdminAuth().verifyIdToken(header.slice(7));
    return (await getAdminDb().doc(`superadmins/${decoded.uid}`).get()).exists;
  } catch { return false; }
}

export async function GET(request: NextRequest) {
  if (!(await isSuperAdmin(request))) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
  try {
    const db = getAdminDb();
    const snapshot = await db.collection("businesses").get();
    const rows = await Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data();
      const integration = await doc.ref.collection("integrations").doc("whatsapp").get();
      const connection = integration.exists ? integration.data() || {} : {};
      return {
        id: doc.id, name: data.name || doc.id, ownerEmail: data.ownerEmail || "",
        plan: data.plan === "pro" ? "pro" : "starter",
        accessEnabled: data.accessEnabled !== false,
        connected: Boolean(connection.wabaId && connection.phoneNumberId),
        displayPhoneNumber: connection.displayPhoneNumber || "",
        verifiedName: connection.verifiedName || "",
        phoneNumberId: connection.phoneNumberId || "",
        wabaId: connection.wabaId || "",
        dailySummaryEnabled: data.whatsappDailySummaryEnabled === true,
      };
    }));
    return NextResponse.json({ businesses: rows.sort((a, b) => a.name.localeCompare(b.name, "tr")) });
  } catch (error) {
    console.error("Admin WhatsApp status failed", error);
    return NextResponse.json({ error: "WhatsApp durumları alınamadı." }, { status: 500 });
  }
}