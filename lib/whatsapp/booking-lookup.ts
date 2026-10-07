import { getAdminDb } from "@/lib/firebase/admin";

export async function lookupWhatsAppBooking(businessId:string, referenceNo:string) {
  const ref=referenceNo.trim().toUpperCase();
  if(!/^[A-Z0-9]{5}$/.test(ref)) return "Referans numarası 5 karakter olmalıdır.";
  const snap=await getAdminDb().collection("businesses").doc(businessId).collection("bookings").doc(ref).get();
  if(!snap.exists) return "Bu referansla eşleşen bir randevu bulamadım.";
  const d=snap.data()||{};
  if(d.status==="cancelled") return "Bu randevu iptal edilmiş.";
  return "Randevunuz bulundu. ✅\n\n"+String(d.serviceName||"Hizmet")+"\n"+String(d.specialistName||"Uzman")+"\n"+String(d.date||"")+" "+String(d.time||"")+"\n\nReferans: "+ref;
}