"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";

const VISUAL_ITEMS = [
  {
    src: "/important-info/claude-cloud-lifetime.jpg",
    alt: "Claude Cloud Lifetime",
    title: "Claude Cloud Lifetime",
    description: "معلومات مرئية مهمة حول الخدمة وخطوات الربط والمميزات.",
  },
  {
    src: "/important-info/payment-methods-overview.jpg",
    alt: "طرق الدفع المتاحة",
    title: "طرق الدفع المتاحة",
    description: "نظرة مرئية على وسائل الدفع المتاحة ومزايا الأمان والدعم.",
  },
];

export default function ImportantInfoPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050508] text-white" dir="rtl">
      <style>{`
        @keyframes importantGlow {
          0%, 100% { opacity: .45; transform: translate3d(0, 0, 0) scale(1); }
          50% { opacity: .75; transform: translate3d(0, -18px, 0) scale(1.04); }
        }
        .info-orb {
          position: fixed;
          border-radius: 999px;
          filter: blur(70px);
          pointer-events: none;
          animation: importantGlow 9s ease-in-out infinite;
        }
        .info-glass {
          background:
            linear-gradient(135deg, rgba(255,255,255,.14), rgba(255,255,255,.045)),
            radial-gradient(circle at 16% 10%, rgba(132,204,22,.16), transparent 32%),
            radial-gradient(circle at 84% 14%, rgba(168,85,247,.18), transparent 34%);
          border: 1px solid rgba(255,255,255,.16);
          box-shadow: 0 24px 80px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.18);
          backdrop-filter: blur(22px);
        }
        .info-glass::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(120deg, rgba(255,255,255,.24), transparent 28%, transparent 72%, rgba(132,204,22,.16));
          opacity: .42;
          pointer-events: none;
        }
      `}</style>

      <SiteHeader />

      <div className="info-orb right-[-120px] top-24 h-72 w-72 bg-purple-600/35" />
      <div className="info-orb bottom-10 left-[-120px] h-80 w-80 bg-lime-400/20" style={{ animationDelay: "1.6s" }} />

      <section className="relative z-10 mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/10 px-4 py-2 text-xs font-black text-purple-200">
              <Sparkles size={14} />
              معلومات مهمة
            </div>
            <h1 className="text-3xl font-black leading-tight sm:text-5xl">مكتبة الصور والمعلومات</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/58 sm:text-base">
              محتوى بصري تفاعلي لعرض التفاصيل المهمة بطريقة واضحة ومتناسقة مع هوية Growfolo.
            </p>
          </div>
          <a
            href="/"
            className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm font-bold text-white/70 transition-all hover:border-purple-400/40 hover:bg-purple-500/12 hover:text-white"
          >
            <ArrowRight size={16} />
            العودة للرئيسية
          </a>
        </motion.div>

        <div className="grid gap-7">
          {VISUAL_ITEMS.map((item, index) => (
            <motion.article
              key={item.src}
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.55, delay: index * 0.08, ease: "easeOut" }}
              whileHover={{ y: -8, rotateX: 1.6, rotateY: -1.6, scale: 1.01 }}
              whileTap={{ scale: 0.985 }}
              drag="x"
              dragConstraints={{ left: -22, right: 22 }}
              dragElastic={0.18}
              className="info-glass relative overflow-hidden rounded-[28px] p-3 sm:p-4"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-white/8">
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={900}
                  height={1800}
                  priority={index === 0}
                  sizes="(max-width: 768px) 94vw, 960px"
                  className="h-auto w-full select-none object-contain"
                />
              </div>
              <div className="relative mt-4 flex flex-col gap-2 px-2 pb-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-black text-white">{item.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-white/55">{item.description}</p>
                </div>
                <span className="w-fit rounded-full border border-lime-400/25 bg-lime-400/10 px-3 py-1.5 text-xs font-black text-lime-200">
                  قابل للسحب والتفاعل
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </main>
  );
}
