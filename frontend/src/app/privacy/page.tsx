import {
  ArrowRight, Shield, Database, Cookie, Lock,
  Users, ServerCog, UserCog, Bell, Baby, Archive,
  Scale, RefreshCw, MessageCircle, CheckCircle,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata = {
  title: "سياسة الخصوصية — Growfolo",
  description: "تعرف على سياسة الخصوصية الخاصة بمنصة Growfolo وكيفية حماية بياناتك الشخصية.",
};

const LAST_UPDATED = new Date().toLocaleDateString("ar-DZ", {
  year: "numeric", month: "long", day: "numeric",
});

const SECTIONS = [
  {
    id: 1,
    icon: Database,
    color: "#a855f7",
    title: "المعلومات التي نقوم بجمعها",
    groups: [
      {
        label: "معلومات الحساب",
        items: [
          "الاسم الكامل",
          "البريد الإلكتروني",
          "رقم الهاتف",
          "الدولة",
          "كلمة المرور (يتم تشفيرها ولا تُحفظ كنص صريح)",
        ],
      },
      {
        label: "معلومات الطلبات",
        items: [
          "المنتجات التي تم شراؤها",
          "قيمة الطلب",
          "تاريخ الطلب",
          "حالة الطلب",
          "رقم الطلب",
        ],
      },
      {
        label: "معلومات الدفع",
        items: [
          "رقم الطلب وطريقة الدفع",
          "عنوان المحفظة (عند الدفع بالعملات الرقمية)",
          "صور إثبات الدفع إذا قام العميل برفعها",
        ],
        note: "لا نقوم بتخزين بيانات البطاقات البنكية الحساسة إذا تمت عملية الدفع عبر مزود دفع خارجي معتمد.",
      },
    ],
  },
  {
    id: 2,
    icon: Shield,
    color: "#10b981",
    title: "كيفية استخدام المعلومات",
    list: [
      "إنشاء حساب المستخدم",
      "معالجة الطلبات وتفعيل المنتجات والخدمات",
      "تقديم الدعم الفني",
      "إرسال الإشعارات ورسائل البريد الإلكتروني",
      "تحسين خدمات Growfolo",
      "منع الاحتيال وتعزيز الأمان",
    ],
  },
  {
    id: 3,
    icon: Cookie,
    color: "#f59e0b",
    title: "ملفات تعريف الارتباط (Cookies)",
    list: [
      "حفظ جلسة تسجيل الدخول",
      "تذكر إعدادات المستخدم",
      "تحسين سرعة الموقع",
      "تحليل أداء الموقع",
    ],
  },
  {
    id: 4,
    icon: Lock,
    color: "#3b82f6",
    title: "حماية البيانات",
    list: [
      "تشفير كلمات المرور",
      "استخدام بروتوكول HTTPS",
      "حماية قواعد البيانات",
      "مراقبة محاولات الوصول غير المصرح بها",
      "تحديث الأنظمة بشكل دوري",
    ],
  },
  {
    id: 5,
    icon: Users,
    color: "#ec4899",
    title: "مشاركة المعلومات",
    intro: "لا نقوم ببيع أو تأجير البيانات الشخصية لأي طرف ثالث.",
    list: [
      "مزودي خدمات الدفع",
      "شركات الاستضافة",
      "الجهات القانونية عند وجود التزام قانوني",
    ],
    listLabel: "قد تتم مشاركة بعض المعلومات فقط مع:",
  },
  {
    id: 6,
    icon: ServerCog,
    color: "#06b6d4",
    title: "مزودو الخدمات",
    intro: "قد تستخدم Growfolo خدمات خارجية، ويخضع استخدامها لسياسات الخصوصية الخاصة بها:",
    list: [
      "خدمات الدفع الإلكتروني",
      "خدمات البريد الإلكتروني",
      "خدمات الاستضافة السحابية",
      "خدمات تحليل الأداء",
      "خدمات تخزين البيانات",
    ],
  },
  {
    id: 7,
    icon: UserCog,
    color: "#8b5cf6",
    title: "حساب المستخدم",
    list: [
      "تعديل البيانات الشخصية",
      "تغيير كلمة المرور",
      "طلب حذف الحساب وفقًا للأنظمة والسياسات المعمول بها",
    ],
    listLabel: "يحق للمستخدم:",
  },
  {
    id: 8,
    icon: Bell,
    color: "#f97316",
    title: "الرسائل والإشعارات",
    list: [
      "إشعارات الطلبات",
      "رسائل تأكيد التسجيل",
      "تحديثات الخدمات",
      "العروض والخصومات (إذا وافق المستخدم على استلامها)",
    ],
    listLabel: "قد نرسل للمستخدم:",
  },
  {
    id: 9,
    icon: Baby,
    color: "#ef4444",
    title: "حماية الأطفال",
    text: "خدمات Growfolo غير موجهة للأطفال دون السن القانوني في الدولة التي يقيمون فيها، ولا نجمع بياناتهم الشخصية عن قصد.",
  },
  {
    id: 10,
    icon: Archive,
    color: "#84cc16",
    title: "الاحتفاظ بالبيانات",
    text: "نحتفظ بالبيانات طالما كانت ضرورية لتقديم خدماتنا أو للوفاء بالمتطلبات القانونية والتنظيمية، ثم يتم حذفها أو إخفاء هويتها عند عدم الحاجة إليها.",
  },
  {
    id: 11,
    icon: Scale,
    color: "#c8e600",
    title: "حقوق المستخدم",
    list: [
      "معرفة البيانات التي نحتفظ بها",
      "طلب تصحيح البيانات",
      "طلب حذف البيانات عندما يكون ذلك ممكنًا قانونيًا",
      "الاعتراض على بعض أنواع معالجة البيانات وفقًا للقوانين المعمول بها",
    ],
    listLabel: "يحق للمستخدم:",
  },
  {
    id: 12,
    icon: RefreshCw,
    color: "#a855f7",
    title: "تعديل سياسة الخصوصية",
    text: "قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. وسيتم نشر أي تحديث على هذه الصفحة مع توضيح تاريخ آخر تعديل.",
  },
  {
    id: 13,
    icon: MessageCircle,
    color: "#10b981",
    title: "التواصل معنا",
    contact: [
      { label: "البريد الإلكتروني", value: "support@growfolo.com", href: "mailto:support@growfolo.com" },
      { label: "واتساب", value: "213779012833+", href: "https://wa.me/213779012833" },
      { label: "الموقع", value: "growfolo.com", href: "https://growfolo.com" },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#050508] text-white" dir="rtl">
      <SiteHeader />

      {/* ── Ambient glows ───────────────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute right-1/4 top-0 size-[600px] rounded-full bg-purple-600/10 blur-[140px]" />
        <div className="absolute left-1/4 top-32 size-[400px] rounded-full bg-blue-500/8 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 size-[350px] rounded-full bg-lime-400/5 blur-[110px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 pb-24 pt-12">

        {/* ── Back link ──────────────────────────────────────────────────── */}
        <a
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white"
        >
          <ArrowRight size={15} /> العودة للرئيسية
        </a>

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <div className="mb-14 text-center">
          <div
            className="mx-auto mb-6 grid size-20 place-items-center rounded-[22px]"
            style={{
              background: "linear-gradient(135deg, rgba(168,85,247,0.25), rgba(59,130,246,0.2))",
              border: "1px solid rgba(168,85,247,0.3)",
              boxShadow: "0 0 0 1px rgba(168,85,247,0.08), 0 0 60px rgba(168,85,247,0.25), 0 20px 50px rgba(0,0,0,0.5)",
              transform: "perspective(500px) rotateX(6deg)",
            }}
          >
            <Shield size={38} className="text-purple-400 drop-shadow-[0_0_18px_rgba(168,85,247,0.8)]" />
          </div>

          <div className="pixel-logo mb-3 text-2xl font-black">
            <span className="text-purple-500">GROW</span>
            <span className="text-lime-400">FOLO</span>
          </div>

          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-400/25 bg-purple-500/10 px-4 py-1.5 text-xs font-bold text-purple-400">
            <Shield size={12} /> وثيقة رسمية
          </div>

          <h1 className="text-4xl font-black text-white md:text-5xl">
            سياسة{" "}
            <span className="bg-gradient-to-l from-blue-400 via-purple-400 to-lime-400 bg-clip-text text-transparent">
              الخصوصية
            </span>
          </h1>
          <p className="mt-3 text-sm text-white/45">
            آخر تحديث: {LAST_UPDATED}
          </p>

          {/* Stats strip */}
          <div className="mx-auto mt-7 flex max-w-xs justify-center gap-8">
            {[
              { val: "13", label: "قسم" },
              { val: "100%", label: "شفافية" },
              { val: "🔒", label: "حماية" },
            ].map(({ val, label }) => (
              <div key={label} className="text-center">
                <p className="text-xl font-black text-white">{val}</p>
                <p className="text-xs text-white/40">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Intro card ─────────────────────────────────────────────────── */}
        <div
          className="mb-8 overflow-hidden rounded-3xl p-6"
          style={{
            background: "linear-gradient(135deg, rgba(168,85,247,0.08), rgba(59,130,246,0.06))",
            border: "1px solid rgba(168,85,247,0.2)",
            boxShadow: "0 0 40px rgba(168,85,247,0.08)",
          }}
        >
          <p className="text-sm leading-8 text-white/70">
            مرحبًا بك في <span className="font-black text-white">Growfolo</span>. نحن نلتزم بحماية خصوصية مستخدمينا وضمان التعامل مع بياناتهم بأعلى معايير الأمان والشفافية. باستخدامك لموقعنا أو خدماتنا، فإنك توافق على سياسة الخصوصية التالية.
          </p>
        </div>

        {/* ── Sections ───────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            return (
              <div
                key={sec.id}
                className="group overflow-hidden rounded-3xl transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.border = `1px solid ${sec.color}30`;
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 30px ${sec.color}10, 0 4px 24px rgba(0,0,0,0.35)`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(255,255,255,0.07)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.25)";
                }}
              >
                {/* Card header */}
                <div className="flex items-center gap-4 p-5 pb-4">
                  <div
                    className="grid size-11 shrink-0 place-items-center rounded-2xl"
                    style={{
                      background: `${sec.color}18`,
                      border: `1px solid ${sec.color}35`,
                    }}
                  >
                    <Icon size={20} style={{ color: sec.color }} />
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs font-black tabular-nums"
                      style={{ color: `${sec.color}88` }}
                    >
                      {String(sec.id).padStart(2, "0")}
                    </span>
                    <h2 className="text-base font-black text-white">{sec.title}</h2>
                  </div>
                </div>

                {/* Divider */}
                <div className="mx-5 h-px" style={{ background: `${sec.color}18` }} />

                {/* Card body */}
                <div className="p-5 pt-4">
                  {/* Simple text */}
                  {"text" in sec && sec.text && (
                    <p className="text-sm leading-8 text-white/65">{sec.text}</p>
                  )}

                  {/* Intro text */}
                  {"intro" in sec && sec.intro && (
                    <p className="mb-3 text-sm leading-7 text-white/65">{sec.intro}</p>
                  )}

                  {/* Intro (strong statement) */}
                  {"intro" in sec && sec.intro && "list" in sec && !("listLabel" in sec) && null}
                  {"listLabel" in sec && sec.listLabel && (
                    <p className="mb-3 text-sm font-semibold text-white/60">{sec.listLabel}</p>
                  )}

                  {/* Simple list */}
                  {"list" in sec && sec.list && (
                    <ul className="grid gap-2">
                      {(sec.list as string[]).map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-white/65">
                          <CheckCircle
                            size={14}
                            className="mt-0.5 shrink-0"
                            style={{ color: sec.color }}
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Grouped lists */}
                  {"groups" in sec && sec.groups && (
                    <div className="grid gap-4 sm:grid-cols-3">
                      {(sec.groups as Array<{ label: string; items: string[]; note?: string }>).map((g) => (
                        <div
                          key={g.label}
                          className="rounded-2xl p-4"
                          style={{
                            background: `${sec.color}08`,
                            border: `1px solid ${sec.color}20`,
                          }}
                        >
                          <p
                            className="mb-3 text-xs font-black uppercase tracking-wider"
                            style={{ color: sec.color }}
                          >
                            {g.label}
                          </p>
                          <ul className="grid gap-2">
                            {g.items.map((item) => (
                              <li key={item} className="flex items-start gap-2 text-xs text-white/60">
                                <span className="mt-1.5 size-1.5 shrink-0 rounded-full" style={{ background: sec.color }} />
                                {item}
                              </li>
                            ))}
                          </ul>
                          {g.note && (
                            <p className="mt-3 rounded-xl border border-yellow-400/20 bg-yellow-400/8 px-3 py-2 text-[11px] leading-5 text-yellow-300/80">
                              ⚠️ {g.note}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Contact info */}
                  {"contact" in sec && sec.contact && (
                    <div className="grid gap-3 sm:grid-cols-3">
                      {(sec.contact as Array<{ label: string; value: string; href: string }>).map((c) => (
                        <a
                          key={c.label}
                          href={c.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/link flex flex-col gap-1 rounded-2xl p-4 transition-all"
                          style={{
                            background: `${sec.color}08`,
                            border: `1px solid ${sec.color}25`,
                          }}
                        >
                          <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: `${sec.color}99` }}>
                            {c.label}
                          </span>
                          <span className="text-sm font-bold text-white/80 group-hover/link:text-white transition-colors">
                            {c.value}
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Consent banner ─────────────────────────────────────────────── */}
        <div
          className="mt-10 overflow-hidden rounded-3xl p-8 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(168,85,247,0.1), rgba(200,230,0,0.06))",
            border: "1px solid rgba(168,85,247,0.25)",
            boxShadow: "0 0 60px rgba(168,85,247,0.1)",
          }}
        >
          <div
            className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl"
            style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}
          >
            <CheckCircle size={28} className="text-purple-400" />
          </div>
          <h2 className="mb-2 text-xl font-black text-white">موافقة المستخدم</h2>
          <p className="mx-auto max-w-xl text-sm leading-8 text-white/55">
            باستخدامك لموقع Growfolo أو أي من خدماته، فإنك تقر بأنك قرأت سياسة الخصوصية هذه وفهمتها، وتوافق على جمع واستخدام ومعالجة بياناتك وفقًا لما هو موضح أعلاه.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl px-7 py-3 text-sm font-black text-black transition-all hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg, #c8e600, #a3bd00)", boxShadow: "0 4px 20px rgba(200,230,0,0.3)" }}
            >
              العودة للمتجر
            </a>
            <a
              href="https://wa.me/213779012833"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/6 px-7 py-3 text-sm font-black text-white transition-all hover:bg-white/12"
            >
              <MessageCircle size={15} /> تواصل معنا
            </a>
          </div>
        </div>

        {/* ── Footer note ────────────────────────────────────────────────── */}
        <p className="mt-10 text-center text-xs text-white/25">
          © 2026 Growfolo — جميع الحقوق محفوظة · آخر تحديث: {LAST_UPDATED}
        </p>
      </div>
    </main>
  );
}
