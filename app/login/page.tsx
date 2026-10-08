"use client";

import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { ArrowRight, CalendarDays, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getFirebaseAuth } from "@/lib/firebase/client";

function getAuthErrorMessage(code?: string) {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "E-posta veya şifre hatalı.";
    case "auth/invalid-email":
      return "Geçerli bir e-posta adresi girin.";
    case "auth/too-many-requests":
      return "Çok fazla başarısız deneme yapıldı. Bir süre sonra tekrar deneyin.";
    case "auth/network-request-failed":
      return "Firebase sunucusuna bağlanılamadı. İnternet bağlantınızı kontrol edin.";
    case "auth/unauthorized-domain":
      return "Bu site Firebase Authentication için yetkilendirilmemiş.";
    case "auth/operation-not-allowed":
      return "E-posta/şifre ile giriş Firebase Authentication'da etkin değil.";
    case "auth/invalid-api-key":
      return "Firebase API anahtarı geçersiz.";
    case "auth/app-not-authorized":
      return "Bu domain Firebase Authentication kullanmaya yetkili değil. API anahtarı ve domain ayarlarını kontrol edin.";
    case "auth/api-key-not-valid":
      return "Firebase API anahtarı bu proje için geçerli değil.";
    default:
      return code
        ? `Firebase giriş hatası: ${code}`
        : "Giriş sırasında bilinmeyen bir Firebase hatası oluştu.";
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const auth = getFirebaseAuth();
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const token = await credential.user.getIdToken();
      const adminResponse = await fetch("/api/admin/session", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const adminData = await adminResponse.json().catch(() => ({ authorized: false }));
      router.replace(adminData.authorized ? "/admin" : "/panel");
    } catch (authError) {
      const code = authError instanceof Error && "code" in authError ? String((authError as { code?: string }).code) : undefined;
      setError(getAuthErrorMessage(code));
      setLoading(false);
    }
  }

  async function handlePasswordReset() {
    setError("");
    setResetSent(false);
    if (!email.trim()) {
      setError("Şifre sıfırlamak için önce e-posta adresinizi girin.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
      setResetSent(true);
    } catch (authError) {
      const code = authError instanceof Error && "code" in authError ? String((authError as { code?: string }).code) : undefined;
      setError(code === "auth/invalid-email" ? "Geçerli bir e-posta adresi girin." : "Şifre sıfırlama e-postası gönderilemedi. E-posta adresinizi kontrol edip tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-alinda-cream px-4 py-8 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
        <Link href="/" className="mx-auto text-center">
          <span className="text-sm font-semibold tracking-[0.12em]">İŞLETME GİRİŞİ</span>
        </Link>

        <section className="mt-8 rounded-[28px] border border-alinda-line bg-white p-6 shadow-card sm:p-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-alinda-cream text-alinda-ink">
            <CalendarDays size={21} />
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">{resetMode ? "Şifrenizi sıfırlayın" : "İşletme paneline giriş"}</h1>
          <p className="mt-2 text-sm leading-6 text-alinda-muted">{resetMode ? "E-posta adresinize güvenli bir şifre sıfırlama bağlantısı göndereceğiz." : "Randevularınızı ve işletmenizi yönetmek için hesabınızla giriş yapın."}</p>

          <form onSubmit={resetMode ? (event) => { event.preventDefault(); void handlePasswordReset(); } : handleSubmit} className="mt-7 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium">E-posta</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="ornek@isletme.com"
                autoComplete="email"
                required
                className="h-12 w-full rounded-xl border border-alinda-line bg-white px-4 text-sm outline-none transition placeholder:text-alinda-muted focus:border-alinda-ink focus:ring-4 focus:ring-black/5"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">Şifre</span>
              <span className="relative block">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  minLength={6}
                  className="h-12 w-full rounded-xl border border-alinda-line bg-white px-4 pr-12 text-sm outline-none transition placeholder:text-alinda-muted focus:border-alinda-ink focus:ring-4 focus:ring-black/5"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-alinda-muted hover:bg-alinda-cream hover:text-alinda-ink"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>

            {resetSent ? <div className="rounded-xl border border-alinda-line bg-alinda-cream px-4 py-3 text-sm">Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Gelen kutunuzu ve spam klasörünü kontrol edin.</div> : null}\n\n            {error ? (
              <div role="alert" className="rounded-xl border border-[#E8CACA] bg-[#FBEEEE] px-4 py-3 text-sm text-alinda-danger">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-alinda-ink px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (resetMode ? "E-posta gönderiliyor…" : "Giriş yapılıyor…") : (resetMode ? "Şifre sıfırlama bağlantısı gönder" : "Giriş yap")}
              {!loading ? <ArrowRight size={17} /> : null}
            </button>
          </form>\n\n          <div className="mt-5 text-center text-sm">\n            <button type="button" onClick={() => { setResetMode((mode) => !mode); setError(""); setResetSent(false); }} className="font-medium underline underline-offset-4">\n              {resetMode ? "Giriş ekranına dön" : "Şifremi unuttum"}\n            </button>\n          </div>
        </section>

        <p className="mt-5 text-center text-xs leading-5 text-alinda-muted">
          Hesabınız yoksa işletme yöneticinizden ALINDA hesabı oluşturmasını isteyin.
        </p>
      </div>
    </main>
  );
}
