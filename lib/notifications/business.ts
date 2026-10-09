import { getAdminDb } from "@/lib/firebase/admin";

export type BusinessNotificationType = "booking_created" | "booking_cancelled" | "daily_summary";

export async function createBusinessNotification(
  businessId: string,
  input: {
    type: BusinessNotificationType;
    title: string;
    message: string;
    bookingId?: string;
    referenceNo?: string;
    eventAt?: Date;
    details?: Record<string, unknown>;
  }
) {
  const db = getAdminDb();
  const ref = db.collection("businesses").doc(businessId).collection("notifications").doc();
  await ref.set({
    type: input.type,
    title: input.title,
    message: input.message,
    bookingId: input.bookingId || null,
    referenceNo: input.referenceNo || null,
    eventAt: input.eventAt || new Date(),
    createdAt: new Date(),
    details: input.details || {},
  });
  return ref.id;
}
