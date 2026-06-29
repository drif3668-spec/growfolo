import { SiteHeader } from "@/components/layout/site-header";
import { ArrowRight, BadgeCheck, Clock, Mail, MessageCircle, ShieldCheck, XCircle } from "lucide-react";

export const metadata = {
  title: "سياسة الاستبدال والاسترجاع — Growfolo",
  description: "تعرف على سياسة الاسترجاع والاستبدال الخاصة بـ Growfolo وشروط استرداد المبالغ.",
};

const LAST_UPDATED = new Date().toLocaleDateString("ar-DZ", {
  year: "numeric", month: "long", day: "numeric",
});

const REFUND_CASES = [
  "إذا تعذّر علينا تسليم الخدمة خلال المدة المحددة.",
  "إذا تعذّر تفعيل الخدمة بسبب خطأ من طرفنا.",
  "إذا كانت الخدمة المرسلة مختلفة تمامًا عن الخدمة التي تم شراؤها.",
  "إذا تم خصم المبلغ مرتين عن طريق الخطأ.",
];

const NO_REFUND_CASES = [
  "بعد استلام الخدمة أو تفعيلها بنجاح.",
  "إذا قام العميل باستخدام الخدمة أو أي جزء منها.",
  "إذا تم إدخال معلومات خاطئة من قبل العميل.",
  "إذا خالف العميل شروط الاستخدام.",
  "إذا تم إيقاف الحساب بسبب إساءة الاستخدام أو مخالفة السياسات.",
];

const REJECT_CASES = [
  "استخدام غير قانوني للخدمة.",
  "محاولة احتيال.",
  "إساءة استخدام النظام.",
  "تقديم معلومات غير صحيحة.",
];

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-[#050508] text-white" dir="rtl">
      <SiteHeader />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pb-12 pt-16">
        {/* Glow blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 size-[500px] -translate-x-1/2 rounded-full bg-purple-600/10 blur-[120px]" />
          <div className="absolute right-1/4 top-20 size-[400px] rounded-full bg-lime-400/6 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-3xl px-4">
          <a href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white">
            <ArrowRight size={15} /> العودة للرئيسية
          </a>

          {/* Badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime-400/25 bg-lime-400/8 px-4 py-1.5 text-xs font-bold text-lime-400">
            <ShieldCheck size={13} /> وثيقة رسمية
          </div>

          <h1 className="text-4xl font-black leading-tight text-white md:text-5xl">
            سياسة الاسترجاع
            <span className="mt-1 block bg-gradient-to-l from-lime-400 to-purple-400 bg-clip-text text-transparent">
              والاستبدال
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-8 text-white/60">
            نحرص في Growfolo على رضا جميع عملائنا. يرجى قراءة هذه السياسة بعناية قبل إتمام أي عملية شراء.
          </p>

          <div className="mt-5 flex items-center gap-2 text-xs text-white/35">
            <Clock size={13} />
            آخر تحديث: {LAST_UPDATED}
          </div>
        </div>
      </section>

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="mx-auto max-w-3xl space-y-6 px-4 pb-20">

        {/* 1 — Digital services */}
        <PolicySection
          number="1"
          title="الخدمات الرقمية"
          color="purple"
        >
          <p className="leading-8 text-white/65">
            جميع الخدمات والمنتجات التي نقدمها هي خدمات رقمية يتم تفعيلها أو تسليمها إلكترونيًا، لذلك تختلف سياسة الاسترجاع عن المنتجات المادية.
          </p>
        </PolicySection>

        {/* 2 — Refund allowed */}
        <PolicySection number="2" title="حالات يحق فيها طلب استرداد كامل للمبلغ" color="lime">
          <ul className="grid gap-3">
            {REFUND_CASES.map((c) => (
              <li key={c} className="flex items-start gap-3">
                <BadgeCheck size={17} className="mt-0.5 shrink-0 text-lime-400" />
                <span className="leading-7 text-white/70">{c}</span>
              </li>
            ))}
          </ul>
        </PolicySection>

        {/* 3 — No refund */}
        <PolicySection number="3" title="حالات لا يمكن فيها استرداد المبلغ" color="red">
          <ul className="grid gap-3">
            {NO_REFUND_CASES.map((c) => (
              <li key={c} className="flex items-start gap-3">
                <XCircle size={17} className="mt-0.5 shrink-0 text-red-400" />
                <span className="leading-7 text-white/70">{c}</span>
              </li>
            ))}
          </ul>
        </PolicySection>

        {/* 4 — Warranty */}
        <PolicySection number="4" title="ضمان الخدمة" color="purple">
          <p className="leading-8 text-white/65">
            تختلف مدة الضمان حسب نوع الخدمة، ويتم توضيحها داخل صفحة كل منتج قبل الشراء.
          </p>
          <p className="mt-3 leading-8 text-white/65">في حال وجود مشكلة خلال فترة الضمان، سنقوم بـ:</p>
          <ul className="mt-3 grid gap-2.5">
            {["إصلاح المشكلة.", "أو إعادة تفعيل الخدمة.", "أو استبدالها بخدمة مماثلة عند الحاجة."].map((c) => (
              <li key={c} className="flex items-start gap-3">
                <BadgeCheck size={17} className="mt-0.5 shrink-0 text-purple-400" />
                <span className="leading-7 text-white/70">{c}</span>
              </li>
            ))}
          </ul>
        </PolicySection>

        {/* 5 — Processing time */}
        <PolicySection number="5" title="مدة معالجة طلب الاسترجاع" color="lime">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard icon="⏱" label="مدة المراجعة" value="24 — 72 ساعة عمل" accent="#a3e635" />
            <InfoCard icon="💳" label="طريقة الاسترداد" value="نفس وسيلة الدفع أو بالاتفاق" accent="#a855f7" />
          </div>
        </PolicySection>

        {/* 6 — How to request */}
        <PolicySection number="6" title="كيفية طلب الاسترجاع" color="purple">
          <p className="mb-4 text-sm text-white/55">للتقدم بطلب استرجاع، أرسل لنا المعلومات التالية:</p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {[
              { icon: "🔢", text: "رقم الطلب" },
              { icon: "👤", text: "الاسم الكامل" },
              { icon: "📧", text: "البريد الإلكتروني" },
              { icon: "📝", text: "سبب طلب الاسترجاع" },
              { icon: "📎", text: "صور أو مستندات داعمة (إن وجدت)", full: true },
            ].map((item) => (
              <div
                key={item.text}
                className={`flex items-center gap-3 rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-white/70 ${item.full ? "sm:col-span-2" : ""}`}
              >
                <span className="text-xl">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </PolicySection>

        {/* 7 — Rejection */}
        <PolicySection number="7" title="رفض طلب الاسترجاع" color="red">
          <p className="mb-4 text-sm text-white/55">تحتفظ Growfolo بحق رفض أي طلب استرجاع في الحالات التالية:</p>
          <ul className="grid gap-3">
            {REJECT_CASES.map((c) => (
              <li key={c} className="flex items-start gap-3">
                <XCircle size={17} className="mt-0.5 shrink-0 text-red-400" />
                <span className="leading-7 text-white/70">{c}</span>
              </li>
            ))}
          </ul>
        </PolicySection>

        {/* 8 — Policy updates */}
        <PolicySection number="8" title="تعديل السياسة" color="purple">
          <p className="leading-8 text-white/65">
            يجوز لـ Growfolo تعديل هذه السياسة في أي وقت. تصبح النسخة المنشورة على الموقع هي النسخة المعتمدة، ويُعدّ استمرار استخدامك للموقع موافقةً على التعديلات.
          </p>
        </PolicySection>

        {/* 9 — Contact */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-purple-500/12 to-lime-400/6 p-6">
          <h2 className="mb-1 flex items-center gap-2 font-black text-white">
            <span className="flex size-7 items-center justify-center rounded-xl bg-purple-500/20 text-sm font-black text-purple-400">9</span>
            التواصل معنا
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/60">
            إذا كانت لديك أي استفسارات بخصوص سياسة الاسترجاع، يمكنك التواصل معنا عبر:
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <a
              href="mailto:support@growfolo.com"
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75 transition-colors hover:border-lime-400/30 hover:bg-lime-400/5 hover:text-white"
            >
              <Mail size={16} className="shrink-0 text-lime-400" />
              support@growfolo.com
            </a>
            <a
              href="/"
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75 transition-colors hover:border-purple-400/30 hover:bg-purple-400/5 hover:text-white"
            >
              <MessageCircle size={16} className="shrink-0 text-purple-400" />
              الدردشة المباشرة داخل الموقع
            </a>
          </div>
        </div>

        {/* Commitment strip */}
        <div className="rounded-3xl border border-lime-400/20 bg-lime-400/5 p-6 text-center">
          <p className="text-2xl">🤝</p>
          <h3 className="mt-2 font-black text-white">التزام Growfolo</h3>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/60">
            نلتزم بالشفافية والوضوح، ونعمل على معالجة جميع طلبات العملاء بسرعة وعدالة لضمان أفضل تجربة استخدام ممكنة.
          </p>
        </div>

        {/* Back button */}
        <div className="pt-4 text-center">
          <a
            href="/"
            className="neon-button inline-flex items-center gap-2 rounded-2xl px-8 py-3.5 font-black text-black"
          >
            <ArrowRight size={17} /> العودة للرئيسية
          </a>
        </div>
      </div>
    </main>
  );
}

/* ── Sub-components ───────────────────────────────────────────────────── */

type Color = "purple" | "lime" | "red";
const COLOR_MAP: Record<Color, { bg: string; text: string; border: string }> = {
  purple: { bg: "rgba(168,85,247,0.12)", text: "#a855f7", border: "rgba(168,85,247,0.2)"  },
  lime:   { bg: "rgba(163,230,53,0.10)", text: "#a3e635", border: "rgba(163,230,53,0.2)"  },
  red:    { bg: "rgba(239,68,68,0.10)",  text: "#f87171", border: "rgba(239,68,68,0.2)"   },
};

function PolicySection({
  number, title, color, children,
}: {
  number: string; title: string; color: Color; children: React.ReactNode;
}) {
  const c = COLOR_MAP[color];
  return (
    <section className="rounded-3xl border border-white/8 bg-[#0d0b14] p-6">
      <h2 className="mb-5 flex items-center gap-3 font-black text-white">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-xl text-sm font-black"
          style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
        >
          {number}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function InfoCard({ icon, label, value, accent }: { icon: string; label: string; value: string; accent: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/4 p-4">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-xs text-white/45">{label}</p>
        <p className="mt-0.5 text-sm font-black" style={{ color: accent }}>{value}</p>
      </div>
    </div>
  );
}
