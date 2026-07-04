"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, LogIn } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// GitHub icon SVG component (no external dependency)
function GitHubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Read error param from URL (e.g. ?error=no_email after failed GitHub OAuth)
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get("error");
    if (urlError && !error) {
      const errorMessages: Record<string, string> = {
        github_oauth_failed: "فشل تسجيل الدخول عبر GitHub، حاول مجدداً",
        access_denied: "تم رفض الإذن من GitHub",
        no_email: "لم يتم العثور على بريد إلكتروني مرتبط بحساب GitHub",
      };
      setError(errorMessages[urlError] ?? "حدث خطأ أثناء تسجيل الدخول");
    }
  }

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

      const data = await res.json() as {
        access_token?: string;
        require_verification?: boolean;
        email?: string;
      };

      // Unverified account — redirect to OTP page
      if (data.require_verification) {
        router.push(`/verify-email?email=${encodeURIComponent(data.email ?? email.trim())}`);
        return;
      }

      // Clear any previous user's session data before saving new token
      const sessionKeys = [
        "gf_cart", "gf_my_email", "gf_pay_method",
        "gf_checkout_data", "gf_order_v2",
        "gf_instapay_order_code", "gf_baridimob_order_code",
      ];
      sessionKeys.forEach(k => { try { localStorage.removeItem(k); } catch {} });

      localStorage.setItem("gf_token", data.access_token!);

      /* Check if admin and redirect accordingly */
      try {
        const jwtPayload = JSON.parse(atob(data.access_token!.split(".")[1])) as { is_admin?: boolean };
        router.push(jwtPayload.is_admin ? "/admin" : "/dashboard");
      } catch {
        router.push("/dashboard");
      }
    } catch {
      setError("تعذر الاتصال بالخادم، تأكد من تشغيل البكند");
    } finally {
      setLoading(false);
    }
  }

  function handleGitHubLogin() {
    // Redirect to backend GitHub OAuth initiation endpoint
    window.location.href = `${API_URL}/api/v1/auth/github/login`;
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

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-white/30">أو</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* GitHub OAuth Button */}
        <button
          type="button"
          onClick={handleGitHubLogin}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3.5 text-sm font-bold text-white transition-colors hover:border-white/25 hover:bg-white/10"
        >
          <GitHubIcon size={18} />
          تسجيل الدخول عبر GitHub
        </button>

        {/* Forgot password + register link */}
        <div className="mt-5 flex flex-col items-center gap-2 text-center text-sm text-white/45">
          <a href="/forgot-password" className="font-semibold text-white/50 hover:text-purple-400 transition-colors">
            نسيت كلمة المرور؟
          </a>
          <span>
            ليس لديك حساب؟{" "}
            <a href="/register" className="font-bold text-purple-400 hover:text-purple-300">
              إنشاء حساب
            </a>
          </span>
        </div>

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
