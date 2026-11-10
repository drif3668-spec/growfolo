"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Menu,
  Search,
  ShoppingCart,
  UserRound,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import { SidebarMenu } from "@/components/layout/sidebar-menu";
import { useCart } from "@/context/cart-context";
import { useCurrency } from "@/context/currency-context";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

interface AuthUser {
  name: string | null;
  is_admin: boolean;
  picture: string | null;
}

export function SiteHeader() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currencyDropOpen, setCurrencyDropOpen] = useState(false);
  const currencyDropRef = useRef<HTMLDivElement>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

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

  useEffect(() => {
    const token = localStorage.getItem("gf_token");
    if (!token) return;
    void fetch(`${API_URL}/api/v1/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (
          u: {
            full_name?: string | null;
            username?: string | null;
            is_admin?: boolean;
            profile_picture?: string | null;
          } | null
        ) => {
          if (u)
            setAuthUser({
              name: u.full_name ?? u.username ?? null,
              is_admin: u.is_admin ?? false,
              picture: u.profile_picture ?? null,
            });
        }
      )
      .catch(() => {});
  }, []);

  return (
    <>
      <SidebarMenu open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <header className="sticky top-0 z-40 border-b border-[var(--gf-line)] bg-[var(--gf-surface-2)]0 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="grid size-10 place-items-center rounded-full text-[var(--gf-text)] transition hover:bg-[var(--gf-surface-2)]"
              aria-label="فتح القائمة"
            >
              <Menu size={20} />
            </button>
            <Link
              href="/products"
              className="grid size-10 place-items-center rounded-full text-[var(--gf-text)] transition hover:bg-[var(--gf-surface-2)]"
              aria-label="البحث في المتجر"
            >
              <Search size={19} />
            </Link>
          </div>

          <Link href="/" className="flex items-center gap-2" aria-label="Growfolo — الصفحة الرئيسية">
            <span className="grid size-9 place-items-center rounded-xl bg-[var(--gf-brand)] text-sm font-black text-white">
              G
            </span>
            <span className="text-lg font-black tracking-tight text-[var(--gf-text)]">
              Growfolo
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <div className="relative" ref={currencyDropRef}>
              <button
                onClick={() => setCurrencyDropOpen((v) => !v)}
                className="hidden items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-bold text-[var(--gf-text-muted)] transition hover:bg-[var(--gf-surface-2)] hover:text-[var(--gf-text)] sm:flex"
                aria-label="العملة"
                aria-expanded={currencyDropOpen}
              >
                <span>{selected.flag}</span>
                <span>{selected.code}</span>
                <ChevronDown
                  size={13}
                  className={`transition-transform ${currencyDropOpen ? "rotate-180" : ""}`}
                />
              </button>
              {currencyDropOpen && (
                <div className="absolute end-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-[var(--gf-radius)] border border-[var(--gf-line)] bg-[var(--gf-surface)] shadow-[var(--gf-shadow)]">
                  <div className="max-h-64 overflow-y-auto py-1">
                    {currencies.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => {
                          setSelected(c);
                          setCurrencyDropOpen(false);
                        }}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-[var(--gf-surface-2)] ${
                          selected.code === c.code
                            ? "font-bold text-[var(--gf-brand)]"
                            : "text-[var(--gf-text)]"
                        }`}
                      >
                        <span>{c.flag}</span>
                        <span className="font-mono font-bold">{c.code}</span>
                        <span className="text-xs text-[var(--gf-text-muted)]">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={openSidebar}
              className="relative grid size-10 place-items-center rounded-full text-[var(--gf-text)] transition hover:bg-[var(--gf-surface-2)]"
              aria-label={`السلة (${count})`}
            >
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute -end-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-[var(--gf-brand)] px-1 text-[10px] font-black text-white">
                  {count}
                </span>
              )}
            </button>

            {authUser ? (
              <Link
                href={authUser.is_admin ? "/admin" : "/dashboard"}
                className="flex items-center gap-2 rounded-full border border-[var(--gf-line)] py-1 pe-3 ps-1 transition hover:border-[var(--gf-brand)]"
                aria-label="حسابي"
              >
                {authUser.picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={authUser.picture}
                    alt=""
                    className="size-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid size-8 place-items-center rounded-full bg-[var(--gf-brand-soft)] text-xs font-black text-[var(--gf-brand)]">
                    {(authUser.name ?? "U").slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="hidden max-w-[90px] truncate text-xs font-bold text-[var(--gf-text)] sm:inline">
                  {authUser.name ?? "حسابي"}
                </span>
                <LayoutDashboard size={13} className="hidden text-[var(--gf-text-muted)] sm:block" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-full px-2 py-1.5 text-xs font-bold text-[var(--gf-text)] transition hover:bg-[var(--gf-surface-2)]"
              >
                <UserRound size={19} />
                <span className="hidden sm:inline">دخول</span>
              </Link>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}
