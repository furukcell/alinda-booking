import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const couponId = typeof body.couponId === "string" ? body.couponId.trim() : "";
    if (!couponId) return NextResponse.json({ error: "Kupon ID zorunlu." }, { status: 400 });
    const ref = getAdminDb().collection("coupons").doc(couponId);
    let used = false;
    await getAdminDb().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error("NOT_FOUND");
      const data = snap.data() || {};
      if (data.active === false) throw new Error("INACTIVE");
      const count = Number(data.usageCount || 0);
      if (data.usageLimit != null && count >= Number(data.usageLimit)) throw new Error("LIMIT");
      tx.update(ref, { usageCount: FieldValue.increment(1), updatedAt: new Date() });
      used = true;
    });
    return NextResponse.json({ ok: used });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "NOT_FOUND") return NextResponse.json({ error: "Kupon bulunamadı." }, { status: 404 });
    if (message === "LIMIT") return NextResponse.json({ error: "Kupon kullanım limiti dolmuş." }, { status: 400 });
    if (message === "INACTIVE") return NextResponse.json({ error: "Kupon aktif değil." }, { status: 400 });
    console.error("Coupon redeem failed", error);
    return NextResponse.json({ error: "Kupon kullanımı kaydedilemedi." }, { status: 500 });
  }
}
