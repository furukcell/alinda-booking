const services = [
  { name: "Signature Saç Kesimi", detail: "Kesim + şekillendirme", duration: "45 dk", price: "₺600" },
  { name: "Hydra Cilt Bakımı", detail: "Derin temizlik + nemlendirme", duration: "60 dk", price: "₺900" },
  { name: "Manikür", detail: "Klasik manikür", duration: "35 dk", price: "₺450" }
];

const dates = [
  { day: "Pzt", date: "16" },
  { day: "Sal", date: "17" },
  { day: "Çar", date: "18" },
  { day: "Per", date: "19" },
  { day: "Cum", date: "20" }
];

const times = ["09:30", "10:00", "10:30", "11:30", "13:00", "14:30", "15:00", "16:30"];

export default function Home() {
  return (
    <main className="min-h-screen bg-alinda-cream">
      <header className="border-b border-alinda-line bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-alinda-ink text-sm font-semibold text-white">A</div>
            <span className="text-sm font-semibold tracking-[0.18em]">ALINDA</span>
          </div>
          <span className="hidden text-xs text-alinda-muted sm:block">Online Randevu</span>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 pb-32 pt-8 sm:px-6 sm:pt-12">
        <div className="rounded-[28px] border border-alinda-line bg-white p-5 shadow-card sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-alinda-accent-soft text-2xl font-semibold text-alinda-accent">MB</div>
            <div className="min-w-0">
              <div className="mb-2 inline-flex rounded-full bg-alinda-accent-soft px-3 py-1 text-xs font-medium text-alinda-accent">Güzellik & Bakım</div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Meltem Beauty Studio</h1>
              <p className="mt-2 text-sm text-alinda-muted">Bodrum, Muğla · Profesyonel güzellik ve bakım hizmetleri</p>
            </div>
          </div>

          <div className="my-8 h-px bg-alinda-line" />

          <section>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-alinda-muted">01</p>
                <h2 className="mt-1 text-xl font-semibold">Hizmet seçin</h2>
              </div>
              <span className="text-xs text-alinda-muted">3 hizmet</span>
            </div>

            <div className="space-y-3">
              {services.map((service, index) => (
                <button key={service.name} className={`group flex w-full items-center justify-between rounded-2xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-alinda-ink ${index === 0 ? "border-alinda-ink bg-alinda-cream" : "border-alinda-line bg-white"}`}>
                  <span className="min-w-0 pr-4">
                    <span className="block font-medium">{service.name}</span>
                    <span className="mt-1 block text-sm text-alinda-muted">{service.detail} · {service.duration}</span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold">{service.price}</span>
                </button>
              ))}
            </div>
          </section>

          <div className="my-8 h-px bg-alinda-line" />

          <section>
            <div className="mb-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-alinda-muted">02</p>
              <h2 className="mt-1 text-xl font-semibold">Tarih seçin</h2>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {dates.map((item, index) => (
                <button key={item.date} className={`rounded-2xl border px-2 py-3 text-center transition ${index === 1 ? "border-alinda-ink bg-alinda-ink text-white" : "border-alinda-line bg-white hover:border-alinda-ink"}`}>
                  <span className={`block text-[11px] ${index === 1 ? "text-white/65" : "text-alinda-muted"}`}>{item.day}</span>
                  <span className="mt-1 block text-lg font-semibold">{item.date}</span>
                </button>
              ))}
            </div>
          </section>

          <div className="my-8 h-px bg-alinda-line" />

          <section>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-alinda-muted">03</p>
                <h2 className="mt-1 text-xl font-semibold">Uygun saatler</h2>
              </div>
              <span className="text-xs text-alinda-muted">17 Eylül</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {times.map((time, index) => (
                <button key={time} className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${index === 2 ? "border-alinda-accent bg-alinda-accent text-white" : "border-alinda-line bg-white hover:border-alinda-ink"}`}>
                  {time}
                </button>
              ))}
            </div>
          </section>

          <div className="my-8 h-px bg-alinda-line" />

          <section>
            <div className="mb-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-alinda-muted">04</p>
              <h2 className="mt-1 text-xl font-semibold">Bilgileriniz</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium">Ad Soyad<input className="mt-2 h-12 w-full rounded-xl border border-alinda-line bg-white px-4 text-sm outline-none transition focus:border-alinda-ink" placeholder="Adınız ve soyadınız" /></label>
              <label className="text-sm font-medium">Telefon<input className="mt-2 h-12 w-full rounded-xl border border-alinda-line bg-white px-4 text-sm outline-none transition focus:border-alinda-ink" placeholder="05xx xxx xx xx" /></label>
            </div>
          </section>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-alinda-line bg-white/90 p-3 backdrop-blur sm:bottom-5 sm:left-1/2 sm:w-full sm:max-w-xl sm:-translate-x-1/2 sm:rounded-2xl sm:border sm:p-3 sm:shadow-elevated">
        <button className="flex h-12 w-full items-center justify-center rounded-xl bg-alinda-ink text-sm font-semibold text-white transition hover:opacity-90">Randevuyu Onayla</button>
      </div>
    </main>
  );
}
