"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function PasswordRule({ met, text }: { met: boolean; text: string }) {
  return (
    <li className={`flex items-center gap-1.5 text-xs ${met ? "text-lime-400" : "text-white/40"}`}>
      {met ? <Check size={11} /> : <X size={11} />}
      {text}
    </li>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordRules = [
    { met: form.password.length >= 9, text: "9 أحرف على الأقل" },
    { met: /[A-Z]/.test(form.password), text: "حرف كبير واحد على الأقل" },
    { met: /[0-9]/.test(form.password), text: "رقم واحد على الأقل" },
  ];
  const passwordStrong = passwordRules.every((r) => r.met);
  const passwordsMatch = form.password === form.confirm && form.confirm !== "";

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!passwordStrong) {
      setError("كلمة المرور لا تستوفي الشروط المطلوبة");
      return;
    }
    if (!passwordsMatch) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    if (!emailValid) {
      setError("البريد الإلكتروني غير صحيح");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name,
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.detail ?? "حدث خطأ في التسجيل");
        return;
      }

      localStorage.setItem("gf_token", data.access_token);
      router.push("/");
    } catch {
      setError("تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً");
    } finally {
      setLoading(false);
    }
  };

  const field = (
    name: keyof typeof form,
    label: string,
    placeholder: string,
    type = "text"
  ) => (
    <label className="grid gap-1.5 text-sm font-semibold text-white/75">
      {label}
      <input
        type={type}
        required
        value={form[name]}
        onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))}
        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-purple-500/60 focus:bg-white/8 transition-colors"
        placeholder={placeholder}
      />
    </label>
  );

  return (
    <div className="w-full max-w-md">
      {/* Brand */}
      <Link href="/" className="mb-8 block text-center">
        <span className="pixel-logo text-3xl font-black">
          <span className="text-purple-500">GROW</span>
          <span className="text-lime-400">FOLO</span>
        </span>
      </Link>

      <div className="glass-panel rounded-3xl p-7">
        <h1 className="text-2xl font-black text-white">إنشاء حساب جديد</h1>
        <p className="mt-1.5 text-sm text-white/50">انضم إلى مجتمع Growfolo وابدأ التسوق</p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          {field("full_name", "الاسم الكامل", "مثال: أحمد محمد علي")}
          {field("username", "اسم المستخدم", "مثال: ahmed99")}
          {field("email", "البريد الإلكتروني", "example@email.com", "email")}

          {/* Password */}
          <label className="grid gap-1.5 text-sm font-semibold text-white/75">
            كلمة المرور
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pl-12 text-sm text-white outline-none placeholder:text-white/30 focus:border-purple-500/60 focus:bg-white/8 transition-colors"
                placeholder="9 أحرف على الأقل"
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
              >
                {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {form.password && (
              <ul className="mt-1 grid gap-1 px-1">
                {passwordRules.map((r) => (
                  <PasswordRule key={r.text} met={r.met} text={r.text} />
                ))}
              </ul>
            )}
          </label>

          {/* Confirm Password */}
          <label className="grid gap-1.5 text-sm font-semibold text-white/75">
            تأكيد كلمة المرور
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                required
                value={form.confirm}
                onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
                className={`w-full rounded-2xl border px-4 py-3 pl-12 text-sm text-white outline-none focus:bg-white/8 transition-colors bg-white/5 ${
                  form.confirm
                    ? passwordsMatch
                      ? "border-lime-500/60"
                      : "border-red-500/60"
                    : "border-white/10"
                }`}
                placeholder="أعد كتابة كلمة المرور"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
              >
                {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
              {form.confirm && (
                <span className={`absolute left-10 top-1/2 -translate-y-1/2 ${passwordsMatch ? "text-lime-400" : "text-red-400"}`}>
                  {passwordsMatch ? <Check size={15} /> : <X size={15} />}
                </span>
              )}
            </div>
          </label>

          {error && (
            <div className="rounded-2xl bg-red-500/12 border border-red-500/25 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="neon-button mt-2 w-full rounded-2xl py-3.5 font-black text-black disabled:opacity-60"
          >
            {loading ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب →"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-white/45">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="font-bold text-purple-400 hover:text-purple-300">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}
