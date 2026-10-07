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
  specialistId: string;
  specialistName: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
};

function minutes(value: string) {
  const [hours, mins] = value.split(":").map(Number);
  return hours * 60 + mins;
}

function timeFromMinutes(value: number) {
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

function getSlotId(date: string, time: string, specialistId: string) {
  return `${date}_${time}_${specialistId}`.replace(/[^a-zA-Z0-9_-]/g, "-");
}

export async function createBooking(input: CreateBookingInput) {
  const customerName = input.customerName.trim();
  const customerPhone = input.customerPhone.trim();

  if (!customerName || !customerPhone) throw new Error("MISSING_CUSTOMER");
  if (!input.businessId || !input.service.id || !input.specialistId || !input.date || !input.time) {
    throw new Error("INVALID_BOOKING");
  }

  const db = getFirebaseDb();
  const bookingRef = doc(collection(db, "businesses", input.businessId, "bookings"));
  const duration = Math.max(30, Math.ceil(input.service.durationMinutes / 30) * 30);
  const start = minutes(input.time);
  const segmentTimes = Array.from({ length: duration / 30 }, (_, index) => timeFromMinutes(start + index * 30));
  const slotRefs = segmentTimes.map((time) =>
    doc(db, "businesses", input.businessId, "slots", getSlotId(input.date, time, input.specialistId))
  );

  try {
    await runTransaction(db, async (transaction) => {
      const snapshots = await Promise.all(slotRefs.map((slotRef) => transaction.get(slotRef)));

      if (snapshots.some((snapshot) => snapshot.exists())) {
        const error = new Error("SLOT_TAKEN") as Error & { code?: string };
        error.code = "already-exists";
        throw error;
      }

      slotRefs.forEach((slotRef, index) => {
        transaction.set(slotRef, {
          slotId: slotRef.id,
          date: input.date,
          time: segmentTimes[index],
          specialistId: input.specialistId,
          status: "pending",
          createdAt: serverTimestamp()
        });
      });

      transaction.set(bookingRef, {
        businessId: input.businessId,
        serviceId: input.service.id,
        serviceName: input.service.name,
        serviceDurationMinutes: input.service.durationMinutes,
        servicePrice: input.service.price,
        specialistId: input.specialistId,
        specialistName: input.specialistName,
        customerName,
        customerPhone,
        date: input.date,
        time: input.time,
        status: "pending",
        slotId: slotRefs[0].id,
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
