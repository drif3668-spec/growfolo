"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ShoppingCart, Eye, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { PRODUCTS, type Product } from "@/data/products";
import { useCart } from "@/context/cart-context";

const VISIBLE_RANGE = 2; // how many cards each side of center
const AUTO_MS = 5000;
const RESUME_MS = 3500;

/* Card 3D geometry per offset */
function cardStyle(offset: number, dragging: boolean): React.CSSProperties {
  const abs = Math.abs(offset);
  const sign = Math.sign(offset);
  const rotY = sign * abs * 42;
  const translateX = sign * abs * (abs === 1 ? 200 : 340);
  const translateZ = -abs * 120;
  const scale = 1 - abs * 0.17;
  const opacity = abs === 0 ? 1 : abs === 1 ? 0.72 : 0.38;
  return {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: `translateY(-50%) translateX(calc(-50% + ${translateX}px)) translateZ(${translateZ}px) rotateY(${rotY}deg) scale(${scale})`,
    opacity,
    zIndex: 10 - abs,
    transition: dragging ? "none" : "all 0.65s cubic-bezier(0.23, 1, 0.32, 1)",
    pointerEvents: abs === 0 ? "auto" : "none",
  };
}

export function AdsShowcase() {
  const n = PRODUCTS.length;
  const [current, setCurrent] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const dragStartX = useRef(0);
  const dragCurrent = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { addItem } = useCart();

  const goTo = useCallback((idx: number) => setCurrent(((idx % n) + n) % n), [n]);
  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  /* Autoplay */
  useEffect(() => {
    if (!autoplay) return;
    timerRef.current = setInterval(goNext, AUTO_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoplay, goNext]);

  const pauseAndResume = useCallback(() => {
    setAutoplay(false);
    if (resumeRef.current) clearTimeout(resumeRef.current);
    resumeRef.current = setTimeout(() => setAutoplay(true), RESUME_MS);
  }, []);

  /* Keyboard */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { pauseAndResume(); goNext(); }
      if (e.key === "ArrowRight") { pauseAndResume(); goPrev(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [goNext, goPrev, pauseAndResume]);

  /* Drag — mouse */
  function onMouseDown(e: React.MouseEvent) { dragStartX.current = e.clientX; dragCurrent.current = e.clientX; setDragging(true); pauseAndResume(); }
  function onMouseMove(e: React.MouseEvent) { if (!dragging) return; dragCurrent.current = e.clientX; }
  function onMouseUp() {
    if (!dragging) return;
    const diff = dragStartX.current - dragCurrent.current;
    if (Math.abs(diff) > 60) diff > 0 ? goNext() : goPrev();
    setDragging(false);
  }

  /* Drag — touch */
  function onTouchStart(e: React.TouchEvent) { dragStartX.current = e.touches[0].clientX; setDragging(true); pauseAndResume(); }
  function onTouchEnd(e: React.TouchEvent) {
    const diff = dragStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
    setDragging(false);
  }

  return (
    <section className="relative select-none overflow-hidden bg-[#050508] py-10">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-purple-600/8 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4">
        {/* Title */}
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[4px] text-purple-400">أبرز خدماتنا</p>
          <h2 className="mt-2 text-3xl font-black text-white md:text-4xl">عروض حصرية لك</h2>
        </div>

        {/* 3D Scene */}
        <div
          className="relative mx-auto cursor-grab active:cursor-grabbing"
          style={{ height: 440, perspective: "1400px" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={() => { if (dragging) { setDragging(false); } }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {PRODUCTS.map((product, i) => {
            const raw = i - current;
            const offset = ((raw + n) % n) > n / 2 ? raw - n : raw;
            if (Math.abs(offset) > VISIBLE_RANGE) return null;
            return (
              <div key={product.id} style={cardStyle(offset, dragging)}>
                <ShowcaseCard
                  product={product}
                  isCenter={offset === 0}
                  onAddToCart={() => {
                    addItem({ id: product.id, name: product.name, price: product.price, logo: product.logo, color: product.color });
                    pauseAndResume();
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            onClick={() => { goPrev(); pauseAndResume(); }}
            className="grid size-11 place-items-center rounded-2xl border border-white/10 bg-white/5 text-white transition-all hover:border-purple-500/40 hover:bg-purple-500/10"
            aria-label="السابق"
          >
            <ChevronRight size={20} />
          </button>
          <div className="flex items-center gap-2">
            {PRODUCTS.map((_, i) => (
              <button
                key={i}
                onClick={() => { goTo(i); pauseAndResume(); }}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? "w-7 h-2.5 bg-purple-500" : "size-2.5 bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`انتقل إلى ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => { goNext(); pauseAndResume(); }}
            className="grid size-11 place-items-center rounded-2xl border border-white/10 bg-white/5 text-white transition-all hover:border-purple-500/40 hover:bg-purple-500/10"
            aria-label="التالي"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── Card component ──────────────────────────────────────────────────────── */

function ShowcaseCard({ product, isCenter, onAddToCart }: { product: Product; isCenter: boolean; onAddToCart: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!isCenter || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rx = ((e.clientY - cy) / (rect.height / 2)) * -8;
    const ry = ((e.clientX - cx) / (rect.width / 2)) * 8;
    setTilt({ x: rx, y: ry });
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{
        width: isCenter ? 320 : 280,
        transform: isCenter ? `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` : undefined,
        transition: "transform 0.15s ease",
      }}
      className="relative flex flex-col overflow-hidden rounded-3xl"
    >
      {/* Gradient BG */}
      <div className={`absolute inset-0 bg-gradient-to-br ${product.color} opacity-90`} />
      <div className="absolute inset-0 bg-black/40" />

      {/* Gloss top line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      {/* Glow border */}
      {isCenter && (
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl"
          style={{ boxShadow: `0 0 0 1px ${product.accentColor}55, 0 0 60px ${product.accentColor}25, 0 20px 60px rgba(0,0,0,0.6)` }}
        />
      )}

      {/* Badge */}
      {product.badge && (
        <div
          className="absolute right-4 top-4 rounded-xl px-3 py-1 text-[10px] font-black text-black"
          style={{ background: product.accentColor }}
        >
          {product.badge}
        </div>
      )}

      {/* Content */}
      <div className="relative flex flex-1 flex-col p-6">
        {/* Logo */}
        <div
          className="mx-auto mb-4 grid size-20 place-items-center rounded-2xl text-4xl font-black text-white"
          style={{ background: `${product.accentColor}22`, border: `1px solid ${product.accentColor}44`, boxShadow: `0 0 30px ${product.accentColor}33` }}
        >
          {product.logo}
        </div>

        {/* Name */}
        <h3 className="text-center text-lg font-black text-white">{product.name}</h3>
        <p className="mt-0.5 text-center text-xs text-white/60">{product.subtitle}</p>

        {/* Rating */}
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={11} className="fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-xs text-white/60">{product.rating} ({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="mt-4 text-center">
          <span className="text-4xl font-black text-white">${product.price}</span>
          <span className="ml-2 text-sm text-white/40 line-through">${product.oldPrice}</span>
        </div>

        {/* Short description */}
        <p className="mt-3 text-center text-xs leading-6 text-white/65 line-clamp-2">
          {product.description}
        </p>

        {/* Buttons */}
        <div className="mt-5 flex flex-col gap-2.5">
          <a
            href={`/products/${product.id}`}
            className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white transition-all hover:opacity-80"
            style={{ background: `${product.accentColor}22`, border: `1px solid ${product.accentColor}44` }}
          >
            <Eye size={15} /> عرض التفاصيل
          </a>
          <button
            onClick={onAddToCart}
            className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black text-black transition-all hover:scale-[1.02]"
            style={{ background: product.accentColor, boxShadow: `0 0 20px ${product.accentColor}55` }}
          >
            <ShoppingCart size={15} /> إضافة للسلة
          </button>
        </div>
      </div>
    </div>
  );
}
