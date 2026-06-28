"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const WS_URL = API_URL.replace(/^http/, "ws");

/* ── Support team avatars ─────────────────────────────────────────────── */
const TEAM = [
  { initials: "AK", gradient: "linear-gradient(135deg,#7c3aed,#6d28d9)", ring: "#a855f7" },
  { initials: "SR", gradient: "linear-gradient(135deg,#059669,#047857)", ring: "#10b981" },
  { initials: "LM", gradient: "linear-gradient(135deg,#db2777,#be185d)", ring: "#f472b6" },
  { initials: "NB", gradient: "linear-gradient(135deg,#2563eb,#1d4ed8)", ring: "#60a5fa" },
];

type Message = { id: string; content: string; is_admin: boolean; created_at: string };
type Phase = "closed" | "form" | "chat";

/* ── Notification sound via Web Audio API ────────────────────────────── */
function beep(hz: number, ms: number, vol = 0.22) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(hz, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(hz * 1.35, ctx.currentTime + ms * 0.001 * 0.45);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + ms * 0.001);
    osc.start();
    osc.stop(ctx.currentTime + ms * 0.001);
  } catch { /* browser may block autoplay */ }
}

/* ── Glassmorphism panel style ───────────────────────────────────────── */
const GLASS: React.CSSProperties = {
  background: "linear-gradient(145deg, rgba(14,10,26,0.96), rgba(8,6,18,0.98))",
  backdropFilter: "blur(28px) saturate(160%)",
  WebkitBackdropFilter: "blur(28px) saturate(160%)",
  border: "1px solid rgba(168,85,247,0.28)",
  boxShadow: [
    "0 0 0 1px rgba(168,85,247,0.08)",
    "0 0 80px rgba(168,85,247,0.22)",
    "0 0 40px rgba(59,130,246,0.12)",
    "0 25px 70px rgba(0,0,0,0.65)",
  ].join(","),
};

const HEADER_BG: React.CSSProperties = {
  background: "linear-gradient(135deg, rgba(124,58,237,0.55) 0%, rgba(59,130,246,0.35) 60%, rgba(6,182,212,0.2) 100%)",
  borderBottom: "1px solid rgba(168,85,247,0.18)",
};

/* ── Time formatter ──────────────────────────────────────────────────── */
const fmt = (iso: string) => {
  try { return new Date(iso).toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" }); }
  catch { return ""; }
};

/* ════════════════════════════════════════════════════════════════════════
   Main component
════════════════════════════════════════════════════════════════════════ */
export function LiveChat() {
  const [phase, setPhase] = useState<Phase>("closed");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [form, setForm] = useState({ name: "", email: "", whatsapp: "" });
  const [formErr, setFormErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  /* Scroll to latest message */
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  /* Restore session from localStorage */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("gf_chat_sid");
    if (saved) setSessionId(saved);
  }, []);

  /* Open WebSocket for a given session */
  const connectWs = useCallback((sid: string) => {
    wsRef.current?.close();
    const ws = new WebSocket(`${WS_URL}/api/v1/chat/ws/${sid}`);
    ws.onmessage = (e) => {
      try {
        const msg: Message = JSON.parse(e.data as string);
        setMessages((p) => [...p, msg]);
        beep(900, 250);
      } catch { /* ignore */ }
    };
    wsRef.current = ws;
  }, []);

  /* Load message history */
  const loadHistory = useCallback(async (sid: string) => {
    try {
      const r = await fetch(`${API_URL}/api/v1/chat/sessions/${sid}/messages`);
      if (r.ok) setMessages(await r.json() as Message[]);
    } catch { /* ignore */ }
  }, []);

  /* Open chat widget */
  const openChat = useCallback(async () => {
    if (sessionId) {
      await loadHistory(sessionId);
      connectWs(sessionId);
      setPhase("chat");
    } else {
      setPhase("form");
    }
  }, [sessionId, loadHistory, connectWs]);

  /* Submit contact form */
  const submitForm = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.whatsapp.trim()) {
      setFormErr("يرجى تعبئة جميع الحقول");
      return;
    }
    setSubmitting(true);
    setFormErr("");
    try {
      const r = await fetch(`${API_URL}/api/v1/chat/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error("server");
      const data = await r.json() as { id: string };
      localStorage.setItem("gf_chat_sid", data.id);
      setSessionId(data.id);
      connectWs(data.id);
      setPhase("chat");
    } catch {
      setFormErr("حدث خطأ، يرجى المحاولة مجدداً");
    } finally {
      setSubmitting(false);
    }
  }, [form, connectWs]);

  /* Send message */
  const send = useCallback(() => {
    if (!draft.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ content: draft.trim() }));
    setMessages((p) => [...p, { id: crypto.randomUUID(), content: draft.trim(), is_admin: false, created_at: new Date().toISOString() }]);
    setDraft("");
    beep(700, 180);
    inputRef.current?.focus();
  }, [draft]);

  const onKey = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  /* ── CLOSED — Circular breathing button ──────────────────────────── */
  if (phase === "closed") {
    return (
      <button
        onClick={openChat}
        aria-label="فتح الدعم"
        className="chat-breathe fixed bottom-6 left-6 z-50 grid size-16 place-items-center rounded-full text-white transition-transform duration-200 hover:scale-110"
        style={{
          background: "linear-gradient(135deg, rgba(124,58,237,0.92) 0%, rgba(59,130,246,0.85) 55%, rgba(6,182,212,0.8) 100%)",
          border: "1px solid rgba(255,255,255,0.18)",
        }}
      >
        <MessageCircle size={26} strokeWidth={2} />
      </button>
    );
  }

  /* ── OPEN — Chat window ──────────────────────────────────────────── */
  return (
    <aside
      className="fixed bottom-6 left-6 z-50 flex w-[350px] flex-col overflow-hidden rounded-3xl"
      style={GLASS}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={HEADER_BG} className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-black tracking-tight text-white">Growfolo Support</h2>
            <p className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-white/60">
              <span
                className="inline-block size-2 rounded-full bg-lime-400"
                style={{ boxShadow: "0 0 6px rgba(132,204,22,0.9)" }}
              />
              Online
            </p>
          </div>
          <button
            onClick={() => setPhase("closed")}
            className="grid size-8 place-items-center rounded-2xl text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="إغلاق"
          >
            <X size={16} />
          </button>
        </div>

        {/* Avatars */}
        <div className="mt-4 flex items-center gap-2">
          {TEAM.map((av) => (
            <div
              key={av.initials}
              className="grid size-10 shrink-0 place-items-center rounded-full text-[11px] font-black text-white"
              style={{
                background: av.gradient,
                boxShadow: `0 0 0 2px rgba(9,8,15,1), 0 0 0 3px ${av.ring}55`,
              }}
            >
              {av.initials}
            </div>
          ))}
          <p className="mr-1 text-[11px] leading-4 text-white/55">
            عادة نرد خلال<br />
            <span className="font-bold text-white/80">أقل من دقيقة</span>
          </p>
        </div>
      </div>

      {/* ── Contact Form (first visit) ──────────────────────────────── */}
      {phase === "form" && (
        <form onSubmit={submitForm} className="flex flex-col gap-3.5 px-5 py-5">
          <p className="text-sm text-white/55">أدخل بياناتك لبدء المحادثة</p>

          {(
            [
              { key: "name" as const, label: "الاسم الكامل", placeholder: "أحمد محمد", type: "text" },
              { key: "email" as const, label: "البريد الإلكتروني", placeholder: "you@example.com", type: "email" },
              { key: "whatsapp" as const, label: "رقم WhatsApp", placeholder: "+213 5XX XXX XXX", type: "tel" },
            ] as const
          ).map(({ key, label, placeholder, type }) => (
            <label key={key} className="grid gap-1.5 text-xs font-semibold text-white/65">
              {label}
              <input
                required
                type={type}
                value={form[key]}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 transition-colors focus:border-purple-500/50 focus:bg-white/8"
              />
            </label>
          ))}

          {formErr && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {formErr}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="neon-button mt-1 w-full rounded-2xl py-3 text-sm font-black text-black disabled:opacity-60"
          >
            {submitting ? "جارٍ الإنشاء..." : "متابعة →"}
          </button>
        </form>
      )}

      {/* ── Messages ───────────────────────────────────────────────── */}
      {phase === "chat" && (
        <>
          <div
            className="flex flex-col gap-3 overflow-y-auto px-4 py-4"
            style={{ minHeight: 200, maxHeight: 320 }}
          >
            {messages.length === 0 && (
              <div className="rounded-2xl bg-white/6 px-3 py-2.5 text-sm text-white/80">
                مرحباً! كيف يمكنني مساعدتك اليوم؟
                <span className="mt-0.5 block text-[10px] text-white/35">{fmt(new Date().toISOString())}</span>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.is_admin ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-6 ${
                    msg.is_admin
                      ? "rounded-tr-sm bg-white/8 text-white"
                      : "rounded-tl-sm text-white"
                  }`}
                  style={
                    !msg.is_admin
                      ? { background: "linear-gradient(135deg, rgba(124,58,237,0.85), rgba(59,130,246,0.7))" }
                      : undefined
                  }
                >
                  {msg.content}
                  <span className="mt-0.5 block text-[10px] text-white/35">{fmt(msg.created_at)}</span>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            className="flex items-center gap-2 px-3 py-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKey}
              autoFocus
              placeholder="اكتب رسالتك..."
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-purple-500/40"
            />
            <button
              onClick={send}
              disabled={!draft.trim()}
              className="grid size-10 shrink-0 place-items-center rounded-2xl text-white disabled:opacity-35"
              style={{
                background: "linear-gradient(135deg, rgba(124,58,237,0.9), rgba(59,130,246,0.8))",
                boxShadow: "0 0 16px rgba(124,58,237,0.4)",
              }}
              aria-label="إرسال"
            >
              <Send size={15} />
            </button>
          </div>

          <div
            className="py-1.5 text-center text-[10px] text-white/22"
            style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
          >
            Growfolo Support · Powered by AI
          </div>
        </>
      )}
    </aside>
  );
}
