"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Brain, Code2, Gamepad2, Headphones, Mail, Medal,
  PenTool, Play, ShieldCheck, ShoppingBag, ShoppingCart, Star,
  Users, Wrench, Zap, BadgeCheck, Globe, Rocket
} from "lucide-react";
import { HeroScene } from "@/components/three/hero-scene";
import { SiteHeader } from "@/components/layout/site-header";
import { PaymentMethodImage } from "@/components/payments/payment-method-image";
import { PAYMENT_METHODS } from "@/lib/payment-methods";
import { ReviewsCarousel } from "@/components/sections/reviews-carousel";
import { BannerCarousel } from "@/components/sections/banner-carousel";
import { AdsShowcase } from "@/components/sections/ads-showcase";
import { AdsSectionSlider } from "@/components/sections/ads-section-slider";
import { useCart } from "@/context/cart-context";
import { useNotifications } from "@/context/notifications-context";
import { PRODUCTS } from "@/data/products";

const features = [
  { title: "تسليم فوري", text: "تسليم الخدمة بسرعة 1 دقيقة", icon: Zap },
  { title: "ضمان كامل", text: "ضمان الاسترجاع الحق حتى 35 يوم", icon: ShieldCheck },
  { title: "دعم 24/7", text: "فريق دعم على مدار الساعة", icon: Headphones },
  { title: "أسعار مميزة", text: "أفضل الأسعار في السوق", icon: Medal },
];

const categories = [
  { title: "الذكاء الاصطناعي", icon: Brain },
  { title: "الأدوات الرقمية", icon: Wrench },
  { title: "الترفيه والمشاهدة", icon: Play },
  { title: "الإبداع والتصميم", icon: PenTool },
  { title: "البرامج والتطبيقات", icon: Code2 },
  { title: "الألعاب والبطاقات", icon: Gamepad2 },
];

const products = PRODUCTS.map(p => ({
  id: p.id, name: p.name, logo: p.logo, discount: p.discount,
  price: `$${p.price}`, price_num: p.price, oldPrice: `$${p.oldPrice}`,
  buyers: p.buyers, color: p.color, rating: p.rating,
}));

const EXCLUSIVE_SHOWCASE_SLIDES = [
  {
    productId: "claude-max-5x-yearly",
    image: "/exclusive-offers/claude-max-5x.jpg",
    alt: "Claude Max 5x",
    accent: "#a855f7",
  },
  {
    productId: "claude-max-20x-yearly",
    image: "/exclusive-offers/claude-max-20x.jpg",
    alt: "Claude Max 20x",
    accent: "#f97316",
  },
  {
    productId: "claude-pro-yearly",
    image: "/exclusive-offers/claude-pro.jpg",
    alt: "Claude Pro",
    accent: "#8b5cf6",
  },
];

const globalStats = [
  { value: "+250,000", label: "عميل سعيد", icon: Users },
  { value: "4.98 ⭐", label: "تقييم العملاء", icon: Star },
  { value: "+650,000", label: "طلب مكتمل", icon: Rocket },
  { value: "+90", label: "دولة حول العالم", icon: Globe },
];

const NEWSLETTER_STRIP_IMAGES = [
  { src: "/newsletter-strip/figma.jpg", alt: "Figma" },
  { src: "/newsletter-strip/gemini.jpg", alt: "Gemini" },
  { src: "/newsletter-strip/chatgpt.jpg", alt: "ChatGPT" },
  { src: "/newsletter-strip/netflix.jpg", alt: "Netflix" },
  { src: "/newsletter-strip/grok.jpg", alt: "Grok" },
  { src: "/newsletter-strip/spotify.jpg", alt: "Spotify" },
  { src: "/newsletter-strip/perplexity.jpg", alt: "Perplexity" },
  { src: "/newsletter-strip/adobe.jpg", alt: "Adobe" },
  { src: "/newsletter-strip/ai-cloud.jpg", alt: "AI Cloud" },
  { src: "/newsletter-strip/claude.jpg", alt: "Claude" },
];


export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050508] text-white">
      <SiteHeader />
      <BannerCarousel />
      <AdsShowcase />
      <div className="mx-auto max-w-7xl px-4 pb-10">
        <HeroSection />
        <FeatureStrip />
        <CategoriesSection />
        <StatsSection />
        <ReviewsCarousel />
        <ExclusiveOfferShowcase />
        <TrustSection />
        <BrandsStrip />
        <NewsletterSection />
        <Footer />
      </div>
    </main>
  );
}

function ExclusiveOfferShowcase() {
  const [current, setCurrent] = useState(0);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragDelta, setDragDelta] = useState(0);
  const [paused, setPaused] = useState(false);
  const { addItem } = useCart();
  const { addNotification } = useNotifications();

  const goTo = useCallback((index: number) => {
    setCurrent((index + EXCLUSIVE_SHOWCASE_SLIDES.length) % EXCLUSIVE_SHOWCASE_SLIDES.length);
  }, []);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(next, 5000);
    return () => window.clearInterval(timer);
  }, [next, paused]);

  function buyProduct(productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    addItem({ id: product.id, name: product.name, price: product.price_num, logo: product.logo, color: product.color });
    addNotification({
      title: "تمت الإضافة إلى السلة",
      description: `تم إضافة "${product.name}" إلى سلة المشتريات`,
      type: "cart",
    });
  }

  return (
    <section
      className="py-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="relative mx-auto min-h-[560px] max-w-5xl touch-pan-y overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] px-4 py-7 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:min-h-[660px] sm:px-8"
        style={{ perspective: "1400px" }}
        onPointerDown={(e) => {
          setPaused(true);
          setDragStart(e.clientX);
          setDragDelta(0);
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (dragStart === null) return;
          setDragDelta(e.clientX - dragStart);
        }}
        onPointerUp={(e) => {
          e.currentTarget.releasePointerCapture(e.pointerId);
          if (dragDelta > 70) prev();
          if (dragDelta < -70) next();
          setDragStart(null);
          setDragDelta(0);
          setPaused(false);
        }}
        onPointerCancel={() => {
          setDragStart(null);
          setDragDelta(0);
          setPaused(false);
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.18),transparent_42%),radial-gradient(circle_at_12%_100%,rgba(200,230,0,0.10),transparent_35%)]" />

        {EXCLUSIVE_SHOWCASE_SLIDES.map((slide, index) => {

          const offset = ((index - current + EXCLUSIVE_SHOWCASE_SLIDES.length + 1) % EXCLUSIVE_SHOWCASE_SLIDES.length) - 1;
          const isActive = offset === 0;
          const product = products.find((p) => p.id === slide.productId);

          return (
            <article
              key={slide.productId}
              className="absolute inset-x-4 top-7 transition-all duration-700 ease-out sm:inset-x-8"
              style={{
                opacity: isActive ? 1 : 0.38,
                transform: `translateX(${offset * 68 + (isActive ? dragDelta / 18 : 0)}%) rotateY(${offset * -18}deg) scale(${isActive ? 1 : 0.86})`,
                zIndex: isActive ? 3 : 1,
                pointerEvents: isActive ? "auto" : "none",
              }}
            >
              <div
                className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border bg-black/35 p-3 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-2xl transition-transform duration-300 hover:-translate-y-1 sm:p-4"
                style={{
                  borderColor: `${slide.accent}55`,
                  boxShadow: `0 0 42px ${slide.accent}24, 0 28px 80px rgba(0,0,0,0.55)`,
                }}
              >
                <img
                  src={slide.image}
                  alt={slide.alt}
                  draggable={false}
                  className="mx-auto max-h-[430px] w-full select-none rounded-2xl object-contain sm:max-h-[540px]"
                />
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => buyProduct(slide.productId)}
                    className="group inline-flex min-h-14 items-center gap-3 rounded-2xl border px-7 py-3 font-black text-white backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] active:scale-95"
                    style={{
                      borderColor: `${slide.accent}70`,
                      background: `linear-gradient(135deg, ${slide.accent}33, rgba(255,255,255,0.08))`,
                      boxShadow: `0 0 28px ${slide.accent}33`,
                    }}
                  >
                    <ShoppingCart size={19} className="transition-transform group-hover:-translate-y-0.5" />
                    {product ? `شراء ${product.name}` : "شراء الآن"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Pagination dots — outside overflow-hidden container */}
      <div className="mt-5 flex items-center justify-center gap-3">
        {EXCLUSIVE_SHOWCASE_SLIDES.map((slide, index) => (
          <button
            key={slide.productId}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => goTo(index)}
            className="rounded-full transition-all duration-300"
            style={{
              width: index === current ? 28 : 10,
              height: 10,
              background: index === current ? slide.accent : "rgba(255,255,255,0.22)",
              boxShadow: index === current ? `0 0 10px ${slide.accent}88` : "none",
            }}
            aria-label={`عرض ${slide.alt}`}
          />
        ))}
      </div>
    </section>
  );
}

function HeroSection() {
  return (
    <section className="grid min-h-[520px] items-center gap-8 py-8 md:grid-cols-[1.02fr_0.98fr] md:py-12">
      <div className="order-2 md:order-none md:col-start-2 md:row-start-1">
        <HeroScene />
      </div>
      <div className="order-1 text-right md:order-none md:col-start-1 md:row-start-1">
        <h1 className="text-5xl font-black leading-[1.25] text-white md:text-7xl">
          كل ما تحتاجه في
          <span className="neon-text mt-1 block">مكان واحد</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-9 text-white/70">
          اشتراكات أصلية، أدوات ذكية. خدمات رقمية بأسعار تنافسية وخدمة موثوقة
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <a href="#products" className="neon-button inline-flex items-center gap-3 rounded-2xl px-7 py-4 font-bold text-black">
            تصفح المنتجات <ShoppingBag size={20} />
          </a>
          <a href="#about" className="inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-black/45 px-7 py-4 font-bold text-white shadow-[0_0_24px_rgba(168,85,247,0.16)]">
            تعرف علينا
            <span className="grid size-7 place-items-center rounded-full border border-white/30"><Play size={14} fill="white" /></span>
          </a>
        </div>
      </div>
    </section>
  );
}

function FeatureStrip() {
  return (
    <section className="glass-panel grid gap-4 rounded-3xl p-5 md:grid-cols-4">
      {features.map((f) => <IconBlock key={f.title} {...f} />)}
    </section>
  );
}

function CategoriesSection() {
  return (
    <section className="py-10">
      <SectionTitle title="تصفح الأقسام" />
      <div className="relative mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {categories.map((c) => (
          <article key={c.title} className="glass-panel group grid min-h-40 place-items-center rounded-3xl p-5 text-center">
            <c.icon className="mb-5 size-14 text-purple-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.75)] group-hover:text-lime-400" />
            <h3 className="font-bold text-white">{c.title}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="glass-panel grid gap-5 rounded-3xl p-6 md:grid-cols-4">
      {globalStats.map((s) => (
        <div key={s.label} className="flex items-center gap-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-2xl border border-purple-500/20 bg-purple-500/10">
            <s.icon className="size-8 text-lime-400 drop-shadow-[0_0_12px_rgba(132,204,22,0.75)]" />
          </div>
          <div>
            <strong className="block text-2xl text-white">{s.value}</strong>
            <span className="text-sm text-white/60">{s.label}</span>
          </div>
        </div>
      ))}
    </section>
  );
}

function TrustSection() {
  return (
    <section className="my-10 text-center">
      <h2 className="text-4xl font-black text-white md:text-5xl">
        يثق بنا <span className="neon-text">آلاف العملاء</span> حول العالم.
      </h2>
      <p className="mt-4 text-white/55">خدمة سريعة · اشتراكات أصلية · دعم 24/7</p>
      <a href="/checkout" className="neon-button mt-8 inline-flex items-center gap-3 rounded-2xl px-10 py-4 font-black text-black text-lg">
        ابدأ الآن ←
      </a>
      <AdsSectionSlider />
      <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
        {["ضمان استرجاع الأموال حتى 30 يوم", "تفعيل فوري خلال دقائق", "دعم على مدار الساعة 24/7", "دفع 100% آمن · حماية بياناتك", "اشتراكات أصلية 100% بدون مشاركة"].map((t) => (
          <span key={t} className="flex items-center gap-1.5">
            <BadgeCheck size={15} className="text-lime-400" /> {t}
          </span>
        ))}
      </div>
    </section>
  );
}

function BrandsStrip() {
  const stripRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef({ active: false, x: 0, scrollLeft: 0 });

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    const timer = window.setInterval(() => {
      if (dragRef.current.active) return;
      const next = strip.scrollLeft + 150;
      strip.scrollTo({
        left: next >= strip.scrollWidth - strip.clientWidth - 4 ? 0 : next,
        behavior: "smooth",
      });
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="glass-panel overflow-hidden rounded-3xl py-5">
      <style>{`
        @keyframes newsletter-logo-float {
          0%, 100% { transform: translateY(0) rotateX(0deg); }
          50% { transform: translateY(-9px) rotateX(5deg); }
        }
      `}</style>
      <div
        ref={stripRef}
        className="flex cursor-grab select-none items-center gap-4 overflow-x-auto px-5 py-3 active:cursor-grabbing [scrollbar-width:none] sm:gap-5 sm:px-6"
        dir="ltr"
        style={{ WebkitOverflowScrolling: "touch" }}
        onPointerDown={(e) => {
          const strip = stripRef.current;
          if (!strip) return;
          dragRef.current = { active: true, x: e.clientX, scrollLeft: strip.scrollLeft };
          strip.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const strip = stripRef.current;
          if (!strip || !dragRef.current.active) return;
          strip.scrollLeft = dragRef.current.scrollLeft - (e.clientX - dragRef.current.x);
        }}
        onPointerUp={(e) => {
          dragRef.current.active = false;
          stripRef.current?.releasePointerCapture(e.pointerId);
        }}
        onPointerCancel={() => {
          dragRef.current.active = false;
        }}
      >
        {NEWSLETTER_STRIP_IMAGES.map((image, idx) => (
          <div
            key={image.src}
            className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-3xl border border-white/10 bg-white shadow-[0_14px_38px_rgba(0,0,0,0.32)] transition duration-300 hover:scale-105 hover:border-lime-300/50 hover:shadow-[0_16px_44px_rgba(200,230,0,0.16)] sm:size-24 md:size-28"
            style={{
              animation: "newsletter-logo-float 4.6s ease-in-out infinite",
              animationDelay: `${idx * 120}ms`,
            }}
          >
            <img
              src={image.src}
              alt={image.alt}
              draggable={false}
              className="size-full object-cover object-center"
            />
            <span className="pointer-events-none absolute inset-x-2 top-1 h-1/3 rounded-full bg-white/20 blur-md" />
          </div>
        ))}
      </div>
    </section>
  );
}

function NewsletterSection() {
  return (
    <section className="glass-panel my-8 grid items-center gap-5 rounded-3xl p-6 md:grid-cols-[1fr_1.1fr_auto]">
      <div>
        <h2 className="text-2xl font-black">كن أول من يعرف!</h2>
        <p className="mt-2 text-sm text-white/65">اشترك بنشرتنا البريدية ليصلك كل جديد</p>
      </div>
      <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-white/10 bg-black/45 px-4 text-white/55">
        <Mail size={21} className="text-purple-400" />
        <input className="w-full bg-transparent outline-none placeholder:text-white/45" placeholder="ادخل بريدك الإلكتروني" type="email" />
      </label>
      <button className="neon-button min-h-14 rounded-2xl px-9 font-black text-black">اشترك الآن</button>
    </section>
  );
}

function Footer() {
  return (
    <footer id="about" className="border-t border-purple-500/15 py-8">
      <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="pixel-logo text-3xl font-black">
            <span className="text-purple-500">GROW</span><span className="text-lime-400">FOLO</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-8 text-white/65">
            متجر رقمي يقدم لك أفضل الخدمات والاشتراكات الأصلية، كل ما تحتاج لتجربة رقمية متكاملة ومتميزة
          </p>
        </div>
        <FooterColumn title="روابط سريعة" links={[
          { label: "المدونة",                href: "/blog" },
          { label: "الصفحة التعريفية",      href: "#about" },
          { label: "سياسة الخصوصية",        href: "#" },
          { label: "الاستبدال والاسترجاع",  href: "/refund-policy" },
        ]} />
        <FooterColumn title="خدمة العملاء" links={[
          { label: "تواصل معنا",    href: "#" },
          { label: "الأسئلة الشائعة", href: "/faq" },
          { label: "تتبع الطلب",    href: "/track-order" },
          { label: "شروط الخدمة",  href: "#" },
        ]} />
        <div>
          <h3 className="mb-4 font-black">طرق الدفع</h3>
          <div className="grid max-w-64 grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((method) => (
              <span key={method.id} className="grid min-h-12 place-items-center rounded-lg border border-white/10 bg-white/5 px-2 py-1.5">
                <PaymentMethodImage method={method} />
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-8 text-center text-xs text-white/35">جميع الحقوق محفوظة GrowFolo © 2026</p>
    </footer>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-2xl font-black text-white md:text-3xl">{title}</h2>
      <button className="rounded-2xl bg-white/5 px-5 py-2 text-sm font-bold text-white">عرض الكل</button>
    </div>
  );
}

function IconBlock({ title, text, icon: Icon }: { title: string; text: string; icon: LucideIcon }) {
  return (
    <article className="flex items-center gap-4 border-white/10 md:border-l md:pl-4 last:border-l-0">
      <div className="grid size-16 shrink-0 place-items-center rounded-2xl border border-purple-500/25 bg-purple-500/10">
        <Icon className="size-9 text-purple-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
      </div>
      <div>
        <h3 className="font-black text-white">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-white/65">{text}</p>
      </div>
    </article>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="mb-4 font-black">{title}</h3>
      <ul className="grid gap-3 text-sm text-white/62">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href} className="transition-colors hover:text-white">{l.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
