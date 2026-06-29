"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useParams } from "next/navigation";
import {
  ArrowRight, BookOpen, Brain, Check, Clock, Copy, Eye,
  Newspaper, Package, Share2, TrendingUp, Wrench,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Post {
  id: string; slug: string; title: string; excerpt: string;
  content: string; author: string; category: string; tags: string[];
  views: number; featured: boolean; created_at: string;
}

type CategoryIcon = React.ComponentType<{
  size?: number;
  className?: string;
  style?: CSSProperties;
}>;

const CATS: Record<string, { label: string; color: string; bg: string; icon: CategoryIcon }> = {
  ai:        { label: "الذكاء الاصطناعي",  color: "#a855f7", bg: "rgba(168,85,247,0.12)", icon: Brain      },
  services:  { label: "الخدمات",           color: "#10b981", bg: "rgba(16,185,129,0.12)", icon: Package     },
  companies: { label: "الشركات العالمية",  color: "#3b82f6", bg: "rgba(59,130,246,0.12)", icon: TrendingUp  },
  tutorials: { label: "الشروحات",          color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: Wrench      },
  news:      { label: "الأخبار",           color: "#ec4899", bg: "rgba(236,72,153,0.12)", icon: Newspaper   },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("ar-DZ", { year: "numeric", month: "long", day: "numeric" });
}
function readTime(content: string) {
  return Math.max(1, Math.ceil(content.replace(/<[^>]*>/g, "").split(/\s+/).length / 200));
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : (params?.slug ?? "");
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`${API_URL}/api/v1/blog/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setPost(data);
          fetch(`${API_URL}/api/v1/blog?category=${data.category}&limit=4`)
            .then(r => r.json())
            .then(list => setRelated(Array.isArray(list) ? list.filter((p: Post) => p.slug !== slug).slice(0, 3) : []));
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  function share(platform: string) {
    const url = window.location.href;
    const text = post?.title ?? "";
    if (platform === "copy") {
      navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
    } else if (platform === "twitter") {
      window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
    } else if (platform === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + "\n" + url)}`);
    }
  }

  if (loading) return (
    <main className="flex min-h-screen items-center justify-center bg-[#050508]">
      <div className="size-10 animate-spin rounded-full border-2 border-lime-400 border-t-transparent" />
    </main>
  );

  if (!post) return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#050508] text-white">
      <BookOpen size={40} className="text-white/20" />
      <p className="text-white/50">المقال غير موجود</p>
      <a href="/blog" className="text-sm text-lime-400 hover:underline">← العودة للمدونة</a>
    </main>
  );

  const cat = CATS[post.category] ?? CATS.news;
  const CatIcon = cat.icon;

  return (
    <main className="min-h-screen bg-[#050508] text-white" dir="rtl">
      <SiteHeader />

      {/* Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute right-1/4 top-0 size-[500px] rounded-full blur-[140px]" style={{ background: `${cat.color}08` }} />
        <div className="absolute left-1/4 top-40 size-[350px] rounded-full bg-purple-600/6 blur-[110px]" />
      </div>

      <article className="relative mx-auto max-w-3xl px-4 pb-24 pt-10">
        {/* Breadcrumb */}
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-xs text-white/35">
          <a href="/" className="hover:text-white transition-colors">الرئيسية</a>
          <span>/</span>
          <a href="/blog" className="hover:text-white transition-colors">المدونة</a>
          <span>/</span>
          <span className="text-white/60">{post.title}</span>
        </nav>

        {/* Article header */}
        <header className="mb-8">
          {/* Category + featured */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span
              className="flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs font-black"
              style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.color}33` }}
            >
              <CatIcon size={12} /> {cat.label}
            </span>
            {post.featured && (
              <span className="rounded-2xl bg-yellow-400/15 px-3 py-1.5 text-xs font-black text-yellow-400">
                ★ مقال مميز
              </span>
            )}
          </div>

          <h1 className="text-3xl font-black leading-[1.4] text-white md:text-4xl">{post.title}</h1>
          <p className="mt-3 text-base leading-7 text-white/55">{post.excerpt}</p>

          {/* Meta row */}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/40">
            <span className="font-semibold text-white/60">{post.author}</span>
            <span>{fmtDate(post.created_at)}</span>
            <span className="flex items-center gap-1"><Clock size={11} /> {readTime(post.content)} دقائق قراءة</span>
            <span className="flex items-center gap-1"><Eye size={11} /> {post.views} مشاهدة</span>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {post.tags.map(t => (
                <span key={t} className="rounded-xl bg-white/6 px-2.5 py-1 text-xs text-white/50">#{t}</span>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="mt-6 h-px" style={{ background: `linear-gradient(90deg, ${cat.color}50, transparent)` }} />
        </header>

        {/* Article content */}
        <div
          className="prose-growfolo mb-10 leading-8 text-white/75"
          dangerouslySetInnerHTML={{ __html: post.content }}
          style={{ fontSize: "0.95rem" }}
        />

        {/* Share */}
        <div
          className="mb-12 rounded-3xl p-5"
          style={{ background: cat.bg, border: `1px solid ${cat.color}25` }}
        >
          <p className="mb-3 flex items-center gap-2 text-sm font-black" style={{ color: cat.color }}>
            <Share2 size={15} /> شارك هذا المقال
          </p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => share("copy")}
              className="flex items-center gap-2 rounded-xl bg-white/8 px-4 py-2 text-xs font-bold text-white hover:bg-white/15">
              {copied ? <Check size={13} className="text-lime-400" /> : <Copy size={13} />}
              {copied ? "تم النسخ!" : "نسخ الرابط"}
            </button>
            <button onClick={() => share("twitter")}
              className="flex items-center gap-2 rounded-xl bg-white/8 px-4 py-2 text-xs font-bold text-white hover:bg-white/15">
              𝕏 تويتر
            </button>
            <button onClick={() => share("whatsapp")}
              className="flex items-center gap-2 rounded-xl bg-green-500/15 px-4 py-2 text-xs font-bold text-green-400 hover:bg-green-500/25">
              📱 واتساب
            </button>
          </div>
        </div>

        {/* Back to blog */}
        <a href="/blog" className="mb-12 inline-flex items-center gap-2 text-sm font-bold text-lime-400 hover:underline">
          <ArrowRight size={15} /> العودة لجميع المقالات
        </a>

        {/* Related */}
        {related.length > 0 && (
          <section>
            <h2 className="mb-5 flex items-center gap-2 text-xl font-black text-white">
              <BookOpen size={18} className="text-lime-400" /> مقالات قد تعجبك
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map(rp => {
                const rc = CATS[rp.category] ?? CATS.news;
                const RIcon = rc.icon;
                return (
                  <a
                    key={rp.id}
                    href={`/blog/${rp.slug}`}
                    className="group rounded-2xl border border-white/8 bg-white/3 p-4 transition-all hover:-translate-y-0.5 hover:border-white/15"
                  >
                    <div
                      className="mb-3 grid size-9 place-items-center rounded-xl"
                      style={{ background: rc.bg }}
                    >
                      <RIcon size={16} style={{ color: rc.color }} />
                    </div>
                    <h3 className="text-sm font-bold leading-6 text-white group-hover:text-lime-400 line-clamp-2">
                      {rp.title}
                    </h3>
                    <p className="mt-1 text-[11px] text-white/40">{fmtDate(rp.created_at)}</p>
                  </a>
                );
              })}
            </div>
          </section>
        )}
      </article>

      {/* Article content styles */}
      <style>{`
        .prose-growfolo h2 { color: white; font-size: 1.35rem; font-weight: 900; margin: 1.8rem 0 0.8rem; padding-bottom: 0.4rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .prose-growfolo h3 { color: rgba(255,255,255,0.9); font-size: 1.1rem; font-weight: 800; margin: 1.4rem 0 0.6rem; }
        .prose-growfolo p  { margin: 0.9rem 0; }
        .prose-growfolo ul, .prose-growfolo ol { margin: 0.9rem 0 0.9rem 1.5rem; }
        .prose-growfolo li { margin: 0.4rem 0; }
        .prose-growfolo strong { color: white; font-weight: 800; }
        .prose-growfolo pre { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1rem; overflow-x: auto; margin: 1rem 0; }
        .prose-growfolo code { background: rgba(200,230,0,0.1); color: #c8e600; padding: 2px 6px; border-radius: 6px; font-size: 0.85em; }
        .prose-growfolo pre code { background: none; color: rgba(255,255,255,0.85); padding: 0; }
        .prose-growfolo a { color: #c8e600; text-decoration: underline; }
      `}</style>
    </main>
  );
}
