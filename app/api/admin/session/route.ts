import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) {
    return NextResponse.json({ authorized: false }, { status: 401 });
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(authorization.slice(7));
    const snapshot = await getAdminDb().doc(`superadmins/${decoded.uid}`).get();

    return NextResponse.json({ authorized: snapshot.exists });
  } catch {
    return NextResponse.json({ authorized: false }, { status: 401 });
  }
}
