"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck, ShieldAlert, LogOut, User, Mail,
  AtSign, Package, MessageCircle, Star,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type UserInfo = {
  id: string;
  email: string;
  username: string | null;
  full_name: string | null;
  is_admin: boolean;
  is_verified: boolean;
  is_active: boolean;
};

export function CustomerDashboard() {
  const router = useRouter();
  const [user,    setUser]    = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    const token = localStorage.getItem("gf_token");
    if (!token) { router.replace("/login"); return; }

    fetch(`${API_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401) { localStorage.removeItem("gf_token"); router.replace("/login"); return; }
        if (!res.ok) throw new Error("fetch failed");
        setUser(await res.json() as UserInfo);
      })
      .catch(() => setError("تعذر تحميل بيانات الحساب"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("gf_token");
    router.push("/");
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="text-center space-y-3">
          <div className="size-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-white/40 text-sm">جارٍ تحميل حسابك…</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !user) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <div className="glass-panel rounded-3xl p-8 text-center max-w-sm w-full">
          <p className="text-red-400 text-sm mb-4">{error || "حدث خطأ"}</p>
          <button
            onClick={() => router.push("/login")}
            className="neon-button rounded-2xl px-6 py-2.5 font-bold text-black text-sm"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  const displayName = user.full_name || user.username || user.email;
  const initials = displayName.substring(0, 2).toUpperCase();

  /* ── Dashboard ── */
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <a href="/" className="pixel-logo text-2xl font-black">
            <span className="text-purple-500">GROW</span>
            <span className="text-lime-400">FOLO</span>
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/4 px-4 py-2 text-sm text-white/60 hover:text-white hover:border-white/20 transition-all"
          >
            <LogOut size={15} />
            تسجيل الخروج
          </button>
        </div>

        {/* Welcome banner */}
        <div
          className="relative overflow-hidden rounded-3xl p-7"
          style={{
            background: "linear-gradient(135deg,rgba(124,58,237,.35),rgba(59,130,246,.18))",
            border: "1px solid rgba(168,85,247,.25)",
          }}
        >
          <div className="flex items-center gap-5">
            <div
              className="grid size-16 shrink-0 place-items-center rounded-2xl text-2xl font-black text-black"
              style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}
            >
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-black text-white">
                أهلاً، {user.full_name || user.username}!
              </h1>
              <p className="mt-0.5 text-sm text-white/50">مرحباً بك في لوحة حسابك</p>
            </div>
          </div>
          {/* decorative glow */}
          <div
            className="pointer-events-none absolute -bottom-8 -right-8 size-40 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle,#a855f7,transparent)" }}
          />
        </div>

        {/* Account info card */}
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <h2 className="font-black text-white text-lg">معلومات الحساب</h2>

          {[
            { icon: User,   label: "الاسم الكامل", value: user.full_name   || "—" },
            { icon: AtSign, label: "اسم المستخدم", value: user.username    || "—" },
            { icon: Mail,   label: "البريد الإلكتروني", value: user.email  },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl border border-white/6 bg-white/3 px-4 py-3"
            >
              <Icon size={16} className="shrink-0 text-purple-400" />
              <div className="flex flex-1 items-center justify-between gap-4">
                <span className="text-xs text-white/40">{label}</span>
                <span className="text-sm font-semibold text-white text-right truncate max-w-[60%]">{value}</span>
              </div>
            </div>
          ))}

          {/* Verification status */}
          <div className="flex items-center gap-3 rounded-2xl border px-4 py-3"
            style={{
              borderColor: user.is_verified ? "rgba(132,204,22,.25)" : "rgba(245,158,11,.25)",
              background:  user.is_verified ? "rgba(132,204,22,.05)" : "rgba(245,158,11,.05)",
            }}
          >
            {user.is_verified
              ? <ShieldCheck size={16} className="shrink-0 text-lime-400" />
              : <ShieldAlert size={16} className="shrink-0 text-yellow-400" />
            }
            <div className="flex flex-1 items-center justify-between">
              <span className="text-xs text-white/40">حالة البريد</span>
              {user.is_verified
                ? <span className="text-xs font-bold text-lime-400">✓ موثّق</span>
                : (
                  <button
                    onClick={() => router.push(`/verify-email?email=${encodeURIComponent(user.email)}`)}
                    className="text-xs font-bold text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    توثيق البريد ←
                  </button>
                )
              }
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { icon: Package,       label: "المنتجات",      href: "/products",     color: "#a855f7" },
            { icon: MessageCircle, label: "الدعم الفني",   href: "#chat",         color: "#c8e600" },
            { icon: Star,          label: "المفضلة",       href: "/wishlist",     color: "#f59e0b" },
          ].map(({ icon: Icon, label, href, color }) => (
            <a
              key={label}
              href={href}
              className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/3 px-4 py-4 transition-all hover:bg-white/6 hover:border-white/15"
            >
              <Icon size={18} style={{ color }} />
              <span className="text-sm font-semibold text-white/80">{label}</span>
            </a>
          ))}
        </div>

        {/* Logout button (prominent) */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/6 py-3.5 text-sm font-bold text-red-400 transition-all hover:bg-red-500/12 hover:border-red-500/35"
        >
          <LogOut size={15} />
          تسجيل الخروج من الحساب
        </button>
      </div>
    </div>
  );
}
