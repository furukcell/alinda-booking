"use client";

import { signOut } from "firebase/auth";
import { LogOut } from "@lucide/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase/client";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await signOut(getFirebaseAuth());
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 rounded-xl border border-alinda-line bg-white px-3 py-2.5 text-sm font-medium text-alinda-muted transition hover:border-alinda-ink hover:text-alinda-ink disabled:opacity-50"
    >
      <LogOut size={16} />
      {loading ? "Çıkılıyor…" : "Çıkış yap"}
    </button>
  );
}
