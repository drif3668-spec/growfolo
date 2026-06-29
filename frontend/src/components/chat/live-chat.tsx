"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send, X, ChevronRight } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const WS_URL = API_URL.replace(/^http/, "ws");

/* ── Brand colors ─────────────────────────────────────────────────────── */
const LIME = "#c8e600";
const LIME_DARK = "#a3bd00";

/* ── Agents definition ────────────────────────────────────────────────── */
const AGENTS = [
  {
    id: "finance",
    name: "عبد الكريم",
    dept: "قسم المالية",
    desc: "مختص في متابعة المدفوعات، تأكيد عمليات الدفع، مشاكل التحويل، الفواتير، والطلبات المالية.",
    img: "/team/agent-1.svg",
    initials: "ع.ك",
    ring: "#c8e600",
  },
  {
    id: "faq",
    name: "ياسمين",
    dept: "قسم الأسئلة الشائعة",
    desc: "مختصة في الإجابة عن الأسئلة العامة، طريقة الطلب، مدة التنفيذ، وسياسات المتجر.",
    img: "/team/agent-3.svg",
    initials: "ي.م",
    ring: "#c8e600",
  },
  {
    id: "coordination",
    name: "أسامة",
    dept: "قسم الوكلاء والتنسيق",
    desc: "مسؤول عن تنظيم الطلبات مع الوكلاء، متابعة التنسيق، وتوجيه العميل إلى القسم المناسب.",
    img: "/team/agent-2.svg",
    initials: "أ.س",
    ring: "#a3c400",
  },
  {
    id: "support",
    name: "مروان",
    dept: "قسم المشاكل والدعم الفني",
    desc: "مختص في حل المشاكل التقنية، مشاكل الحسابات، أخطاء الطلبات، وتعطل الخدمات.",
    img: "/team/agent-4.svg",
    initials: "م.ر",
    ring: "#a3c400",
  },
] as const;

type Agent = (typeof AGENTS)[number];
type Message = { id: string; content: string; is_admin: boolean; created_at: string };
type Phase = "closed" | "select" | "form" | "chat";

/* ── Notification beep ────────────────────────────────────────────────── */
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

/* ── Panel style ──────────────────────────────────────────────────────── */
const PANEL: React.CSSProperties = {
  background: "linear-gradient(160deg, #0e0e0e 0%, #111111 100%)",
  backdropFilter: "blur(32px) saturate(180%)",
  WebkitBackdropFilter: "blur(32px) saturate(180%)",
  border: "1px solid rgba(200,230,0,0.18)",
  boxShadow: [
    "0 0 0 1px rgba(200,230,0,0.06)",
    "0 0 60px rgba(200,230,0,0.12)",
    "0 30px 80px rgba(0,0,0,0.75)",
  ].join(","),
};

/* ── Agent Avatar ─────────────────────────────────────────────────────── */
function AgentAvatar({ agent, size = 40 }: { agent: Agent; size?: number }) {
  const [err, setErr] = useState(false);
  return (
    <div
      className="shrink-0 overflow-hidden rounded-full"
      style={{
        width: size, height: size,
        border: `2px solid ${agent.ring}`,
        background: err ? "#1e1e1e" : undefined,
        display: "grid", placeItems: "center",
      }}
    >
      {err ? (
        <span style={{ fontSize: size * 0.28, fontWeight: 900, color: LIME }}>{agent.initials}</span>
      ) : (
        <img
          src={agent.img}
          alt={agent.name}
          className="size-full object-cover object-top"
          onError={() => setErr(true)}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Main component
════════════════════════════════════════════════════════════════════════ */
export function LiveChat() {
  const [phase, setPhase] = useState<Phase>("closed");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
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

  /* Restore session & agent from localStorage */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sid = localStorage.getItem("gf_chat_sid");
    const agentId = localStorage.getItem("gf_chat_agent");
    if (sid) setSessionId(sid);
    if (agentId) {
      const saved = AGENTS.find((a) => a.id === agentId);
      if (saved) setSelectedAgent(saved);
    }
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

  /* Open button → go to agent selection or existing chat */
  const openChat = useCallback(async () => {
    if (sessionId) {
      await loadHistory(sessionId);
      connectWs(sessionId);
      setPhase("chat");
    } else {
      setPhase("select");
    }
  }, [sessionId, loadHistory, connectWs]);

  /* Agent card click */
  const handleSelectAgent = useCallback((agent: Agent) => {
    setSelectedAgent(agent);
    localStorage.setItem("gf_chat_agent", agent.id);
    setPhase("form");
  }, []);

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
      const ws = new WebSocket(`${WS_URL}/api/v1/chat/ws/${data.id}`);
      ws.onmessage = (ev) => {
        try {
          const msg: Message = JSON.parse(ev.data as string);
          setMessages((p) => [...p, msg]);
          beep(900, 250);
        } catch { /* ignore */ }
      };
      wsRef.current = ws;
      /* Send agent info as first message so admin can see it */
      ws.onopen = () => {
        if (selectedAgent) {
          ws.send(JSON.stringify({
            content: `🎯 الوكيل المختار: ${selectedAgent.name} | ${selectedAgent.dept}`,
          }));
        }
      };
      setPhase("chat");
    } catch {
      setFormErr("حدث خطأ، يرجى المحاولة مجدداً");
    } finally {
      setSubmitting(false);
    }
  }, [form, selectedAgent]);

  /* Send message */
  const send = useCallback(() => {
    if (!draft.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ content: draft.trim() }));
    setMessages((p) => [...p, {
      id: crypto.randomUUID(), content: draft.trim(),
      is_admin: false, created_at: new Date().toISOString(),
    }]);
    setDraft("");
    beep(700, 180);
    inputRef.current?.focus();
  }, [draft]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  /* ── CLOSED — floating app-icon button ───────────────────────────── */
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
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
          <rect x="8" y="4" width="22" height="16" rx="7" fill="#000" opacity="0.9" />
          <rect x="4" y="11" width="22" height="16" rx="7" fill="#000" />
          <path d="M8 27 L4 33 L14 27" fill="#000" />
        </svg>
      </button>
    );
  }

  /* ── Shared header ────────────────────────────────────────────────── */
  const ChatHeader = ({ showBack, onBack }: { showBack?: boolean; onBack?: () => void }) => (
    <div
      className="px-5 pt-5 pb-4 shrink-0"
      style={{
        background: "linear-gradient(135deg, #111111 0%, #161616 100%)",
        borderBottom: "1px solid rgba(200,230,0,0.12)",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={onBack}
              className="grid size-7 place-items-center rounded-xl text-white/40 hover:text-white transition-colors"
              aria-label="رجوع"
            >
              <ChevronRight size={16} />
            </button>
          )}
          {/* Logo icon */}
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
              <span className="inline-block size-1.5 rounded-full" style={{ background: LIME, boxShadow: `0 0 6px ${LIME}` }} />
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
    </div>
  );

  /* ── OPEN panel wrapper ───────────────────────────────────────────── */
  return (
    <aside
      className="fixed bottom-6 left-6 z-50 flex w-[360px] flex-col overflow-hidden"
      style={{ ...PANEL, borderRadius: "24px", maxHeight: "90vh" }}
    >

      {/* ── AGENT SELECTION ─────────────────────────────────────────── */}
      {phase === "select" && (
        <>
          <ChatHeader />
          <div className="flex flex-col overflow-y-auto px-4 py-4 gap-2.5">
            <p className="mb-1 text-center text-xs text-white/40">اختر الوكيل المناسب لبدء المحادثة</p>
            {AGENTS.map((agent) => (
              <button
                key={agent.id}
                onClick={() => handleSelectAgent(agent)}
                className="group flex w-full items-start gap-3 rounded-2xl border border-white/8 bg-white/3 p-3.5 text-right transition-all duration-200 hover:border-[rgba(200,230,0,0.3)] hover:bg-white/6"
              >
                <AgentAvatar agent={agent} size={52} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-black text-sm text-white">{agent.name}</p>
                    <ChevronRight
                      size={14}
                      className="shrink-0 text-white/20 transition-all group-hover:text-[#c8e600] group-hover:translate-x-0.5"
                    />
                  </div>
                  <p className="mt-0.5 text-[11px] font-bold" style={{ color: LIME }}>{agent.dept}</p>
                  <p className="mt-1.5 text-[11px] leading-[1.6] text-white/45">{agent.desc}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="py-2 text-center text-[10px] text-white/18 border-t border-white/4">
            Growfolo Support · Powered by AI
          </div>
        </>
      )}

      {/* ── FORM ────────────────────────────────────────────────────── */}
      {phase === "form" && (
        <>
          <ChatHeader showBack onBack={() => setPhase("select")} />

          {/* Selected agent banner */}
          {selectedAgent && (
            <div
              className="flex items-center gap-3 px-4 py-3 mx-4 mt-4 rounded-2xl"
              style={{ background: "rgba(200,230,0,0.07)", border: "1px solid rgba(200,230,0,0.18)" }}
            >
              <AgentAvatar agent={selectedAgent} size={40} />
              <div>
                <p className="text-xs font-black text-white">{selectedAgent.name}</p>
                <p className="text-[11px]" style={{ color: LIME }}>{selectedAgent.dept}</p>
              </div>
            </div>
          )}

          <form onSubmit={submitForm} className="flex flex-col gap-3 px-4 py-4">
            <p className="text-xs text-white/40">أدخل بياناتك لبدء المحادثة</p>
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
                  onFocus={(e) => { e.currentTarget.style.borderColor = `${LIME}55`; e.currentTarget.style.background = "rgba(200,230,0,0.04)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                />
              </label>
            ))}
            {formErr && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-2 text-xs text-red-400">{formErr}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="mt-1 w-full rounded-2xl py-3 text-sm font-black text-black transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})`, boxShadow: `0 4px 18px rgba(200,230,0,0.35)` }}
            >
              {submitting ? "جارٍ الإنشاء..." : "بدء المحادثة ←"}
            </button>
          </form>
        </>
      )}

      {/* ── CHAT ────────────────────────────────────────────────────── */}
      {phase === "chat" && (
        <>
          {/* Header with selected agent */}
          <div
            className="px-5 pt-5 pb-4 shrink-0"
            style={{
              background: "linear-gradient(135deg, #111111 0%, #161616 100%)",
              borderBottom: "1px solid rgba(200,230,0,0.12)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedAgent ? (
                  <AgentAvatar agent={selectedAgent} size={42} />
                ) : (
                  <div
                    className="grid size-10 shrink-0 place-items-center"
                    style={{ background: LIME, borderRadius: "13px" }}
                  >
                    <svg width="22" height="22" viewBox="0 0 34 34" fill="none">
                      <rect x="8" y="4" width="22" height="16" rx="7" fill="#000" opacity="0.9" />
                      <rect x="4" y="11" width="22" height="16" rx="7" fill="#000" />
                      <path d="M8 27 L4 33 L14 27" fill="#000" />
                    </svg>
                  </div>
                )}
                <div>
                  <h2 className="text-sm font-black text-white">
                    {selectedAgent ? selectedAgent.name : "Growfolo Support"}
                  </h2>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-white/50">
                    {selectedAgent ? (
                      <span style={{ color: LIME }}>{selectedAgent.dept}</span>
                    ) : (
                      <>
                        <span className="inline-block size-1.5 rounded-full" style={{ background: LIME }} />
                        متصل الآن
                      </>
                    )}
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
          </div>

          {/* Messages */}
          <div
            className="flex flex-col gap-3 overflow-y-auto px-4 py-4"
            style={{ minHeight: 200, maxHeight: 320 }}
          >
            {messages.length === 0 && (
              <div
                className="self-start rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-6 text-white/85"
                style={{ background: "#1c1c1c", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                {selectedAgent
                  ? `مرحباً! أنا ${selectedAgent.name} من ${selectedAgent.dept}. كيف يمكنني مساعدتك؟`
                  : "مرحباً! كيف يمكنني مساعدتك اليوم؟"}
                <span className="mt-1 block text-[10px] text-white/30">{fmt(new Date().toISOString())}</span>
              </div>
            )}
            {messages.map((msg) => (
              /* hide the internal agent-routing message from user view */
              msg.content.startsWith("🎯 الوكيل المختار:") ? null : (
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
              )
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div
            className="flex items-center gap-2.5 px-3.5 py-3 shrink-0"
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
            className="py-1.5 shrink-0 text-center text-[10px] text-white/18"
            style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
          >
            Growfolo Support · Powered by AI
          </div>
        </>
      )}
    </aside>
  );
}
