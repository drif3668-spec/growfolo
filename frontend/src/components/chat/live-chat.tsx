"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X, ChevronDown } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const WS_URL = API_URL.replace(/^http/, "ws");

const SUPPORT_AVATARS = [
  { initials: "أح", color: "from-purple-500 to-purple-700" },
  { initials: "سا", color: "from-emerald-500 to-teal-600" },
  { initials: "لي", color: "from-pink-500 to-rose-600" },
  { initials: "نا", color: "from-blue-500 to-indigo-600" },
];

type Message = {
  id: string;
  content: string;
  is_admin: boolean;
  created_at: string;
};

type Phase = "closed" | "form" | "chat";

function playTone(freq: number, duration: number) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.4, ctx.currentTime + duration * 0.4);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    /* browser may block autoplay */
  }
}

export function LiveChat() {
  const [phase, setPhase] = useState<Phase>("closed");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", whatsapp: "" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("gf_chat_session");
    if (saved) {
      setSessionId(saved);
      setPhase("closed");
    }
  }, []);

  const connectWs = useCallback((sid: string) => {
    if (wsRef.current) wsRef.current.close();
    const ws = new WebSocket(`${WS_URL}/api/v1/chat/ws/${sid}`);
    ws.onmessage = (event) => {
      try {
        const msg: Message = JSON.parse(event.data);
        setMessages((prev) => [...prev, msg]);
        playTone(900, 0.25);
      } catch {}
    };
    wsRef.current = ws;
  }, []);

  const loadHistory = useCallback(async (sid: string) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/chat/sessions/${sid}/messages`);
      if (res.ok) {
        const data: Message[] = await res.json();
        setMessages(data);
      }
    } catch {}
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

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name.trim() || !formData.email.trim() || !formData.whatsapp.trim()) {
        setFormError("يرجى تعبئة جميع الحقول");
        return;
      }
      setSubmitting(true);
      setFormError("");
      try {
        const res = await fetch(`${API_URL}/api/v1/chat/sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("فشل إنشاء الجلسة");
        const data = await res.json();
        localStorage.setItem("gf_chat_session", data.id);
        setSessionId(data.id);
        connectWs(data.id);
        setPhase("chat");
      } catch {
        setFormError("حدث خطأ، يرجى المحاولة مجدداً");
      } finally {
        setSubmitting(false);
      }
    },
    [formData, connectWs]
  );

  const sendMessage = useCallback(() => {
    if (!draft.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ content: draft.trim() }));
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), content: draft.trim(), is_admin: false, created_at: new Date().toISOString() },
    ]);
    setDraft("");
    playTone(700, 0.18);
    inputRef.current?.focus();
  }, [draft]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  if (phase === "closed") {
    return (
      <button
        onClick={openChat}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-3 rounded-full bg-gradient-to-r from-purple-600 to-purple-800 px-5 py-3.5 text-white shadow-[0_0_28px_rgba(168,85,247,0.6)] transition-all hover:scale-105 hover:shadow-[0_0_38px_rgba(168,85,247,0.8)]"
        aria-label="فتح الشات"
      >
        <MessageCircle size={22} />
        <span className="text-sm font-bold">تواصل معنا</span>
        <span className="flex h-2.5 w-2.5 rounded-full bg-lime-400 ring-2 ring-lime-400/30" />
      </button>
    );
  }

  return (
    <aside className="fixed bottom-6 left-6 z-50 flex w-[340px] flex-col overflow-hidden rounded-3xl border border-purple-500/30 bg-[#09080f]/98 shadow-[0_0_48px_rgba(168,85,247,0.45)] backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/8 bg-gradient-to-r from-purple-800/60 to-purple-900/60 p-4">
        <div>
          <div className="flex -space-x-2 rtl:space-x-reverse mb-2">
            {SUPPORT_AVATARS.map((av) => (
              <div
                key={av.initials}
                className={`grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br ${av.color} text-[10px] font-bold text-white ring-2 ring-[#09080f]`}
              >
                {av.initials}
              </div>
            ))}
          </div>
          <p className="text-xs font-semibold text-white">
            <span className="ml-1 inline-block size-2 rounded-full bg-lime-400 align-middle" />
            فريق الدعم متصل الآن
          </p>
        </div>
        <button
          onClick={() => setPhase("closed")}
          className="grid size-9 place-items-center rounded-2xl bg-white/8 text-white/70 hover:bg-white/15 hover:text-white"
          aria-label="إغلاق"
        >
          <ChevronDown size={18} />
        </button>
      </div>

      {phase === "form" && (
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 p-5">
          <div className="text-center">
            <h3 className="text-base font-black text-white">مرحباً! 👋</h3>
            <p className="mt-1 text-xs text-white/55">أدخل بياناتك لبدء المحادثة مع فريق الدعم</p>
          </div>

          <label className="grid gap-1.5 text-xs font-semibold text-white/75">
            الاسم الكامل
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-purple-500/60"
              placeholder="مثال: أحمد محمد"
            />
          </label>

          <label className="grid gap-1.5 text-xs font-semibold text-white/75">
            البريد الإلكتروني
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-purple-500/60"
              placeholder="example@email.com"
            />
          </label>

          <label className="grid gap-1.5 text-xs font-semibold text-white/75">
            رقم واتساب
            <input
              required
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => setFormData((p) => ({ ...p, whatsapp: e.target.value }))}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-purple-500/60"
              placeholder="+213 xxx xxx xxx"
            />
          </label>

          {formError && <p className="rounded-xl bg-red-500/15 px-3 py-2 text-xs text-red-400">{formError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="neon-button mt-1 rounded-2xl py-3 text-sm font-black text-black disabled:opacity-60"
          >
            {submitting ? "جارٍ الإنشاء..." : "ابدأ المحادثة →"}
          </button>
        </form>
      )}

      {phase === "chat" && (
        <>
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4" style={{ maxHeight: 340, minHeight: 220 }}>
            {messages.length === 0 && (
              <div className="rounded-2xl bg-white/6 p-3 text-sm text-white/80">
                مرحبا! كيف يمكنني مساعدتك اليوم؟
                <span className="mt-1 block text-[10px] text-white/40">{formatTime(new Date().toISOString())}</span>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.is_admin ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-6 ${
                    msg.is_admin
                      ? "rounded-tr-sm bg-white/8 text-white"
                      : "rounded-tl-sm bg-purple-600/80 text-white"
                  }`}
                >
                  {msg.content}
                  <span className="mt-0.5 block text-[10px] text-white/40 text-left">{formatTime(msg.created_at)}</span>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="flex items-center gap-2 border-t border-white/8 p-3">
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-purple-500/50"
              placeholder="اكتب رسالتك..."
              autoFocus
            />
            <button
              onClick={sendMessage}
              disabled={!draft.trim()}
              className="grid size-10 shrink-0 place-items-center rounded-2xl bg-purple-600 text-white shadow-[0_0_16px_rgba(168,85,247,0.5)] disabled:opacity-40"
              aria-label="إرسال"
            >
              <Send size={16} />
            </button>
          </div>
          <div className="py-1.5 text-center text-[10px] text-white/25">مدعوم بـ Growfolo Support</div>
        </>
      )}
    </aside>
  );
}
