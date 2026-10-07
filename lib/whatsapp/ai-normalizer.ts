import { interpretSecretaryMessage } from "@/lib/whatsapp/ai-secretary";

export async function normalizeSecretaryText(input:{
  businessName:string;
  text:string;
  services:Array<{id:string;name:string;durationMinutes:number;price:number}>;
  specialists:Array<{id:string;name:string;serviceIds:string[]}>;
}) {
  const ai=await interpretSecretaryMessage(input);
  if(!ai) return { text: input.text, ai:null };
  if(ai.intent==="book" && ai.serviceId && ai.date && ai.time) {
    const service=input.services.find(x=>x.id===ai.serviceId);
    if(service) return { text: service.name+" "+ai.date+" "+ai.time, ai };
  }
  return { text:input.text, ai };
}