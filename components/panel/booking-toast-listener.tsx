"use client";

import { onAuthStateChanged } from "firebase/auth";
import { Bell, CalendarCheck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase/client";

type BookingToast = {
  id: string;
  customerName: string;
  serviceName: string;
  specialistName: string;
  date: string;
  time: string;
  totalPrice: number;
};

export function BookingToastListener() {
  const [toasts, setToasts] = useState<BookingToast[]>([]);
  const cursorRef = useRef(Date.now());
  const seenRef = useRef(new Set<string>());

  useEffect(() => {
    let active = true;
    let intervalId: number | undefined;
    let unsubscribe = () => {};

    const poll = async () => {
      const user = getFirebaseAuth().currentUser;
      if (!user || !active) return;

      try {
        const token = await user.getIdToken();
        const since = Math.max(1, cursorRef.current - 2000);
        const response = await fetch(`/api/panel/notifications?since=${since}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (!response.ok) return;

        const result = await response.json();
        if (!active) return;

        const items = Array.isArray(result.notifications) ? result.notifications : [];
        for (const item of items) {
          if (!item || typeof item.id !== "string" || seenRef.current.has(item.id)) continue;
          seenRef.current.add(item.id);
          if (seenRef.current.size > 150) {
            const first = seenRef.current.values().next().value;
            if (first) seenRef.current.delete(first);
          }

          const toast: BookingToast = {
            id: item.id,
            customerName: typeof item.customerName === "string" ? item.customerName : "Yeni müşteri",
            serviceName: typeof item.serviceName === "string" ? item.serviceName : "Hizmet",
            specialistName: typeof item.specialistName === "string" ? item.specialistName : "",
            date: typeof item.date === "string" ? item.date : "",
            time: typeof item.time === "string" ? item.time : "",
            totalPrice: Number(item.totalPrice || 0),
          };
          setToasts((current) => [...current, toast].slice(-3));
          window.setTimeout(() => {
            if (active) setToasts((current) => current.filter((entry) => entry.id !== toast.id));
          }, 4500);
        }

        cursorRef.current = Date.now();
      } catch {
        // Notification polling is best-effort and must not interrupt panel usage.
      }
    };

    unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
      if (!user) return;
      cursorRef.current = Date.now();
      void poll();
      intervalId = window.setInterval(() => void poll(), 8000);
    });

    return () => {
      active = false;
      unsubscribe();
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:bottom-6 sm:right-6" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto overflow-hidden rounded-2xl border border-alinda-line bg-white shadow-[0_16px_50px_rgba(45,38,37,0.18)] animate-in slide-in-from-bottom-3 fade-in duration-300">
          <div className="flex items-start gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F0EB] text-alinda-success">
              <CalendarCheck size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Bell size={14} className="shrink-0 text-alinda-accent" />
                <p className="text-sm font-semibold">Yeni randevu geldi!</p>
              </div>
              <p className="mt-1 truncate text-sm font-medium">{toast.customerName}</p>
              <p className="mt-0.5 text-xs text-alinda-muted">{toast.serviceName}{toast.specialistName ? ` · ${toast.specialistName}` : ""}</p>
              <p className="mt-2 text-xs font-semibold text-alinda-ink">{toast.date} · {toast.time} <span className="text-alinda-success">· ₺{new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(toast.totalPrice)}</span></p>
              <a href="/panel/appointments" className="mt-3 inline-flex text-xs font-semibold text-alinda-accent hover:underline">Randevuları görüntüle →</a>
            </div>
            <button type="button" onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))} aria-label="Bildirimi kapat" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-alinda-muted hover:bg-alinda-cream">
              <X size={16} />
            </button>
          </div>
          <div className="h-1 bg-alinda-cream"><div className="h-full origin-left animate-[toast-progress_4.5s_linear_forwards] bg-alinda-accent" /></div>
        </div>
      ))}
    </div>
  );
}
