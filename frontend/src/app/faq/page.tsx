"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown, HelpCircle, MessageCircle, ShoppingCart, Shield, Zap } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";

/* ── FAQ data ──────────────────────────────────────────────────────────── */
const FAQS = [
  {
    q: "ما هي Growfolo؟",
    a: "Growfolo منصة رقمية تقدم خدمات الذكاء الاصطناعي، والخدمات السحابية، والحلول البرمجية، والمنتجات الرقمية للمطورين والأفراد والشركات.",
    icon: Zap,
    color: "#a855f7",
  },
  {
    q: "كيف يمكنني شراء أي خدمة؟",
    a: "اختر الخدمة المناسبة، ثم اضغط «إضافة إلى السلة»، وبعدها أكمل عملية الدفع من خلال صفحة السلة.",
    icon: ShoppingCart,
    color: "#c8e600",
  },
  {
    q: "ما هي طرق الدفع المتوفرة؟",
    a: "ندعم عدة وسائل دفع، منها: USDT، BNB، فودافون كاش، إنستا باي، بريدي موب، فليكسي موبيليس.",
    icon: Shield,
    color: "#3b82f6",
  },
  {
    q: "هل يمكنني شراء أكثر من خدمة في نفس الوقت؟",
    a: "نعم، يمكنك إضافة عدة خدمات إلى السلة والدفع لها جميعاً في عملية واحدة.",
    icon: ShoppingCart,
    color: "#10b981",
  },
  {
    q: "كيف أعرف حالة طلبي؟",
    a: "بعد إتمام الطلب ستظهر المعاملة داخل قسم «معاملاتي»، ويمكنك متابعة حالتها مثل: قيد المراجعة، قيد المعالجة، بانتظار الدفع، مكتمل، ملغي.",
    icon: HelpCircle,
    color: "#f59e0b",
  },
  {
    q: "كم تستغرق عملية التفعيل؟",
    a: "تختلف حسب نوع الخدمة، لكن معظم الطلبات تتم معالجتها خلال وقت قصير بعد التحقق من الدفع.",
    icon: Zap,
    color: "#c8e600",
  },
  {
    q: "هل أحتاج إلى إنشاء حساب؟",
    a: "نعم، يجب إنشاء حساب حتى تتمكن من إدارة طلباتك، ومتابعة مشترياتك، والعودة إليها في أي وقت.",
    icon: Shield,
    color: "#a855f7",
  },
  {
    q: "هل بياناتي آمنة؟",
    a: "نعم، نستخدم معايير أمان حديثة لحماية بيانات المستخدمين، ولا تتم مشاركة معلوماتك مع أي طرف غير مصرح له.",
    icon: Shield,
    color: "#10b981",
  },
  {
    q: "هل يمكنني استرجاع المبلغ؟",
    a: "يمكنك مراجعة صفحة سياسة الاسترجاع لمعرفة الحالات التي يمكن فيها استرداد المبلغ وشروط ذلك.",
    icon: HelpCircle,
    color: "#ef4444",
  },
  {
    q: "هل أحصل على دعم فني بعد الشراء؟",
    a: "نعم، جميع العملاء يحصلون على دعم فني عبر الدردشة المباشرة داخل الموقع.",
    icon: MessageCircle,
    color: "#c8e600",
  },
  {
    q: "كيف أتواصل مع الدعم؟",
    a: "يمكنك استخدام زر الدردشة المباشرة الموجود داخل الموقع، وسيقوم فريق الدعم بالرد عليك في أقرب وقت.",
    icon: MessageCircle,
    color: "#a855f7",
  },
  {
    q: "هل يمكنني استخدام الخدمات على Windows وmacOS وLinux؟",
    a: "نعم، معظم خدماتنا تدعم أنظمة Windows وmacOS وLinux.",
    icon: Zap,
    color: "#3b82f6",
  },
  {
    q: "هل الخدمات مناسبة للمطورين؟",
    a: "نعم، نوفر خدمات مخصصة للمطورين، بما في ذلك حلول تعتمد على واجهات API، وخدمات سحابية، وأدوات ذكاء اصطناعي متقدمة.",
    icon: Zap,
    color: "#c8e600",
  },
  {
    q: "هل يمكنني تحديث أو تغيير طلبي بعد الدفع؟",
    a: "إذا لم يبدأ تنفيذ الطلب، يمكنك التواصل مع فريق الدعم لدراسة إمكانية التعديل.",
    icon: HelpCircle,
    color: "#f59e0b",
  },
  {
    q: "ماذا أفعل إذا واجهت مشكلة؟",
    a: "تواصل معنا عبر الدردشة المباشرة مع شرح المشكلة، وسيعمل فريق الدعم على مساعدتك بأسرع وقت ممكن.",
    icon: MessageCircle,
    color: "#10b981",
  },
];

/* ── Accordion card ─────────────────────────────────────────────────────── */
function FaqCard({
  item,
  index,
  open,
  onToggle,
}: {
  item: (typeof FAQS)[0];
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const Icon = item.icon;
  return (
    <div
      className="group overflow-hidden rounded-2xl transition-all duration-300"
      style={{
        background: open
          ? `linear-gradient(135deg, rgba(14,10,26,0.98), rgba(8,6,18,0.99))`
          : "rgba(255,255,255,0.03)",
        border: open
          ? `1px solid ${item.color}44`
          : "1px solid rgba(255,255,255,0.07)",
        boxShadow: open
          ? `0 0 30px ${item.color}18, 0 8px 30px rgba(0,0,0,0.4)`
          : "0 2px 12px rgba(0,0,0,0.2)",
      }}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-4 py-4 text-right"
        aria-expanded={open}
      >
        {/* Number + icon */}
        <div
          className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl transition-all duration-300"
          style={{
            background: open ? `${item.color}22` : "rgba(255,255,255,0.06)",
            border: `1px solid ${open ? item.color + "44" : "rgba(255,255,255,0.08)"}`,
          }}
        >
          <Icon size={15} style={{ color: open ? item.color : "rgba(255,255,255,0.4)" }} />
        </div>

        {/* Question */}
        <div className="flex-1 text-right">
          <span
            className="block text-sm font-bold leading-6 transition-colors duration-200"
            style={{ color: open ? "white" : "rgba(255,255,255,0.75)" }}
          >
            <span
              className="ml-1.5 text-xs font-black"
              style={{ color: open ? item.color : "rgba(255,255,255,0.25)" }}
            >
              {String(index + 1).padStart(2, "0")}.
            </span>
            {item.q}
          </span>
        </div>

        {/* Chevron */}
        <ChevronDown
          size={16}
          className="mt-1 shrink-0 transition-transform duration-300"
          style={{
            color: open ? item.color : "rgba(255,255,255,0.3)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Answer — CSS max-height transition */}
      <div
        className="overflow-hidden transition-all duration-400 ease-in-out"
        style={{ maxHeight: open ? "300px" : "0px", opacity: open ? 1 : 0 }}
      >
        <div
          className="mx-4 mb-4 rounded-xl px-4 py-3 text-sm leading-7"
          style={{
            background: `${item.color}0a`,
            border: `1px solid ${item.color}22`,
            color: "rgba(255,255,255,0.65)",
          }}
        >
          {item.a}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Page
════════════════════════════════════════════════════════════════════════ */
export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex((prev) => (prev === i ? null : i));

  /* Split into two columns */
  const leftCol  = FAQS.filter((_, i) => i % 2 === 0);
  const rightCol = FAQS.filter((_, i) => i % 2 !== 0);

  return (
    <main className="min-h-screen bg-[#050508] text-white" dir="rtl">
      <SiteHeader />

      {/* ── Ambient glows ─────────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute right-1/4 top-0 size-[500px] rounded-full bg-purple-600/10 blur-[130px]" />
        <div className="absolute left-1/4 top-40 size-[350px] rounded-full bg-lime-400/6 blur-[110px]" />
        <div className="absolute bottom-1/3 left-1/3 size-[400px] rounded-full bg-blue-500/7 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 pb-24 pt-12">
        {/* ── Back link ───────────────────────────────────────────── */}
        <a
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white"
        >
          <ArrowRight size={15} /> العودة للرئيسية
        </a>

        {/* ── Hero ────────────────────────────────────────────────── */}
        <div className="mb-14 text-center">
          {/* Logo */}
          <div
            className="mx-auto mb-6 grid size-20 place-items-center rounded-[22px]"
            style={{
              background: "linear-gradient(135deg, rgba(168,85,247,0.25), rgba(200,230,0,0.15))",
              border: "1px solid rgba(168,85,247,0.3)",
              boxShadow: "0 0 0 1px rgba(168,85,247,0.08), 0 0 50px rgba(168,85,247,0.2), 0 20px 50px rgba(0,0,0,0.5)",
              transform: "perspective(500px) rotateX(6deg)",
            }}
          >
            <HelpCircle size={36} className="text-purple-400 drop-shadow-[0_0_16px_rgba(168,85,247,0.7)]" />
          </div>

          <div className="pixel-logo mb-3 text-2xl font-black">
            <span className="text-purple-500">GROW</span>
            <span className="text-lime-400">FOLO</span>
          </div>

          <h1 className="text-4xl font-black text-white md:text-5xl">
            الأسئلة{" "}
            <span className="bg-gradient-to-l from-lime-400 to-purple-400 bg-clip-text text-transparent">
              الشائعة
            </span>
          </h1>
          <p className="mt-3 text-sm text-white/45">
            كل ما تحتاج معرفته عن Growfolo في مكان واحد
          </p>

          {/* Stats strip */}
          <div className="mx-auto mt-7 flex max-w-sm justify-center gap-6">
            {[
              { val: `${FAQS.length}`, label: "سؤال" },
              { val: "٢٤/٧", label: "دعم فني" },
              { val: "100%", label: "مجاناً" },
            ].map(({ val, label }) => (
              <div key={label} className="text-center">
                <p className="text-xl font-black text-white">{val}</p>
                <p className="text-xs text-white/40">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ grid — 2 columns on desktop, 1 on mobile ───────── */}
        <div className="grid gap-3 lg:grid-cols-2 lg:gap-4">
          {/* Right column (odd indices: 0,2,4,...) */}
          <div className="flex flex-col gap-3">
            {leftCol.map((item) => {
              const realIdx = FAQS.indexOf(item);
              return (
                <FaqCard
                  key={realIdx}
                  item={item}
                  index={realIdx}
                  open={openIndex === realIdx}
                  onToggle={() => toggle(realIdx)}
                />
              );
            })}
          </div>

          {/* Left column (even indices: 1,3,5,...) */}
          <div className="flex flex-col gap-3">
            {rightCol.map((item) => {
              const realIdx = FAQS.indexOf(item);
              return (
                <FaqCard
                  key={realIdx}
                  item={item}
                  index={realIdx}
                  open={openIndex === realIdx}
                  onToggle={() => toggle(realIdx)}
                />
              );
            })}
          </div>
        </div>

        {/* ── CTA ─────────────────────────────────────────────────── */}
        <div
          className="mt-14 overflow-hidden rounded-3xl p-8 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(168,85,247,0.1), rgba(200,230,0,0.06))",
            border: "1px solid rgba(168,85,247,0.2)",
            boxShadow: "0 0 60px rgba(168,85,247,0.1)",
          }}
        >
          <MessageCircle size={32} className="mx-auto mb-3 text-purple-400" />
          <h2 className="mb-2 text-xl font-black text-white">لم تجد إجابة سؤالك؟</h2>
          <p className="mb-5 text-sm text-white/50">
            فريق الدعم متاح لمساعدتك في أي وقت عبر الدردشة المباشرة داخل الموقع
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl px-7 py-3 text-sm font-black text-black transition-all hover:opacity-90 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #c8e600, #a3bd00)",
              boxShadow: "0 4px 20px rgba(200,230,0,0.35)",
            }}
          >
            <MessageCircle size={16} /> تواصل مع الدعم
          </a>
        </div>
      </div>
    </main>
  );
}
