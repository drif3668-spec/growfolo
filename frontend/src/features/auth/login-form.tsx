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

// Google icon SVG component (official Google colors)
function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
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

  // Read error param from URL (e.g. ?error=no_email after failed OAuth)
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get("error");
    if (urlError && !error) {
      const errorMessages: Record<string, string> = {
        github_oauth_failed: "فشل تسجيل الدخول عبر GitHub، حاول مجدداً",
        google_oauth_failed: "فشل تسجيل الدخول عبر Google، حاول مجدداً",
        access_denied: "تم رفض الإذن",
        no_email: "لم يتم العثور على بريد إلكتروني مرتبط بالحساب",
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
    window.location.href = `${API_URL}/api/v1/auth/github/login`;
  }

  function handleGoogleLogin() {
    window.location.href = `${API_URL}/api/v1/auth/google/login`;
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="pixel-logo text-4xl font-black">
          <span className="text-[var(--gf-brand)]">GROW</span>
          <span className="text-[var(--gf-brand)]">FOLO</span>
        </div>
        <p className="mt-2 text-sm text-[var(--gf-text-muted)]">سجّل دخولك للمتابعة</p>
      </div>

      {/* Card */}
      <form
        onSubmit={handleSubmit}
        className="glass-panel rounded-3xl px-8 py-8"
      >
        <h1 className="mb-6 text-xl font-black text-[var(--gf-text)]">تسجيل الدخول</h1>

        {/* Email */}
        <label className="mb-4 grid gap-1.5 text-xs font-semibold text-[var(--gf-text)]/65">
          البريد الإلكتروني
          <div className="flex items-center gap-2 rounded-2xl border border-[var(--gf-line)] bg-[var(--gf-surface-2)] px-3 py-3 transition-colors focus-within:border-purple-500/50">
            <Mail size={15} className="shrink-0 text-[var(--gf-brand)]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="flex-1 bg-transparent text-sm text-[var(--gf-text)] outline-none placeholder:text-[var(--gf-text)]/30"
            />
          </div>
        </label>

        {/* Password */}
        <label className="mb-6 grid gap-1.5 text-xs font-semibold text-[var(--gf-text)]/65">
          كلمة المرور
          <div className="flex items-center gap-2 rounded-2xl border border-[var(--gf-line)] bg-[var(--gf-surface-2)] px-3 py-3 transition-colors focus-within:border-purple-500/50">
            <Lock size={15} className="shrink-0 text-[var(--gf-brand)]" />
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              autoComplete="current-password"
              className="flex-1 bg-transparent text-sm text-[var(--gf-text)] outline-none placeholder:text-[var(--gf-text)]/30"
            />
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              className="text-[var(--gf-text)]/35 hover:text-[var(--gf-text-muted)]"
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
          <div className="h-px flex-1 bg-[var(--gf-surface-2)]" />
          <span className="text-xs text-[var(--gf-text)]/30">أو</span>
          <div className="h-px flex-1 bg-[var(--gf-surface-2)]" />
        </div>

        {/* OAuth Buttons — GitHub & Google side by side */}
        <div className="flex gap-3">
          {/* GitHub OAuth Button */}
          <button
            type="button"
            onClick={handleGitHubLogin}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[var(--gf-line)] bg-[var(--gf-surface-2)] py-3.5 text-sm font-bold text-[var(--gf-text)] transition-colors hover:border-white/25 hover:bg-[var(--gf-surface-2)]"
          >
            <GitHubIcon size={18} />
            GitHub
          </button>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[var(--gf-line)] bg-[var(--gf-surface-2)] py-3.5 text-sm font-bold text-[var(--gf-text)] transition-colors hover:border-white/25 hover:bg-[var(--gf-surface-2)]"
          >
            <GoogleIcon size={18} />
            Google
          </button>
        </div>

        {/* Forgot password + register link */}
        <div className="mt-5 flex flex-col items-center gap-2 text-center text-sm text-[var(--gf-text)]/45">
          <a href="/forgot-password" className="font-semibold text-[var(--gf-text-muted)] hover:text-[var(--gf-brand)] transition-colors">
            نسيت كلمة المرور؟
          </a>
          <span>
            ليس لديك حساب؟{" "}
            <a href="/register" className="font-bold text-[var(--gf-brand)] hover:text-[var(--gf-brand)]">
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
