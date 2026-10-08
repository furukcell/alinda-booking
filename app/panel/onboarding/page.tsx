"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Clock3, ExternalLink, Loader2, PartyPopper, QrCode, Scissors, Settings2, Users } from "lucide-react";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";

type Business = {
  id: string;
  name: string;
  slug: string;
  city: string;
  district: string;
  address: string;
  phone: string;
};

type Step = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: typeof Settings2;
};

export default function OnboardingPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [serviceCount, setServiceCount] = useState(0);
  const [specialistCount, setSpecialistCount] = useState(0);
  const [hasHours, setHasHours] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const user = getFirebaseAuth().currentUser;
    if (!user) return;

    try {
      const snapshot = await getDocs(
        query(collection(getFirebaseDb(), "businesses"), where("ownerId", "==", user.uid))
      );
      if (snapshot.empty) throw new Error("İşletme bulunamadı.");

      const businessDoc = snapshot.docs[0];
      const data = businessDoc.data();

      setBusiness({
        id: businessDoc.id,
        name: typeof data.name === "string" ? data.name : "",
        slug: typeof data.slug === "string" ? data.slug : businessDoc.id,
        city: typeof data.city === "string" ? data.city : "",
        district: typeof data.district === "string" ? data.district : "",
        address: typeof data.address === "string" ? data.address : "",
        phone: typeof data.phone === "string" ? data.phone : ""
      });

      const db = getFirebaseDb();
      const [services, specialists, hours] = await Promise.all([
        getDocs(collection(db, "businesses", businessDoc.id, "services")),
        getDocs(collection(db, "businesses", businessDoc.id, "specialists")),
        getDocs(collection(db, "businesses", businessDoc.id, "hours"))
      ]);

      setServiceCount(services.size);
      setSpecialistCount(specialists.size);
      setHasHours(hours.docs.some((item) => item.data().enabled !== false));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Kurulum bilgileri alınamadı.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
        if (user) void load();
        else setLoading(false);
      });
    } catch {
      setError("Firebase yapılandırılmamış.");
      setLoading(false);
    }
    return () => unsubscribe();
  }, []);

  const steps: Step[] = useMemo(() => [
    {
      id: "business",
      title: "İşletme bilgileri",
      description: "Ad, telefon, şehir ve adres bilgilerinizi tamamlayın.",
      href: "/panel/settings",
      icon: Settings2
    },
    {
      id: "service",
      title: "İlk hizmetinizi ekleyin",
      description: "Müşterinin randevu alabileceği en az bir hizmet oluşturun.",
      href: "/panel/services",
      icon: Scissors
    },
    {
      id: "specialist",
      title: "Uzmanınızı ekleyin",
      description: "Hizmet verecek uzmanı, verdiği hizmetlerle birlikte tanımlayın.",
      href: "/panel/specialists",
      icon: Users
    },
    {
      id: "hours",
      title: "Çalışma saatlerini belirleyin",
      description: "Müşterilerin randevu alabileceği gün ve saatleri açın.",
      href: "/panel/hours",
      icon: Clock3
    },
    {
      id: "booking",
      title: "Randevu sayfanızı kontrol edin",
      description: "Müşterinin göreceği sayfayı açıp mobil görünümü kontrol edin.",
      href: business ? "/" + business.slug : "/panel",
      icon: ExternalLink
    },
    {
      id: "share",
      title: "Randevu linkinizi paylaşın",
      description: "QR kod veya paylaş butonuyla müşterilerinize ulaştırın.",
      href: "/panel",
      icon: QrCode
    }
  ], [business]);

  const doneById: Record<string, boolean> = {
    business: Boolean(business?.name && business?.phone && business?.city && business?.address),
    service: serviceCount > 0,
    specialist: specialistCount > 0,
    hours: hasHours,
    booking: Boolean(business?.slug),
    share: Boolean(business?.slug)
  };

  const completedCount = steps.filter((step) => doneById[step.id]).length;
  const readyToFinish = completedCount === steps.length;

  async function finishOnboarding() {
    if (!business || !readyToFinish) return;

    setSaving(true);
    setError("");

    try {
      await updateDoc(doc(getFirebaseDb(), "businesses", business.id), {
        onboardingCompleted: true,
        onboardingCompletedAt: new Date()
      });
      window.location.href = "/panel";
    } catch {
      setError("Kurulum tamamlanamadı. Lütfen tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-alinda-cream text-sm text-alinda-muted">Kurulum hazırlanıyor…</main>;
  }

  return (
    <main className="min-h-screen bg-alinda-cream px-4 py-6 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/panel" className="inline-flex items-center gap-2 text-sm text-alinda-muted hover:text-alinda-ink">
          <ArrowLeft size={16} /> Panele dön
        </Link>

        <section className="mt-6 overflow-hidden rounded-[32px] border border-alinda-line bg-white shadow-card">
          <div className="bg-alinda-ink px-6 py-8 text-white sm:px-10 sm:py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E8C6C0]">ALINDA Kurulum</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">İlk randevunuzu almaya hazır mısınız?</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">Birkaç kısa adımda işletmenizin online randevu sayfasını yayına hazır hale getirin.</p>

            <div className="mt-6 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-white transition-all" style={{ width: (completedCount / steps.length) * 100 + "%" }} />
              </div>
              <span className="text-xs font-semibold">{completedCount}/{steps.length}</span>
            </div>
          </div>

          <div className="divide-y divide-alinda-line">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const done = doneById[step.id];

              return (
                <Link key={step.id} href={step.href} className="flex items-center gap-4 px-6 py-5 transition hover:bg-alinda-cream sm:px-10">
                  <span className={"flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl " + (done ? "bg-[#E8F0EB] text-alinda-success" : "bg-alinda-accent-soft text-alinda-accent")}>
                    {done ? <Check size={19} /> : <Icon size={19} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{index + 1}. {step.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-alinda-muted">{step.description}</span>
                  </span>
                  <ArrowRight size={17} className="shrink-0 text-alinda-muted" />
                </Link>
              );
            })}
          </div>

          <div className="border-t border-alinda-line bg-alinda-cream/40 px-6 py-6 sm:px-10">
            {error && <div role="alert" className="mb-4 rounded-xl border border-[#E8CACA] bg-[#FBEEEE] px-4 py-3 text-sm text-alinda-danger">{error}</div>}

            {readyToFinish ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8F0EB] text-alinda-success"><PartyPopper size={20} /></div>
                  <div>
                    <p className="text-sm font-semibold">Kurulum tamamlandı.</p>
                    <p className="mt-1 text-xs text-alinda-muted">Artık randevu sayfanızı müşterilerinizle paylaşabilirsiniz.</p>
                  </div>
                </div>

                <button type="button" onClick={() => void finishOnboarding()} disabled={saving} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-alinda-ink px-5 text-sm font-semibold text-white disabled:opacity-50">
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? "Tamamlanıyor…" : "Panele geç"}
                </button>
              </div>
            ) : (
              <p className="text-xs leading-5 text-alinda-muted">Eksik adımlardan birine dokunarak ilgili bölüme geçebilirsiniz. Tamamladığınızda bu sayfaya dönüp kurulumu tamamlayın.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
