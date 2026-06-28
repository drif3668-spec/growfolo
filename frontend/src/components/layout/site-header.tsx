"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, Search, ShoppingCart, Sparkle, UserRound, ChevronDown } from "lucide-react";
import { SidebarMenu } from "@/components/layout/sidebar-menu";
import { CartSidebar } from "@/components/cart/cart-sidebar";
import { useCart } from "@/context/cart-context";
import { useCurrency } from "@/context/currency-context";

export function SiteHeader() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currencyDropOpen, setCurrencyDropOpen] = useState(false);
  const currencyDropRef = useRef<HTMLDivElement>(null);

  const { count, openSidebar } = useCart();
  const { currencies, selected, setSelected } = useCurrency();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (currencyDropRef.current && !currencyDropRef.current.contains(e.target as Node)) {
        setCurrencyDropOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      <CartSidebar />
      <SidebarMenu open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <header className="sticky top-0 z-40 bg-[#050508]/88 px-4 pb-3 pt-1 backdrop-blur-xl">
        <div className="mx-auto mb-2 flex max-w-7xl justify-center">
          <div className="glass-panel flex min-h-9 w-full max-w-xl items-center justify-center gap-3 rounded-full px-4 text-xs text-white md:text-sm">
            <Sparkle size={16} className="text-purple-400" />
            <span>
              خصم خاص عند الشراء استخدم الكود: <strong className="text-white">KN13</strong>
            </span>
          </div>
        </div>

        <div className="glass-panel mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-3xl px-5 py-4">
          <div className="flex items-center gap-3 md:gap-5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="grid size-11 place-items-center rounded-2xl border border-white/10 text-white hover:bg-white/5 transition-colors"
              aria-label="القائمة"
            >
              <Menu size={22} />
            </button>
            <button className="hidden items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white sm:flex hover:bg-white/5 transition-colors">
              الأقسام
            </button>
            <button className="grid size-11 place-items-center rounded-2xl text-white hover:bg-white/5 transition-colors" aria-label="البحث">
              <Search size={22} />
            </button>
          </div>

          <Link href="/" className="flex items-center gap-3" aria-label="GROWFOLO">
            <span className="grid size-12 place-items-center rounded-xl border border-purple-400/40 bg-purple-500/20 shadow-[0_0_28px_rgba(168,85,247,0.55)]">
              <span className="size-7 rounded-md bg-gradient-to-br from-purple-500 to-lime-400" />
            </span>
            <span className="pixel-logo hidden text-3xl font-black md:inline">
              <span className="text-purple-500">GROW</span>
              <span className="text-lime-400">FOLO</span>
            </span>
          </Link>

          <nav className="flex items-center gap-3 md:gap-5">
            {/* Currency button */}
            <div className="relative" ref={currencyDropRef}>
              <button
                onClick={() => setCurrencyDropOpen(v => !v)}
                className="hidden items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors sm:flex"
                aria-label="العملة"
              >
                <span>{selected.flag}</span>
                <span>{selected.code}</span>
                <ChevronDown size={14} className={`transition-transform ${currencyDropOpen ? "rotate-180" : ""}`} />
              </button>
              {currencyDropOpen && (
                <div className="absolute left-0 top-full mt-2 z-50 w-56 rounded-2xl border border-white/10 bg-[#12101a] shadow-2xl overflow-hidden">
                  <div className="max-h-64 overflow-y-auto py-1">
                    {currencies.map(c => (
                      <button
                        key={c.code}
                        onClick={() => { setSelected(c); setCurrencyDropOpen(false); }}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-white/8 ${selected.code === c.code ? "text-purple-400" : "text-white/80"}`}
                      >
                        <span>{c.flag}</span>
                        <span className="font-mono font-bold">{c.code}</span>
                        <span className="text-white/50 text-xs">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cart button */}
            <button
              onClick={openSidebar}
              className="relative flex items-center gap-2 text-sm font-semibold text-white"
              aria-label="السلة"
            >
              <span className="relative">
                <ShoppingCart size={25} />
                <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-lime-400 text-xs text-black font-bold">
                  {count}
                </span>
              </span>
            </button>

            <Link
              href="/login"
              className="flex items-center gap-2 text-sm font-semibold text-white hover:text-purple-300 transition-colors"
            >
              <UserRound size={24} />
              <span className="hidden sm:inline">تسجيل الدخول</span>
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
