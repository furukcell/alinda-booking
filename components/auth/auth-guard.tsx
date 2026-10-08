"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";
import { collection, getDocs, limit, query, where } from "firebase/firestore";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};

    try {
      const auth = getFirebaseAuth();
      unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
        setUser(nextUser);
        if (!nextUser) {
          setChecking(false);
          router.replace("/login");
          return;
        }

        try {
          const snapshot = await getDocs(
            query(collection(getFirebaseDb(), "businesses"), where("ownerId", "==", nextUser.uid), limit(1))
          );
          if (snapshot.empty) {
            setChecking(false);
            return;
          }
          const business = snapshot.docs[0].data();
          if (business.accessEnabled === false) {
            setChecking(false);
            router.replace("/access-suspended");
            return;
          }
          if (business.onboardingCompleted === false && pathname !== "/panel/onboarding") {
            setChecking(false);
            router.replace("/panel/onboarding");
            return;
          }
        } catch {
          // Keep the normal authenticated panel flow if the access check cannot be read.
        }

        setChecking(false);
      });
    } catch {
      setChecking(false);
      router.replace("/login");
    }

    return () => unsubscribe();
  }, [pathname, router]);

  if (checking || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-alinda-cream px-6">
        <div className="w-full max-w-sm rounded-2xl border border-alinda-line bg-white p-6 shadow-card">
          <div className="h-3 w-20 animate-pulse rounded-full bg-alinda-line" />
          <div className="mt-4 h-8 w-48 animate-pulse rounded-lg bg-alinda-line" />
          <div className="mt-3 h-4 w-64 animate-pulse rounded-lg bg-alinda-line" />
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
