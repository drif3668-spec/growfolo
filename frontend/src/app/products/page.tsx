"use client";

import { useEffect, useState } from "react";
import { Star, ArrowLeft, ChevronRight } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

interface Product {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  logo: string;
  description: string;
  price: number;
  old_price: number;
  discount: string;
  buyers: string;
  accent_color: string;
  logo_color: string;
  category: string;
  badge: string | null;
  rating: number;
  reviews_count: number;
  is_published: boolean;
}

const CATEGORIES = [
  {
    id: "AI",
    label: "الذكاء الاصطناعي",
    icon: "🤖",
    active: true,
    color: "#a855f7",
    description: "أدوات AI للإنتاجية والبرمجة والإبداع",
  },
  {
    id: "Entertainment",
    label: "منتجات الترفيه",
    icon: "🎬",
    active: false,
    color: "#ef4444",
    description: "نتفليكس، سبوتيفاي، ديزني+ والمزيد",
  },
  {
    id: "Content",
    label: "صناعة المحتوى",
    icon: "🎨",
    active: false,
    color: "#f59e0b",
    description: "أدوبي، كانفا، كابكت وأدوات الإبداع",
  },
  {
    id: "Gaming",
    label: "شحن الألعاب",
    icon: "🎮",
    active: false,
    color: "#10b981",
    description: "PUBG، فري فاير، بلايستيشن وأكثر",
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("AI");

  useEffect(() => {
    fetch(`${API}/api/v1/products`)
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => p.category === activeCategory);
  const catInfo = CATEGORIES.find((c) => c.id === activeCategory)!;

  return (
    <main className="min-h-screen bg-[#050508] text-white" dir="rtl">
      <SiteHeader />

      {/* Header */}
      <section className="relative overflow-hidden py-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 size-[600px] rounded-full bg-purple-600/10 blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4">
          <a href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors">
            <ArrowLeft size={15} />
            الرئيسية
          </a>
          <h1 className="text-4xl font-black text-white md:text-5xl">
            تصفح <span className="text-purple-400">المنتجات</span>
          </h1>
          <p className="mt-3 text-lg text-white/50">اشتراكات احترافية بأسعار لا تصدق</p>
        </div>
      </section>

      {/* Category tabs */}
      <div className="sticky top-0 z-10 border-b border-white/8 bg-[#050508]/95 backdrop-blur-lg">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => cat.active && setActiveCategory(cat.id)}
                className={`relative flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                  activeCategory === cat.id
                    ? "bg-white/10 text-white"
                    : cat.active
                    ? "text-white/50 hover:bg-white/5 hover:text-white/80"
                    : "cursor-not-allowed text-white/25"
                }`}
              >
                <span className="text-lg">{cat.icon}</span>
                <span>{cat.label}</span>
                {!cat.active && (
                  <span className="rounded-md bg-white/8 px-1.5 py-0.5 text-[10px] font-black text-white/30">
                    قريباً
                  </span>
                )}
                {activeCategory === cat.id && (
                  <span
                    className="absolute bottom-0 left-1/2 h-0.5 w-3/4 -translate-x-1/2 rounded-full"
                    style={{ background: catInfo.color }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-10">
        {catInfo.active ? (
          loading ? (
            /* Skeleton */
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-3xl bg-white/5" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-5xl">📦</p>
              <p className="mt-4 text-lg text-white/40">لا توجد منتجات متاحة حالياً</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )
        ) : (
          /* Coming soon for inactive categories */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="mb-6 grid size-24 place-items-center rounded-3xl text-5xl"
              style={{
                background: `${catInfo.color}15`,
                border: `1px solid ${catInfo.color}30`,
              }}
            >
              {catInfo.icon}
            </div>
            <h2 className="text-3xl font-black text-white">{catInfo.label}</h2>
            <p className="mt-3 max-w-xs text-white/45">{catInfo.description}</p>
            <span className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-black text-white/40">
              قريباً — يتم التحضير لها الآن
            </span>
          </div>
        )}
      </div>
    </main>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <a
      href={`/products/${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/8 bg-[#0d0b14] p-5 transition-all hover:border-white/20 hover:shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
    >
      {/* Accent glow on hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity group-hover:opacity-100"
        style={{ boxShadow: `inset 0 0 60px ${product.accent_color}10` }}
      />

      {product.badge && (
        <span
          className="mb-4 self-start rounded-xl px-3 py-1 text-[11px] font-black text-black"
          style={{ background: product.accent_color }}
        >
          {product.badge}
        </span>
      )}

      {/* Logo */}
      <div
        className="mb-4 grid size-16 shrink-0 place-items-center rounded-2xl text-4xl font-black transition-transform group-hover:scale-105"
        style={{
          background: `linear-gradient(135deg, ${product.accent_color}30, ${product.accent_color}10)`,
          border: `1px solid ${product.accent_color}40`,
          boxShadow: `0 0 30px ${product.accent_color}20`,
        }}
      >
        {product.logo}
      </div>

      {/* Info */}
      <div className="flex-1">
        <h3 className="font-black text-white">{product.name}</h3>
        <p className="mt-0.5 text-sm text-white/45">{product.subtitle}</p>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-1.5">
          <Star size={12} className="fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-bold text-yellow-400">{product.rating}</span>
          {product.reviews_count > 0 && (
            <span className="text-xs text-white/30">({product.reviews_count.toLocaleString()})</span>
          )}
          {product.buyers && (
            <span className="mr-auto text-xs text-white/30">{product.buyers}+ عميل</span>
          )}
        </div>
      </div>

      {/* Price row */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white">${product.price}</span>
          {product.old_price > 0 && (
            <span className="text-sm text-white/30 line-through">${product.old_price}</span>
          )}
        </div>
        {product.discount && (
          <span
            className="rounded-lg px-2 py-0.5 text-xs font-black text-black"
            style={{ background: product.accent_color }}
          >
            {product.discount}
          </span>
        )}
      </div>

      {/* CTA arrow */}
      <div className="mt-3 flex items-center gap-1 text-xs font-bold opacity-0 transition-opacity group-hover:opacity-100" style={{ color: product.accent_color }}>
        عرض التفاصيل <ChevronRight size={13} />
      </div>
    </a>
  );
}
