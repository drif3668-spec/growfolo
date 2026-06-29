"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const AUTO_INTERVAL = 5000;

interface Slide {
  id: number;
  image_url: string;
  title: string | null;
  description: string | null;
  button_text: string;
  link_url: string;
  alt_text: string | null;
}

export function BannerCarousel() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Touch / swipe state
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/banners`)
      .then((r) => r.json())
      .then((data: Slide[]) => { if (Array.isArray(data) && data.length) setSlides(data); })
      .catch(() => {});
  }, []);

  const next = useCallback(() => setCurrent((p) => (p + 1) % Math.max(slides.length, 1)), [slides.length]);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + Math.max(slides.length, 1)) % Math.max(slides.length, 1)), [slides.length]);

  /* Auto-play */
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!playing || hovered || slides.length < 2) return;
    timerRef.current = setInterval(next, AUTO_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, hovered, slides.length, next]);

  /* Keyboard navigation */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") next();
      if (e.key === "ArrowRight") prev();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [next, prev]);

  if (!slides.length) return null;

  const slide = slides[current];

  return (
    <section
      className="relative w-full overflow-hidden bg-black"
      style={{ aspectRatio: "3/1", maxHeight: 640 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={(e) => { touchStartX.current = e.changedTouches[0].clientX; }}
      onTouchEnd={(e) => {
        touchEndX.current = e.changedTouches[0].clientX;
        const diff = touchStartX.current - touchEndX.current;
        if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
      }}
      aria-roledescription="carousel"
      aria-label="الإعلانات والعروض"
    >
      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
          aria-hidden={i !== current}
        >
          {/* Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${API_URL}${s.image_url}`}
            alt={s.alt_text ?? s.title ?? "إعلان"}
            className="h-full w-full object-cover"
            loading={i === 0 ? "eager" : "lazy"}
            onLoad={() => setLoaded((p) => ({ ...p, [s.id]: true }))}
            style={{ opacity: loaded[s.id] ? 1 : 0, transition: "opacity .4s" }}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-start justify-end p-6 md:p-10 lg:p-16">
            {s.title && (
              <h2
                className="mb-2 max-w-2xl text-2xl font-black leading-tight text-white drop-shadow-lg md:text-4xl lg:text-5xl"
                style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}
              >
                {s.title}
              </h2>
            )}
            {s.description && (
              <p className="mb-5 max-w-xl text-sm leading-7 text-white/80 drop-shadow md:text-base">
                {s.description}
              </p>
            )}
            <a
              href={s.link_url}
              className="neon-button inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-black text-black md:px-8 md:py-4 md:text-base"
            >
              {s.button_text}
            </a>
          </div>
        </div>
      ))}

      {/* Arrow — Right (prev in RTL) */}
      {slides.length > 1 && (
        <button
          onClick={prev}
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 grid size-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/65 transition-colors md:size-12"
          aria-label="السابق"
        >
          <ChevronRight size={22} />
        </button>
      )}

      {/* Arrow — Left (next in RTL) */}
      {slides.length > 1 && (
        <button
          onClick={next}
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 grid size-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/65 transition-colors md:size-12"
          aria-label="التالي"
        >
          <ChevronLeft size={22} />
        </button>
      )}

      {/* Bottom bar: dots + play/pause */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 z-10 flex items-center justify-center gap-3">
          {/* Play/Pause */}
          <button
            onClick={() => setPlaying((p) => !p)}
            className="grid size-8 place-items-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70"
            aria-label={playing ? "إيقاف" : "تشغيل"}
          >
            {playing ? <Pause size={13} /> : <Play size={13} />}
          </button>

          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`انتقل إلى الشريحة ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-6 h-2.5 bg-lime-400"
                    : "size-2.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Progress bar */}
      {playing && !hovered && slides.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-10 h-0.5 bg-white/15">
          <div
            key={`${current}-${playing}`}
            className="h-full bg-lime-400"
            style={{
              animation: `banner-progress ${AUTO_INTERVAL}ms linear forwards`,
            }}
          />
        </div>
      )}
    </section>
  );
}
