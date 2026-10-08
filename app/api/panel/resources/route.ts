import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

const allowed = new Set(["services", "specialists", "hours", "bookings"]);

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });

  try {
    const decoded = await getAdminAuth().verifyIdToken(authorization.slice(7));
    const type = request.nextUrl.searchParams.get("type") || "";
    if (!allowed.has(type)) return NextResponse.json({ error: "Geçersiz kaynak." }, { status: 400 });

    const businessSnapshot = await getAdminDb().collection("businesses").where("ownerId", "==", decoded.uid).limit(1).get();
    if (businessSnapshot.empty) return NextResponse.json({ error: "Bu kullanıcıya bağlı işletme bulunamadı." }, { status: 404 });

    const businessDoc = businessSnapshot.docs[0];
    const businessId = businessDoc.id;
    const businessData = businessDoc.data();
    if (businessData.accessEnabled === false || businessData.active === false) {
      return NextResponse.json({ error: "İşletme erişimi şu anda aktif değil." }, { status: 403 });
    }
    const snapshot = await getAdminDb().collection("businesses").doc(businessId).collection(type).get();

    return NextResponse.json({
      businessId,
      items: snapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
    });
  } catch (error) {
    console.error("Panel resource lookup failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Veriler alınamadı." }, { status: 500 });
  }
}
