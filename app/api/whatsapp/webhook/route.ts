import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getWhatsAppConnection, getWhatsAppTemplateConfig, sendWhatsAppTemplate } from "@/lib/whatsapp/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN && challenge) {
    return new Response(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Webhook doğrulaması başarısız." }, { status: 403 });
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("tr-TR");
}

function buildReply(text: string, businessName: string) {
  const value = normalize(text);
  if (value.includes("merhaba") || value === "selam" || value === "slm") {
    return `Merhaba 👋 ${businessName} için yardımcı olabilirim. Randevu almak için “randevu”, mevcut randevunuz için “randevum” yazabilirsiniz.`;
  }
  if (value.includes("randevum") || value.includes("randevu sorgu")) {
    return "Randevunuzu kontrol edebilmem için randevu referans numaranızı (5 karakter) yazabilirsiniz.";
  }
  if (value.includes("iptal")) {
    return "Randevu iptali için 5 karakterli randevu referans numaranızı yazabilirsiniz. İşletme ekibi gerekli işlemi yapacaktır.";
  }
  if (value.includes("randevu")) {
    return "Randevu için hizmet adını ve tercih ettiğiniz günü yazabilirsiniz. Örn: “Manikür için yarın randevu”.";
  }
  return "Size yardımcı olmak için “randevu”, “randevum” veya “iptal” yazabilirsiniz. 😊";
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const entry = Array.isArray(payload?.entry) ? payload.entry : [];

    for (const item of entry) {
      const changes = Array.isArray(item?.changes) ? item.changes : [];
      for (const change of changes) {
        const value = change?.value;
        const messages = Array.isArray(value?.messages) ? value.messages : [];
        const phoneNumberId = typeof value?.metadata?.phone_number_id === "string" ? value.metadata.phone_number_id : "";
        if (!phoneNumberId) continue;

        const connectionSnapshot = await getAdminDb().collectionGroup("integrations").where("phoneNumberId", "==", phoneNumberId).limit(1).get();
        if (connectionSnapshot.empty) continue;

        const integration = connectionSnapshot.docs[0];
        const businessRef = integration.ref.parent.parent;
        if (!businessRef) continue;

        const businessSnapshot = await businessRef.get();
        const business = businessSnapshot.data() as { name?: string } | undefined;
        const connection = await getWhatsAppConnection(businessRef.id);

        for (const message of messages) {
          if (message?.type !== "text" || !message?.from || !message?.text?.body || !connection) continue;
          const incoming = String(message.text.body);
          await getAdminDb().collection(businessRef.path + "/whatsappMessages").add({
            direction: "inbound",
            from: String(message.from),
            text: incoming,
            messageId: typeof message.id === "string" ? message.id : "",
            createdAt: new Date().toISOString()
          });

          const reply = buildReply(incoming, business?.name || "İşletme");
          await sendWhatsAppTemplate(
            connection.phoneNumberId,
            connection.accessToken,
            String(message.from),
            process.env.WHATSAPP_SECRETARY_REPLY_TEMPLATE || getWhatsAppTemplateConfig().customerTemplate,
            getWhatsAppTemplateConfig().language,
            [reply]
          );
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Webhook işlenemedi." }, { status: 200 });
  }
}
