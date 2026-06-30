"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, RotateCcw } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export function VerifyEmailForm() {
  const router      = useRouter();
  const params      = useSearchParams();
  const email       = params.get("email") ?? "";

  const [digits,     setDigits]     = useState(["", "", "", "", "", ""]);
  const [loading,    setLoading]    = useState(false);
  const [resending,  setResending]  = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");
  const [countdown,  setCountdown]  = useState(60);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  /* countdown timer for resend */
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  /* auto-submit when all 6 digits filled */
  const otp = digits.join("");
  const prevOtpRef = useRef("");
  useEffect(() => {
    if (otp.length === 6 && otp !== prevOtpRef.current) {
      prevOtpRef.current = otp;
      void handleVerify(otp);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const handleVerify = useCallback(async (code: string) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json() as { access_token?: string; detail?: string };
      if (!res.ok) {
        setError(data.detail ?? "رمز غير صحيح");
        setDigits(["", "", "", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
        return;
      }
      localStorage.setItem("gf_token", data.access_token!);
      setSuccess("✓ تم التحقق! جارٍ التوجيه…");
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }, [email, router]);

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      await fetch(`${API_URL}/api/v1/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setCountdown(60);
      setSuccess("تم إرسال رمز جديد إلى بريدك");
      setTimeout(() => setSuccess(""), 4000);
    } catch {
      setError("تعذر إعادة الإرسال");
    } finally {
      setResending(false);
    }
  };

  const handleDigitChange = (idx: number, val: string) => {
    const char = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = char;
    setDigits(next);
    if (char && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = [...digits];
    text.split("").forEach((c, i) => { if (i < 6) next[i] = c; });
    setDigits(next);
    inputRefs.current[Math.min(text.length, 5)]?.focus();
  };

  return (
    <div className="w-full max-w-md">
      {/* Brand */}
      <a href="/" className="mb-8 block text-center">
        <span className="pixel-logo text-3xl font-black">
          <span className="text-purple-500">GROW</span>
          <span className="text-lime-400">FOLO</span>
        </span>
      </a>

      <div className="glass-panel rounded-3xl p-7">
        {/* Icon */}
        <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-purple-500/15 border border-purple-500/30">
          <ShieldCheck size={26} className="text-purple-400" />
        </div>

        <h1 className="text-2xl font-black text-white">تحقق من بريدك</h1>
        <p className="mt-2 text-sm text-white/50 leading-relaxed">
          أرسلنا رمز التحقق إلى<br />
          <strong className="text-white/80">{email}</strong>
        </p>

        {/* OTP inputs */}
        <div
          className="mt-7 flex justify-center gap-3 ltr"
          dir="ltr"
          onPaste={handlePaste}
        >
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={loading || !!success}
              className="h-14 w-12 rounded-2xl border border-white/12 bg-white/5 text-center text-xl font-black text-white outline-none transition-all focus:border-purple-500/70 focus:bg-purple-500/8 disabled:opacity-50"
              style={{
                borderColor: d ? "rgba(168,85,247,.55)" : undefined,
                boxShadow: d ? "0 0 0 1px rgba(168,85,247,.2)" : undefined,
              }}
            />
          ))}
        </div>

        {/* Error / Success */}
        {error && (
          <div className="mt-4 rounded-2xl bg-red-500/10 border border-red-500/25 px-4 py-3 text-sm text-red-400 text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 rounded-2xl bg-lime-500/10 border border-lime-500/25 px-4 py-3 text-sm text-lime-400 text-center font-bold">
            {success}
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <p className="mt-4 text-center text-sm text-purple-400 animate-pulse">
            جارٍ التحقق…
          </p>
        )}

        {/* Resend */}
        <div className="mt-6 text-center">
          {countdown > 0 ? (
            <p className="text-sm text-white/35">
              يمكن إعادة الإرسال بعد <span className="text-white/60 font-bold tabular-nums">{countdown}s</span>
            </p>
          ) : (
            <button
              onClick={() => void handleResend()}
              disabled={resending}
              className="flex items-center gap-2 mx-auto text-sm text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
            >
              <RotateCcw size={14} />
              {resending ? "جارٍ الإرسال…" : "إعادة إرسال الرمز"}
            </button>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-white/30">
          الرمز صالح لمدة 15 دقيقة فقط
        </p>
      </div>
    </div>
  );
}
