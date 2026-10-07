import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import type { Business, Service, Specialist } from "@/types/business";
import { getFirebaseDb } from "@/lib/firebase/client";
import { getBusinessBySlug } from "@/lib/mock/businesses";

function parseServices(rawServices: unknown): Service[] {
  if (!Array.isArray(rawServices)) return [];
  return rawServices.flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const item = raw as Record<string, unknown>;
    if (typeof item.id !== "string" || typeof item.name !== "string") return [];
    return [{
      id: item.id,
      name: item.name,
      description: typeof item.description === "string" ? item.description : "",
      durationMinutes: typeof item.durationMinutes === "number" ? item.durationMinutes : 30,
      price: typeof item.price === "number" ? item.price : 0,
      currency: "TRY" as const
    }];
  });
}

const dayOptions = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

function parseSpecialists(raw: unknown): Specialist[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const value = item as Record<string, unknown>;
    if (typeof value.id !== "string" || typeof value.name !== "string") return [];
    return [{
      id: value.id,
      name: value.name,
      title: typeof value.title === "string" ? value.title : "Uzman",
      photoUrl: typeof value.photoUrl === "string" ? value.photoUrl : "",
      serviceIds: Array.isArray(value.serviceIds) ? value.serviceIds.filter((id): id is string => typeof id === "string") : [],
      schedule: value.schedule && typeof value.schedule === "object" ? Object.fromEntries(
        Object.entries(value.schedule as Record<string, unknown>).filter(([dayId, day]) => dayOptions.includes(dayId as typeof dayOptions[number]) && day && typeof day === "object")
      ) as Specialist["schedule"] : undefined,
      timeOffDates: Array.isArray(value.timeOffDates) ? value.timeOffDates.filter((date): date is string => typeof date === "string") : []
    }];
  });
}

const demoSpecialists: Specialist[] = [
  {
    id: "demo-aylin",
    name: "Aylin",
    title: "Saç & Stil Uzmanı",
    photoUrl: "https://i.pravatar.cc/240?img=47",
    serviceIds: ["signature-sac-kesimi"]
  },
  {
    id: "demo-melisa",
    name: "Melisa",
    title: "Cilt Bakım Uzmanı",
    photoUrl: "https://i.pravatar.cc/240?img=32",
    serviceIds: ["hydra-cilt-bakimi"]
  },
  {
    id: "demo-derya",
    name: "Derya",
    title: "Nail Artist",
    photoUrl: "https://i.pravatar.cc/240?img=44",
    serviceIds: ["manikur"]
  }
];

async function getBusinessServices(businessId: string, embedded: unknown): Promise<Service[]> {
  try {
    const snapshot = await getDocs(collection(getFirebaseDb(), "businesses", businessId, "services"));
    if (!snapshot.empty) {
      return snapshot.docs.flatMap((item) => parseServices([{ id: item.id, ...item.data() }]));
    }
  } catch {
    // Use embedded/mock-compatible data if the public subcollection is unavailable.
  }
  return parseServices(embedded);
}

async function getBusinessSpecialists(businessId: string, services: Service[], embedded: unknown): Promise<Specialist[]> {
  try {
    const snapshot = await getDocs(collection(getFirebaseDb(), "businesses", businessId, "specialists"));
    if (!snapshot.empty) {
      return snapshot.docs.flatMap((item) => parseSpecialists([{ id: item.id, ...item.data() }]));
    }
  } catch {
    // Fall back to embedded/demo specialists.
  }

  const parsed = parseSpecialists(embedded);
  if (parsed.length > 0) return parsed;

  const serviceIds = new Set(services.map((service) => service.id));
  return demoSpecialists.filter((specialist) => specialist.serviceIds.some((id) => serviceIds.has(id)));
}

export async function getPublicBusiness(slug: string): Promise<Business | undefined> {
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) return getBusinessBySlug(slug);

  try {
    const snapshot = await getDoc(doc(getFirebaseDb(), "businesses", slug));
    if (!snapshot.exists()) return undefined;
    const data = snapshot.data();
    const services = await getBusinessServices(snapshot.id, data.services);
    const specialists = await getBusinessSpecialists(snapshot.id, services, data.specialists);

    return {
      id: snapshot.id,
      name: typeof data.name === "string" ? data.name : "",
      slug: typeof data.slug === "string" ? data.slug : slug,
      category: typeof data.category === "string" ? data.category : "Hizmet",
      description: typeof data.description === "string" ? data.description : "",
      city: typeof data.city === "string" ? data.city : "",
      district: typeof data.district === "string" ? data.district : "",
      address: typeof data.address === "string" ? data.address : "",
      phone: typeof data.phone === "string" ? data.phone : "",
      initials: typeof data.initials === "string" ? data.initials : "AL",
      primaryColor: typeof data.primaryColor === "string" ? data.primaryColor : "#B86F61",
      primaryColorSoft: typeof data.primaryColorSoft === "string" ? data.primaryColorSoft : "#F3E4E0",
      services,
      specialists
    };
  } catch {
    return getBusinessBySlug(slug);
  }
}
