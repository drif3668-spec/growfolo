"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send, X, MessageSquare } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const WS_URL = API_URL.replace(/^http/, "ws");

const TEAM = [
  { initials: "AK", bg: "#1a1a1a", ring: "#c8e600" },
  { initials: "SR", bg: "#1a1a1a", ring: "#a3c400" },
  { initials: "LM", bg: "#1a1a1a", ring: "#c8e600" },
  { initials: "NB", bg: "#1a1a1a", ring: "#a3c400" },
];

type Message = { id: string; content: string; is_admin: boolean; created_at: string };
type Phase = "closed" | "form" | "chat";

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

const fmt = (iso: string) => {
  try { return new Date(iso).toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" }); }
  catch { return ""; }
};

/* ── LIME brand color ─────────────────────────────────────────────────── */
const LIME = "#c8e600";
const LIME_DARK = "#a3bd00";

/* ── Panel styles ─────────────────────────────────────────────────────── */
const PANEL: React.CSSProperties = {
  background: "linear-gradient(160deg, #0e0e0e 0%, #111111 100%)",
  backdropFilter: "blur(32px) saturate(180%)",
  WebkitBackdropFilter: "blur(32px) saturate(180%)",
  border: "1px solid rgba(200,230,0,0.18)",
  boxShadow: [
    `0 0 0 1px rgba(200,230,0,0.06)`,
    `0 0 60px rgba(200,230,0,0.12)`,
    "0 30px 80px rgba(0,0,0,0.75)",
  ].join(","),
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

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("gf_chat_sid");
    if (saved) setSessionId(saved);
  }, []);

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

  const loadHistory = useCallback(async (sid: string) => {
    try {
      const r = await fetch(`${API_URL}/api/v1/chat/sessions/${sid}/messages`);
      if (r.ok) setMessages(await r.json() as Message[]);
    } catch { /* ignore */ }
  }, []);

  const openChat = useCallback(async () => {
    if (sessionId) {
      await loadHistory(sessionId);
      connectWs(sessionId);
      setPhase("chat");
    } else {
      setPhase("form");
    }
  }, [sessionId, loadHistory, connectWs]);

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

  const send = useCallback(() => {
    if (!draft.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ content: draft.trim() }));
    setMessages((p) => [...p, { id: crypto.randomUUID(), content: draft.trim(), is_admin: false, created_at: new Date().toISOString() }]);
    setDraft("");
    beep(700, 180);
    inputRef.current?.focus();
  }, [draft]);

  const onKey = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  /* ── CLOSED — App-icon style button ─────────────────────────────── */
  if (phase === "closed") {
    return (
      <button
        onClick={openChat}
        aria-label="فتح الدعم"
        className="chat-breathe fixed bottom-6 left-6 z-50 grid size-[62px] place-items-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: `linear-gradient(145deg, ${LIME} 0%, ${LIME_DARK} 100%)`,
          borderRadius: "22px",
          boxShadow: `0 0 0 1px rgba(200,230,0,0.3), 0 8px 32px rgba(200,230,0,0.35), 0 2px 8px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Two overlapping chat bubbles — matching the logo */}
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
          {/* Back bubble */}
          <rect x="8" y="4" width="22" height="16" rx="7" fill="#000" opacity="0.9" />
          {/* Front bubble */}
          <rect x="4" y="11" width="22" height="16" rx="7" fill="#000" />
          {/* Tail */}
          <path d="M8 27 L4 33 L14 27" fill="#000" />
        </svg>
      </button>
    );
  }

  /* ── OPEN — Chat window ──────────────────────────────────────────── */
  return (
    <aside
      className="fixed bottom-6 left-6 z-50 flex w-[360px] flex-col overflow-hidden"
      style={{ ...PANEL, borderRadius: "24px" }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div
        className="px-5 pt-5 pb-4"
        style={{
          background: "linear-gradient(135deg, #111111 0%, #161616 100%)",
          borderBottom: "1px solid rgba(200,230,0,0.12)",
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Mini logo icon */}
            <div
              className="grid size-10 shrink-0 place-items-center"
              style={{ background: LIME, borderRadius: "13px", boxShadow: `0 4px 14px rgba(200,230,0,0.4)` }}
            >
              <svg width="22" height="22" viewBox="0 0 34 34" fill="none">
                <rect x="8" y="4" width="22" height="16" rx="7" fill="#000" opacity="0.9" />
                <rect x="4" y="11" width="22" height="16" rx="7" fill="#000" />
                <path d="M8 27 L4 33 L14 27" fill="#000" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight text-white">Growfolo Support</h2>
              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-white/50">
                <span
                  className="inline-block size-1.5 rounded-full"
                  style={{ background: LIME, boxShadow: `0 0 6px ${LIME}` }}
                />
                متصل الآن
              </p>
            </div>
          </div>
          <button
            onClick={() => setPhase("closed")}
            className="grid size-8 place-items-center rounded-xl text-white/40 transition-all hover:bg-white/8 hover:text-white"
            aria-label="إغلاق"
          >
            <X size={15} />
          </button>
        </div>

        {/* Avatars strip */}
        <div className="mt-4 flex items-center gap-2">
          {TEAM.map((av, idx) => (
            <div
              key={av.initials}
              className="grid size-9 shrink-0 place-items-center rounded-full text-[10px] font-black"
              style={{
                background: "#1e1e1e",
                color: LIME,
                border: `2px solid ${av.ring}`,
                marginLeft: idx > 0 ? "-8px" : "0",
                zIndex: TEAM.length - idx,
                boxShadow: `0 0 0 1px #111`,
              }}
            >
              {av.initials}
            </div>
          ))}
          <p className="mr-3 text-[11px] leading-4 text-white/45">
            نرد عادةً خلال
            <span className="block font-bold" style={{ color: LIME }}>أقل من دقيقة</span>
          </p>
        </div>
      </div>

      {/* ── Contact Form ────────────────────────────────────────────── */}
      {phase === "form" && (
        <form onSubmit={submitForm} className="flex flex-col gap-3 px-5 py-5">
          <p className="mb-1 text-xs text-white/40">أدخل بياناتك لبدء المحادثة</p>

          {(
            [
              { key: "name" as const, label: "الاسم الكامل", placeholder: "أحمد محمد", type: "text" },
              { key: "email" as const, label: "البريد الإلكتروني", placeholder: "you@example.com", type: "email" },
              { key: "whatsapp" as const, label: "رقم WhatsApp", placeholder: "+213 5XX XXX XXX", type: "tel" },
            ] as const
          ).map(({ key, label, placeholder, type }) => (
            <label key={key} className="grid gap-1.5 text-[11px] font-semibold text-white/50">
              {label}
              <input
                required
                type={type}
                value={form[key]}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                className="rounded-2xl border border-white/8 bg-white/4 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/20 transition-all"
                style={{ "--tw-ring-color": LIME } as React.CSSProperties}
                onFocus={(e) => { e.currentTarget.style.borderColor = `${LIME}55`; e.currentTarget.style.background = "rgba(200,230,0,0.04)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              />
            </label>
          ))}

          {formErr && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-2 text-xs text-red-400">
              {formErr}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 w-full rounded-2xl py-3 text-sm font-black text-black transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})`, boxShadow: `0 4px 18px rgba(200,230,0,0.35)` }}
          >
            {submitting ? "جارٍ الإنشاء..." : "متابعة ←"}
          </button>
        </form>
      )}

      {/* ── Messages ─────────────────────────────────────────────────── */}
      {phase === "chat" && (
        <>
          <div
            className="flex flex-col gap-3 overflow-y-auto px-4 py-4"
            style={{ minHeight: 200, maxHeight: 320 }}
          >
            {messages.length === 0 && (
              <div
                className="self-start rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-6 text-white/85"
                style={{ background: "#1c1c1c", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                مرحباً! كيف يمكنني مساعدتك اليوم؟
                <span className="mt-1 block text-[10px] text-white/30">{fmt(new Date().toISOString())}</span>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.is_admin ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
                    msg.is_admin ? "rounded-tl-sm text-white/90" : "rounded-tr-sm text-black"
                  }`}
                  style={
                    msg.is_admin
                      ? { background: "#1c1c1c", border: "1px solid rgba(255,255,255,0.06)" }
                      : { background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})`, boxShadow: `0 2px 12px rgba(200,230,0,0.25)` }
                  }
                >
                  {msg.content}
                  <span
                    className="mt-0.5 block text-[10px]"
                    style={{ color: msg.is_admin ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.45)" }}
                  >
                    {fmt(msg.created_at)}
                  </span>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div
            className="flex items-center gap-2.5 px-3.5 py-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKey}
              autoFocus
              placeholder="اكتب رسالتك..."
              className="min-w-0 flex-1 rounded-2xl border border-white/8 bg-white/4 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/25 transition-all"
              onFocus={(e) => { e.currentTarget.style.borderColor = `${LIME}44`; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
            />
            <button
              onClick={send}
              disabled={!draft.trim()}
              aria-label="إرسال"
              className="grid size-10 shrink-0 place-items-center rounded-2xl text-black transition-all hover:opacity-90 active:scale-95 disabled:opacity-30"
              style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})`, boxShadow: `0 2px 12px rgba(200,230,0,0.3)` }}
            >
              <Send size={15} />
            </button>
          </div>

          <div
            className="py-1.5 text-center text-[10px] text-white/18"
            style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
          >
            Growfolo Support · Powered by AI
          </div>
        </>
      )}
    </aside>
  );
}
