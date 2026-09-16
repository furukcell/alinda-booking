"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase/client";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};

    try {
      const auth = getFirebaseAuth();
      unsubscribe = onAuthStateChanged(auth, (nextUser) => {
        setUser(nextUser);
        setChecking(false);

        if (!nextUser) router.replace("/login");
      });
    } catch {
      setChecking(false);
      router.replace("/login");
    }

    return () => unsubscribe();
  }, [router]);

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
