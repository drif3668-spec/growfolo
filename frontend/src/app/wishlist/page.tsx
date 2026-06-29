"use client";

import { useState } from "react";
import { ArrowRight, Heart, ShoppingCart, Star, Trash2, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { useFavorites } from "@/context/favorites-context";
import { useCart } from "@/context/cart-context";
import { useNotifications } from "@/context/notifications-context";

/* ── Particle burst on remove ────────────────────────────────────────── */
function HeartBurst({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-3xl">
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className="absolute left-1/2 top-1/2 size-2 rounded-full"
          style={{
            background: i % 2 === 0 ? "#a855f7" : "#c8e600",
            animation: `burst-${i} .5s ease-out forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes burst-0 { to { transform: translate(-30px,-30px) scale(0); opacity:0 } }
        @keyframes burst-1 { to { transform: translate(0px,-40px) scale(0); opacity:0 } }
        @keyframes burst-2 { to { transform: translate(30px,-30px) scale(0); opacity:0 } }
        @keyframes burst-3 { to { transform: translate(40px,0px) scale(0); opacity:0 } }
        @keyframes burst-4 { to { transform: translate(30px,30px) scale(0); opacity:0 } }
        @keyframes burst-5 { to { transform: translate(0px,40px) scale(0); opacity:0 } }
        @keyframes burst-6 { to { transform: translate(-30px,30px) scale(0); opacity:0 } }
        @keyframes burst-7 { to { transform: translate(-40px,0px) scale(0); opacity:0 } }
      `}</style>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Page
════════════════════════════════════════════════════════════════════════ */
export default function WishlistPage() {
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { addItem } = useCart();
  const { addNotification } = useNotifications();
  const [bursting, setBursting] = useState<string | null>(null);

  function handleRemove(id: string) {
    const item = favorites.find(f => f.id === id);
    if (!item) return;
    setBursting(id);
    setTimeout(() => setBursting(null), 500);
    toggleFavorite(item);
    addNotification({ title: "تمت الإزالة من المفضلة", description: `تم إزالة "${item.name}" من قائمة المفضلة`, type: "info" });
  }

  function handleAddToCart(item: typeof favorites[0]) {
    addItem({ id: item.id, name: item.name, price: item.price, logo: item.logo, color: item.color });
    addNotification({ title: "تمت الإضافة إلى السلة", description: `تم إضافة "${item.name}" إلى سلة المشتريات`, type: "cart" });
  }

  return (
    <main className="min-h-screen bg-[#050508] text-white" dir="rtl">
      <SiteHeader />

      {/* Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute right-1/4 top-10 size-[450px] rounded-full bg-yellow-400/6 blur-[130px]" />
        <div className="absolute left-1/4 top-32 size-[350px] rounded-full bg-purple-600/10 blur-[110px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 pb-24 pt-12">
        {/* Back */}
        <a href="/" className="mb-10 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white">
          <ArrowRight size={15} /> العودة للرئيسية
        </a>

        {/* Hero */}
        <div className="mb-12 text-center">
          <div
            className="mx-auto mb-5 grid size-20 place-items-center rounded-[22px]"
            style={{
              background: "linear-gradient(135deg, rgba(250,204,21,0.2), rgba(168,85,247,0.15))",
              border: "1px solid rgba(250,204,21,0.3)",
              boxShadow: "0 0 50px rgba(250,204,21,0.18), 0 20px 50px rgba(0,0,0,0.5)",
              transform: "perspective(500px) rotateX(6deg)",
            }}
          >
            <Heart size={36} fill="#facc15" className="text-yellow-400 drop-shadow-[0_0_16px_rgba(250,204,21,0.7)]" />
          </div>
          <h1 className="text-4xl font-black md:text-5xl">
            قائمة{" "}
            <span className="bg-gradient-to-l from-yellow-400 to-purple-400 bg-clip-text text-transparent">
              المفضلة
            </span>
          </h1>
          <p className="mt-2 text-sm text-white/45">
            {favorites.length > 0 ? `${favorites.length} منتج محفوظ` : "لا توجد منتجات في المفضلة بعد"}
          </p>
        </div>

        {/* Empty state */}
        {favorites.length === 0 && (
          <div className="flex flex-col items-center gap-5 py-20 text-center">
            <div className="grid size-24 place-items-center rounded-3xl border border-white/8 bg-white/3">
              <Sparkles size={36} className="text-white/20" />
            </div>
            <p className="text-lg font-bold text-white/50">قائمتك فارغة</p>
            <p className="text-sm text-white/30">اضغط على ⭐ في أي منتج لإضافته هنا</p>
            <a
              href="/#products"
              className="mt-2 inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-black text-black transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #c8e600, #a3bd00)", boxShadow: "0 4px 18px rgba(200,230,0,0.35)" }}
            >
              تصفح المنتجات
            </a>
          </div>
        )}

        {/* Grid */}
        {favorites.length > 0 && (
          <>
            {/* Clear all */}
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => favorites.forEach(f => toggleFavorite(f))}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-2 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/15"
              >
                <Trash2 size={13} /> مسح الكل
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((item) => (
                <div
                  key={item.id}
                  className="glass-panel relative overflow-hidden rounded-3xl p-4 transition-all duration-300 hover:-translate-y-0.5"
                  style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.35)" }}
                >
                  <HeartBurst active={bursting === item.id} />

                  {/* Discount badge */}
                  <span className="absolute right-3 top-3 rounded-full bg-purple-600 px-2.5 py-1 text-xs font-bold text-white">
                    {item.discount}
                  </span>

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="absolute left-3 top-3 grid size-8 place-items-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 transition-all hover:bg-red-500/25"
                  >
                    <Trash2 size={13} />
                  </button>

                  {/* Logo */}
                  <div className={`mx-auto mt-6 grid size-20 place-items-center rounded-3xl bg-gradient-to-br ${item.color} text-3xl font-black shadow-[0_0_24px_rgba(168,85,247,0.4)]`}>
                    {item.logo}
                  </div>

                  {/* Name */}
                  <h3 className="mt-4 text-center text-sm font-bold text-white">{item.name}</h3>

                  {/* Rating */}
                  <div className="mt-2 flex items-center justify-center gap-1 text-xs text-yellow-400">
                    <Star size={12} fill="currentColor" /> {item.rating}
                  </div>

                  {/* Price */}
                  <p className="mt-3 text-center text-2xl font-black text-white">${item.price}</p>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-black text-black transition-all hover:opacity-90"
                      style={{ background: "linear-gradient(135deg, #c8e600, #a3bd00)" }}
                    >
                      <ShoppingCart size={15} /> أضف للسلة
                    </button>
                    <a
                      href={`/products/${item.id}`}
                      className="grid size-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/12"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
