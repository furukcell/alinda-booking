import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

function clean(v: unknown) { return typeof v === "string" ? v.trim() : ""; }

export async function GET(request: NextRequest) {
  try {
    const businessId = clean(request.nextUrl.searchParams.get("businessId"));
    const code = clean(request.nextUrl.searchParams.get("code")).toUpperCase();
    const subtotal = Number(request.nextUrl.searchParams.get("subtotal") || 0);
    if (!businessId || !code || !Number.isFinite(subtotal) || subtotal <= 0) return NextResponse.json({ error: "Kupon bilgileri geçersiz." }, { status: 400 });

    const snapshot = await getAdminDb().collection("coupons").where("code", "==", code).limit(1).get();
    if (snapshot.empty) return NextResponse.json({ error: "Kupon kodu bulunamadı." }, { status: 404 });
    const doc = snapshot.docs[0];
    const coupon = doc.data();
    if (coupon.active === false) return NextResponse.json({ error: "Bu kupon şu anda aktif değil." }, { status: 400 });
    if (coupon.businessId && coupon.businessId !== businessId) return NextResponse.json({ error: "Bu kupon bu işletmede geçerli değil." }, { status: 400 });

    const today = new Date().toISOString().slice(0, 10);
    if (coupon.startDate && today < coupon.startDate) return NextResponse.json({ error: "Bu kupon henüz başlamadı." }, { status: 400 });
    if (coupon.endDate && today > coupon.endDate) return NextResponse.json({ error: "Bu kuponun süresi dolmuş." }, { status: 400 });
    if (coupon.usageLimit != null && Number(coupon.usageCount || 0) >= Number(coupon.usageLimit)) return NextResponse.json({ error: "Bu kuponun kullanım limiti dolmuş." }, { status: 400 });

    const rawDiscount = coupon.type === "fixed" ? Number(coupon.value || 0) : subtotal * Number(coupon.value || 0) / 100;
    const discount = Math.min(subtotal, Math.max(0, Math.round(rawDiscount * 100) / 100));
    return NextResponse.json({ couponId: doc.id, code: coupon.code, type: coupon.type, value: Number(coupon.value || 0), discount, total: Math.max(0, subtotal - discount) });
  } catch (error) {
    console.error("Coupon validation failed", error);
    return NextResponse.json({ error: "Kupon kontrol edilemedi." }, { status: 500 });
  }
}
