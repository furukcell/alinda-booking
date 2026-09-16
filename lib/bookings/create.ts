import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { Service } from "@/types/business";

export type CreateBookingInput = {
  businessId: string;
  service: Service;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
};

export async function createBooking(input: CreateBookingInput) {
  const customerName = input.customerName.trim();
  const customerPhone = input.customerPhone.trim();

  if (!customerName || !customerPhone) throw new Error("MISSING_CUSTOMER");

  return addDoc(collection(getFirebaseDb(), "businesses", input.businessId, "bookings"), {
    businessId: input.businessId,
    serviceId: input.service.id,
    serviceName: input.service.name,
    serviceDurationMinutes: input.service.durationMinutes,
    servicePrice: input.service.price,
    customerName,
    customerPhone,
    date: input.date,
    time: input.time,
    status: "pending",
    createdAt: serverTimestamp()
  });
}
