"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  BadgeCheck, ChevronDown, ChevronUp,
  ShoppingCart, Star, Zap,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { SiteHeader } from "@/components/layout/site-header";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

interface Spec { label: string; value: string }
interface FAQ { question: string; answer: string }

interface Product {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  logo: string;
  description: string;
  full_description: string | null;
  usage_details: string | null;
  requirements: string | null;
  benefits: string | null;
  price: number;
  old_price: number;
  discount: string;
  buyers: string;
  image_url: string | null;
  accent_color: string;
  logo_color: string;
  category: string;
  badge: string | null;
  rating: number;
  reviews_count: number;
  partners: string[];
  features: string[];
  specs: Spec[];
  faq: FAQ[];
}

export default function ProductPage() {
  const { id } = useParams() as { id: string };
  const { addItem, openSidebar } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${API}/api/v1/products/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data: Product) => {
        setProduct(data);
        return fetch(`${API}/api/v1/products`)
          .then((r) => r.json())
          .then((all: Product[]) =>
            setRelated(
              (Array.isArray(all) ? all : [])
                .filter((p) => p.id !== data.id && p.category === data.category)
                .slice(0, 3)
            )
          );
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050508]">
        <SiteHeader />
        <div className="mx-auto max-w-5xl px-4 py-16 animate-pulse">
          <div className="h-6 w-48 rounded-xl bg-white/8 mb-10" />
          <div className="grid gap-10 md:grid-cols-[auto_1fr]">
            <div className="size-52 rounded-3xl bg-white/8" />
            <div className="flex flex-col gap-4">
              <div className="h-12 w-80 rounded-2xl bg-white/8" />
              <div className="h-4 w-48 rounded-xl bg-white/5" />
              <div className="h-20 w-full rounded-2xl bg-white/5" />
              <div className="h-16 w-56 rounded-2xl bg-white/8" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-screen flex-col bg-[#050508] text-white">
        <SiteHeader />
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-2xl font-black text-white/30">المنتج غير موجود</p>
          <a href="/" className="neon-button rounded-2xl px-6 py-3 font-black text-black">
            العودة للرئيسية
          </a>
        </div>
      </main>
    );
  }

  function handleAddToCart() {
    if (!product) return;
    addItem({ id: product.id, name: product.name, price: product.price, logo: product.logo, color: product.accent_color });
    openSidebar();
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050508] text-white" dir="rtl">
      <SiteHeader />

      {/* ══ Hero ══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% -20%, ${product.accent_color}18 0%, transparent 70%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050508]/50 to-[#050508]" />
        <div
          className="pointer-events-none absolute left-1/4 top-8 size-72 rounded-full blur-[100px] opacity-20"
          style={{ background: product.accent_color }}
        />

        <div className="relative mx-auto max-w-5xl px-4 py-16">
          {/* Breadcrumb */}
          <div className="mb-8 flex items-center gap-2 text-sm text-white/40">
            <a href="/" className="hover:text-white transition-colors">الرئيسية</a>
            <span>/</span>
            <a href="/products" className="hover:text-white transition-colors">المنتجات</a>
            <span>/</span>
            <span className="text-white/70">{product.name}</span>
          </div>

          <div className="grid gap-10 md:grid-cols-[auto_1fr]">
            {/* ── Product visual ── */}
            <div className="relative mx-auto flex shrink-0 flex-col items-center">
              <div
                className="relative grid size-52 shrink-0 place-items-center rounded-3xl text-7xl font-black text-white"
                style={{
                  background: `linear-gradient(145deg, ${product.accent_color}40 0%, ${product.accent_color}15 50%, ${product.accent_color}05 100%)`,
                  border: `1px solid ${product.accent_color}50`,
                  boxShadow: `0 0 0 1px ${product.accent_color}20, 0 30px 80px ${product.accent_color}35, 0 0 120px ${product.accent_color}20`,
                  transform: "perspective(600px) rotateY(-5deg) rotateX(2deg)",
                }}
              >
                {product.image_url ? (
                  <img src={`${API}${product.image_url}`} alt={product.name} className="size-36 object-contain" />
                ) : (
                  <span>{product.logo}</span>
                )}
                <div
                  className="pointer-events-none absolute inset-0 rounded-3xl"
                  style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.12) 0%, transparent 60%)" }}
                />
              </div>
              {/* Reflection */}
              <div
                className="mt-2 h-12 w-40 rounded-b-3xl opacity-20 blur-sm"
                style={{ background: `linear-gradient(to bottom, ${product.accent_color}50, transparent)` }}
              />
            </div>

            {/* ── Info ── */}
            <div className="flex flex-col justify-center">
              {product.badge && (
                <span
                  className="mb-3 inline-block self-start rounded-xl px-3 py-1 text-xs font-black text-black"
                  style={{ background: product.accent_color }}
                >
                  {product.badge}
                </span>
              )}

              <h1 className="text-4xl font-black text-white md:text-5xl">{product.name}</h1>
              <p className="mt-1.5 text-lg text-white/50">{product.subtitle}</p>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "fill-white/15 text-white/15"}
                    />
                  ))}
                  <span className="text-sm font-bold text-yellow-400">{product.rating}</span>
                  <span className="text-sm text-white/35">({product.reviews_count.toLocaleString()} تقييم)</span>
                </div>
                {product.buyers && (
                  <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-white/50">
                    {product.buyers}+ عميل
                  </span>
                )}
              </div>

              <p className="mt-4 max-w-xl leading-8 text-white/65">{product.description}</p>

              {/* Price */}
              <div className="mt-6 flex items-end gap-3">
                <span className="text-5xl font-black" style={{ color: product.accent_color }}>${product.price}</span>
                {product.old_price > 0 && (
                  <div className="mb-1.5 flex flex-col">
                    <span className="text-lg text-white/30 line-through">${product.old_price}</span>
                    {product.discount && (
                      <span
                        className="mt-0.5 self-start rounded-lg px-2 py-0.5 text-xs font-black text-black"
                        style={{ background: product.accent_color }}
                      >
                        وفّر {product.discount}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex items-center gap-3 rounded-2xl px-8 py-4 text-base font-black text-black transition-all hover:scale-105 hover:brightness-110"
                  style={{ background: product.accent_color, boxShadow: `0 0 30px ${product.accent_color}55` }}
                >
                  <ShoppingCart size={20} /> إضافة للسلة
                </button>
                <a
                  href={`/checkout?product=${encodeURIComponent(product.name)}&price=${product.price}`}
                  className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-base font-bold text-white hover:bg-white/10 transition-colors"
                >
                  شراء الآن
                </a>
              </div>

              {/* Partners */}
              {product.partners.length > 0 && (
                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-white/35">
                  <span>بالشراكة مع:</span>
                  {product.partners.map((p) => (
                    <span key={p} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 font-bold text-white/60">{p}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ Body ══════════════════════════════════════════════════ */}
      <div className="mx-auto max-w-5xl px-4 pb-20">
        <div className="grid gap-6 md:grid-cols-[1fr_300px]">

          {/* ── Main column ── */}
          <div className="flex flex-col gap-6">
            {product.features.length > 0 && (
              <div className="rounded-3xl border border-white/8 bg-[#0d0b14] p-7">
                <h2 className="mb-5 text-xl font-black text-white">ماذا تحصل عليه؟</h2>
                <ul className="grid gap-3.5">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <BadgeCheck size={18} className="mt-0.5 shrink-0" style={{ color: product.accent_color }} />
                      <span className="leading-6 text-white/75">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.full_description && (
              <div className="rounded-3xl border border-white/8 bg-[#0d0b14] p-7">
                <h2 className="mb-4 text-xl font-black text-white">عن المنتج</h2>
                <p className="leading-8 text-white/65 whitespace-pre-line">{product.full_description}</p>
              </div>
            )}

            {product.usage_details && (
              <div className="rounded-3xl border border-white/8 bg-[#0d0b14] p-7">
                <h2 className="mb-4 text-xl font-black text-white">طريقة الاستخدام</h2>
                <p className="leading-8 text-white/65 whitespace-pre-line">{product.usage_details}</p>
              </div>
            )}

            {product.benefits && (
              <div
                className="rounded-3xl p-7"
                style={{
                  background: `linear-gradient(135deg, ${product.accent_color}10, ${product.accent_color}05)`,
                  border: `1px solid ${product.accent_color}25`,
                }}
              >
                <h2 className="mb-4 text-xl font-black text-white">لماذا تختاره؟</h2>
                <p className="leading-8 text-white/70 whitespace-pre-line">{product.benefits}</p>
              </div>
            )}

            {product.faq.length > 0 && (
              <div className="rounded-3xl border border-white/8 bg-[#0d0b14] p-7">
                <h2 className="mb-5 text-xl font-black text-white">أسئلة شائعة</h2>
                <div className="flex flex-col gap-2">
                  {product.faq.map((item, i) => (
                    <div key={i} className="overflow-hidden rounded-2xl border border-white/6 bg-white/3">
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="flex w-full items-center justify-between gap-4 p-4 text-right font-bold text-white hover:bg-white/3 transition-colors"
                      >
                        <span>{item.question}</span>
                        {openFaq === i
                          ? <ChevronUp size={16} className="shrink-0 text-white/40" />
                          : <ChevronDown size={16} className="shrink-0 text-white/40" />}
                      </button>
                      {openFaq === i && (
                        <div className="border-t border-white/6 px-4 pb-4 pt-3 text-sm leading-7 text-white/60">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="flex flex-col gap-5">
            {product.specs.length > 0 && (
              <div className="rounded-3xl border border-white/8 bg-[#0d0b14] p-6">
                <h2 className="mb-4 font-black text-white">المواصفات</h2>
                <div className="grid gap-2.5">
                  {product.specs.map((s) => (
                    <div key={s.label} className="flex items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2.5">
                      <span className="text-xs text-white/45">{s.label}</span>
                      <span className="text-xs font-black text-white">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.requirements && (
              <div className="rounded-3xl border border-white/8 bg-[#0d0b14] p-6">
                <h2 className="mb-3 font-black text-white">المتطلبات</h2>
                <p className="text-sm leading-7 text-white/55 whitespace-pre-line">{product.requirements}</p>
              </div>
            )}

            <div className="rounded-3xl border border-white/8 bg-[#0d0b14] p-6">
              <h2 className="mb-4 font-black text-white">ضماناتنا</h2>
              <div className="grid gap-3 text-xs text-white/60">
                {[
                  { icon: "⚡", text: "تسليم فوري خلال دقائق" },
                  { icon: "🔒", text: "دفع آمن 100%" },
                  { icon: "🔄", text: "ضمان الاسترجاع 30 يوماً" },
                  { icon: "💬", text: "دعم 24/7" },
                ].map((g) => (
                  <div key={g.text} className="flex items-center gap-2.5">
                    <span className="text-base">{g.icon}</span>
                    <span>{g.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sticky buy box */}
            <div
              className="sticky top-20 rounded-3xl p-5 text-center"
              style={{
                background: `linear-gradient(135deg, ${product.accent_color}18, ${product.accent_color}08)`,
                border: `1px solid ${product.accent_color}30`,
              }}
            >
              <p className="text-3xl font-black text-white">${product.price}</p>
              {product.old_price > 0 && (
                <p className="mt-0.5 text-sm text-white/35 line-through">${product.old_price}</p>
              )}
              <button
                onClick={handleAddToCart}
                className="mt-4 w-full rounded-2xl py-3.5 text-sm font-black text-black transition-all hover:brightness-110"
                style={{ background: product.accent_color }}
              >
                إضافة للسلة
              </button>
              <a
                href={`/checkout?product=${encodeURIComponent(product.name)}&price=${product.price}`}
                className="mt-2 block w-full rounded-2xl border border-white/15 py-3.5 text-sm font-bold text-white hover:bg-white/5 transition-colors"
              >
                شراء الآن
              </a>
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-8 rounded-3xl border border-white/8 bg-[#0d0b14] p-5">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/45">
            {[
              { icon: Zap, text: "تفعيل فوري" },
              { icon: BadgeCheck, text: "اشتراك أصلي 100%" },
              { icon: Star, text: `${product.rating}/5 تقييم العملاء` },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon size={15} style={{ color: product.accent_color }} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-black text-white">منتجات مشابهة</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((rel) => (
                <a
                  key={rel.id}
                  href={`/products/${rel.id}`}
                  className="group flex items-center gap-4 rounded-3xl border border-white/8 bg-[#0d0b14] p-4 transition-all hover:border-white/20"
                >
                  <div
                    className="grid size-14 shrink-0 place-items-center rounded-2xl text-2xl font-black transition-transform group-hover:scale-110"
                    style={{ background: `${rel.accent_color}22`, border: `1px solid ${rel.accent_color}33` }}
                  >
                    {rel.logo}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-white">{rel.name}</p>
                    <p className="mt-0.5 text-sm font-black" style={{ color: rel.accent_color }}>${rel.price}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
