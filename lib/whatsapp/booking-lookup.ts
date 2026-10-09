import { getAdminDb } from "@/lib/firebase/admin";
import { createBusinessNotification } from "@/lib/notifications/business";

type CancellationState = { action: "cancel"; referenceNo: string; expiresAt: number };

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

export async function prepareWhatsAppCancellation(businessId:string, referenceNo:string, customerPhone:string) {
  const ref=referenceNo.trim().toUpperCase();
  if(!/^[A-Z0-9]{5}$/.test(ref)) return { message:"Referans numarası 5 karakter olmalıdır." };
  const snap=await getAdminDb().collection("businesses").doc(businessId).collection("bookings").doc(ref).get();
  if(!snap.exists) return { message:"Bu referansla eşleşen bir randevu bulamadım." };
  const d=snap.data()||{};
  if(normalizePhone(String(d.customerPhone||""))!==normalizePhone(customerPhone)) return { message:"Bu referans numarası sizin telefon numaranızla eşleşmiyor." };
  if(d.status==="cancelled") return { message:"Bu randevu zaten iptal edilmiş." };
  return {
    message:"Randevunuzu iptal etmek üzeresiniz. ⚠️\n\n"+String(d.serviceName||"Hizmet")+"\n"+String(d.specialistName||"Uzman")+"\n"+String(d.date||"")+" "+String(d.time||"")+"\n\nİptal etmek istediğinize emin misiniz? “Evet” yazın.",
    state:{action:"cancel",referenceNo:ref,expiresAt:Date.now()+300000} as CancellationState
  };
}

export async function cancelWhatsAppBooking(businessId:string, referenceNo:string, customerPhone:string) {
  const ref=referenceNo.trim().toUpperCase();
  if(!/^[A-Z0-9]{5}$/.test(ref)) return "Referans numarası 5 karakter olmalıdır.";
  const db=getAdminDb(),base=db.collection("businesses").doc(businessId),bookingRef=base.collection("bookings").doc(ref);
  const result = await db.runTransaction(async tx=>{
    const snap=await tx.get(bookingRef);
    if(!snap.exists)return { message:"Bu referansla eşleşen bir randevu bulamadım." };
    const d=snap.data()||{};
    if(normalizePhone(String(d.customerPhone||""))!==normalizePhone(customerPhone))return { message:"Bu referans numarası sizin telefon numaranızla eşleşmiyor." };
    if(d.status==="cancelled")return { message:"Bu randevu zaten iptal edilmiş." };
    const duration=Math.max(30,Math.ceil(Number(d.serviceDurationMinutes||30)/30)*30);
    const parts=String(d.time||"00:00").split(":").map(Number),startMin=parts[0]*60+parts[1],date=String(d.date||""),specialist=String(d.specialistId||"");
    const slotRefs = Array.from({length:duration/30},(_,i)=>{const m=startMin+i*30,t=String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0"),slotId=(date+"_"+t+"_"+specialist).replace(/[^a-zA-Z0-9_-]/g,"-");return base.collection("slots").doc(slotId)});
    const slotSnaps = await Promise.all(slotRefs.map((slotRef)=>tx.get(slotRef)));
    slotSnaps.forEach((slotSnap,i)=>{if(slotSnap.exists)tx.delete(slotRefs[i])});
    const cancelledAt=new Date();
    tx.update(bookingRef,{status:"cancelled",cancelledAt,cancelledBy:"customer"});
    return {
      message:"Randevunuz iptal edildi. ✅\\n\\n"+String(d.serviceName||"Hizmet")+"\\n"+String(d.date||"")+" "+String(d.time||"")+"\\n\\nReferans: "+ref,
      cancelled:true,
      details:{customerName:String(d.customerName||""),serviceName:String(d.serviceName||""),specialistName:String(d.specialistName||""),date,time:String(d.time||""),cancelledBy:"customer"}
    };
  });
  if ("cancelled" in result && result.cancelled) {
    try {
      await createBusinessNotification(businessId,{
        type:"booking_cancelled",
        title:"Müşteri WhatsApp üzerinden randevusunu iptal etti",
        message:`${result.details.customerName || "Müşteri"} · ${ref} referanslı randevuyu iptal etti.`,
        bookingId:ref,
        referenceNo:ref,
        details:result.details,
      });
    } catch (notificationError) {
      console.error("WhatsApp cancellation notification record failed",notificationError);
    }
  }
  return result.message;
}
