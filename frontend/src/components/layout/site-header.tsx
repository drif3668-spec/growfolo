import Link from "next/link";
import { Menu, Search, ShoppingCart, Sparkle, UserRound } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-[#050508]/88 px-4 pb-3 pt-1 backdrop-blur-xl">
      <div className="mx-auto mb-2 flex max-w-7xl justify-center">
        <div className="glass-panel flex min-h-9 w-full max-w-xl items-center justify-center gap-3 rounded-full px-4 text-xs text-white md:text-sm">
          <Sparkle size={16} className="text-purple-400" />
          <span>خصم خاص عند الشراء استخدم الكود: <strong className="text-white">KN13</strong></span>
        </div>
      </div>

      <div className="glass-panel mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-3xl px-5 py-4">
        <div className="flex items-center gap-3 md:gap-5">
          <button className="grid size-11 place-items-center rounded-2xl border border-white/10 text-white" aria-label="القائمة">
            <Menu size={22} />
          </button>
          <button className="hidden items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white sm:flex">
            الأقسام
          </button>
          <button className="grid size-11 place-items-center rounded-2xl text-white" aria-label="البحث">
            <Search size={22} />
          </button>
        </div>

        <Link href="/" className="flex items-center gap-3" aria-label="GROWFOLO">
          <span className="grid size-12 place-items-center rounded-xl border border-purple-400/40 bg-purple-500/20 shadow-[0_0_28px_rgba(168,85,247,0.55)]">
            <span className="size-7 rounded-md bg-gradient-to-br from-purple-500 to-lime-400" />
          </span>
          <span className="pixel-logo hidden text-3xl font-black md:inline">
            <span className="text-purple-500">GROW</span><span className="text-lime-400">FOLO</span>
          </span>
        </Link>

        <nav className="flex items-center gap-3 md:gap-5">
          <Link href="/checkout" className="relative flex items-center gap-2 text-sm font-semibold text-white">
            <span className="relative">
              <ShoppingCart size={25} />
              <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-lime-400 text-xs text-black">0</span>
            </span>
            <span className="hidden leading-5 sm:block">السلة<br /><b>0 دج</b></span>
          </Link>
          <Link href="/login" className="flex items-center gap-2 text-sm font-semibold text-white">
            <UserRound size={24} />
            <span className="hidden sm:inline">تسجيل الدخول</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
