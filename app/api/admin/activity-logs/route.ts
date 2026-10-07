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

export async function GET(request: NextRequest) {
  const admin = await requireSuperAdmin(request);
  if (!admin) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });

  try {
    const snapshot = await getAdminDb()
      .collection("adminActivityLogs")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const logs = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        adminUid: data.adminUid || "",
        adminEmail: data.adminEmail || "",
        action: data.action || "unknown",
        businessId: data.businessId || null,
        businessName: data.businessName || null,
        summary: data.summary || "",
        details: data.details || {},
        createdAt: dateValue(data.createdAt),
      };
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Admin activity logs failed", error);
    return NextResponse.json({ error: "Aktivite logları alınamadı." }, { status: 500 });
  }
}
