import { getAdminDb } from "@/lib/firebase/admin";
import { lookupWhatsAppBooking, prepareWhatsAppCancellation, cancelWhatsAppBooking } from "@/lib/whatsapp/booking-lookup";
import { confirmSecretaryBooking, prepareSecretaryBooking } from "@/lib/whatsapp/secretary";

type ToolResult = Record<string, unknown>;

type AiInput = {
  businessId: string;
  businessName: string;
  text: string;
  phone: string;
  customerName: string;
  history?: string[];
  services: Array<{ id: string; name: string; durationMinutes: number; price: number }>;
  specialists: Array<{ id: string; name: string; serviceIds: string[] }>;
};

const MODEL = process.env.GEMINI_SECRETARY_MODEL || "gemini-3.8-flash";

function todayIstanbul() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

const tools = [
  {
    functionDeclarations: [
      {
        name: "prepare_booking",
        description: "Gerçek Firestore müsaitliğini kontrol eder ve uygun saat bulunduğunda onay bekleyen randevu hazırlığı oluşturur.",
        parameters: {
          type: "object",
          properties: {
            serviceId: { type: "string", description: "Katalogdaki hizmet ID'si" },
            date: { type: "string", description: "YYYY-MM-DD" },
            time: { type: "string", description: "HH:MM" },
            specialistId: { type: "string", description: "İstenen uzman ID'si; belirtilmediyse gönderme" }
          },
          required: ["serviceId", "date", "time"]
        }
      },
      {
        name: "confirm_booking",
        description: "Müşteri daha önce önerilen randevuyu açıkça onayladığında gerçek randevuyu oluşturur.",
        parameters: { type: "object", properties: {}, required: [] }
      },
      {
        name: "lookup_booking",
        description: "Müşterinin 5 karakterli referans numarasıyla kendi randevusunu sorgular.",
        parameters: {
          type: "object",
          properties: { referenceNo: { type: "string", description: "5 karakterli randevu referansı" } },
          required: ["referenceNo"]
        }
      },
      {
        name: "prepare_cancel",
        description: "Randevu iptalini hazırlar ve müşteriden onay ister; iptali hemen gerçekleştirmez.",
        parameters: {
          type: "object",
          properties: { referenceNo: { type: "string", description: "5 karakterli randevu referansı" } },
          required: ["referenceNo"]
        }
      },
      {
        name: "cancel_booking",
        description: "Müşteri hazırlanmış iptali açıkça onayladığında randevuyu iptal eder.",
        parameters: { type: "object", properties: {}, required: [] }
      }
    ]
  }
];

function systemPrompt(input: AiInput) {
  return [
    "Sen " + input.businessName + " işletmesinin Türkçe WhatsApp AI sekreterisin.",
    "Doğal Türkçe konuş; kısa, samimi ve WhatsApp'a uygun cevaplar ver.",
    "Bugünün tarihi " + todayIstanbul() + ". Saat ve tarihleri Europe/Istanbul kabul et.",
    "Randevu, sorgulama ve iptal işlemlerinde bilgi uydurma; gerçek sonucu öğrenmek için araçları kullan.",
    "Hizmet, uzman ve fiyat bilgisini yalnızca katalogdan kullan.",
    "Randevu isteğinde prepare_booking kullan ve müşteriden açık onay iste.",
    "Müşteri önceki öneriyi net biçimde onaylarsa confirm_booking kullan.",
    "İptalde önce prepare_cancel kullan, net onay gelirse cancel_booking kullan.",
    "Katalog: " + JSON.stringify({
      today: todayIstanbul(),
      timezone: "Europe/Istanbul",
      services: input.services,
      specialists: input.specialists
    })
  ].join("\n");
}

async function callGemini(contents: any[], apiKey: string, input: AiInput) {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/" + MODEL + ":generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemPrompt(input) }] },
        tools,
        generationConfig: { temperature: 0.2, maxOutputTokens: 500 }
      })
    }
  );

  if (!response.ok) throw new Error("GEMINI_API_ERROR");
  return response.json();
}

async function executeTool(name: string, args: Record<string, any>, input: AiInput): Promise<ToolResult> {
  if (name === "prepare_booking") {
    return await prepareSecretaryBooking(
      input.businessId,
      input.phone,
      String(args.serviceId || ""),
      String(args.date || ""),
      String(args.time || ""),
      args.specialistId ? String(args.specialistId) : undefined,
      input.customerName
    ) as ToolResult;
  }

  if (name === "confirm_booking") {
    return { ok: true, message: await confirmSecretaryBooking(input.businessId, input.phone, input.customerName) };
  }

  if (name === "lookup_booking") {
    return {
      ok: true,
      message: await lookupWhatsAppBooking(input.businessId, String(args.referenceNo || "").toUpperCase(), input.phone)
    };
  }

  if (name === "prepare_cancel") {
    const prepared = await prepareWhatsAppCancellation(
      input.businessId,
      String(args.referenceNo || "").toUpperCase(),
      input.phone
    );
    if (prepared.state) {
      await getAdminDb()
        .collection("businesses")
        .doc(input.businessId)
        .collection("whatsappConversations")
        .doc(input.phone)
        .set(prepared.state);
    }
    return { ok: true, message: prepared.message };
  }

  if (name === "cancel_booking") {
    const conversationRef = getAdminDb()
      .collection("businesses")
      .doc(input.businessId)
      .collection("whatsappConversations")
      .doc(input.phone);
    const snap = await conversationRef.get();
    const state = snap.data();

    if (state?.action !== "cancel" || !state?.referenceNo || Number(state.expiresAt || 0) <= Date.now()) {
      return { ok: false, message: "Geçerli bir iptal onayı bulunamadı. Önce randevu referansını belirtin." };
    }

    const message = await cancelWhatsAppBooking(input.businessId, String(state.referenceNo), input.phone);
    await conversationRef.delete();
    return { ok: true, message };
  }

  return { ok: false, message: "Bilinmeyen araç." };
}

export async function interpretBusinessMessage(input: AiInput): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const contents: any[] = [
    ...(input.history || []).slice(-8).map((text) => ({
      role: "user",
      parts: [{ text }]
    })),
    { role: "user", parts: [{ text: input.text }] }
  ];

  for (let turn = 0; turn < 4; turn++) {
    const data = await callGemini(contents, apiKey, input);
    const candidate = data?.candidates?.[0];
    const modelContent = candidate?.content;
    const parts = Array.isArray(modelContent?.parts) ? modelContent.parts : [];
    const calls = parts.filter((part: any) => part?.functionCall?.name);

    if (!calls.length) {
      const text = parts
        .map((part: any) => typeof part?.text === "string" ? part.text : "")
        .join("")
        .trim();
      return text ? text.slice(0, 1200) : null;
    }

    contents.push(modelContent);

    for (const part of calls) {
      const call = part.functionCall;
      let result: ToolResult;
      try {
        result = await executeTool(
          String(call.name),
          call.args && typeof call.args === "object" ? call.args : {},
          input
        );
      } catch {
        result = { ok: false, message: "İşlem sırasında geçici bir hata oluştu. Lütfen tekrar deneyin." };
      }

      const functionResponse: any = {
        name: String(call.name),
        response: result
      };
      if (call.id) functionResponse.id = String(call.id);

      contents.push({
        role: "user",
        parts: [{ functionResponse }]
      });
    }
  }

  return "İşlemi tamamlamak için bir adım daha gerekiyor. Lütfen tekrar yazar mısınız?";
}

export async function getSecretaryHistory(businessId: string, phone: string) {
  const snap = await getAdminDb()
    .collection("businesses")
    .doc(businessId)
    .collection("whatsappMessages")
    .where("from", "==", phone)
    .orderBy("createdAt", "desc")
    .limit(8)
    .get()
    .catch(() => null);

  if (!snap) return [];
  return snap.docs.reverse().map((d) => String(d.data().text || "")).filter(Boolean);
}

export async function loadSecretaryCatalog(businessId: string) {
  const ref = getAdminDb().collection("businesses").doc(businessId);
  const [businessSnap, servicesSnap, specialistsSnap] = await Promise.all([
    ref.get(),
    ref.collection("services").get(),
    ref.collection("specialists").get()
  ]);

  const services = servicesSnap.docs
    .map((d) => ({
      id: d.id,
      name: String(d.data().name || ""),
      durationMinutes: Number(d.data().durationMinutes || 30),
      price: Number(d.data().price || 0)
    }))
    .filter((x) => x.name);

  const specialists = specialistsSnap.docs.map((d) => ({
    id: d.id,
    name: String(d.data().name || ""),
    serviceIds: Array.isArray(d.data().serviceIds)
      ? d.data().serviceIds.filter((x: unknown): x is string => typeof x === "string")
      : []
  }));

  return {
    businessName: String(businessSnap.data()?.name || "işletmemiz"),
    services,
    specialists
  };
}


export async function interpretSecretaryMessage(input: {
  businessName: string;
  text: string;
  services: Array<{id:string;name:string;durationMinutes:number;price:number}>;
  specialists: Array<{id:string;name:string;serviceIds:string[]}>;
}) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + MODEL + ":generateContent", {
    method: "POST",
    headers: {"Content-Type":"application/json","x-goog-api-key":key},
    body: JSON.stringify({
      contents: [{role:"user",parts:[{text:JSON.stringify({
        task:"JSON olarak niyet çıkar",
        message:input.text,
        today:todayIstanbul(),
        services:input.services,
        specialists:input.specialists
      })}]}],
      systemInstruction:{parts:[{text:"Türkçe WhatsApp randevu niyetini JSON olarak çıkar. intent book, lookup, cancel, help veya unknown olabilir. Tarih YYYY-MM-DD, saat HH:MM. Sadece JSON."}]},
      generationConfig:{temperature:0.1,maxOutputTokens:300,responseMimeType:"application/json"}
    })
  });
  if(!response.ok) return null;
  const data=await response.json().catch(()=>({}));
  const raw=data?.candidates?.[0]?.content?.parts?.map((p:any)=>p.text||"").join("")||"";
  try{return JSON.parse(raw);}catch{return null;}
}
