import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

function asDate(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (value && typeof value === "object" && "toDate" in value && typeof (value as { toDate?: unknown }).toDate === "function") {
    return ((value as { toDate: () => Date }).toDate()).toISOString().slice(0, 10);
  }
  return null;
}

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(authorization.slice(7));
    const db = getAdminDb();
    const businessSnapshot = await db.collection("businesses")
      .where("ownerId", "==", decoded.uid)
      .limit(1)
      .get();

    if (businessSnapshot.empty) {
      return NextResponse.json({ error: "Bu kullanıcıya bağlı işletme bulunamadı." }, { status: 404 });
    }

    const businessDoc = businessSnapshot.docs[0];
    const business = businessDoc.data();
    if (business.active === false || business.accessEnabled === false) {
      return NextResponse.json({ error: "İşletme erişimi şu anda aktif değil." }, { status: 403 });
    }

    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(new Date());
    const snapshot = await db.collection("announcements").get();
    const announcements = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: typeof data.title === "string" ? data.title : "",
        message: typeof data.message === "string" ? data.message : "",
        type: data.type === "success" || data.type === "warning" ? data.type : "info",
        active: data.active === true,
        businessId: typeof data.businessId === "string" ? data.businessId : null,
        startDate: asDate(data.startDate),
        endDate: asDate(data.endDate),
        createdAt: asDate(data.createdAt),
      };
    }).filter((item) =>
      item.active
      && (!item.businessId || item.businessId === businessDoc.id)
      && (!item.startDate || item.startDate <= today)
      && (!item.endDate || item.endDate >= today)
    ).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error("Panel announcements failed", error);
    return NextResponse.json({ error: "Duyurular alınamadı." }, { status: 500 });
  }
}
