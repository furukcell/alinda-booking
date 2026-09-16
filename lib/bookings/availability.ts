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

function slotId(date: string, time: string) {
  return `${date}_${time}`.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function minutes(value: string) {
  const [hours, mins] = value.split(":").map(Number);
  return hours * 60 + mins;
}

function timeFromMinutes(value: number) {
  return `${pad(Math.floor(value / 60))}:${pad(value % 60)}`;
}

export function getNextDates(count = 14): AvailableDate[] {
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
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) return fallback;

  const snapshot = await getDoc(doc(getFirebaseDb(), "businesses", businessId, "hours", dayId));
  if (!snapshot.exists()) return fallback;

  const data = snapshot.data();
  return {
    enabled: data.enabled !== false,
    open: typeof data.open === "string" ? data.open : fallback.open,
    close: typeof data.close === "string" ? data.close : fallback.close
  };
}

export async function getAvailableSlots(
  businessId: string,
  date: string,
  dayId: string,
  durationMinutes: number
): Promise<string[]> {
  const workingDay = await getWorkingDay(businessId, dayId);
  if (!workingDay.enabled) return [];

  const opening = minutes(workingDay.open);
  const closing = minutes(workingDay.close);
  const latestStart = closing - Math.max(1, durationMinutes);
  if (latestStart < opening) return [];

  const now = new Date();
  const todayId = toDateId(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const slots: string[] = [];

  for (let value = opening; value <= latestStart; value += 30) {
    const time = timeFromMinutes(value);
    if (date === todayId && value <= currentMinutes) continue;
    slots.push(time);
  }

  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || slots.length === 0) return slots;

  const occupied = await Promise.all(
    slots.map(async (time) => {
      const snapshot = await getDoc(doc(getFirebaseDb(), "businesses", businessId, "slots", slotId(date, time)));
      return [time, snapshot.exists()] as const;
    })
  );

  return occupied.filter(([, isTaken]) => !isTaken).map(([time]) => time);
}
