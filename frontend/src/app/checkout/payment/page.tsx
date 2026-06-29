"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Copy, Check, Upload, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { PaymentMethodImage } from "@/components/payments/payment-method-image";

type Method = {
  id: string;
  label: string;
  logo: string;
  color: string;
  bg: string;
  description: string;
};

const METHODS: Method[] = [
  {
    id: "instapay",
    label: "InstaPay",
    logo: "/payment-methods/instapay.png",
    color: "text-blue-400",
    bg: "from-blue-900/30 to-blue-800/10 border-blue-500/20",
    description: "تحويل فوري عبر InstaPay",
  },
  {
    id: "baridimob",
    label: "BaridiMob",
    logo: "/payment-methods/baridimob.png",
    color: "text-yellow-400",
    bg: "from-yellow-900/30 to-yellow-800/10 border-yellow-500/20",
    description: "تحويل عبر تطبيق BaridiMob",
  },
  {
    id: "flexy",
    label: "Flexy Mobilis",
    logo: "/payment-methods/mobilis.png",
    color: "text-green-400",
    bg: "from-green-900/30 to-green-800/10 border-green-500/20",
    description: "دفع عبر Flexy Mobilis",
  },
  {
    id: "usdt",
    label: "USDT (TRC20)",
    logo: "/payment-methods/usdt.png",
    color: "text-emerald-400",
    bg: "from-emerald-900/30 to-emerald-800/10 border-emerald-500/20",
    description: "تحويل USDT عبر شبكة TRON",
  },
  {
    id: "bnb",
    label: "BNB (BEP20)",
    logo: "/payment-methods/bnb.png",
    color: "text-yellow-300",
    bg: "from-yellow-900/30 to-yellow-800/10 border-yellow-400/20",
    description: "تحويل BNB عبر Binance Smart Chain",
  },
];

const PAYMENT_DETAILS: Record<string, { fields: { label: string; value: string }[]; steps: string[] }> = {
  vodafone: {
    fields: [{ label: "رقم Vodafone Cash", value: "01XXXXXXXXX" }],
    steps: ["افتح تطبيق Vodafone Cash", "اختر تحويل أموال", "أدخل الرقم أعلاه والمبلغ", "أرسل لقطة الشاشة"],
  },
  instapay: {
    fields: [{ label: "معرف InstaPay", value: "growfolo@instapay" }],
    steps: ["افتح تطبيق InstaPay", "ابحث عن المعرف أعلاه", "أدخل المبلغ وأتم التحويل", "أرسل صورة الإيصال"],
  },
  baridimob: {
    fields: [
      { label: "رقم CCP", value: "00123456789 — مفتاح: 12" },
      { label: "الاسم", value: "Growfolo Store" },
    ],
    steps: ["افتح تطبيق BaridiMob", "اختر تحويل CCP", "أدخل رقم الحساب والمفتاح", "أرسل صورة التأكيد"],
  },
  flexy: {
    fields: [{ label: "رقم الهاتف", value: "07XXXXXXXX (Mobilis)" }],
    steps: ["اشترِ رصيد Flexy من أي نقطة بيع", "أرسل الرصيد على الرقم أعلاه", "أرسل صورة إثبات الإرسال"],
  },
  usdt: {
    fields: [
      { label: "الشبكة", value: "TRC20 (TRON)" },
      { label: "عنوان المحفظة", value: "TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" },
    ],
    steps: ["افتح محفظتك (Trust Wallet, Binance…)", "أرسل USDT على الشبكة TRC20 فقط", "أرسل hash المعاملة"],
  },
  bnb: {
    fields: [
      { label: "الشبكة", value: "BEP20 (BSC)" },
      { label: "عنوان المحفظة", value: "0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" },
    ],
    steps: ["افتح محفظتك (Trust Wallet, MetaMask…)", "أرسل BNB على شبكة BSC فقط", "أرسل hash المعاملة"],
  },
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      className={`grid size-7 shrink-0 place-items-center rounded-lg transition-colors ${
        copied ? "bg-lime-500/20 text-lime-400" : "bg-white/8 text-white/50 hover:bg-white/15 hover:text-white"
      }`}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

export default function PaymentPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [proof, setProof] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleConfirm = async () => {
    if (!proof) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setDone(true);
    setSubmitting(false);
  };

  if (done) {
    return (
      <main className="min-h-screen bg-[#050508]">
        <SiteHeader />
        <div className="mx-auto flex max-w-lg flex-col items-center justify-center py-24 text-center">
          <div className="mb-5 grid size-20 place-items-center rounded-3xl bg-lime-400/15 text-lime-400">
            <Check size={40} />
          </div>
          <h1 className="text-3xl font-black text-white">تم استلام طلبك!</h1>
          <p className="mt-3 text-white/55">
            سيتم مراجعة إثبات الدفع وتفعيل طلبك خلال دقائق.
          </p>
          <Link href="/" className="neon-button mt-8 inline-block rounded-2xl px-10 py-3.5 font-black text-black">
            العودة للرئيسية
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050508]">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => router.back()} className="grid size-9 place-items-center rounded-2xl bg-white/6 text-white hover:bg-white/12">
            <ArrowRight size={18} />
          </button>
          <h1 className="text-2xl font-black text-white">اختر طريقة الدفع</h1>
        </div>

        {/* Methods Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {METHODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelected(selected === m.id ? null : m.id)}
              className={`flex flex-col items-start gap-2 rounded-2xl border bg-gradient-to-br p-5 text-right transition-all ${m.bg} ${
                selected === m.id ? "ring-2 ring-purple-500 scale-[1.02]" : "hover:scale-[1.01]"
              }`}
            >
              <span className="grid h-14 w-full place-items-center">
                <PaymentMethodImage method={{ label: m.label, image: m.logo }} />
              </span>
              <span className={`text-base font-black ${m.color}`}>{m.label}</span>
              <span className="text-xs text-white/50">{m.description}</span>
            </button>
          ))}
        </div>

        {/* Payment Details */}
        {selected && (
          <div className="glass-panel mt-6 rounded-3xl p-6">
            <h2 className="mb-4 text-lg font-black text-white">
              تفاصيل الدفع — {METHODS.find((m) => m.id === selected)?.label}
            </h2>

            {/* Fields */}
            <div className="mb-5 grid gap-3">
              {PAYMENT_DETAILS[selected].fields.map((f) => (
                <div key={f.label} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                  <p className="mb-1 text-xs text-white/45">{f.label}</p>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-sm font-bold text-white break-all">{f.value}</code>
                    <CopyButton value={f.value} />
                  </div>
                </div>
              ))}
            </div>

            {/* Steps */}
            <div className="mb-5">
              <p className="mb-2 text-xs font-bold text-white/55">خطوات الدفع</p>
              <ol className="grid gap-1.5">
                {PAYMENT_DETAILS[selected].steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-purple-600/30 text-xs font-bold text-purple-400">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* Proof Upload */}
            <label className="block cursor-pointer">
              <p className="mb-2 text-sm font-bold text-white/75">رفع إثبات الدفع</p>
              <div className={`flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed transition-colors ${
                proof ? "border-lime-500/50 bg-lime-500/6" : "border-white/15 bg-white/3 hover:bg-white/6"
              }`}>
                {proof ? (
                  <>
                    <Check size={24} className="text-lime-400" />
                    <p className="text-sm text-lime-400 font-semibold">{proof.name}</p>
                    <p className="text-xs text-white/35">اضغط لتغيير الملف</p>
                  </>
                ) : (
                  <>
                    <Upload size={24} className="text-white/30" />
                    <p className="text-sm text-white/55">اسحب الصورة هنا أو اضغط للرفع</p>
                    <p className="text-xs text-white/30">JPG، PNG، PDF</p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="sr-only"
                  onChange={(e) => setProof(e.target.files?.[0] ?? null)}
                />
              </div>
            </label>

            <button
              onClick={handleConfirm}
              disabled={!proof || submitting}
              className="neon-button mt-5 w-full rounded-2xl py-4 font-black text-black disabled:opacity-50"
            >
              {submitting ? "جارٍ التأكيد..." : "تأكيد الدفع →"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
