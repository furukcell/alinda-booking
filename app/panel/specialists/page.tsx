"use client";

import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { ArrowLeft, Check, ImagePlus, Pencil, Plus, Trash2, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getFirebaseAuth, getFirebaseDb, getFirebaseStorage } from "@/lib/firebase/client";
import { getOwnedBusinessId } from "@/lib/businesses/owner";
import type { Service, Specialist } from "@/types/business";

const dayOptions = [
  ["monday", "Pazartesi"], ["tuesday", "Salı"], ["wednesday", "Çarşamba"],
  ["thursday", "Perşembe"], ["friday", "Cuma"], ["saturday", "Cumartesi"], ["sunday", "Pazar"]
] as const;

type ScheduleDay = { enabled: boolean; open: string; close: string; breakStart: string; breakEnd: string };
type ScheduleState = Record<string, ScheduleDay>;

const defaultSchedule: ScheduleState = Object.fromEntries(dayOptions.map(([id]) => [id, {
  enabled: !["saturday", "sunday"].includes(id), open: "09:00", close: "18:00", breakStart: "", breakEnd: ""
}])) as ScheduleState;

const emptyForm = {
  name: "",
  title: "Uzman",
  serviceIds: [] as string[],
  photoUrl: "",
  schedule: defaultSchedule,
  timeOffDates: [] as string[]
};

export default function SpecialistsPage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData(uid: string) {
    setLoading(true);
    setError("");
    try {
      const user = getFirebaseAuth().currentUser;
      const token = await user?.getIdToken();
      if (!token) throw new Error("Oturum doğrulanamadı.");
      const headers = { Authorization: `Bearer ${token}` };
      const [serviceResponse, specialistResponse] = await Promise.all([
        fetch("/api/panel/resources?type=services", { headers, cache: "no-store" }),
        fetch("/api/panel/resources?type=specialists", { headers, cache: "no-store" })
      ]);
      const serviceResult = await serviceResponse.json().catch(() => ({}));
      const specialistResult = await specialistResponse.json().catch(() => ({}));
      if (!serviceResponse.ok) throw new Error(serviceResult.error || "Hizmetler alınamadı.");
      if (!specialistResponse.ok) throw new Error(specialistResult.error || "Uzmanlar alınamadı.");
      setBusinessId(specialistResult.businessId || serviceResult.businessId);
      setServices((serviceResult.items || []).map((item: any) => {
        const data = item;
        return {
          id: item.id,
          name: typeof data.name === "string" ? data.name : "",
          description: typeof data.description === "string" ? data.description : "",
          durationMinutes: typeof data.durationMinutes === "number" ? data.durationMinutes : 30,
          price: typeof data.price === "number" ? data.price : 0,
          currency: "TRY"
        };
      }));

      setSpecialists((Array.isArray(specialistResult.items) ? specialistResult.items : []).map((item: any) => {
        const data = item ?? {};
        return {
          id: typeof item.id === "string" ? item.id : "",
          name: typeof data.name === "string" ? data.name : "",
          title: typeof data.title === "string" ? data.title : "Uzman",
          photoUrl: typeof data.photoUrl === "string" ? data.photoUrl : "",
          serviceIds: Array.isArray(data.serviceIds) ? data.serviceIds.filter((value: unknown): value is string => typeof value === "string") : [],
          schedule: Object.fromEntries(dayOptions.map(([dayId]) => {
            const value = data.schedule?.[dayId];
            return [dayId, {
              ...defaultSchedule[dayId],
              ...(value && typeof value === "object" ? value : {})
            }];
          })),
          timeOffDates: Array.isArray(data.timeOffDates) ? data.timeOffDates.filter((value: unknown): value is string => typeof value === "string") : []
        };
      }).filter((item) => item.id));
    } catch {
      setError("Uzmanlar yüklenemedi. Firebase ve Firestore ayarlarınızı kontrol edin.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
        if (user) void loadData(user.uid);
        else setLoading(false);
      });
    } catch {
      setError("Firebase yapılandırılmamış.");
      setLoading(false);
    }
    return () => unsubscribe();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setPhotoFile(null);
  }

  function toggleService(serviceId: string) {
    setForm((current) => ({
      ...current,
      serviceIds: current.serviceIds.includes(serviceId)
        ? current.serviceIds.filter((id) => id !== serviceId)
        : [...current.serviceIds, serviceId]
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!businessId) return;

    const name = form.name.trim();
    if (!name) {
      setError("Uzman adı zorunlu.");
      return;
    }
    if (form.serviceIds.length === 0) {
      setError("En az bir hizmet seçin.");
      return;
    }
    if (photoFile && (!photoFile.type.startsWith("image/") || photoFile.size > 5 * 1024 * 1024)) {
      setError("Fotoğraf 5 MB'dan küçük bir görsel olmalı.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      let photoUrl = form.photoUrl;

      if (photoFile) {
        const extension = photoFile.name.split(".").pop() || "jpg";
        const imageRef = ref(getFirebaseStorage(), "businesses/" + businessId + "/specialists/" + (editingId ?? crypto.randomUUID()) + "." + extension);
        await uploadBytes(imageRef, photoFile, { contentType: photoFile.type });
        photoUrl = await getDownloadURL(imageRef);
      }

      const payload = {
        name,
        title: form.title.trim() || "Uzman",
        serviceIds: form.serviceIds,
        photoUrl,
        schedule: form.schedule,
        timeOffDates: form.timeOffDates,
        updatedAt: serverTimestamp()
      };

      const specialistsRef = collection(getFirebaseDb(), "businesses", businessId, "specialists");

      if (editingId) {
        await updateDoc(doc(specialistsRef, editingId), payload);
        setSuccess("Uzman güncellendi.");
      } else {
        await addDoc(specialistsRef, { ...payload, createdAt: serverTimestamp() });
        setSuccess("Uzman eklendi.");
      }

      resetForm();
      const user = getFirebaseAuth().currentUser;
      if (user) await loadData(user.uid);
    } catch {
      setError("Uzman kaydedilemedi. Fotoğraf, Firestore veya Storage kurallarını kontrol edin.");
    } finally {
      setSaving(false);
    }
  }

  async function removeSpecialist() {
    if (!businessId || !deletingId) return;
    try {
      await deleteDoc(doc(getFirebaseDb(), "businesses", businessId, "specialists", deletingId));
      setSpecialists((items) => items.filter((item) => item.id !== deletingId));
      setDeletingId(null);
      setSuccess("Uzman silindi.");
    } catch {
      setError("Uzman silinemedi.");
    }
  }

  function editSpecialist(item: Specialist) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      title: item.title,
      serviceIds: item.serviceIds,
      photoUrl: item.photoUrl,
      schedule: Object.fromEntries(dayOptions.map(([dayId]) => [dayId, {
        ...defaultSchedule[dayId],
        ...(item.schedule?.[dayId] ?? {})
      }])),
      timeOffDates: item.timeOffDates ?? []
    });
    setPhotoFile(null);
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen bg-alinda-cream">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-10">
        <Link href="/panel" className="inline-flex items-center gap-2 text-sm text-alinda-muted hover:text-alinda-ink"><ArrowLeft size={16} /> Dashboard</Link>

        <header className="mt-8 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-alinda-ink text-white"><UserRound size={19} /></div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">Uzmanlar</h1>
                <p className="mt-1 text-sm text-alinda-muted">Hizmete göre filtrelenecek uzmanları ve fotoğraflarını yönetin.</p>
              </div>
            </div>
          </div>
          {!editingId && <a href="#specialist-form" className="hidden shrink-0 items-center gap-2 rounded-xl bg-alinda-ink px-4 py-2.5 text-sm font-semibold text-white sm:inline-flex"><Plus size={16} /> Yeni uzman</a>}
        </header>

        {error && <div role="alert" className="mt-6 rounded-xl border border-[#E8CACA] bg-[#FBEEEE] px-4 py-3 text-sm text-alinda-danger">{error}</div>}
        {success && <div role="status" className="mt-6 flex items-center gap-2 rounded-xl border border-[#CFE4D5] bg-[#EEF7F0] px-4 py-3 text-sm text-[#39704A]"><Check size={16} /> {success}</div>}

        <section id="specialist-form" className="mt-6 rounded-[24px] border border-alinda-line bg-white p-5 shadow-card sm:p-6">
          <div className="flex items-center justify-between">
            <div><h2 className="font-semibold">{editingId ? "Uzmanı düzenle" : "Yeni uzman"}</h2><p className="mt-1 text-xs text-alinda-muted">Uzman hangi hizmetleri yapıyorsa onları işaretleyin.</p></div>
            {editingId && <button onClick={resetForm} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-alinda-cream" aria-label="Düzenlemeyi iptal et"><X size={18} /></button>}
          </div>

          <form onSubmit={handleSubmit} className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Ad Soyad</span>
              <input required maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11 w-full rounded-xl border border-alinda-line px-3 text-sm outline-none focus:border-alinda-ink" placeholder="Örn. Aylin Yılmaz" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Uzmanlık başlığı</span>
              <input maxLength={80} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-11 w-full rounded-xl border border-alinda-line px-3 text-sm outline-none focus:border-alinda-ink" placeholder="Örn. Nail Artist" />
            </label>

            <div className="sm:col-span-2">
              <span className="mb-2 block text-sm font-medium">Yaptığı hizmetler</span>
              <div className="grid gap-2 sm:grid-cols-2">
                {services.map((service) => (
                  <label key={service.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-alinda-line p-3 text-sm">
                    <input type="checkbox" checked={form.serviceIds.includes(service.id)} onChange={() => toggleService(service.id)} className="h-4 w-4 accent-black" />
                    <span className="font-medium">{service.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2 rounded-2xl border border-alinda-line bg-alinda-cream/40 p-4">
              <div>
                <p className="text-sm font-semibold">Uzmanın çalışma saatleri</p>
                <p className="mt-1 text-xs text-alinda-muted">İşletmenin genel saatlerinden farklıysa burada uzmana özel gün ve saatleri belirleyin. Boş bırakılan mola alanı kullanılmaz.</p>
              </div>
              <div className="mt-4 space-y-2">
                {dayOptions.map(([dayId, label]) => {
                  const day = form.schedule[dayId];
                  return <div key={dayId} className="rounded-xl border border-alinda-line bg-white p-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <label className="flex min-w-[130px] items-center gap-2 text-sm font-medium"><input type="checkbox" checked={day.enabled} onChange={(e) => setForm({ ...form, schedule: { ...form.schedule, [dayId]: { ...day, enabled: e.target.checked } } })} className="h-4 w-4 accent-black" />{label}</label>
                      {day.enabled ? <div className="flex flex-wrap items-center gap-2 text-xs">
                        <input type="time" value={day.open} onChange={(e) => setForm({ ...form, schedule: { ...form.schedule, [dayId]: { ...day, open: e.target.value } } })} className="h-9 rounded-lg border border-alinda-line px-2 text-sm" />
                        <span className="text-alinda-muted">—</span>
                        <input type="time" value={day.close} onChange={(e) => setForm({ ...form, schedule: { ...form.schedule, [dayId]: { ...day, close: e.target.value } } })} className="h-9 rounded-lg border border-alinda-line px-2 text-sm" />
                        <span className="ml-1 text-alinda-muted">Mola</span>
                        <input type="time" value={day.breakStart} onChange={(e) => setForm({ ...form, schedule: { ...form.schedule, [dayId]: { ...day, breakStart: e.target.value } } })} className="h-9 rounded-lg border border-alinda-line px-2 text-sm" />
                        <span className="text-alinda-muted">—</span>
                        <input type="time" value={day.breakEnd} onChange={(e) => setForm({ ...form, schedule: { ...form.schedule, [dayId]: { ...day, breakEnd: e.target.value } } })} className="h-9 rounded-lg border border-alinda-line px-2 text-sm" />
                      </div> : <span className="text-xs text-alinda-muted">Çalışmıyor</span>}
                    </div>
                  </div>;
                })}
              </div>
              <div className="mt-5">
                <p className="text-sm font-semibold">İzin / kapalı günler</p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input id="specialist-timeoff-date" type="date" className="h-10 rounded-xl border border-alinda-line px-3 text-sm" />
                  <button type="button" onClick={() => {
                    const input = document.getElementById("specialist-timeoff-date") as HTMLInputElement | null;
                    if (!input?.value || form.timeOffDates.includes(input.value)) return;
                    setForm({ ...form, timeOffDates: [...form.timeOffDates, input.value].sort() }); input.value = "";
                  }} className="h-10 rounded-xl border border-alinda-line px-4 text-sm font-semibold">İzin günü ekle</button>
                </div>
                {form.timeOffDates.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{form.timeOffDates.map((date) => <span key={date} className="inline-flex items-center gap-2 rounded-full bg-[#FBEEEE] px-3 py-1.5 text-xs font-medium">{new Date(date + "T12:00:00").toLocaleDateString("tr-TR")}<button type="button" onClick={() => setForm({ ...form, timeOffDates: form.timeOffDates.filter((item) => item !== date) })} aria-label="İzin gününü kaldır"><X size={13} /></button></span>)}</div>}
              </div>
            </div>

            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-medium">Fotoğraf</span>
              <div className="flex flex-col gap-3 rounded-xl border border-dashed border-alinda-line p-4 sm:flex-row sm:items-center">
                {form.photoUrl ? <img src={form.photoUrl} alt={form.name || "Uzman"} className="h-20 w-20 rounded-2xl object-cover" /> : <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-alinda-cream text-alinda-muted"><ImagePlus size={22} /></div>}
                <div className="min-w-0 flex-1">
                  <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} className="block w-full text-sm" />
                  <p className="mt-1 text-xs text-alinda-muted">JPG, PNG veya WEBP · maksimum 5 MB</p>
                  {photoFile && <p className="mt-1 text-xs font-medium">{photoFile.name}</p>}
                </div>
              </div>
            </label>

            <div className="flex gap-2 sm:col-span-2">
              <button disabled={saving || !businessId} className="inline-flex h-11 items-center justify-center rounded-xl bg-alinda-ink px-5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Kaydediliyor…" : editingId ? "Değişiklikleri kaydet" : "Uzmanı ekle"}</button>
              {editingId && <button type="button" onClick={resetForm} className="h-11 rounded-xl border border-alinda-line px-5 text-sm font-semibold">İptal</button>}
            </div>
          </form>
        </section>

        <section className="mt-5 overflow-hidden rounded-[24px] border border-alinda-line bg-white shadow-card">
          {loading ? <div className="space-y-3 p-6">{[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-xl bg-alinda-cream" />)}</div> : specialists.length === 0 ? <div className="p-8 text-center"><p className="font-semibold">Henüz uzman yok</p><p className="mt-1 text-sm text-alinda-muted">İlk uzmanınızı yukarıdaki formdan ekleyin.</p></div> : specialists.map((item, index) => (
            <div key={item.id} className={"flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-6 " + (index ? "border-t border-alinda-line" : "")}>
              {item.photoUrl ? <img src={item.photoUrl} alt={item.name} className="h-14 w-14 shrink-0 rounded-2xl object-cover" /> : <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-alinda-cream font-semibold">{item.name.slice(0, 1)}</div>}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="mt-1 text-xs text-alinda-muted">{item.title}</p>
                <p className="mt-1 truncate text-xs text-alinda-muted">{item.serviceIds.map((id) => services.find((service) => service.id === id)?.name).filter(Boolean).join(" · ") || "Hizmet seçilmemiş"}</p>
              </div>
              <button onClick={() => editSpecialist(item)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-alinda-cream" aria-label={item.name + " düzenle"}><Pencil size={16} /></button>
              <button onClick={() => setDeletingId(item.id)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-alinda-danger hover:bg-[#FBEEEE]" aria-label={item.name + " sil"}><Trash2 size={16} /></button>
            </div>
          ))}
        </section>
      </div>

      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold">Uzman silinsin mi?</h2>
            <p className="mt-2 text-sm leading-6 text-alinda-muted">Uzman yeni randevu ekranında görünmeyecek. Eski randevuların kayıtları silinmez.</p>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setDeletingId(null)} className="h-11 flex-1 rounded-xl border border-alinda-line text-sm font-semibold">Vazgeç</button>
              <button onClick={() => void removeSpecialist()} className="h-11 flex-1 rounded-xl bg-alinda-danger text-sm font-semibold text-white">Evet, sil</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
