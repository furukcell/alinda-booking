import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

async function requireSuperAdmin(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return false;
  try {
    const decoded = await getAdminAuth().verifyIdToken(authorization.slice(7));
    return (await getAdminDb().doc(`superadmins/${decoded.uid}`).get()).exists;
  } catch {
    return false;
  }
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: NextRequest) {
  if (!(await requireSuperAdmin(request))) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
  }

  try {
    const db = getAdminDb();
    const businessSnapshot = await db.collection("businesses").get();

    let total = 0;
    let completed = 0;
    let pending = 0;
    let cancelled = 0;
    let revenue = 0;
    const byBusiness = new Map<string, { name: string; appointments: number; cancelled: number; revenue: number }>();
    const services = new Map<string, number>();
    const hours = new Map<string, number>();
    const weekdays = new Map<string, number>();

    for (const businessDoc of businessSnapshot.docs) {
      const business = businessDoc.data();
      const name = clean(business.name) || businessDoc.id;
      const bookingsSnapshot = await businessDoc.ref.collection("bookings").get();

      let businessAppointments = 0;
      let businessCancelled = 0;
      let businessRevenue = 0;

      for (const bookingDoc of bookingsSnapshot.docs) {
        const booking = bookingDoc.data();
        const status = clean(booking.status) || "pending";
        const price = typeof booking.servicePrice === "number" ? booking.servicePrice : 0;
        total += 1;
        businessAppointments += 1;

        if (status === "cancelled") {
          cancelled += 1;
          businessCancelled += 1;
        } else if (status === "completed" || status === "confirmed") {
          completed += 1;
          revenue += price;
          businessRevenue += price;
        } else {
          pending += 1;
        }

        const serviceName = clean(booking.serviceName);
        if (serviceName) services.set(serviceName, (services.get(serviceName) || 0) + 1);

        const time = clean(booking.time);
        if (time) {
          const hour = time.slice(0, 2);
          if (/^\d{2}$/.test(hour)) hours.set(hour, (hours.get(hour) || 0) + 1);
        }

        const date = clean(booking.date);
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          const day = new Date(`${date}T12:00:00`).toLocaleDateString("tr-TR", { weekday: "long" });
          weekdays.set(day, (weekdays.get(day) || 0) + 1);
        }
      }

      byBusiness.set(businessDoc.id, { name, appointments: businessAppointments, cancelled: businessCancelled, revenue: businessRevenue });
    }

    const topBusinesses = [...byBusiness.values()].sort((a, b) => b.appointments - a.appointments).slice(0, 10);
    const topServices = [...services.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 10);
    const peakHours = [...hours.entries()].map(([hour, count]) => ({ hour: `${hour}:00`, count })).sort((a, b) => b.count - a.count).slice(0, 5);
    const peakWeekdays = [...weekdays.entries()].map(([day, count]) => ({ day, count })).sort((a, b) => b.count - a.count).slice(0, 7);

    const cancellationRate = total ? Math.round((cancelled / total) * 100) : 0;
    const recommendations: string[] = [];
    if (!total) recommendations.push("Henüz yeterli randevu verisi yok. İlk randevular geldikçe AI Sekreter daha anlamlı içgörüler üretecek.");
    if (cancellationRate >= 15) recommendations.push(`İptal oranı %${cancellationRate}. Randevudan önce otomatik WhatsApp hatırlatması kullanmak faydalı olabilir.`);
    if (peakHours[0]) recommendations.push(`En yoğun saat ${peakHours[0].hour}. Bu saatlerde uzman kapasitesini artırmayı değerlendirin.`);
    if (topServices[0]) recommendations.push(`En çok tercih edilen hizmet “${topServices[0].name}”. Bu hizmet için paket veya ek hizmet önerisi satışları artırabilir.`);
    if (topBusinesses[0]) recommendations.push(`En yüksek randevu hacmi ${topBusinesses[0].name} işletmesinde. Bu işletmenin çalışma modelini diğer işletmelere örnek olarak kullanabilirsiniz.`);

    return NextResponse.json({
      businesses: businessSnapshot.size,
      total,
      completed,
      pending,
      cancelled,
      revenue,
      cancellationRate,
      topBusinesses,
      topServices,
      peakHours,
      peakWeekdays,
      recommendations,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Admin AI insights failed", error);
    return NextResponse.json({ error: "AI istatistikleri alınamadı." }, { status: 500 });
  }
}
