"use client";

import { useParams } from "next/navigation";
import { ArrowRight, BadgeCheck, ShoppingCart, Star, Zap } from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { useCart } from "@/context/cart-context";
import { SiteHeader } from "@/components/layout/site-header";

export default function ProductPage() {
  const { id } = useParams() as { id: string };
  const product = PRODUCTS.find((p) => p.id === id);
  const { addItem, openSidebar } = useCart();

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

  const related = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);

  function handleAddToCart() {
    addItem({ id: product!.id, name: product!.name, price: product!.price, logo: product!.logo, color: product!.color });
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050508] text-white">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Bg gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${product.color} opacity-20`} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050508]/60 to-[#050508]" />
        <div
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 size-[700px] rounded-full blur-[140px]"
          style={{ background: `${product.accentColor}18` }}
        />

        <div className="relative mx-auto max-w-5xl px-4 py-16">
          {/* Breadcrumb */}
          <a href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-white/45 hover:text-white transition-colors">
            <ArrowRight size={15} /> الرئيسية / {product.category} / {product.name}
          </a>

          <div className="grid gap-10 md:grid-cols-[auto_1fr]">
            {/* Product visual */}
            <div
              className="relative mx-auto grid size-52 shrink-0 place-items-center rounded-3xl text-7xl font-black text-white"
              style={{
                background: `linear-gradient(135deg, ${product.accentColor}33, ${product.accentColor}11)`,
                border: `1px solid ${product.accentColor}44`,
                boxShadow: `0 0 80px ${product.accentColor}30, 0 30px 80px rgba(0,0,0,0.6)`,
              }}
            >
              {product.logo}
              {/* Glow ring */}
              <div
                className="pointer-events-none absolute -inset-4 rounded-[36px]"
                style={{ boxShadow: `0 0 0 1px ${product.accentColor}22` }}
              />
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center">
              {product.badge && (
                <span
                  className="mb-3 inline-block self-start rounded-xl px-3 py-1 text-xs font-black text-black"
                  style={{ background: product.accentColor }}
                >
                  {product.badge}
                </span>
              )}
              <h1 className="text-4xl font-black text-white md:text-5xl">{product.name}</h1>
              <p className="mt-1 text-lg text-white/55">{product.subtitle}</p>

              {/* Rating */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm font-bold text-yellow-400">{product.rating}</span>
                <span className="text-sm text-white/40">({product.reviews.toLocaleString()} تقييم)</span>
              </div>

              <p className="mt-4 max-w-xl leading-8 text-white/70">{product.description}</p>

              {/* Price */}
              <div className="mt-6 flex items-end gap-3">
                <span className="text-5xl font-black text-white">${product.price}</span>
                <div className="mb-1">
                  <span className="block text-lg text-white/35 line-through">${product.oldPrice}</span>
                  <span
                    className="rounded-lg px-2 py-0.5 text-xs font-black text-black"
                    style={{ background: product.accentColor }}
                  >
                    وفّر {product.discount}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex items-center gap-3 rounded-2xl px-8 py-4 text-base font-black text-black transition-all hover:scale-105"
                  style={{ background: product.accentColor, boxShadow: `0 0 30px ${product.accentColor}55` }}
                >
                  <ShoppingCart size={20} /> إضافة للسلة
                </button>
                <a
                  href="/checkout"
                  className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-base font-bold text-white hover:bg-white/10 transition-colors"
                >
                  شراء الآن
                </a>
              </div>

              {/* Partners */}
              {product.partners && (
                <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-white/40">
                  <span>بالشراكة مع:</span>
                  {product.partners.map((p) => (
                    <span key={p} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 font-bold text-white/70">
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="mx-auto max-w-5xl px-4 pb-16">
        <div className="grid gap-8 md:grid-cols-[1fr_300px]">

          {/* Features */}
          <div className="rounded-3xl border border-white/8 bg-[#0d0b14] p-8">
            <h2 className="mb-6 text-xl font-black text-white">ماذا تحصل عليه؟</h2>
            <ul className="grid gap-4">
              {product.features.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <BadgeCheck size={18} className="mt-0.5 shrink-0" style={{ color: product.accentColor }} />
                  <span className="leading-6 text-white/80">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Specs */}
          <div className="flex flex-col gap-4">
            <div className="rounded-3xl border border-white/8 bg-[#0d0b14] p-6">
              <h2 className="mb-5 font-black text-white">المواصفات</h2>
              <div className="grid gap-3">
                {product.specs.map((s) => (
                  <div key={s.label} className="flex items-center justify-between gap-2 rounded-2xl bg-white/4 px-3 py-2.5">
                    <span className="text-xs text-white/50">{s.label}</span>
                    <span className="text-xs font-black text-white">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Guarantees */}
            <div className="rounded-3xl border border-white/8 bg-[#0d0b14] p-6">
              <h2 className="mb-4 font-black text-white">ضماناتنا</h2>
              <div className="grid gap-3 text-xs text-white/65">
                {[
                  { icon: "⚡", text: "تسليم فوري خلال دقائق" },
                  { icon: "🔒", text: "دفع آمن 100%" },
                  { icon: "🔄", text: "ضمان الاسترجاع 30 يوماً" },
                  { icon: "💬", text: "دعم 24/7" },
                ].map((g) => (
                  <div key={g.text} className="flex items-center gap-2">
                    <span>{g.icon}</span>
                    <span>{g.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-8 rounded-3xl border border-white/8 bg-[#0d0b14] p-5">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/50">
            {[
              { icon: Zap, text: "تفعيل فوري" },
              { icon: BadgeCheck, text: "اشتراك أصلي 100%" },
              { icon: Star, text: `${product.rating}/5 تقييم العملاء` },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon size={15} style={{ color: product.accentColor }} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-black text-white">منتجات ذات صلة</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((rel) => (
                <a
                  key={rel.id}
                  href={`/products/${rel.id}`}
                  className="group flex items-center gap-4 rounded-3xl border border-white/8 bg-[#0d0b14] p-4 transition-all hover:border-white/20 hover:bg-white/5"
                >
                  <div
                    className="grid size-14 shrink-0 place-items-center rounded-2xl text-2xl font-black text-white"
                    style={{ background: `${rel.accentColor}22`, border: `1px solid ${rel.accentColor}33` }}
                  >
                    {rel.logo}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-white">{rel.name}</p>
                    <p className="mt-0.5 text-sm font-black" style={{ color: rel.accentColor }}>${rel.price}</p>
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
