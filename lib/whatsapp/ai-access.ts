import { getAdminDb } from "@/lib/firebase/admin";

type Preference = {
  aiEnabled: boolean;
  consentAt?: string;
  disabledAt?: string;
  offerSentAt?: string;
  declineCount?: number;
};

function ref(businessId: string, phone: string) {
  return getAdminDb()
    .collection("businesses")
    .doc(businessId)
    .collection("whatsappAiPreferences")
    .doc(phone);
}

function normalizeCommand(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/[İı]/g, "i")
    .replace(/[Şş]/g, "s")
    .replace(/[Ğğ]/g, "g")
    .replace(/[Üü]/g, "u")
    .replace(/[Öö]/g, "o")
    .replace(/[Çç]/g, "c")
    .replace(/[^a-z0-9çğıöşü\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isEnableAssistantCommand(text: string) {
  const value = normalizeCommand(text);
  return [
    "asistani ac",
    "ai i ac",
    "aiyi ac",
    "ai asistanı ac",
    "ai asistan ac",
    "yapay zekayi ac",
    "asistan aktif",
    "asistanla devam edelim",
    "asistanla konusmak istiyorum"
  ].includes(value);
}

export function isDisableAssistantCommand(text: string) {
  const value = normalizeCommand(text);
  return [
    "asistani kapat",
    "ai yi kapat",
    "aiyi kapat",
    "ai asistani kapat",
    "yapay zekayi kapat",
    "insanla gorusmek istiyorum",
    "yetkiliyle gorusmek istiyorum",
    "isletmeyle gorusmek istiyorum"
  ].includes(value);
}

export async function getAiPreference(businessId: string, phone: string) {
  const snapshot = await ref(businessId, phone).get();
  if (!snapshot.exists) return null;
  return snapshot.data() as Preference;
}

export async function enableAi(businessId: string, phone: string) {
  await ref(businessId, phone).set(
    {
      aiEnabled: true,
      consentAt: new Date().toISOString(),
      offerSentAt: null,
      disabledAt: null
    },
    { merge: true }
  );
}

export async function disableAi(businessId: string, phone: string) {
  const current = await getAiPreference(businessId, phone);
  const declineCount = Number(current?.declineCount || 0) + 1;

  await ref(businessId, phone).set(
    {
      aiEnabled: false,
      disabledAt: new Date().toISOString(),
      declineCount,
      offerSentAt: null
    },
    { merge: true }
  );

  return declineCount;
}

export async function markInitialPromptSent(businessId: string, phone: string) {
  await ref(businessId, phone).set(
    {
      aiEnabled: false,
      initialPromptSentAt: new Date().toISOString()
    },
    { merge: true }
  );
}

export async function markInbound(businessId: string, phone: string, text: string) {
  await ref(businessId, phone).set(
    {
      lastInboundAt: new Date().toISOString(),
      lastInboundText: text
    },
    { merge: true }
  );
}

export async function markOutbound(businessId: string, phone: string) {
  await ref(businessId, phone).set(
    {
      lastOutboundAt: new Date().toISOString()
    },
    { merge: true }
  );
}

export async function markAiOfferSent(businessId: string, phone: string) {
  await ref(businessId, phone).set(
    {
      offerSentAt: new Date().toISOString()
    },
    { merge: true }
  );
}

export function shouldOfferAiAfterDelay(preference: Preference | null) {
  if (!preference || preference.aiEnabled) return false;
  if (!preference.lastInboundAt) return false;

  const inboundAt = new Date(preference.lastInboundAt).getTime();
  const outboundAt = preference.lastOutboundAt
    ? new Date(preference.lastOutboundAt).getTime()
    : 0;
  const offerAt = preference.offerSentAt
    ? new Date(preference.offerSentAt).getTime()
    : 0;

  if (!Number.isFinite(inboundAt)) return false;
  if (outboundAt > inboundAt) return false;
  if (offerAt > inboundAt) return false;

  return Date.now() - inboundAt >= 10 * 60 * 1000;
}

export const initialAssistantMessage =
  "Merhaba 👋 Hoş geldiniz! Randevu, müsaitlik ve randevu işlemlerinizde AI Asistanımızdan yardım almak ister misiniz?\n\n🤖 AI Asistanı Kullan\n👤 İşletmeyle Görüşeceğim";

export const aiEnabledMessage =
  "Harika 😊 AI Asistan aktif. Randevu, müsaitlik, randevu sorgulama ve iptal işlemlerinde size yardımcı olabilirim.";

export const aiDisabledMessage =
  "Tamamdır 👍 Bundan sonraki mesajlarınızı işletme ekibimiz yanıtlayacaktır.\n\n🤖 Dilediğiniz zaman “Asistanı aç” yazarak AI Asistanı tekrar kullanabilirsiniz.";

export const delayedAssistantOffer =
  "👋 İşletme ekibimiz şu anda yoğun olabilir ve mesajınıza henüz yanıt veremedi.\n\n🤖 Dilerseniz AI Asistanımız müsaitlik ve randevu konusunda size hemen yardımcı olabilir. “Asistanla devam et” veya “Asistanı aç” yazabilirsiniz.";

export function isAssistantYes(text: string) {
  const value = normalizeCommand(text);
  return ["evet", "evet kullan", "asistani kullan", "ai asistanı kullan", "ai asistani kullan", "1"].includes(value);
}

export function isAssistantNo(text: string) {
  const value = normalizeCommand(text);
  return ["hayir", "hayır", "hayir kullanmayacagim", "isletmeyle gorusecegim", "2"].includes(value);
}

export function isContinueWithAssistant(text: string) {
  const value = normalizeCommand(text);
  return ["asistanla devam et", "asistanla devam edelim"].includes(value);
}
