import { doc, getDoc } from "firebase/firestore";
import type { Business, Service } from "@/types/business";
import { getFirebaseDb } from "@/lib/firebase/client";
import { getBusinessBySlug } from "@/lib/mock/businesses";

function toPublicBusiness(id: string, data: Record<string, unknown>): Business {
  const rawServices = Array.isArray(data.services) ? data.services : [];
  const services: Service[] = rawServices.flatMap((raw) => {
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

  return {
    id,
    name: typeof data.name === "string" ? data.name : "",
    slug: typeof data.slug === "string" ? data.slug : "",
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
}

export async function getPublicBusiness(slug: string): Promise<Business | undefined> {
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) return getBusinessBySlug(slug);

  try {
    const snapshot = await getDoc(doc(getFirebaseDb(), "businesses", slug));
    if (!snapshot.exists()) return undefined;
    return toPublicBusiness(snapshot.id, snapshot.data());
  } catch {
    // Keep local development usable until Firebase credentials/rules are configured.
    return getBusinessBySlug(slug);
  }
}
