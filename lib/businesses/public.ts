import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import type { Business, Service } from "@/types/business";
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

async function getBusinessServices(businessId: string, embedded: unknown): Promise<Service[]> {
  try {
    const snapshot = await getDocs(collection(getFirebaseDb(), "businesses", businessId, "services"));
    if (!snapshot.empty) {
      return snapshot.docs.flatMap((item) => parseServices([{ id: item.id, ...item.data() }]));
    }
  } catch {
    // If the subcollection is not available yet, use embedded/mock-compatible data.
  }
  return parseServices(embedded);
}

export async function getPublicBusiness(slug: string): Promise<Business | undefined> {
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) return getBusinessBySlug(slug);

  try {
    const snapshot = await getDoc(doc(getFirebaseDb(), "businesses", slug));
    if (!snapshot.exists()) return undefined;
    const data = snapshot.data();
    const services = await getBusinessServices(snapshot.id, data.services);

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
      services
    };
  } catch {
    return getBusinessBySlug(slug);
  }
}
