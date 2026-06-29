"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, BookOpen, Brain, Clock, Eye, Newspaper, Package, Search, Sparkles, Star, TrendingUp, Wrench } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/* ── Types & config ─────────────────────────────────────────────────── */
interface Post {
  id: string; slug: string; title: string; excerpt: string; author: string;
  category: string; tags: string[]; views: number; featured: boolean;
  created_at: string; content: string;
}

const CATS = [
  { id: "all",       label: "الكل",              icon: Sparkles,  color: "#c8e600", bg: "rgba(200,230,0,0.12)"  },
  { id: "ai",        label: "الذكاء الاصطناعي",  icon: Brain,     color: "#a855f7", bg: "rgba(168,85,247,0.12)" },
  { id: "services",  label: "الخدمات",           icon: Package,   color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  { id: "companies", label: "الشركات العالمية",  icon: TrendingUp,color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  { id: "tutorials", label: "الشروحات",          icon: BookOpen,  color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  { id: "news",      label: "الأخبار",           icon: Newspaper, color: "#ec4899", bg: "rgba(236,72,153,0.12)" },
];

function getCat(id: string) { return CATS.find(c => c.id === id) ?? CATS[0]; }
function readTime(content: string) { return Math.max(1, Math.ceil(content.replace(/<[^>]*>/g, "").split(/\s+/).length / 200)); }
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("ar-DZ", { year: "numeric", month: "long", day: "numeric" });
}

/* ── Featured card ──────────────────────────────────────────────────── */
function FeaturedCard({ post }: { post: Post }) {
  const cat = getCat(post.category);
  const Icon = cat.icon;
  return (
    <a
      href={`/blog/${post.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl transition-all duration-500 hover:-translate-y-1 md:flex-row"
      style={{
        background: "linear-gradient(135deg, rgba(14,10,26,0.98), rgba(8,6,18,0.99))",
        border: `1px solid ${cat.color}33`,
        boxShadow: `0 0 0 1px ${cat.color}10, 0 20px 60px rgba(0,0,0,0.5), 0 0 80px ${cat.color}10`,
        transform: "perspective(1200px) rotateX(1deg)",
      }}
    >
      {/* Left gradient panel */}
      <div
        className="flex min-h-48 items-center justify-center p-10 md:w-2/5"
        style={{ background: `linear-gradient(135deg, ${cat.color}18, ${cat.color}08)` }}
      >
        <div className="text-center">
          <div
            className="mx-auto mb-4 grid size-20 place-items-center rounded-3xl"
            style={{
              background: `${cat.color}18`,
              border: `1px solid ${cat.color}33`,
              boxShadow: `0 0 30px ${cat.color}22`,
              transform: "perspective(400px) rotateY(-6deg) rotateX(4deg)",
            }}
          >
            <Icon size={36} style={{ color: cat.color }} />
          </div>
          <span
            className="rounded-full px-3 py-1 text-xs font-black"
            style={{ background: `${cat.color}25`, color: cat.color, border: `1px solid ${cat.color}40` }}
          >
            {cat.label}
          </span>
          <div
            className="mt-3 flex items-center justify-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{ background: "rgba(255,215,0,0.12)", color: "#fbbf24" }}
          >
            <Star size={10} fill="currentColor" /> مقال مميز
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-7">
        <div>
          <h2 className="text-xl font-black leading-8 text-white transition-colors group-hover:text-lime-400 md:text-2xl">
            {post.title}
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/60">{post.excerpt}</p>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-white/40">
          <span className="flex items-center gap-1"><Clock size={12} /> {readTime(post.content)} دقائق قراءة</span>
          <span className="flex items-center gap-1"><Eye size={12} /> {post.views} مشاهدة</span>
          <span>{post.author}</span>
          <span>{fmtDate(post.created_at)}</span>
          <span
            className="mr-auto flex items-center gap-1 font-bold transition-colors"
            style={{ color: cat.color }}
          >
            اقرأ المقال <ArrowLeft size={13} />
          </span>
        </div>
      </div>
    </a>
  );
}

/* ── Post card ──────────────────────────────────────────────────────── */
function PostCard({ post }: { post: Post }) {
  const cat = getCat(post.category);
  const Icon = cat.icon;
  return (
    <a
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.border = `1px solid ${cat.color}33`;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 30px rgba(0,0,0,0.4), 0 0 30px ${cat.color}12`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.border = "1px solid rgba(255,255,255,0.07)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
      }}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${cat.color}, ${cat.color}44)` }} />

      {/* Card icon header */}
      <div className="flex items-center justify-between px-5 pt-5">
        <div
          className="grid size-12 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
          style={{ background: cat.bg, border: `1px solid ${cat.color}30` }}
        >
          <Icon size={20} style={{ color: cat.color }} />
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-black"
          style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.color}30` }}
        >
          {cat.label}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5 pt-3">
        <h3 className="text-base font-black leading-7 text-white transition-colors group-hover:text-lime-400">
          {post.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-white/55 line-clamp-3">{post.excerpt}</p>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map(t => (
              <span key={t} className="rounded-lg bg-white/6 px-2 py-0.5 text-[10px] text-white/45">
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Meta */}
        <div className="mt-4 flex items-center justify-between text-[11px] text-white/35">
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Clock size={11} /> {readTime(post.content)} د</span>
            <span className="flex items-center gap-1"><Eye size={11} /> {post.views}</span>
          </span>
          <span>{fmtDate(post.created_at)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[11px] text-white/35">{post.author}</span>
          <span className="text-[11px] font-bold" style={{ color: cat.color }}>اقرأ المزيد ←</span>
        </div>
      </div>
    </a>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Page
════════════════════════════════════════════════════════════════════════ */
export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("all");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (cat !== "all") params.set("category", cat);
    if (query) params.set("search", query);
    fetch(`${API_URL}/api/v1/blog?${params}`)
      .then(r => r.json())
      .then(data => { setPosts(Array.isArray(data) ? data : []); })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [cat, query]);

  function handleSearch(v: string) {
    setSearch(v);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setQuery(v), 400);
  }

  const featured  = posts.filter(p => p.featured);
  const rest      = posts.filter(p => !p.featured);

  return (
    <main className="min-h-screen bg-[#050508] text-white" dir="rtl">
      <SiteHeader />

      {/* Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute right-1/4 top-0 size-[600px] rounded-full bg-lime-400/5 blur-[150px]" />
        <div className="absolute left-1/4 top-32 size-[400px] rounded-full bg-purple-600/8 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/3 size-[300px] rounded-full bg-blue-500/6 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-12">
        {/* ── Hero ──────────────────────────────────────────────────── */}
        <div className="mb-14 text-center">
          <div
            className="mx-auto mb-6 grid size-20 place-items-center rounded-[22px]"
            style={{
              background: "linear-gradient(135deg, rgba(200,230,0,0.18), rgba(168,85,247,0.12))",
              border: "1px solid rgba(200,230,0,0.3)",
              boxShadow: "0 0 60px rgba(200,230,0,0.18), 0 20px 60px rgba(0,0,0,0.5)",
              transform: "perspective(500px) rotateX(8deg)",
            }}
          >
            <BookOpen size={38} className="text-lime-400 drop-shadow-[0_0_18px_rgba(200,230,0,0.7)]" />
          </div>
          <div className="pixel-logo mb-3 text-2xl font-black">
            <span className="text-purple-500">GROW</span><span className="text-lime-400">FOLO</span>
          </div>
          <h1 className="text-4xl font-black md:text-6xl">
            <span className="bg-gradient-to-l from-lime-400 to-green-500 bg-clip-text text-transparent">المدونة</span>
          </h1>
          <p className="mt-3 text-sm text-white/50">
            أحدث المقالات حول الذكاء الاصطناعي، الخدمات الرقمية، والشركات التقنية العالمية
          </p>

          {/* Stats */}
          <div className="mx-auto mt-7 flex max-w-sm justify-center gap-8">
            {[
              { val: String(posts.length), label: "مقال" },
              { val: String(CATS.length - 1), label: "تصنيف" },
              { val: "أسبوعياً", label: "تحديث" },
            ].map(({ val, label }) => (
              <div key={label} className="text-center">
                <p className="text-xl font-black text-white">{val}</p>
                <p className="text-xs text-white/40">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Search ────────────────────────────────────────────────── */}
        <div className="relative mb-8 mx-auto max-w-xl">
          <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35" />
          <input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="ابحث في المقالات..."
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pr-11 pl-5 text-sm text-white outline-none placeholder:text-white/30 focus:border-lime-500/50"
            style={{ backdropFilter: "blur(10px)" }}
          />
        </div>

        {/* ── Category filters ──────────────────────────────────────── */}
        <div className="mb-10 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
          {CATS.map(c => {
            const Icon = c.icon;
            const active = cat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className="flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition-all duration-200"
                style={{
                  background: active ? c.bg : "rgba(255,255,255,0.04)",
                  border: `1px solid ${active ? c.color + "50" : "rgba(255,255,255,0.07)"}`,
                  color: active ? c.color : "rgba(255,255,255,0.5)",
                  boxShadow: active ? `0 0 16px ${c.color}18` : "none",
                }}
              >
                <Icon size={14} /> {c.label}
              </button>
            );
          })}
        </div>

        {/* ── Loading ───────────────────────────────────────────────── */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="size-10 rounded-full border-2 border-lime-400 border-t-transparent animate-spin" />
          </div>
        )}

        {/* ── Empty ─────────────────────────────────────────────────── */}
        {!loading && posts.length === 0 && (
          <div className="py-20 text-center">
            <BookOpen size={40} className="mx-auto mb-3 text-white/20" />
            <p className="text-white/40">لا توجد مقالات حالياً</p>
          </div>
        )}

        {/* ── Featured ──────────────────────────────────────────────── */}
        {!loading && featured.length > 0 && !query && cat === "all" && (
          <div className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-white">
              <Star size={18} className="text-yellow-400" /> المقالات المميزة
            </h2>
            <div className="flex flex-col gap-4">
              {featured.map(p => <FeaturedCard key={p.id} post={p} />)}
            </div>
          </div>
        )}

        {/* ── Grid ──────────────────────────────────────────────────── */}
        {!loading && rest.length > 0 && (
          <div>
            {featured.length > 0 && !query && cat === "all" && (
              <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-white">
                <Wrench size={18} className="text-lime-400" /> جميع المقالات
              </h2>
            )}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map(p => <PostCard key={p.id} post={p} />)}
            </div>
          </div>
        )}

        {/* Show all posts in grid when filtered */}
        {!loading && (query || cat !== "all") && posts.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map(p => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </div>
    </main>
  );
}
