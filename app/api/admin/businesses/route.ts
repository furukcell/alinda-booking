import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

async function requireSuperAdmin(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return null;

  try {
    const token = authorization.slice(7);
    const decoded = await getAdminAuth().verifyIdToken(token);
    const snapshot = await getAdminDb().doc(`superadmins/${decoded.uid}`).get();
    return snapshot.exists ? decoded : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const admin = await requireSuperAdmin(request);
  if (!admin) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });

  const snapshot = await getAdminDb().collection("businesses").orderBy("name").get();
  const businesses = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: typeof data.name === "string" ? data.name : "",
      slug: typeof data.slug === "string" ? data.slug : doc.id,
      category: typeof data.category === "string" ? data.category : "",
      city: typeof data.city === "string" ? data.city : "",
      district: typeof data.district === "string" ? data.district : "",
      phone: typeof data.phone === "string" ? data.phone : "",
      ownerId: typeof data.ownerId === "string" ? data.ownerId : "",
    };
  });

  return NextResponse.json({ businesses });
}

export async function POST(request: NextRequest) {
  const admin = await requireSuperAdmin(request);
  if (!admin) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });

  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const slug = String(body.slug || "").trim().toLowerCase();
    const category = String(body.category || "Güzellik Salonu").trim();
    const city = String(body.city || "").trim();
    const district = String(body.district || "").trim();
    const phone = String(body.phone || "").trim();
    const ownerEmail = String(body.ownerEmail || "").trim().toLowerCase();
    const ownerPassword = String(body.ownerPassword || "");

    if (!name || !slug || !ownerEmail || ownerPassword.length < 6) {
      return NextResponse.json({ error: "İşletme adı, slug, işletme e-postası ve en az 6 karakterli şifre zorunlu." }, { status: 400 });
    }

    if (!/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json({ error: "Slug yalnızca küçük harf, rakam, tire ve alt çizgi içerebilir." }, { status: 400 });
    }

    const db = getAdminDb();
    const businessRef = db.collection("businesses").doc(slug);
    const existing = await businessRef.get();
    if (existing.exists) {
      return NextResponse.json({ error: "Bu işletme bağlantısı zaten kullanılıyor." }, { status: 409 });
    }

    let ownerUid = "";
    try {
      const user = await getAdminAuth().createUser({
        email: ownerEmail,
        password: ownerPassword,
        emailVerified: false,
      });
      ownerUid = user.uid;
    } catch (error) {
      const code = error instanceof Error && "code" in error ? String((error as { code?: string }).code) : "";
      if (code.includes("email-already-exists")) {
        return NextResponse.json({ error: "Bu e-posta zaten Firebase'de kayıtlı. Yeni işletme için farklı bir e-posta kullanın." }, { status: 409 });
      }
      throw error;
    }

    const initials = name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "AL";

    await businessRef.set({
      name,
      slug,
      category,
      description: "",
      city,
      district,
      address: "",
      phone,
      initials,
      primaryColor: "#B86F61",
      primaryColorSoft: "#F3E4E0",
      ownerId: ownerUid,
      createdAt: new Date(),
    });

    return NextResponse.json({
      business: { id: slug, name, slug, category, city, district, phone, ownerId: ownerUid },
    }, { status: 201 });
  } catch (error) {
    console.error("Admin business creation failed", error);
    return NextResponse.json({ error: "İşletme oluşturulamadı." }, { status: 500 });
  }
}
