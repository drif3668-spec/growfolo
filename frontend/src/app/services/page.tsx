import { SiteHeader } from "@/components/layout/site-header";

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-[#050508] text-white">
      <SiteHeader />
      <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <div className="glass-panel rounded-3xl p-8 md:p-12">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-purple-400">Growfolo Services</p>
          <h1 className="text-3xl font-black md:text-5xl">عرض جميع الخدمات</h1>
          <p className="mt-5 text-lg leading-8 text-white/65">
            هذه الصفحة قيد التطوير، وسيتم إطلاقها قريبًا.
          </p>
          <a href="/" className="neon-button mt-8 inline-flex rounded-2xl px-8 py-3.5 font-black text-black">
            العودة للرئيسية
          </a>
        </div>
      </section>
    </main>
  );
}
