import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

async function requireSuperAdmin(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return null;
  try {
    const decoded = await getAdminAuth().verifyIdToken(authorization.slice(7));
    const snapshot = await getAdminDb().doc(`superadmins/${decoded.uid}`).get();
    return snapshot.exists ? decoded : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireSuperAdmin(request);
  if (!admin) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });

  try {
    const { businessId } = await request.json();
    if (typeof businessId !== "string" || !businessId.trim()) {
      return NextResponse.json({ error: "İşletme ID zorunlu." }, { status: 400 });
    }

    const business = await getAdminDb().collection("businesses").doc(businessId.trim()).get();
    if (!business.exists) return NextResponse.json({ error: "İşletme bulunamadı." }, { status: 404 });

    const ownerId = business.data()?.ownerId;
    if (typeof ownerId !== "string" || !ownerId) {
      return NextResponse.json({ error: "İşletme sahibinin hesabı bulunamadı." }, { status: 400 });
    }

    const user = await getAdminAuth().getUser(ownerId);
    if (!user.email) return NextResponse.json({ error: "İşletme sahibinin e-posta adresi bulunamadı." }, { status: 400 });

    const link = await getAdminAuth().generatePasswordResetLink(user.email);
    return NextResponse.json({ email: user.email, link });
  } catch (error) {
    console.error("Admin password reset link failed", error);
    return NextResponse.json({ error: "Şifre sıfırlama bağlantısı oluşturulamadı." }, { status: 500 });
  }
}