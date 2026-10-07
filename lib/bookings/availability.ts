import { doc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";

type WorkingDay = {
  enabled: boolean;
  open: string;
  close: string;
};

export type AvailableDate = {
  id: string;
  label: string;
  dateLabel: string;
  dayId: string;
};

export type BookingSlot = {
  time: string;
  status: "available" | "booked";
};

const defaultHours: Record<string, WorkingDay> = {
  sunday: { enabled: false, open: "10:00", close: "16:00" },
  monday: { enabled: true, open: "09:00", close: "18:00" },
  tuesday: { enabled: true, open: "09:00", close: "18:00" },
  wednesday: { enabled: true, open: "09:00", close: "18:00" },
  thursday: { enabled: true, open: "09:00", close: "18:00" },
  friday: { enabled: true, open: "09:00", close: "18:00" },
  saturday: { enabled: false, open: "10:00", close: "16:00" }
};

const dayIds = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const dayLabels = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateId(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function slotId(date: string, time: string, specialistId: string) {
  return `${date}_${time}_${specialistId}`.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function minutes(value: string) {
  const [hours, mins] = value.split(":").map(Number);
  return hours * 60 + mins;
}

function timeFromMinutes(value: number) {
  return `${pad(Math.floor(value / 60))}:${pad(value % 60)}`;
}

export function getNextDates(count = 30): AvailableDate[] {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + index);
    return {
      id: toDateId(date),
      label: dayLabels[date.getDay()],
      dateLabel: `${date.getDate()} ${date.toLocaleDateString("tr-TR", { month: "long" })}`,
      dayId: dayIds[date.getDay()]
    };
  });
}

async function getWorkingDay(businessId: string, dayId: string): Promise<WorkingDay> {
  const fallback = defaultHours[dayId];
  const snapshot = await getDoc(doc(getFirebaseDb(), "businesses", businessId, "hours", dayId));
  if (!snapshot.exists()) return fallback;

  const data = snapshot.data();
  return {
    enabled: data.enabled !== false,
    open: typeof data.open === "string" ? data.open : fallback.open,
    close: typeof data.close === "string" ? data.close : fallback.close
  };
}

export async function getDailySlots(
  businessId: string,
  date: string,
  dayId: string,
  specialistId: string,
  durationMinutes: number
): Promise<{ slots: BookingSlot[]; working: boolean; open: string; close: string }> {
  const workingDay = await getWorkingDay(businessId, dayId);
  if (!workingDay.enabled) {
    return { slots: [], working: false, open: workingDay.open, close: workingDay.close };
  }

  const opening = minutes(workingDay.open);
  const closing = minutes(workingDay.close);
  const duration = Math.max(30, Math.ceil(durationMinutes / 30) * 30);
  const latestStart = closing - duration;
  if (latestStart < opening) {
    return { slots: [], working: true, open: workingDay.open, close: workingDay.close };
  }

  const now = new Date();
  const todayId = toDateId(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const candidateTimes: string[] = [];

  for (let value = opening; value <= latestStart; value += 30) {
    if (date === todayId && value <= currentMinutes) continue;
    candidateTimes.push(timeFromMinutes(value));
  }

  const slots = await Promise.all(candidateTimes.map(async (time) => {
    const start = minutes(time);
    const segments = Array.from({ length: duration / 30 }, (_, index) => timeFromMinutes(start + index * 30));

    const snapshots = await Promise.all(
      segments.map((segment) =>
        getDoc(doc(getFirebaseDb(), "businesses", businessId, "slots", slotId(date, segment, specialistId)))
      )
    );

    return {
      time,
      status: snapshots.some((snapshot) => snapshot.exists()) ? "booked" as const : "available" as const
    };
  }));

  return { slots, working: true, open: workingDay.open, close: workingDay.close };
}
