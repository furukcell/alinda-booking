import { getAdminDb } from "@/lib/firebase/admin";

function normalizePhone(value:string){return value.replace(/\D/g,"").replace(/^00/,"").replace(/^0/,"90");}

export async function lookupWhatsAppBooking(businessId:string, referenceNo:string, customerPhone:string) {
  const ref=referenceNo.trim().toUpperCase();
  if(!/^[A-Z0-9]{5}$/.test(ref)) return "Referans numarası 5 karakter olmalıdır.";
  const snap=await getAdminDb().collection("businesses").doc(businessId).collection("bookings").doc(ref).get();
  if(!snap.exists) return "Bu referansla eşleşen bir randevu bulamadım.";
  const d=snap.data()||{};
  if(normalizePhone(String(d.customerPhone||""))!==normalizePhone(customerPhone)) return "Bu referans numarası sizin telefon numaranızla eşleşmiyor.";
  if(d.status==="cancelled") return "Bu randevu zaten iptal edilmiş.";
  return "Randevunuz bulundu. ✅\n\n"+String(d.serviceName||"Hizmet")+"\n"+String(d.specialistName||"Uzman")+"\n"+String(d.date||"")+" "+String(d.time||"")+"\n\nReferans: "+ref;
}

export async function cancelWhatsAppBooking(businessId:string, referenceNo:string, customerPhone:string) {
  const ref=referenceNo.trim().toUpperCase();
  if(!/^[A-Z0-9]{5}$/.test(ref)) return "Referans numarası 5 karakter olmalıdır.";
  const db=getAdminDb(),base=db.collection("businesses").doc(businessId),bookingRef=base.collection("bookings").doc(ref);
  const result=await db.runTransaction(async tx=>{
    const snap=await tx.get(bookingRef);
    if(!snap.exists)return "Bu referansla eşleşen bir randevu bulamadım.";
    const d=snap.data()||{};
    if(normalizePhone(String(d.customerPhone||""))!==normalizePhone(customerPhone))return "Bu referans numarası sizin telefon numaranızla eşleşmiyor.";
    if(d.status==="cancelled")return "Bu randevu zaten iptal edilmiş.";
    const duration=Math.max(30,Math.ceil(Number(d.serviceDurationMinutes||30)/30)*30);
    const start=String(d.time||"00:00").split(":").map(Number);
    const startMin=start[0]*60+start[1];
    const date=String(d.date||"");
    const specialist=String(d.specialistId||"");
    for(let i=0;i<duration/30;i++){
      const t=String(Math.floor((startMin+i*30)/60)).padStart(2,"0")+":"+String((startMin+i*30)%60).padStart(2,"0");
      const slotId=(date+"_"+t+"_"+specialist).replace(/[^a-zA-Z0-9_-]/g,"-");
      tx.delete(base.collection("slots").doc(slotId));
    }
    tx.update(bookingRef,{status:"cancelled",cancelledAt:new Date()});
    return "Randevunuz iptal edildi. ✅\n\n"+String(d.serviceName||"Hizmet")+"\n"+String(d.date||"")+" "+String(d.time||"")+"\n\nReferans: "+ref;
  });
  return result;
}