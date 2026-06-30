"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, KeyRound, Eye, EyeOff, ShieldCheck } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type Step = "email" | "otp" | "done";

export function ForgotPasswordForm() {
  const router  = useRouter();
  const [step,     setStep]     = useState<Step>("email");
  const [email,    setEmail]    = useState("");
  const [otp,      setOtp]      = useState("");
  const [newPass,  setNewPass]  = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  /* Step 1 — send OTP */
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const d = await res.json() as { detail?: string };
        setError(d.detail ?? "حدث خطأ"); return;
      }
      setStep("otp");
    } catch { setError("تعذر الاتصال بالخادم"); }
    finally { setLoading(false); }
  };

  /* Step 2 — reset password */
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 9) { setError("كلمة المرور يجب أن تكون 9 أحرف على الأقل"); return; }
    if (newPass !== confirm) { setError("كلمتا المرور غير متطابقتين"); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, new_password: newPass }),
      });
      const d = await res.json() as { detail?: string };
      if (!res.ok) { setError(d.detail ?? "حدث خطأ"); return; }
      setStep("done");
      setTimeout(() => router.push("/login"), 2500);
    } catch { setError("تعذر الاتصال بالخادم"); }
    finally { setLoading(false); }
  };

  return (
    <div className="w-full max-w-md">
      <a href="/" className="mb-8 block text-center">
        <span className="pixel-logo text-3xl font-black">
          <span className="text-purple-500">GROW</span>
          <span className="text-lime-400">FOLO</span>
        </span>
      </a>

      <div className="glass-panel rounded-3xl p-7">
        {/* Done state */}
        {step === "done" ? (
          <div className="py-6 text-center space-y-4">
            <div className="grid size-16 place-items-center rounded-2xl bg-lime-500/15 border border-lime-500/30 mx-auto">
              <ShieldCheck size={28} className="text-lime-400" />
            </div>
            <h1 className="text-xl font-black text-white">تم تغيير كلمة المرور!</h1>
            <p className="text-sm text-white/50">جارٍ توجيهك لتسجيل الدخول…</p>
          </div>
        ) : step === "email" ? (
          <>
            <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-purple-500/15 border border-purple-500/30">
              <KeyRound size={22} className="text-purple-400" />
            </div>
            <h1 className="text-xl font-black text-white">نسيت كلمة المرور؟</h1>
            <p className="mt-1.5 text-sm text-white/50">أدخل بريدك وسنرسل لك رمزاً للإعادة</p>

            <form onSubmit={e => void handleSendOtp(e)} className="mt-6 space-y-4">
              <label className="grid gap-1.5 text-xs font-semibold text-white/60">
                البريد الإلكتروني
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 focus-within:border-purple-500/50">
                  <Mail size={15} className="shrink-0 text-purple-400" />
                  <input
                    type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                  />
                </div>
              </label>
              {error && <p className="text-xs text-red-400 rounded-2xl bg-red-500/10 border border-red-500/20 px-3 py-2">{error}</p>}
              <button type="submit" disabled={loading}
                className="neon-button w-full rounded-2xl py-3 font-black text-black disabled:opacity-60">
                {loading ? "جارٍ الإرسال…" : "إرسال رمز التحقق"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-xl font-black text-white">إعادة تعيين كلمة المرور</h1>
            <p className="mt-1.5 text-sm text-white/50">
              أرسلنا الرمز إلى <strong className="text-white/70">{email}</strong>
            </p>

            <form onSubmit={e => void handleReset(e)} className="mt-6 space-y-4">
              <label className="grid gap-1.5 text-xs font-semibold text-white/60">
                رمز التحقق (6 أرقام)
                <input type="text" inputMode="numeric" maxLength={6} required value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="• • • • • •"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-xl font-black text-purple-400 tracking-widest outline-none focus:border-purple-500/50 transition-colors"
                  style={{ direction: "ltr" }}
                />
              </label>
              <label className="grid gap-1.5 text-xs font-semibold text-white/60">
                كلمة المرور الجديدة
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 focus-within:border-purple-500/50">
                  <input type={showPass ? "text" : "password"} required value={newPass}
                    onChange={e => setNewPass(e.target.value)} placeholder="9 أحرف على الأقل"
                    className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)} className="text-white/35">
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </label>
              <label className="grid gap-1.5 text-xs font-semibold text-white/60">
                تأكيد كلمة المرور
                <input type="password" required value={confirm}
                  onChange={e => setConfirm(e.target.value)} placeholder="أعد كتابة كلمة المرور"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-purple-500/50 transition-colors"
                />
              </label>
              {error && <p className="text-xs text-red-400 rounded-2xl bg-red-500/10 border border-red-500/20 px-3 py-2">{error}</p>}
              <button type="submit" disabled={loading}
                className="neon-button w-full rounded-2xl py-3 font-black text-black disabled:opacity-60">
                {loading ? "جارٍ الحفظ…" : "تغيير كلمة المرور"}
              </button>
            </form>
          </>
        )}

        <p className="mt-5 text-center text-sm text-white/40">
          <a href="/login" className="text-purple-400 hover:text-purple-300">← العودة لتسجيل الدخول</a>
        </p>
      </div>
    </div>
  );
}
