"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  { src: "/alinda-salon-hero.png", alt: "ALINDA online randevu sistemi - güzellik salonu", label: "Güzellik & Kuaför" },
  { src: "/hero-spa.png", alt: "ALINDA online randevu sistemi - masaj ve spa", label: "Masaj & Spa" },
  { src: "/hero-dental.png", alt: "ALINDA online randevu sistemi - diş kliniği", label: "Diş Kliniği" },
  { src: "/hero-auto-service.png", alt: "ALINDA online randevu sistemi - oto servis", label: "Oto Servis" },
  { src: "/hero-veterinary.png", alt: "ALINDA online randevu sistemi - veteriner kliniği", label: "Veteriner" },
  { src: "/hero-barbershop.png", alt: "ALINDA online randevu sistemi - berber", label: "Berber" },
];

export default function BookingPreviewCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  const go = (direction: number) => {
    setActive((current) => (current + direction + slides.length) % slides.length);
  };

  return (
    <div className="relative mx-auto w-full min-w-0 lg:ml-[-12px] xl:ml-[-24px]">
      <div className="absolute left-4 top-4 z-20 rounded-full border border-white/70 bg-white/90 px-4 py-2 text-xs font-semibold text-alinda-ink shadow-card backdrop-blur sm:left-6 sm:top-6">
        {slides[active].label}
      </div>
      <div className="relative aspect-[4/3] min-h-[300px] w-full overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_30px_90px_rgba(45,38,37,0.2)] sm:aspect-[16/11] sm:rounded-[36px] lg:aspect-[5/4] lg:min-h-[580px] xl:min-h-[680px]">
        {slides.map((slide, index) => (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === active ? "z-10 opacity-100" : "z-0 opacity-0"}`}
            aria-hidden={index !== active}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Önceki sektör görseli"
          className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-alinda-ink shadow-card transition hover:scale-105 sm:left-5 sm:h-12 sm:w-12"
        >
          <ChevronLeft size={23} />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Sonraki sektör görseli"
          className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-alinda-ink shadow-card transition hover:scale-105 sm:right-5 sm:h-12 sm:w-12"
        >
          <ChevronRight size={23} />
        </button>
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3 py-2 shadow-card backdrop-blur">
          {slides.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`${slide.label} görselini göster`}
              aria-current={index === active ? "true" : undefined}
              className={`h-2.5 rounded-full transition-all duration-300 ${index === active ? "w-7 bg-alinda-accent" : "w-2.5 bg-alinda-ink/20 hover:bg-alinda-ink/40"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
