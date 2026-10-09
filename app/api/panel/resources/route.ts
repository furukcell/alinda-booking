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


async function getWritableBusiness(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) {
    return { error: NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 }) };
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(authorization.slice(7));
    const snapshot = await getAdminDb().collection("businesses").where("ownerId", "==", decoded.uid).limit(1).get();
    if (snapshot.empty) return { error: NextResponse.json({ error: "İşletme bulunamadı." }, { status: 404 }) };
    const business = snapshot.docs[0];
    const data = business.data();
    if (data.accessEnabled === false || data.active === false) {
      return { error: NextResponse.json({ error: "İşletme erişimi şu anda aktif değil." }, { status: 403 }) };
    }
    return { business };
  } catch {
    return { error: NextResponse.json({ error: "Oturum doğrulanamadı." }, { status: 401 }) };
  }
}

function validSpecialist(data: Record<string, unknown>) {
  return typeof data.name === "string" && data.name.trim().length > 0
    && typeof data.title === "string"
    && Array.isArray(data.serviceIds) && data.serviceIds.every((id) => typeof id === "string")
    && typeof data.photoUrl === "string"
    && data.schedule !== null && typeof data.schedule === "object" && !Array.isArray(data.schedule)
    && Array.isArray(data.timeOffDates) && data.timeOffDates.every((date) => typeof date === "string");
}

export async function POST(request: NextRequest) {
  const result = await getWritableBusiness(request);
  if ("error" in result) return result.error!;
  try {
    const body = await request.json();
    if (body.type !== "specialists" || !body.data || typeof body.data !== "object" || !validSpecialist(body.data)) {
      return NextResponse.json({ error: "Uzman bilgileri geçersiz." }, { status: 400 });
    }
    const now = new Date();
    const ref = await result.business!.ref.collection("specialists").add({
      name: body.data.name.trim(),
      title: body.data.title.trim() || "Uzman",
      serviceIds: body.data.serviceIds,
      photoUrl: body.data.photoUrl,
      schedule: body.data.schedule,
      timeOffDates: body.data.timeOffDates,
      createdAt: now,
      updatedAt: now,
    });
    return NextResponse.json({ id: ref.id }, { status: 201 });
  } catch (error) {
    console.error("Panel resource create failed", error);
    return NextResponse.json({ error: "Uzman kaydedilemedi." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const result = await getWritableBusiness(request);
  if ("error" in result) return result.error!;
  try {
    const body = await request.json();
    if (body.type !== "specialists" || typeof body.id !== "string" || !body.id
      || !body.data || typeof body.data !== "object" || !validSpecialist(body.data)) {
      return NextResponse.json({ error: "Uzman bilgileri geçersiz." }, { status: 400 });
    }
    await result.business!.ref.collection("specialists").doc(body.id).update({
      name: body.data.name.trim(),
      title: body.data.title.trim() || "Uzman",
      serviceIds: body.data.serviceIds,
      photoUrl: body.data.photoUrl,
      schedule: body.data.schedule,
      timeOffDates: body.data.timeOffDates,
      updatedAt: new Date(),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Panel resource update failed", error);
    return NextResponse.json({ error: "Uzman güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const result = await getWritableBusiness(request);
  if ("error" in result) return result.error!;
  try {
    const body = await request.json();
    if (body.type !== "specialists" || typeof body.id !== "string" || !body.id) {
      return NextResponse.json({ error: "Uzman bilgisi geçersiz." }, { status: 400 });
    }
    await result.business!.ref.collection("specialists").doc(body.id).delete();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Panel resource delete failed", error);
    return NextResponse.json({ error: "Uzman silinemedi." }, { status: 500 });
  }
}
