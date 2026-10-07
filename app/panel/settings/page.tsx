"use client";

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { ArrowLeft, Check, Loader2, MessageCircle, Settings2, Unplug } from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth, getFirebaseDb, getFirebaseStorage } from "@/lib/firebase/client";
import { getOwnedBusinessId } from "@/lib/businesses/owner";

declare global {
  interface Window {
    FB?: {
      init: (options: { appId: string; cookie?: boolean; xfbml?: boolean; version: string }) => void;
      login: (callback: (response: { authResponse?: { code?: string } }) => void, options: Record<string, unknown>) => void;
    };
  }
}

type BusinessForm = {
  name: string;
  slug: string;
  category: string;
  description: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  whatsappNotificationPhone: string;
  initials: string;
  primaryColor: string;
  primaryColorSoft: string;
};

const emptyForm: BusinessForm = {
  name: "",
  slug: "",
  category: "",
  description: "",
  city: "",
  district: "",
  address: "",
  phone: "",
  whatsappNotificationPhone: "",
  initials: "",
  primaryColor: "#B86F61",
  primaryColorSoft: "#F3E4E0"
};

export default function BusinessSettingsPage() {
  const [businessId, setBusinessId] = useState("");
  const [form, setForm] = useState<BusinessForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoBusy, setLogoBusy] = useState(false);
  const [logoError, setLogoError] = useState("");
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [whatsappName, setWhatsappName] = useState("");
  const [whatsappLoading, setWhatsappLoading] = useState(true);
  const [whatsappBusy, setWhatsappBusy] = useState(false);
  const [whatsappError, setWhatsappError] = useState("");
  const [facebookReady, setFacebookReady] = useState(false);
  const signupData = useRef<{ code?: string; wabaId?: string; phoneNumberId?: string }>({});

  useEffect(() => {
    let unsubscribe = () => {};

    try {
      unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (user) => {
        if (!user) {
          setLoading(false);
          return;
        }

        try {
          const id = await getOwnedBusinessId(user.uid);
          if (!id) throw new Error("NO_BUSINESS");

          const snapshot = await getDoc(doc(getFirebaseDb(), "businesses", id));
          if (!snapshot.exists()) throw new Error("BUSINESS_NOT_FOUND");

          const data = snapshot.data();
          setBusinessId(id);
          setForm({
            name: data.name ?? "",
            slug: data.slug ?? "",
            category: data.category ?? "",
            description: data.description ?? "",
            city: data.city ?? "",
            district: data.district ?? "",
            address: data.address ?? "",
            phone: data.phone ?? "",
            whatsappNotificationPhone: data.whatsappNotificationPhone ?? data.phone ?? "",
            initials: data.initials ?? "",
            primaryColor: data.primaryColor ?? emptyForm.primaryColor,
            primaryColorSoft: data.primaryColorSoft ?? emptyForm.primaryColorSoft
          });
          setLogoUrl(typeof data.logoUrl === "string" ? data.logoUrl : "");
        } catch {
          setError("İşletme bilgileri yüklenemedi. Firestore bağlantısını ve kuralları kontrol edin.");
        } finally {
          setLoading(false);
        }
      });
    } catch {
      setError("Firebase yapılandırılmamış.");
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let active = true;

    async function loadWhatsApp() {
      try {
        const user = getFirebaseAuth().currentUser;
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch("/api/whatsapp/status", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (!active) return;
        setWhatsappConnected(Boolean(data.connected));
        setWhatsappPhone(data.displayPhoneNumber || "");
        setWhatsappName(data.verifiedName || "");
      } catch {
        if (active) setWhatsappError("WhatsApp bağlantı durumu okunamadı.");
      } finally {
        if (active) setWhatsappLoading(false);
      }
    }

    void loadWhatsApp();

    function onMessage(event: MessageEvent) {
      if (!event.origin.endsWith("facebook.com")) return;
      try {
        const data = JSON.parse(event.data);
        if (data?.type !== "WA_EMBEDDED_SIGNUP") return;
        const payload = data.data || {};
        signupData.current = {
          ...signupData.current,
          wabaId: payload.waba_id || payload.wabaId,
          phoneNumberId: payload.phone_number_id || payload.phoneNumberId
        };
        void finishWhatsAppSignup();
      } catch {
        // Meta sends non-JSON messages as well; ignore them.
      }
    }

    window.addEventListener("message", onMessage);
    return () => {
      active = false;
      window.removeEventListener("message", onMessage);
    };
  }, []);

  async function finishWhatsAppSignup() {
    const { code, wabaId, phoneNumberId } = signupData.current;
    if (!code || !wabaId || !phoneNumberId || whatsappBusy) return;

    const user = getFirebaseAuth().currentUser;
    if (!user) return;

    setWhatsappBusy(true);
    setWhatsappError("");

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/whatsapp/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code, wabaId, phoneNumberId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "WhatsApp bağlantısı kurulamadı.");

      setWhatsappConnected(true);
      setWhatsappPhone(data.displayPhoneNumber || "");
      setWhatsappName(data.verifiedName || "");
      signupData.current = {};
    } catch (error) {
      setWhatsappError(error instanceof Error ? error.message : "WhatsApp bağlantısı kurulamadı.");
    } finally {
      setWhatsappBusy(false);
    }
  }

  function launchWhatsAppSignup() {
    const appId = process.env.NEXT_PUBLIC_META_APP_ID;
    const configId = process.env.NEXT_PUBLIC_META_CONFIG_ID;

    if (!appId || !configId) {
      setWhatsappError("WhatsApp bağlantısı için Meta App ID ve Embedded Signup Config ID henüz tanımlanmamış.");
      return;
    }

    if (!window.FB || !facebookReady) {
      setWhatsappError("WhatsApp bağlantısı hazırlanıyor. Birkaç saniye sonra tekrar deneyin.");
      return;
    }

    signupData.current = {};
    window.FB.login(
      (response) => {
        const code = response.authResponse?.code;
        if (!code) {
          setWhatsappError("WhatsApp bağlantısı iptal edildi veya tamamlanmadı.");
          return;
        }
        signupData.current = { ...signupData.current, code };
        void finishWhatsAppSignup();
      },
      {
        config_id: configId,
        response_type: "code",
        override_default_response_type: true,
        extras: {
          setup: {},
          sessionInfoVersion: "3"
        }
      }
    );
  }

  async function disconnectWhatsApp() {
    const user = getFirebaseAuth().currentUser;
    if (!user) return;
    setWhatsappBusy(true);
    setWhatsappError("");

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/whatsapp/status", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("WhatsApp bağlantısı kaldırılamadı.");
      setWhatsappConnected(false);
      setWhatsappPhone("");
      setWhatsappName("");
    } catch (error) {
      setWhatsappError(error instanceof Error ? error.message : "WhatsApp bağlantısı kaldırılamadı.");
    } finally {
      setWhatsappBusy(false);
    }
  }

  async function handleLogoUpload(file: File) {
    if (!businessId || logoBusy) return;
    setLogoError("");

    if (!file.type.startsWith("image/")) {
      setLogoError("Lütfen bir görsel dosyası seçin.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setLogoError("Logo en fazla 5 MB olabilir.");
      return;
    }

    setLogoBusy(true);
    try {
      const storage = getFirebaseStorage();
      const logoRef = ref(storage, `businesses/${businessId}/logo`);
      await uploadBytes(logoRef, file, { contentType: file.type, cacheControl: "public,max-age=3600" });
      const url = await getDownloadURL(logoRef);
      await updateDoc(doc(getFirebaseDb(), "businesses", businessId), { logoUrl: url });
      setLogoUrl(url);
      setSaved(true);
    } catch {
      setLogoError("Logo yüklenemedi. Storage Rules ve Firebase Storage bağlantısını kontrol edin.");
    } finally {
      setLogoBusy(false);
    }
  }

  async function removeLogo() {
    if (!businessId || logoBusy || !logoUrl) return;
    setLogoBusy(true);
    setLogoError("");

    try {
      await deleteObject(ref(getFirebaseStorage(), `businesses/${businessId}/logo`));
      await updateDoc(doc(getFirebaseDb(), "businesses", businessId), { logoUrl: "" });
      setLogoUrl("");
      setSaved(true);
    } catch {
      setLogoError("Logo silinemedi. Lütfen tekrar deneyin.");
    } finally {
      setLogoBusy(false);
    }
  }

  function updateField(field: keyof BusinessForm, value: string) {
    setSaved(false);
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!businessId) return;

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      await updateDoc(doc(getFirebaseDb(), "businesses", businessId), {
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase(),
        category: form.category.trim(),
        description: form.description.trim(),
        city: form.city.trim(),
        district: form.district.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        whatsappNotificationPhone: form.whatsappNotificationPhone.trim(),
        initials: form.initials.trim().slice(0, 3).toUpperCase(),
        primaryColor: form.primaryColor,
        primaryColorSoft: form.primaryColorSoft
      });
      setSaved(true);
    } catch {
      setError("Değişiklikler kaydedilemedi. Firestore Rules ve sahiplik bilgisini kontrol edin.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Script
      src="https://connect.facebook.net/en_US/sdk.js"
      strategy="afterInteractive"
      onLoad={() => {
        const appId = process.env.NEXT_PUBLIC_META_APP_ID;
        if (!appId || !window.FB) return;
        window.FB.init({ appId, cookie: true, xfbml: true, version: "v25.0" });
        setFacebookReady(true);
      }}
      />

      <main className="min-h-screen bg-alinda-cream">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:py-10">
        <Link href="/panel" className="inline-flex items-center gap-2 text-sm text-alinda-muted hover:text-alinda-ink">
          <ArrowLeft size={16} /> Dashboard
        </Link>

        <header className="mt-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-alinda-ink text-white"><Settings2 size={19} /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-alinda-accent">İşletme</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">İşletme Ayarları</h1>
            <p className="mt-1 text-sm text-alinda-muted">Müşterilerin randevu sayfasında göreceği temel işletme bilgilerini yönetin.</p>
          </div>
        </header>

        {error && <div role="alert" className="mt-6 rounded-xl border border-[#E8CACA] bg-[#FBEEEE] px-4 py-3 text-sm text-alinda-danger">{error}</div>}

        {loading ? (
          <section className="mt-8 rounded-[24px] border border-alinda-line bg-white p-8 shadow-card">
            <div className="flex items-center gap-2 text-sm text-alinda-muted"><Loader2 size={16} className="animate-spin" /> İşletme bilgileri yükleniyor…</div>
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <section className="rounded-[24px] border border-alinda-line bg-white p-5 shadow-card sm:p-6">
              <div><h2 className="font-semibold">Temel bilgiler</h2><p className="mt-1 text-xs text-alinda-muted">İşletmenizin müşterilere gösterilecek ana bilgileri.</p></div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="İşletme adı" value={form.name} onChange={(value) => updateField("name", value)} required />
                <Field label="Kategori" value={form.category} onChange={(value) => updateField("category", value)} required />
                <Field label="Slug / randevu adresi" value={form.slug} onChange={(value) => updateField("slug", value)} required hint="Örn. meltem-guzellik" />
                <Field label="Kısa isim" value={form.initials} onChange={(value) => updateField("initials", value)} maxLength={3} hint="Örn. MB" />
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">Açıklama</label>
                  <textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} rows={4} className="mt-2 w-full resize-none rounded-xl border border-alinda-line px-3 py-2.5 text-sm outline-none transition focus:border-alinda-ink" />
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border border-alinda-line bg-white p-5 shadow-card sm:p-6">
              <div><h2 className="font-semibold">İletişim ve adres</h2><p className="mt-1 text-xs text-alinda-muted">Randevu sayfanızda müşterilerin göreceği iletişim bilgileri.</p></div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="Şehir" value={form.city} onChange={(value) => updateField("city", value)} required />
                <Field label="İlçe" value={form.district} onChange={(value) => updateField("district", value)} required />
                <Field label="Telefon" value={form.phone} onChange={(value) => updateField("phone", value)} />
                <Field label="WhatsApp bildirim telefonu" value={form.whatsappNotificationPhone} onChange={(value) => updateField("whatsappNotificationPhone", value)} hint="Yeni randevu bildirimlerinin gönderileceği salon/işletme telefonu." />
                <div className="sm:col-span-2"><Field label="Adres" value={form.address} onChange={(value) => updateField("address", value)} /></div>
              </div>
            </section>

            <section className="rounded-[24px] border border-alinda-line bg-white p-5 shadow-card sm:p-6">
              <div>
                <h2 className="font-semibold">İşletme logosu</h2>
                <p className="mt-1 text-xs text-alinda-muted">Müşteriler randevu sayfanızda bu logoyu görecek. PNG, JPG veya WEBP kullanabilirsiniz; maksimum 5 MB.</p>
              </div>

              <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[24px] border border-alinda-line bg-alinda-cream">
                  {logoUrl ? (
                    <img src={logoUrl} alt={form.name || "İşletme logosu"} className="h-full w-full object-contain p-3" />
                  ) : (
                    <span className="text-2xl font-semibold text-alinda-accent">{form.initials || "LOGO"}</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-alinda-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
                    {logoBusy ? "İşleniyor…" : logoUrl ? "Logoyu değiştir" : "Logo yükle"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      disabled={logoBusy}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.currentTarget.value = "";
                        if (file) void handleLogoUpload(file);
                      }}
                    />
                  </label>
                  {logoUrl && (
                    <button type="button" onClick={() => void removeLogo()} disabled={logoBusy} className="rounded-xl border border-alinda-line bg-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50">
                      Logoyu sil
                    </button>
                  )}
                </div>
              </div>

              {logoError && <div role="alert" className="mt-4 rounded-xl border border-[#E8CACA] bg-[#FBEEEE] px-4 py-3 text-xs text-alinda-danger">{logoError}</div>}
            </section>

            <section className="rounded-[24px] border border-alinda-line bg-white p-5 shadow-card sm:p-6">
              <div><h2 className="font-semibold">Marka renkleri</h2><p className="mt-1 text-xs text-alinda-muted">Temel tema renklerinizi buradan yönetin.</p></div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <ColorField label="Ana renk" value={form.primaryColor} onChange={(value) => updateField("primaryColor", value)} />
                <ColorField label="Yumuşak renk" value={form.primaryColorSoft} onChange={(value) => updateField("primaryColorSoft", value)} />
              </div>
            </section>

            <section className="rounded-[24px] border border-alinda-line bg-white p-5 shadow-card sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="flex items-center gap-2 font-semibold"><MessageCircle size={18} /> WhatsApp bildirimleri</h2>
                  <p className="mt-1 text-xs text-alinda-muted">Randevu geldiğinde salonu ve müşteriyi WhatsApp üzerinden otomatik bilgilendirin.</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${whatsappConnected ? "bg-[#E8F5EC] text-[#4E8762]" : "bg-[#F5F1F0] text-alinda-muted"}`}>
                  {whatsappConnected ? "Bağlı" : "Bağlı değil"}
                </span>
              </div>

              {whatsappConnected ? (
                <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-alinda-cream p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold">{whatsappName || "WhatsApp Business"}</p>
                    <p className="mt-1 text-xs text-alinda-muted">{whatsappPhone || "Numara bağlı"}</p>
                  </div>
                  <button type="button" onClick={() => void disconnectWhatsApp()} disabled={whatsappBusy} className="inline-flex items-center justify-center gap-2 rounded-xl border border-alinda-line bg-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50">
                    <Unplug size={16} /> Bağlantıyı kaldır
                  </button>
                </div>
              ) : (
                <div className="mt-5">
                  <button type="button" onClick={launchWhatsAppSignup} disabled={whatsappBusy || whatsappLoading} className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50">
                    <MessageCircle size={17} /> {whatsappBusy ? "Bağlanıyor…" : "WhatsApp'ı Bağla"}
                  </button>
                  <p className="mt-2 text-xs text-alinda-muted">Meta'nın güvenli bağlantı ekranı açılır. İşletme WhatsApp hesabınızı seçip birkaç adımda tamamlayabilirsiniz.</p>
                </div>
              )}

              {whatsappError && <div role="alert" className="mt-4 rounded-xl border border-[#E8CACA] bg-[#FBEEEE] px-4 py-3 text-xs text-alinda-danger">{whatsappError}</div>}
            </section>

            <div className="sticky bottom-4 flex items-center justify-end gap-3 rounded-2xl border border-alinda-line bg-white/95 p-3 shadow-card backdrop-blur">
              {saved && <span className="mr-auto inline-flex items-center gap-1.5 text-sm font-medium text-alinda-success"><Check size={16} /> Kaydedildi</span>}
              <button type="submit" disabled={saving || loading} className="inline-flex items-center gap-2 rounded-xl bg-alinda-ink px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                {saving && <Loader2 size={16} className="animate-spin" />}
                {saving ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
              </button>
            </div>
          </form>
        )}
      </div>
      </main>
    </>
  );
}

function Field({ label, value, onChange, required, hint, maxLength }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; hint?: string; maxLength?: number }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}{required ? " *" : ""}</label>
      <input value={value} onChange={(event) => onChange(event.target.value)} required={required} maxLength={maxLength} className="mt-2 w-full rounded-xl border border-alinda-line px-3 py-2.5 text-sm outline-none transition focus:border-alinda-ink" />
      {hint && <p className="mt-1.5 text-xs text-alinda-muted">{hint}</p>}
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="mt-2 flex gap-2">
        <input type="color" value={/^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#B86F61"} onChange={(event) => onChange(event.target.value)} className="h-11 w-14 cursor-pointer rounded-xl border border-alinda-line bg-white p-1" />
        <input value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-alinda-line px-3 py-2.5 text-sm uppercase outline-none transition focus:border-alinda-ink" />
      </div>
    </div>
  );
}
