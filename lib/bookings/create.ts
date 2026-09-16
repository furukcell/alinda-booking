import {
  collection,
  doc,
  runTransaction,
  serverTimestamp
} from "firebase/firestore";
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

function getSlotId(date: string, time: string) {
  return `${date}_${time}`.replace(/[^a-zA-Z0-9_-]/g, "-");
}

export async function createBooking(input: CreateBookingInput) {
  const customerName = input.customerName.trim();
  const customerPhone = input.customerPhone.trim();

  if (!customerName || !customerPhone) throw new Error("MISSING_CUSTOMER");
  if (!input.businessId || !input.service.id || !input.date || !input.time) {
    throw new Error("INVALID_BOOKING");
  }

  const db = getFirebaseDb();
  const bookingRef = doc(collection(db, "businesses", input.businessId, "bookings"));
  const slotId = getSlotId(input.date, input.time);
  const slotRef = doc(db, "businesses", input.businessId, "slots", slotId);

  try {
    await runTransaction(db, async (transaction) => {
      transaction.create(slotRef, {
        slotId,
        date: input.date,
        time: input.time,
        status: "pending",
        createdAt: serverTimestamp()
      });

      transaction.set(bookingRef, {
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
        slotId,
        createdAt: serverTimestamp()
      });
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "already-exists") {
      throw new Error("SLOT_TAKEN");
    }
    throw error;
  }

  return bookingRef;
}
