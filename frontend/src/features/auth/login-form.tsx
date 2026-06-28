"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, LogIn } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("يرجى تعبئة جميع الحقول");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { detail?: string };
        setError(data.detail ?? "بيانات الدخول غير صحيحة");
        return;
      }

      const data = await res.json() as { access_token: string };
      localStorage.setItem("gf_token", data.access_token);

      /* Check if admin */
      try {
        const payload = JSON.parse(atob(data.access_token.split(".")[1])) as { is_admin?: boolean };
        router.push(payload.is_admin ? "/admin" : "/");
      } catch {
        router.push("/");
      }
    } catch {
      setError("تعذر الاتصال بالخادم، تأكد من تشغيل البكند");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="pixel-logo text-4xl font-black">
          <span className="text-purple-500">GROW</span>
          <span className="text-lime-400">FOLO</span>
        </div>
        <p className="mt-2 text-sm text-white/50">سجّل دخولك للمتابعة</p>
      </div>

      {/* Card */}
      <form
        onSubmit={handleSubmit}
        className="glass-panel rounded-3xl px-8 py-8"
      >
        <h1 className="mb-6 text-xl font-black text-white">تسجيل الدخول</h1>

        {/* Email */}
        <label className="mb-4 grid gap-1.5 text-xs font-semibold text-white/65">
          البريد الإلكتروني
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 transition-colors focus-within:border-purple-500/50">
            <Mail size={15} className="shrink-0 text-purple-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
            />
          </div>
        </label>

        {/* Password */}
        <label className="mb-6 grid gap-1.5 text-xs font-semibold text-white/65">
          كلمة المرور
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 transition-colors focus-within:border-purple-500/50">
            <Lock size={15} className="shrink-0 text-purple-400" />
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              autoComplete="current-password"
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
            />
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              className="text-white/35 hover:text-white/70"
              tabIndex={-1}
            >
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </label>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="neon-button flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-black text-black disabled:opacity-60"
        >
          {loading ? (
            <span className="animate-spin text-lg">⟳</span>
          ) : (
            <>
              <LogIn size={18} />
              دخول
            </>
          )}
        </button>

        {/* Register link */}
        <p className="mt-5 text-center text-sm text-white/45">
          ليس لديك حساب؟{" "}
          <a href="/register" className="font-bold text-purple-400 hover:text-purple-300">
            إنشاء حساب
          </a>
        </p>

        <a
          href="/"
          className="neon-button mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-black text-black"
        >
          ← العودة للرئيسية
        </a>
      </form>
    </div>
  );
}
