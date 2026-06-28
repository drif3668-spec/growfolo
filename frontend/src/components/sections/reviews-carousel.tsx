"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, BadgeCheck } from "lucide-react";

const REVIEWS = [
  {
    name: "Ahmed Hassan",
    country: "مصر",
    flag: "🇪🇬",
    avatar: "AH",
    color: "#7c3aed",
    product: "Claude Max 20x",
    activationTime: "8 دقائق",
    since: "أسبوعين",
    rating: 5,
    text: "اشتريت Claude Max وتم التفعيل خلال أقل من 10 دقائق. خدمة احترافية وسريعة جداً، وسأكرر الشراء مرة أخرى.",
  },
  {
    name: "Sarah Alqahtani",
    country: "السعودية",
    flag: "🇸🇦",
    avatar: "SA",
    color: "#db2777",
    product: "ChatGPT Plus",
    activationTime: "5 دقائق",
    since: "3 أيام",
    rating: 5,
    text: "من أفضل المتاجر التي تعاملت معها. الدعم سريع جداً والاشتراكات أصلية 100%، أنصع الجميع بالتعامل معهم.",
  },
  {
    name: "Youssef E.",
    country: "المغرب",
    flag: "🇲🇦",
    avatar: "YE",
    color: "#059669",
    product: "Gemini Ultra",
    activationTime: "10 دقائق",
    since: "أسبوع",
    rating: 5,
    text: "اشتريت أكثر من 5 اشتراكات من المتجر، كلها كانت ممتازة. الأسعار مناسبة جداً والخدمة فوق التوقع!",
  },
  {
    name: "Nour El",
    country: "الجزائر",
    flag: "🇩🇿",
    avatar: "NE",
    color: "#2563eb",
    product: "Canva Pro",
    activationTime: "2 دقيقة",
    since: "أمس",
    rating: 5,
    text: "متجر موثوق وسريع جداً. اشتريت Canva Pro وتم التفعيل فوراً. شكراً على الخدمة الرائعة.",
  },
  {
    name: "Omar Khaled",
    country: "الإمارات",
    flag: "🇦🇪",
    avatar: "OK",
    color: "#f59e0b",
    product: "Adobe Creative Cloud",
    activationTime: "15 دقيقة",
    since: "شهر",
    rating: 5,
    text: "أفضل متجر للاشتراكات في المنطقة العربية. سعر لا يُصدق والجودة أصلية 100%.",
  },
  {
    name: "Fatima Z.",
    country: "تونس",
    flag: "🇹🇳",
    avatar: "FZ",
    color: "#a855f7",
    product: "Claude Pro",
    activationTime: "3 دقائق",
    since: "4 أيام",
    rating: 5,
    text: "تجربة رائعة! الدعم الفني متجاوب في أي وقت والأسعار في متناول الجميع. أنصح الجميع بهذا المتجر.",
  },
];

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>
      ))}
    </div>
  );
}

export function ReviewsCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => setCurrent((p) => (p + 1) % REVIEWS.length), []);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + REVIEWS.length) % REVIEWS.length), []);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, 4500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, next]);

  const visible = [-1, 0, 1].map((offset) => ({
    review: REVIEWS[(current + offset + REVIEWS.length) % REVIEWS.length],
    offset,
  }));

  return (
    <section className="py-14">
      <div className="mb-10 text-center">
        <div className="mb-3 flex items-center justify-center gap-2 text-yellow-400">
          <Stars n={5} />
          <span className="text-xl font-black text-white">4.98</span>
          <span className="text-white/40 text-sm">/ 5</span>
        </div>
        <h2 className="text-3xl font-black text-white md:text-4xl">ماذا يقول عملاؤنا؟</h2>
        <p className="mt-2 text-white/50">+250,000 عميل راضٍ حول العالم</p>
      </div>

      {/* Cards */}
      <div
        className="relative flex items-center justify-center gap-5 overflow-visible"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        style={{ minHeight: 320 }}
      >
        {visible.map(({ review, offset }) => (
          <ReviewCard key={review.name} review={review} offset={offset} />
        ))}
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          onClick={prev}
          className="grid size-10 place-items-center rounded-2xl border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/12"
        >
          <ChevronRight size={18} />
        </button>
        <div className="flex gap-2">
          {REVIEWS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${i === current ? "h-2 w-6 bg-purple-500" : "size-2 bg-white/20"}`}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="grid size-10 place-items-center rounded-2xl border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/12"
        >
          <ChevronLeft size={18} />
        </button>
      </div>
    </section>
  );
}

function ReviewCard({ review, offset }: { review: typeof REVIEWS[0]; offset: number }) {
  const isCenter = offset === 0;
  return (
    <div
      className="flex-shrink-0 transition-all duration-500"
      style={{
        width: isCenter ? 380 : 300,
        opacity: isCenter ? 1 : 0.5,
        transform: `scale(${isCenter ? 1 : 0.88}) translateY(${isCenter ? 0 : 16}px)`,
        zIndex: isCenter ? 10 : 1,
        pointerEvents: isCenter ? "auto" : "none",
      }}
    >
      <div
        className="relative flex flex-col overflow-hidden rounded-3xl p-6"
        style={{
          background: isCenter
            ? "linear-gradient(145deg, rgba(18,13,30,0.97), rgba(9,8,18,0.99))"
            : "rgba(14,11,24,0.7)",
          border: `1px solid ${isCenter ? "rgba(168,85,247,0.35)" : "rgba(255,255,255,0.07)"}`,
          boxShadow: isCenter ? "0 0 60px rgba(168,85,247,0.20), 0 20px 50px rgba(0,0,0,0.5)" : "none",
        }}
      >
        {/* Gloss line */}
        {isCenter && (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="grid size-12 shrink-0 place-items-center rounded-2xl text-sm font-black text-white"
              style={{
                background: `linear-gradient(135deg, ${review.color}, ${review.color}99)`,
                boxShadow: `0 0 0 2px rgba(9,8,15,1), 0 0 0 3px ${review.color}55`,
              }}
            >
              {review.avatar}
            </div>
            <div>
              <p className="font-black text-white leading-tight">{review.name}</p>
              <p className="text-xs text-white/45">{review.flag} {review.country}</p>
            </div>
          </div>
          <span className="flex items-center gap-1 rounded-xl border border-lime-500/25 bg-lime-500/10 px-2.5 py-1 text-[11px] font-bold text-lime-400">
            <BadgeCheck size={11} /> Verified
          </span>
        </div>

        {/* Stars */}
        <div className="mt-4">
          <Stars n={review.rating} />
        </div>

        {/* Text */}
        <p className="mt-3 text-sm leading-7 text-white/75">{review.text}</p>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-3 divide-x divide-white/8 rounded-2xl border border-white/8 bg-white/4 text-center">
          {[
            { label: "تم شراء", value: review.product },
            { label: "التفعيل", value: review.activationTime },
            { label: "منذ", value: review.since },
          ].map(({ label, value }) => (
            <div key={label} className="px-2 py-2.5">
              <p className="text-[10px] text-white/40">{label}</p>
              <p className="mt-0.5 text-[11px] font-bold text-white leading-tight">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
