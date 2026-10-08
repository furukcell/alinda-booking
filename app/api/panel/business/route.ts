import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(authorization.slice(7));
    const snapshot = await getAdminDb()
      .collection("businesses")
      .where("ownerId", "==", decoded.uid)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: "Bu kullanıcıya bağlı işletme bulunamadı." }, { status: 404 });
    }

    const doc = snapshot.docs[0];
    return NextResponse.json({ businessId: doc.id, business: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error("Panel business lookup failed", error);
    return NextResponse.json({ error: "İşletme bilgisi alınamadı." }, { status: 500 });
  }
}
