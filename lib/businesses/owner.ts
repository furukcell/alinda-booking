import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";

export async function getOwnedBusinessId(uid: string): Promise<string | null> {
  const snapshot = await getDocs(
    query(collection(getFirebaseDb(), "businesses"), where("ownerId", "==", uid), limit(1))
  );

  return snapshot.empty ? null : snapshot.docs[0].id;
}
