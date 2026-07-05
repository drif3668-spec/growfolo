import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Globe2, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { CERTIFICATES, getCertificate } from "@/data/certificates";

export function generateStaticParams() {
  return CERTIFICATES.map((certificate) => ({ slug: certificate.slug }));
}

export default async function CertificatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const certificate = getCertificate(slug);
  if (!certificate) notFound();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050508] text-white" dir="rtl">
      <style>{`
        @keyframes certificateFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
        .certificate-card {
          background:
            linear-gradient(135deg, rgba(255,255,255,.13), rgba(255,255,255,.045)),
            radial-gradient(circle at 18% 8%, rgba(132,204,22,.14), transparent 32%),
            radial-gradient(circle at 82% 18%, rgba(168,85,247,.16), transparent 34%);
          border: 1px solid rgba(255,255,255,.16);
          box-shadow: 0 28px 90px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.18);
          backdrop-filter: blur(22px);
          animation: certificateFloat 7s ease-in-out infinite;
        }
      `}</style>
      <SiteHeader />

      <div className="pointer-events-none fixed -right-24 top-24 h-80 w-80 rounded-full bg-purple-600/25 blur-[80px]" />
      <div className="pointer-events-none fixed -left-24 bottom-10 h-80 w-80 rounded-full bg-lime-400/18 blur-[80px]" />

      <section className="relative z-10 mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <div className="mb-7 grid gap-5 text-right md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div
              className="mb-3 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black"
              style={{
                borderColor: `${certificate.accent}55`,
                background: `${certificate.accent}18`,
                color: certificate.accent,
              }}
            >
              <ShieldCheck size={14} />
              الشهادات
            </div>
            <h1 className="text-3xl font-black leading-tight sm:text-5xl">{certificate.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62 sm:text-base">
              {certificate.description}
            </p>
          </div>
          <a
            href="/"
            className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm font-bold text-white/72 transition-all hover:border-purple-400/40 hover:bg-purple-500/12 hover:text-white"
          >
            <ArrowRight size={16} />
            العودة إلى الصفحة الرئيسية
          </a>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-white/45">
              <Globe2 size={16} />
              الدولة
            </div>
            <p className="text-2xl font-black text-white">{certificate.country}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-white/45">
              <CalendarDays size={16} />
              تاريخ الإصدار
            </div>
            <p className="text-2xl font-black text-white">{certificate.issueDate}</p>
          </div>
        </div>

        <article className="certificate-card relative overflow-hidden rounded-[30px] p-3 sm:p-5">
          <div className="relative overflow-hidden rounded-[22px] border border-white/12 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.32)]">
            <Image
              src={certificate.image}
              alt={certificate.title}
              width={1100}
              height={1600}
              priority
              sizes="(max-width: 768px) 94vw, 980px"
              className="h-auto w-full object-contain"
            />
          </div>
          <p className="mt-4 text-center text-xs font-bold text-white/45">للعرض فقط</p>
        </article>
      </section>
    </main>
  );
}
