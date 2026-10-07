import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { logAdminActivity } from "@/lib/admin-activity";

async function requireSuperAdmin(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return null;
  try {
    const decoded = await getAdminAuth().verifyIdToken(authorization.slice(7));
    const admin = await getAdminDb().doc(`superadmins/${decoded.uid}`).get();
    return admin.exists ? decoded : null;
  } catch { return null; }
}

function clean(value: unknown) { return typeof value === "string" ? value.trim() : ""; }

function validDate(value: unknown) {
  return typeof value === "string" && (!value || /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export async function GET(request: NextRequest) {
  const admin = await requireSuperAdmin(request);
  if (!admin) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
  try {
    const snapshot = await getAdminDb().collection("coupons").orderBy("createdAt", "desc").get();
    return NextResponse.json({
      coupons: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    });
  } catch (error) {
    console.error("Admin coupons failed", error);
    return NextResponse.json({ error: "Kuponlar alınamadı." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireSuperAdmin(request);
  if (!admin) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });

  try {
    const body = await request.json();
    const code = clean(body.code).toUpperCase().replace(/\s+/g, "");
    const name = clean(body.name) || code;
    const type = body.type === "fixed" ? "fixed" : "percent";
    const value = Number(body.value);
    const usageLimit = body.usageLimit === "" || body.usageLimit == null ? null : Number(body.usageLimit);
    const businessId = clean(body.businessId) || null;
    const startDate = clean(body.startDate) || null;
    const endDate = clean(body.endDate) || null;
    const active = body.active !== false;

    if (!/^[A-Z0-9_-]{3,30}$/.test(code)) return NextResponse.json({ error: "Kupon kodu 3-30 karakter olmalı." }, { status: 400 });
    if (!Number.isFinite(value) || value <= 0 || (type === "percent" && value > 100)) return NextResponse.json({ error: "İndirim değeri geçersiz." }, { status: 400 });
    if (usageLimit !== null && (!Number.isInteger(usageLimit) || usageLimit < 1)) return NextResponse.json({ error: "Kullanım limiti geçersiz." }, { status: 400 });
    if (!validDate(startDate) || !validDate(endDate)) return NextResponse.json({ error: "Tarih formatı geçersiz." }, { status: 400 });
    if (startDate && endDate && startDate > endDate) return NextResponse.json({ error: "Başlangıç tarihi bitişten sonra olamaz." }, { status: 400 });

    const db = getAdminDb();
    const existing = await db.collection("coupons").where("code", "==", code).limit(1).get();
    if (!existing.empty) return NextResponse.json({ error: "Bu kupon kodu zaten mevcut." }, { status: 409 });

    const ref = await db.collection("coupons").add({
      code, name, type, value, businessId, startDate, endDate, active,
      usageLimit, usageCount: 0, createdAt: new Date(), updatedAt: new Date(),
    });

    await logAdminActivity({
      adminUid: admin.uid, adminEmail: admin.email, action: "coupon_created",
      summary: `Kupon ${code} oluşturuldu.`,
      details: { couponId: ref.id, code, type, value, businessId, usageLimit },
    });

    return NextResponse.json({ id: ref.id }, { status: 201 });
  } catch (error) {
    console.error("Admin coupon create failed", error);
    return NextResponse.json({ error: "Kupon oluşturulamadı." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const admin = await requireSuperAdmin(request);
  if (!admin) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });

  try {
    const body = await request.json();
    const id = clean(body.id);
    if (!id) return NextResponse.json({ error: "Kupon ID zorunlu." }, { status: 400 });

    const ref = getAdminDb().collection("coupons").doc(id);
    const snapshot = await ref.get();
    if (!snapshot.exists) return NextResponse.json({ error: "Kupon bulunamadı." }, { status: 404 });

    const before = snapshot.data() || {};
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof body.active === "boolean") updates.active = body.active;
    if (typeof body.name === "string") updates.name = clean(body.name);
    if (body.type === "percent" || body.type === "fixed") updates.type = body.type;
    if (Number.isFinite(Number(body.value)) && Number(body.value) > 0) updates.value = Number(body.value);
    if (typeof body.usageLimit === "number" && body.usageLimit >= 1) updates.usageLimit = Math.floor(body.usageLimit);
    if (body.usageLimit === null) updates.usageLimit = null;
    if (typeof body.startDate === "string" && validDate(body.startDate)) updates.startDate = body.startDate || null;
    if (typeof body.endDate === "string" && validDate(body.endDate)) updates.endDate = body.endDate || null;
    if (typeof body.businessId === "string") updates.businessId = body.businessId.trim() || null;

    await ref.update(updates);
    await logAdminActivity({
      adminUid: admin.uid, adminEmail: admin.email, action: "coupon_updated",
      summary: `Kupon ${before.code || id} güncellendi.`,
      details: { couponId: id, changedFields: Object.keys(updates).filter((x) => x !== "updatedAt") },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin coupon update failed", error);
    return NextResponse.json({ error: "Kupon güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await requireSuperAdmin(request);
  if (!admin) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });

  try {
    const body = await request.json();
    const id = clean(body.id);
    if (!id) return NextResponse.json({ error: "Kupon ID zorunlu." }, { status: 400 });
    const ref = getAdminDb().collection("coupons").doc(id);
    const snapshot = await ref.get();
    if (!snapshot.exists) return NextResponse.json({ error: "Kupon bulunamadı." }, { status: 404 });
    const data = snapshot.data() || {};
    await ref.delete();
    await logAdminActivity({
      adminUid: admin.uid, adminEmail: admin.email, action: "coupon_deleted",
      summary: `Kupon ${data.code || id} silindi.`, details: { couponId: id, code: data.code || null },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin coupon delete failed", error);
    return NextResponse.json({ error: "Kupon silinemedi." }, { status: 500 });
  }
}
