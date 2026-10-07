import Link from "next/link";

export default function AccessSuspendedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-alinda-cream px-4 text-alinda-ink">
      <section className="w-full max-w-md rounded-[28px] border border-alinda-line bg-white p-8 text-center shadow-card">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4EAEA] text-[#A55E63] text-2xl">⏸</div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-alinda-accent">ALINDA</p>
        <h1 className="mt-2 text-2xl font-semibold">Erişim geçici olarak durduruldu</h1>
        <p className="mt-3 text-sm leading-6 text-alinda-muted">İşletme panelinize erişim şu anda kapalı. Aboneliğiniz veya hesabınızla ilgili bilgi almak için ALINDA yöneticinizle iletişime geçin.</p>
        <Link href="/login" className="mt-7 inline-flex h-11 items-center rounded-full bg-alinda-ink px-6 text-sm font-semibold text-white">Giriş ekranına dön</Link>
      </section>
    </main>
  );
}