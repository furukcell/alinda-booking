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

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: NextRequest) {
  const admin = await requireSuperAdmin(request);
  if (!admin) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });

  try {
    const snapshot = await getAdminDb().collection("businesses").orderBy("name").get();
    const businesses = await Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data();
      let ownerEmail = "";

      if (typeof data.ownerId === "string" && data.ownerId) {
        try {
          ownerEmail = (await getAdminAuth().getUser(data.ownerId)).email || "";
        } catch {}
      }

      return {
        id: doc.id,
        name: clean(data.name),
        slug: clean(data.slug) || doc.id,
        category: clean(data.category),
        city: clean(data.city),
        district: clean(data.district),
        address: clean(data.address),
        phone: clean(data.phone),
        ownerId: clean(data.ownerId),
        ownerEmail,
        plan: data.plan === "pro" ? "pro" : "starter",
        active: data.active !== false,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null,
      };
    }));

    return NextResponse.json({ businesses });
  } catch (error) {
    console.error("Admin business list failed", error);
    return NextResponse.json({ error: "İşletmeler alınamadı." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireSuperAdmin(request);
  if (!admin) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });

  try {
    const body = await request.json();
    const name = clean(body.name);
    const slug = clean(body.slug).toLowerCase();
    const category = clean(body.category) || "Güzellik Salonu";
    const city = clean(body.city);
    const district = clean(body.district);
    const phone = clean(body.phone);
    const ownerEmail = clean(body.ownerEmail).toLowerCase();
    const ownerPassword = typeof body.ownerPassword === "string" ? body.ownerPassword : "";

    if (!name || !slug || !ownerEmail || ownerPassword.length < 6) {
      return NextResponse.json({ error: "İşletme adı, slug, işletme e-postası ve en az 6 karakterli şifre zorunlu." }, { status: 400 });
    }

    if (!/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json({ error: "Slug yalnızca küçük harf, rakam, tire ve alt çizgi içerebilir." }, { status: 400 });
    }

    const db = getAdminDb();
    const businessRef = db.collection("businesses").doc(slug);
    if ((await businessRef.get()).exists) {
      return NextResponse.json({ error: "Bu işletme bağlantısı zaten kullanılıyor." }, { status: 409 });
    }

    let ownerUid = "";
    try {
      const user = await getAdminAuth().createUser({ email: ownerEmail, password: ownerPassword, emailVerified: false });
      ownerUid = user.uid;
    } catch (error) {
      const code = error instanceof Error && "code" in error ? String((error as { code?: string }).code) : "";
      if (code.includes("email-already-exists")) {
        return NextResponse.json({ error: "Bu e-posta zaten Firebase'de kayıtlı. Yeni işletme için farklı bir e-posta kullanın." }, { status: 409 });
      }
      throw error;
    }

    const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("") || "AL";

    await businessRef.set({
      name, slug, category, description: "", city, district, address: "", phone, initials,
      primaryColor: "#B86F61", primaryColorSoft: "#F3E4E0", ownerId: ownerUid,
      plan: "starter", active: true, whatsappDailySummaryEnabled: false, createdAt: new Date(),
    });

    return NextResponse.json({
      business: { id: slug, name, slug, category, city, district, address: "", phone, ownerId: ownerUid, ownerEmail, plan: "starter", active: true },
    }, { status: 201 });
  } catch (error) {
    console.error("Admin business creation failed", error);
    return NextResponse.json({ error: "İşletme oluşturulamadı." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const admin = await requireSuperAdmin(request);
  if (!admin) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });

  try {
    const body = await request.json();
    const businessId = clean(body.businessId);
    if (!businessId) return NextResponse.json({ error: "İşletme ID zorunlu." }, { status: 400 });

    const businessRef = getAdminDb().collection("businesses").doc(businessId);
    const snapshot = await businessRef.get();
    if (!snapshot.exists) return NextResponse.json({ error: "İşletme bulunamadı." }, { status: 404 });

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof body.name === "string") updates.name = clean(body.name);
    if (typeof body.category === "string") updates.category = clean(body.category);
    if (typeof body.city === "string") updates.city = clean(body.city);
    if (typeof body.district === "string") updates.district = clean(body.district);
    if (typeof body.address === "string") updates.address = clean(body.address);
    if (typeof body.phone === "string") updates.phone = clean(body.phone);
    if (body.plan === "starter" || body.plan === "pro") updates.plan = body.plan;
    if (typeof body.active === "boolean") updates.active = body.active;

    if (typeof updates.name === "string" && updates.name) {
      updates.initials = updates.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("") || "AL";
    }

    if (Object.keys(updates).length === 1) return NextResponse.json({ error: "Güncellenecek alan bulunamadı." }, { status: 400 });

    await businessRef.update(updates);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin business update failed", error);
    return NextResponse.json({ error: "İşletme güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await requireSuperAdmin(request);
  if (!admin) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });

  try {
    const body = await request.json();
    const businessId = clean(body.businessId);
    const confirmation = clean(body.confirmation);

    if (!businessId || confirmation !== businessId) {
      return NextResponse.json({ error: "Silme onayı geçersiz." }, { status: 400 });
    }

    const db = getAdminDb();
    const businessRef = db.collection("businesses").doc(businessId);
    const snapshot = await businessRef.get();
    if (!snapshot.exists) return NextResponse.json({ error: "İşletme bulunamadı." }, { status: 404 });

    const ownerId = clean(snapshot.data()?.ownerId);
    await db.recursiveDelete(businessRef);

    if (ownerId) {
      try { await getAdminAuth().deleteUser(ownerId); } catch (error) { console.error("Business owner auth delete failed", error); }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin business delete failed", error);
    return NextResponse.json({ error: "İşletme silinemedi." }, { status: 500 });
  }
}