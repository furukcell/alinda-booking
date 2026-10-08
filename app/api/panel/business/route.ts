import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

async function getOwner(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  return getAdminAuth().verifyIdToken(authorization.slice(7));
}

async function findOwnedBusiness(uid: string) {
  const snapshot = await getAdminDb()
    .collection("businesses")
    .where("ownerId", "==", uid)
    .limit(1)
    .get();

  if (!snapshot.empty) return snapshot.docs[0];

  const all = await getAdminDb().collection("businesses").limit(100).get();
  return all.docs.find((item) => item.data().ownerId === uid) || null;
}

export async function GET(request: NextRequest) {
  try {
    const decoded = await getOwner(request);
    const doc = await findOwnedBusiness(decoded.uid);

    if (!doc) {
      return NextResponse.json({ error: "Bu kullanıcıya bağlı işletme bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ businessId: doc.id, business: { id: doc.id, ...doc.data() } });
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 500;
    console.error("Panel business lookup failed", error);
    return NextResponse.json({
      error: status === 401 ? "Oturum bulunamadı." : error instanceof Error ? error.message : "İşletme bilgisi alınamadı."
    }, { status });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const decoded = await getOwner(request);
    const businessDoc = await findOwnedBusiness(decoded.uid);

    if (!businessDoc) {
      return NextResponse.json({ error: "Bu kullanıcıya bağlı işletme bulunamadı." }, { status: 404 });
    }

    const body = await request.json();
    const allowed = [
      "name", "slug", "category", "description", "city", "district", "address",
      "latitude", "longitude", "phone", "whatsappNotificationPhone",
      "initials", "primaryColor", "primaryColorSoft", "whatsappDailySummaryEnabled", "logoUrl"
    ] as const;

    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, key)) updates[key] = body[key];
    }

    for (const field of ["name", "category", "city", "district"] as const) {
      if (updates[field] !== undefined && (typeof updates[field] !== "string" || !updates[field].trim())) {
        return NextResponse.json({ error: `${field} alanı boş bırakılamaz.` }, { status: 400 });
      }
    }

    if (updates.slug !== undefined) {
      if (typeof updates.slug !== "string" || !updates.slug.trim()) {
        return NextResponse.json({ error: "Randevu adresi boş bırakılamaz." }, { status: 400 });
      }
      if (updates.slug.trim().toLowerCase() !== businessDoc.id) {
        return NextResponse.json({ error: "Randevu adresi (slug) bu işletme için sabittir." }, { status: 400 });
      }
      delete updates.slug;
    }

    if (updates.latitude !== null && updates.latitude !== undefined && typeof updates.latitude !== "number") {
      return NextResponse.json({ error: "Enlem geçersiz." }, { status: 400 });
    }

    if (updates.longitude !== null && updates.longitude !== undefined && typeof updates.longitude !== "number") {
      return NextResponse.json({ error: "Boylam geçersiz." }, { status: 400 });
    }

    if (updates.initials !== undefined && typeof updates.initials !== "string") {
      return NextResponse.json({ error: "Kısa isim geçersiz." }, { status: 400 });
    }

    if (updates.logoUrl !== undefined && typeof updates.logoUrl !== "string") {
      return NextResponse.json({ error: "Logo adresi geçersiz." }, { status: 400 });
    }

    await businessDoc.ref.update(updates);

    const fresh = await businessDoc.ref.get();
    return NextResponse.json({ businessId: businessDoc.id, business: { id: businessDoc.id, ...fresh.data() } });
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 500;
    console.error("Panel business update failed", error);
    return NextResponse.json({
      error: status === 401 ? "Oturum bulunamadı." : error instanceof Error ? error.message : "İşletme bilgileri kaydedilemedi."
    }, { status });
  }
}
