import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { handleSecretaryMessage, sendSecretaryReply } from "@/lib/whatsapp/secretary";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  if (verifyToken && mode === "subscribe" && token === verifyToken && challenge) return new Response(challenge, { status: 200 });
  return NextResponse.json({ error: "Webhook doğrulaması başarısız." }, { status: 403 });
}

function verifySignature(body: string, signature: string) {
  const secret = process.env.META_APP_SECRET;
  if (!secret || !signature.startsWith("sha256=")) return false;
  const expected = "sha256=" + createHmac("sha256", secret).update(body).digest("hex");
  const a = Buffer.from(signature), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    if (!verifySignature(rawBody, request.headers.get("x-hub-signature-256") || "")) return NextResponse.json({ error: "Geçersiz webhook imzası." }, { status: 401 });
    const payload = JSON.parse(rawBody);
    for (const entry of Array.isArray(payload?.entry) ? payload.entry : []) {
      for (const change of Array.isArray(entry?.changes) ? entry.changes : []) {
        const value = change?.value, messages = Array.isArray(value?.messages) ? value.messages : [];
        const phoneNumberId = typeof value?.metadata?.phone_number_id === "string" ? value.metadata.phone_number_id : "";
        if (!phoneNumberId) continue;
        const found = await getAdminDb().collectionGroup("integrations").where("phoneNumberId", "==", phoneNumberId).limit(1).get();
        if (found.empty) continue;
        const businessRef = found.docs[0].ref.parent.parent;
        if (!businessRef) continue;
        const connection = await import("@/lib/whatsapp/server").then(m => m.getWhatsAppConnection(businessRef.id));
        if (!connection) continue;
        for (const message of messages) {
          if (message?.type !== "text" || !message?.from || !message?.text?.body) continue;
          const id = typeof message.id === "string" ? message.id : "";
          const log = getAdminDb().collection(businessRef.path + "/whatsappMessages");
          if (id) {
            const old = await log.doc(id).get();
            if (old.exists) continue;
            await log.doc(id).set({ direction: "inbound", from: String(message.from), text: String(message.text.body), messageId: id, createdAt: new Date().toISOString() });
          }
          const contacts = Array.isArray(value?.contacts) ? value.contacts : [];
          const name = typeof contacts[0]?.profile?.name === "string" ? contacts[0].profile.name : "WhatsApp müşterisi";
          const reply = await handleSecretaryMessage(businessRef.id, String(message.from), String(message.text.body), name);
          await sendSecretaryReply(businessRef.id, String(message.from), reply);
        }
      }
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Webhook işlenemedi." }, { status: 200 });
  }
}
