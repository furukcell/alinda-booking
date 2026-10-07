import "server-only";

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { getAdminDb } from "@/lib/firebase/admin";

const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || "v25.0";

type WhatsAppConnection = {
  wabaId: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
  verifiedName: string;
  encryptedAccessToken: string;
  connectedAt: string;
};

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`MISSING_ENV:${name}`);
  return value;
}

function encryptionKey() {
  const key = Buffer.from(required("WHATSAPP_TOKEN_ENCRYPTION_KEY"), "base64");
  if (key.length !== 32) throw new Error("INVALID_WHATSAPP_ENCRYPTION_KEY");
  return key;
}

function encrypt(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, ciphertext].map((part) => part.toString("base64url")).join(".");
}

function decrypt(value: string) {
  const [ivText, tagText, ciphertextText] = value.split(".");
  if (!ivText || !tagText || !ciphertextText) throw new Error("INVALID_ENCRYPTED_TOKEN");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(ivText, "base64url")
  );
  decipher.setAuthTag(Buffer.from(tagText, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextText, "base64url")),
    decipher.final()
  ]).toString("utf8");
}

async function graph<T>(
  path: string,
  init?: RequestInit,
  token?: string
): Promise<T> {
  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${path.replace(/^\//, "")}`);
  if (token && init?.method !== "POST") url.searchParams.set("access_token", token);

  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token && init?.method === "POST" ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {})
    },
    cache: "no-store"
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.error) {
    const message = data?.error?.message || `WhatsApp API error (${response.status})`;
    throw new Error(message);
  }

  return data as T;
}

export function normalizeWhatsAppPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith("90") && digits.length >= 12) return digits;
  if (digits.startsWith("0") && digits.length === 11) return `90${digits.slice(1)}`;
  if (digits.length === 10 && digits.startsWith("5")) return `90${digits}`;
  return digits;
}

export async function exchangeEmbeddedSignupCode(code: string) {
  const appId = required("NEXT_PUBLIC_META_APP_ID");
  const appSecret = required("META_APP_SECRET");

  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token`);
  url.searchParams.set("client_id", appId);
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("code", code);

  const response = await fetch(url, { cache: "no-store" });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data?.error || !data?.access_token) {
    throw new Error(data?.error?.message || "WhatsApp bağlantı kodu doğrulanamadı.");
  }

  return data.access_token as string;
}

export async function subscribeWaba(wabaId: string, accessToken: string) {
  await graph<Record<string, unknown>>(
    `${wabaId}/subscribed_apps`,
    { method: "POST", body: JSON.stringify({}) },
    accessToken
  );
}

export async function getPhoneDetails(phoneNumberId: string, accessToken: string) {
  return graph<{ display_phone_number?: string; verified_name?: string }>(
    phoneNumberId,
    undefined,
    accessToken
  );
}

export async function saveWhatsAppConnection(
  businessId: string,
  connection: Omit<WhatsAppConnection, "encryptedAccessToken" | "connectedAt">,
  accessToken: string
) {
  const db = getAdminDb();
  await db.doc(`businesses/${businessId}/integrations/whatsapp`).set(
    {
      ...connection,
      encryptedAccessToken: encrypt(accessToken),
      connectedAt: new Date().toISOString()
    },
    { merge: true }
  );
}

export async function getWhatsAppConnection(businessId: string) {
  const snapshot = await getAdminDb()
    .doc(`businesses/${businessId}/integrations/whatsapp`)
    .get();
  if (!snapshot.exists()) return null;

  const data = snapshot.data() as WhatsAppConnection;
  if (!data.encryptedAccessToken || !data.wabaId || !data.phoneNumberId) return null;

  return {
    ...data,
    accessToken: decrypt(data.encryptedAccessToken)
  };
}

export async function deleteWhatsAppConnection(businessId: string) {
  const db = getAdminDb();
  await db.doc(`businesses/${businessId}/integrations/whatsapp`).set(
    {
      connected: false,
      disconnectedAt: new Date().toISOString(),
      encryptedAccessToken: "",
      wabaId: "",
      phoneNumberId: "",
      displayPhoneNumber: "",
      verifiedName: ""
    },
    { merge: true }
  );
}

export async function sendWhatsAppTemplate(
  phoneNumberId: string,
  accessToken: string,
  recipientPhone: string,
  templateName: string,
  languageCode: string,
  parameters: string[]
) {
  const to = normalizeWhatsAppPhone(recipientPhone);
  if (!to) throw new Error("INVALID_WHATSAPP_RECIPIENT");

  return graph<{ messages?: Array<{ id: string }> }>(
    `${phoneNumberId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          components: [
            {
              type: "body",
              parameters: parameters.map((text) => ({ type: "text", text }))
            }
          ]
        }
      })
    },
    accessToken
  );
}

export function getWhatsAppTemplateConfig() {
  return {
    ownerTemplate: process.env.WHATSAPP_OWNER_BOOKING_TEMPLATE || "",
    customerTemplate: process.env.WHATSAPP_CUSTOMER_BOOKING_TEMPLATE || "",
    language: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "tr"
  };
}
