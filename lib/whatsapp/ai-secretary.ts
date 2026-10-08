import { getAdminDb } from "@/lib/firebase/admin";

type AiResult = {
  intent: "book" | "lookup" | "cancel" | "help" | "unknown";
  serviceId?: string | null;
  specialistId?: string | null;
  date?: string | null;
  time?: string | null;
  referenceNo?: string | null;
  customerName?: string | null;
  reply?: string | null;
};

function todayIstanbul() {
  return new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Istanbul",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
}

export async function interpretSecretaryMessage(input:{
  businessName:string;
  text:string;
  history?:string[];
  services:Array<{id:string;name:string;durationMinutes:number;price:number}>;
  specialists:Array<{id:string;name:string;serviceIds:string[]}>;
}):Promise<AiResult|null>{
  const key=process.env.OPENAI_API_KEY;
  if(!key) return null;
  const model=process.env.OPENAI_SECRETARY_MODEL||"gpt-5.5";
  const catalog=JSON.stringify({
    today:todayIstanbul(),
    services:input.services.map(x=>({id:x.id,name:x.name,durationMinutes:x.durationMinutes,price:x.price})),
    specialists:input.specialists
  });
  const system="Sen "+input.businessName+" işletmesinin Türkçe WhatsApp AI sekreterisin. Müşterinin doğal dilini anla. Kısa, samimi ve net konuş. Randevu oluşturma/iptal işlemini kendin yapmazsın; yalnızca güvenli backend akışının kullanacağı JSON niyeti üretirsin. Tarihleri Europe/Istanbul saatine göre YYYY-MM-DD, saatleri HH:MM ver. bugün, yarın, hafta sonu, pazartesi gibi ifadeleri bugünün tarihine göre çöz. Hizmet ve uzman için katalogdaki ID'leri kullan. Referans 5 karakterlidir. Fiyat/hizmet/genel bilgi sorularında reply alanında doğrudan cevap ver; katalogda olmayan bilgiyi uydurma. Sadece JSON döndür. Bugün: "+todayIstanbul();
  const user=JSON.stringify({catalog,message:input.text,history:(input.history||[]).slice(-8)});
  const response=await fetch("https://api.openai.com/v1/responses",{
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":"Bearer "+key},
    body:JSON.stringify({
      model,
      instructions:system,
      input:user,
      max_output_tokens:400,
      text:{format:{type:"json_object"}}
    })
  });
  if(!response.ok)return null;
  const data=await response.json().catch(()=>({}));
  const raw=typeof data.output_text==="string"?data.output_text:"";
  if(!raw)return null;
  try{
    const parsed=JSON.parse(raw) as AiResult;
    if(!["book","lookup","cancel","help","unknown"].includes(parsed.intent))return null;
    if(parsed.reply&&parsed.reply.length>800)parsed.reply=parsed.reply.slice(0,800);
    return parsed;
  }catch{return null;}
}

export async function getSecretaryHistory(businessId:string,phone:string){
  const snap=await getAdminDb().collection("businesses").doc(businessId).collection("whatsappMessages").where("from","==",phone).orderBy("createdAt","desc").limit(8).get().catch(()=>null);
  if(!snap)return [];
  return snap.docs.reverse().map(d=>String(d.data().text||"")).filter(Boolean);
}

export async function interpretBusinessMessage(businessId:string,text:string,history:string[]=[]){
  const ref=getAdminDb().collection("businesses").doc(businessId);
  const [businessSnap,servicesSnap,specialistsSnap]=await Promise.all([ref.get(),ref.collection("services").get(),ref.collection("specialists").get()]);
  const services=servicesSnap.docs.map(d=>({id:d.id,name:String(d.data().name||""),durationMinutes:Number(d.data().durationMinutes||30),price:Number(d.data().price||0)})).filter(x=>x.name);
  const specialists=specialistsSnap.docs.map(d=>({id:d.id,name:String(d.data().name||""),serviceIds:Array.isArray(d.data().serviceIds)?d.data().serviceIds.filter((x:unknown):x is string=>typeof x==="string"):[]}));
  return interpretSecretaryMessage({businessName:String(businessSnap.data()?.name||"işletmemiz"),text,history,services,specialists});
}