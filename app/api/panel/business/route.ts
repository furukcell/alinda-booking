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
      const all = await getAdminDb().collection("businesses").limit(100).get();
      const fallback = all.docs.find((item) => item.data().ownerId === decoded.uid);
      if (!fallback) {
        console.error("Owner business not found", {
          uid: decoded.uid,
          email: decoded.email || null,
          businessCountChecked: all.size,
        });
        return NextResponse.json({
          error: "Bu kullanıcıya bağlı işletme bulunamadı.",
          debug: { uid: decoded.uid, email: decoded.email || null, businessCountChecked: all.size },
        }, { status: 404 });
      }
      return NextResponse.json({
        businessId: fallback.id,
        business: { id: fallback.id, ...fallback.data() },
      });
    }

    const doc = snapshot.docs[0];
    return NextResponse.json({ businessId: doc.id, business: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error("Panel business lookup failed", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "İşletme bilgisi alınamadı.",
    }, { status: 500 });
  }
}
