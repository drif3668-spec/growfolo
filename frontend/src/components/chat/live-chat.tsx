"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send, X, ChevronLeft } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const WS_URL  = API_URL.replace(/^http/, "ws");

/* ── Brand ────────────────────────────────────────────────────────────── */
const LIME      = "#c8e600";
const LIME_DARK = "#a3bd00";

/* ── Agent definitions ────────────────────────────────────────────────── */
type Status = "online" | "soon" | "offline";

const STATUS_CFG: Record<Status, { color: string; label: string }> = {
  online:  { color: "#22c55e", label: "متصل الآن"   },
  soon:    { color: "#f59e0b", label: "سيرد قريباً" },
  offline: { color: "#ef4444", label: "غير متصل"   },
};

const AGENTS = [
  {
    id: "finance", name: "عبد الكريم", initials: "ع.ك",
    dept: "قسم المالية",
    desc: "مختص في متابعة المدفوعات، تأكيد عمليات الدفع، مشاكل التحويل، الفواتير، والطلبات المالية.",
    img: "/team/agent-1.svg", ring: LIME, status: "online" as Status,
  },
  {
    id: "faq", name: "ياسمين", initials: "ي.م",
    dept: "قسم الأسئلة الشائعة",
    desc: "مختصة في الأسئلة العامة، طريقة الطلب، مدة التنفيذ، طرق الاستخدام، وسياسات المتجر.",
    img: "/team/agent-3.svg", ring: LIME, status: "online" as Status,
  },
  {
    id: "coordination", name: "أسامة", initials: "أ.س",
    dept: "قسم الوكلاء والتنسيق",
    desc: "مسؤول عن تنظيم الطلبات مع الوكلاء، متابعة التنسيق، وتوجيه العميل إلى القسم المناسب.",
    img: "/team/agent-2.svg", ring: "#a3c400", status: "soon" as Status,
  },
  {
    id: "support", name: "مروان", initials: "م.ر",
    dept: "قسم الدعم الفني",
    desc: "مختص في حل المشاكل التقنية، مشاكل الحسابات، أخطاء الطلبات، وتعطل الخدمات.",
    img: "/team/agent-4.svg", ring: "#a3c400", status: "online" as Status,
  },
] as const;

type Agent    = (typeof AGENTS)[number];
type Message  = { id: string; content: string; is_admin: boolean; created_at: string };
type Phase    = "closed" | "select" | "form" | "chat";
type UserInfo = { name: string; email: string; whatsapp: string };

/* ── localStorage helpers ─────────────────────────────────────────────── */
const LS = {
  sid:       (id: string) => localStorage.getItem(`gf_chat_sid_${id}`),
  setSid:    (id: string, v: string) => localStorage.setItem(`gf_chat_sid_${id}`, v),
  user:      (): UserInfo | null => { try { return JSON.parse(localStorage.getItem("gf_chat_user") ?? "null"); } catch { return null; } },
  setUser:   (u: UserInfo) => localStorage.setItem("gf_chat_user", JSON.stringify(u)),
  lastAgent: () => localStorage.getItem("gf_chat_agent"),
  setAgent:  (id: string) => localStorage.setItem("gf_chat_agent", id),
};

/* ── Beep ─────────────────────────────────────────────────────────────── */
function beep(hz: number, ms: number, vol = 0.2) {
  try {
    const ctx = new AudioContext(), osc = ctx.createOscillator(), g = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.type = "sine"; osc.frequency.setValueAtTime(hz, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(hz * 1.35, ctx.currentTime + ms / 1000 * 0.45);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + ms / 1000);
    osc.start(); osc.stop(ctx.currentTime + ms / 1000);
  } catch { /* blocked */ }
}

const fmt = (iso: string) => {
  try { return new Date(iso).toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" }); }
  catch { return ""; }
};

/* ── AgentAvatar ──────────────────────────────────────────────────────── */
function AgentAvatar({
  agent, size = 40, active = false, showStatus = false,
}: {
  agent: Agent; size?: number; active?: boolean; showStatus?: boolean;
}) {
  const [err, setErr] = useState(false);
  const sc = STATUS_CFG[agent.status];
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="size-full overflow-hidden rounded-full transition-all duration-300"
        style={{
          border: `2px solid ${active ? LIME : "rgba(255,255,255,0.12)"}`,
          boxShadow: active
            ? `0 0 0 2px #111, 0 0 0 4px ${LIME}70, 0 0 18px ${LIME}50`
            : "none",
        }}
      >
        {err ? (
          <div className="grid size-full place-items-center rounded-full"
            style={{ background: "#1e1e1e", color: LIME, fontSize: size * 0.27, fontWeight: 900 }}>
            {agent.initials}
          </div>
        ) : (
          <img src={agent.img} alt={agent.name}
            className="size-full object-cover object-top"
            onError={() => setErr(true)} />
        )}
      </div>
      {showStatus && (
        <span
          className="absolute bottom-0 right-0 rounded-full border-2 border-[#111]"
          style={{ width: size * 0.28, height: size * 0.28, background: sc.color, boxShadow: `0 0 6px ${sc.color}99` }}
        />
      )}
    </div>
  );
}

/* ── Panel wrapper ────────────────────────────────────────────────────── */
const PANEL: React.CSSProperties = {
  background: "linear-gradient(160deg,#0e0e0e,#111)",
  backdropFilter: "blur(32px) saturate(180%)",
  WebkitBackdropFilter: "blur(32px) saturate(180%)",
  border: "1px solid rgba(200,230,0,0.18)",
  boxShadow: "0 0 0 1px rgba(200,230,0,0.06),0 0 60px rgba(200,230,0,0.12),0 30px 80px rgba(0,0,0,0.75)",
};

/* ════════════════════════════════════════════════════════════════════════
   LiveChat
════════════════════════════════════════════════════════════════════════ */
export function LiveChat() {
  const [phase,        setPhase]        = useState<Phase>("closed");
  const [activeAgent,  setActiveAgent]  = useState<Agent | null>(null);
  const [msgCache,     setMsgCache]     = useState<Record<string, Message[]>>({});
  const [messages,     setMessages]     = useState<Message[]>([]);
  const [draft,        setDraft]        = useState("");
  const [form,         setForm]         = useState({ name: "", email: "", whatsapp: "" });
  const [formErr,      setFormErr]      = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [fading,       setFading]       = useState(false);
  const [visible,      setVisible]      = useState(false); // panel mounted animation

  const wsRef            = useRef<WebSocket | null>(null);
  const bottomRef        = useRef<HTMLDivElement | null>(null);
  const inputRef         = useRef<HTMLInputElement | null>(null);
  const pendingAgentRef  = useRef<Agent | null>(null);
  const fadeTimer        = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  /* Restore last agent from localStorage */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = LS.lastAgent();
    if (id) { const a = AGENTS.find(x => x.id === id); if (a) setActiveAgent(a); }
  }, []);

  /* Panel mount animation */
  useEffect(() => {
    if (phase !== "closed") { setTimeout(() => setVisible(true), 20); }
    else { setVisible(false); }
  }, [phase]);

  /* ── WebSocket connect ─────────────────────────────────────────── */
  const connectWs = useCallback((sid: string, agentId: string) => {
    wsRef.current?.close();
    const ws = new WebSocket(`${WS_URL}/api/v1/chat/ws/${sid}`);
    ws.onmessage = (e) => {
      try {
        const msg: Message = JSON.parse(e.data as string);
        if (msg.content.startsWith("🎯")) return;
        setMessages(p => [...p, msg]);
        setMsgCache(prev => ({ ...prev, [agentId]: [...(prev[agentId] ?? []), msg] }));
        beep(900, 250);
      } catch { /* ignore */ }
    };
    wsRef.current = ws;
  }, []);

  /* ── Create new session ────────────────────────────────────────── */
  const createSession = useCallback(async (agent: Agent, info: UserInfo): Promise<boolean> => {
    try {
      const r = await fetch(`${API_URL}/api/v1/chat/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(info),
      });
      if (!r.ok) return false;
      const { id: sid } = await r.json() as { id: string };
      LS.setSid(agent.id, sid);
      wsRef.current?.close();
      const ws = new WebSocket(`${WS_URL}/api/v1/chat/ws/${sid}`);
      ws.onmessage = (e) => {
        try {
          const msg: Message = JSON.parse(e.data as string);
          if (msg.content.startsWith("🎯")) return;
          setMessages(p => [...p, msg]);
          setMsgCache(prev => ({ ...prev, [agent.id]: [...(prev[agent.id] ?? []), msg] }));
          beep(900, 250);
        } catch { /* ignore */ }
      };
      ws.onopen = () => ws.send(JSON.stringify({ content: `🎯 الوكيل المختار: ${agent.name} | ${agent.dept}` }));
      wsRef.current = ws;
      return true;
    } catch { return false; }
  }, []);

  /* ── Open agent (load history + connect) ──────────────────────── */
  const openAgent = useCallback(async (agent: Agent) => {
    const sid = LS.sid(agent.id);
    /* show cached messages instantly */
    setMessages(msgCache[agent.id] ?? []);
    if (sid) {
      try {
        const r = await fetch(`${API_URL}/api/v1/chat/sessions/${sid}/messages`);
        if (r.ok) {
          const msgs = (await r.json() as Message[]).filter(m => !m.content.startsWith("🎯"));
          setMessages(msgs);
          setMsgCache(p => ({ ...p, [agent.id]: msgs }));
        }
      } catch { /* ignore */ }
      connectWs(sid, agent.id);
    }
  }, [msgCache, connectWs]);

  /* ── Select agent from selection screen ───────────────────────── */
  const selectAgent = useCallback(async (agent: Agent) => {
    setActiveAgent(agent);
    LS.setAgent(agent.id);
    const info = LS.user();
    const sid  = LS.sid(agent.id);

    if (sid) {
      await openAgent(agent);
      setPhase("chat");
    } else if (info) {
      const ok = await createSession(agent, info);
      if (ok) { setMessages([]); setPhase("chat"); }
    } else {
      pendingAgentRef.current = agent;
      setPhase("form");
    }
  }, [openAgent, createSession]);

  /* ── Switch agent inside chat ──────────────────────────────────── */
  const switchAgent = useCallback(async (agent: Agent) => {
    if (agent.id === activeAgent?.id) return;
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    setFading(true);
    wsRef.current?.close(); wsRef.current = null;

    fadeTimer.current = setTimeout(async () => {
      setActiveAgent(agent);
      LS.setAgent(agent.id);
      const info = LS.user();
      const sid  = LS.sid(agent.id);

      if (sid) {
        await openAgent(agent);
      } else if (info) {
        const ok = await createSession(agent, info);
        if (ok) setMessages([]);
      }
      setFading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }, 220);
  }, [activeAgent, openAgent, createSession]);

  /* ── Open floating button ──────────────────────────────────────── */
  const openChat = useCallback(async () => {
    const lastId = LS.lastAgent();
    const agent  = lastId ? AGENTS.find(a => a.id === lastId) ?? null : null;
    if (agent && LS.sid(agent.id)) {
      setActiveAgent(agent);
      await openAgent(agent);
      setPhase("chat");
    } else {
      setPhase("select");
    }
  }, [openAgent]);

  /* ── Submit form ───────────────────────────────────────────────── */
  const submitForm = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.whatsapp.trim()) {
      setFormErr("يرجى تعبئة جميع الحقول"); return;
    }
    setSubmitting(true); setFormErr("");
    const agent = pendingAgentRef.current ?? activeAgent;
    if (!agent) { setSubmitting(false); return; }
    const info: UserInfo = { name: form.name.trim(), email: form.email.trim(), whatsapp: form.whatsapp.trim() };
    const ok = await createSession(agent, info);
    if (ok) { LS.setUser(info); setMessages([]); setPhase("chat"); }
    else setFormErr("حدث خطأ، يرجى المحاولة مجدداً");
    setSubmitting(false);
  }, [form, activeAgent, createSession]);

  /* ── Send message ──────────────────────────────────────────────── */
  const send = useCallback(() => {
    if (!draft.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    const content = draft.trim();
    wsRef.current.send(JSON.stringify({ content }));
    const msg: Message = { id: crypto.randomUUID(), content, is_admin: false, created_at: new Date().toISOString() };
    setMessages(p => [...p, msg]);
    if (activeAgent) setMsgCache(p => ({ ...p, [activeAgent.id]: [...(p[activeAgent.id] ?? []), msg] }));
    setDraft("");
    beep(700, 180);
    inputRef.current?.focus();
  }, [draft, activeAgent]);

  const onKey = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  /* ══════════════════════════════════════════════════════════════════
     RENDER — closed
  ══════════════════════════════════════════════════════════════════ */
  if (phase === "closed") {
    return (
      <>
        <style>{`
          @keyframes lc-breathe {
            0%,100%{box-shadow:0 0 0 1px rgba(200,230,0,.3),0 8px 32px rgba(200,230,0,.35),0 2px 8px rgba(0,0,0,.5)}
            50%{box-shadow:0 0 0 1px rgba(200,230,0,.5),0 8px 40px rgba(200,230,0,.55),0 2px 12px rgba(0,0,0,.6)}
          }
          @keyframes lc-card-in {
            from{opacity:0;transform:translateY(18px) scale(.96)}
            to{opacity:1;transform:translateY(0) scale(1)}
          }
          @keyframes lc-panel-in {
            from{opacity:0;transform:translateY(14px) scale(.97)}
            to{opacity:1;transform:translateY(0) scale(1)}
          }
        `}</style>
        <button
          onClick={openChat}
          aria-label="فتح الدعم"
          className="fixed bottom-6 left-6 z-50 grid size-[62px] place-items-center transition-transform duration-200 hover:scale-110 active:scale-95"
          style={{
            background: `linear-gradient(145deg,${LIME},${LIME_DARK})`,
            borderRadius: "22px",
            animation: "lc-breathe 2.6s ease-in-out infinite",
          }}
        >
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
            <rect x="8" y="4" width="22" height="16" rx="7" fill="#000" opacity=".9"/>
            <rect x="4" y="11" width="22" height="16" rx="7" fill="#000"/>
            <path d="M8 27 L4 33 L14 27" fill="#000"/>
          </svg>
        </button>
      </>
    );
  }

  /* ══════════════════════════════════════════════════════════════════
     OPEN PANEL — shared styles
  ══════════════════════════════════════════════════════════════════ */
  const panelStyle: React.CSSProperties = {
    ...PANEL, borderRadius: "24px",
    maxHeight: "90vh",
    transition: "opacity .25s ease, transform .25s ease",
    opacity:   visible ? 1 : 0,
    transform: visible ? "translateY(0) scale(1)" : "translateY(14px) scale(.97)",
  };

  /* Shared top-bar ──────────────────────────────────────────────── */
  const TopBar = ({ back, onBack }: { back?: boolean; onBack?: () => void }) => (
    <div className="flex shrink-0 items-center justify-between px-5 py-4"
      style={{ background: "#111", borderBottom: "1px solid rgba(200,230,0,.12)" }}>
      <div className="flex items-center gap-3">
        {back && (
          <button onClick={onBack}
            className="grid size-7 place-items-center rounded-xl text-white/40 hover:text-white transition-colors">
            <ChevronLeft size={16}/>
          </button>
        )}
        <div className="grid size-10 shrink-0 place-items-center"
          style={{ background: LIME, borderRadius: "13px", boxShadow: `0 4px 14px rgba(200,230,0,.4)` }}>
          <svg width="22" height="22" viewBox="0 0 34 34" fill="none">
            <rect x="8" y="4" width="22" height="16" rx="7" fill="#000" opacity=".9"/>
            <rect x="4" y="11" width="22" height="16" rx="7" fill="#000"/>
            <path d="M8 27 L4 33 L14 27" fill="#000"/>
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-black text-white">Growfolo Support</h2>
          <p className="flex items-center gap-1.5 text-[11px] text-white/50">
            <span className="inline-block size-1.5 rounded-full" style={{ background: LIME, boxShadow: `0 0 6px ${LIME}` }}/>
            متصل الآن
          </p>
        </div>
      </div>
      <button onClick={() => setPhase("closed")}
        className="grid size-8 place-items-center rounded-xl text-white/40 hover:bg-white/8 hover:text-white transition-all">
        <X size={15}/>
      </button>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════════
     SELECT PHASE
  ══════════════════════════════════════════════════════════════════ */
  if (phase === "select") {
    return (
      <>
        <style>{`
          @keyframes lc-card-in {
            from{opacity:0;transform:translateY(18px) scale(.96)}
            to{opacity:1;transform:translateY(0) scale(1)}
          }
          @keyframes lc-panel-in {
            from{opacity:0;transform:translateY(14px) scale(.97)}
            to{opacity:1;transform:translateY(0) scale(1)}
          }
        `}</style>
        <aside className="fixed bottom-6 left-6 z-50 flex w-[360px] flex-col overflow-hidden" style={panelStyle}>
          <TopBar />

          {/* Header text */}
          <div className="px-5 pt-4 pb-2 shrink-0">
            <p className="text-sm font-black text-white">اختر وكيل الدعم</p>
            <p className="mt-0.5 text-[11px] text-white/40">تحدث مع الوكيل المناسب لطلبك مباشرة</p>
          </div>

          {/* Agent cards */}
          <div className="flex flex-col gap-2.5 overflow-y-auto px-4 pb-4">
            {AGENTS.map((agent, idx) => (
              <button
                key={agent.id}
                onClick={() => selectAgent(agent)}
                className="group flex w-full items-start gap-3.5 rounded-2xl border border-white/8 bg-white/3 p-3.5 text-right transition-all duration-200 hover:border-[rgba(200,230,0,.28)] hover:bg-[rgba(200,230,0,.04)]"
                style={{ animation: `lc-card-in .35s ease both`, animationDelay: `${idx * 70}ms` }}
              >
                {/* Avatar + status */}
                <div className="relative shrink-0 mt-0.5">
                  <AgentAvatar agent={agent} size={52} showStatus />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-black text-sm text-white">{agent.name}</p>
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold"
                      style={{ background: `${STATUS_CFG[agent.status].color}20`, color: STATUS_CFG[agent.status].color }}
                    >
                      {STATUS_CFG[agent.status].label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] font-bold" style={{ color: LIME }}>{agent.dept}</p>
                  <p className="mt-1.5 text-[11px] leading-[1.65] text-white/40">{agent.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="shrink-0 border-t border-white/4 py-2 text-center text-[10px] text-white/18">
            Growfolo Support · Powered by AI
          </div>
        </aside>
      </>
    );
  }

  /* ══════════════════════════════════════════════════════════════════
     FORM PHASE
  ══════════════════════════════════════════════════════════════════ */
  if (phase === "form") {
    const pending = pendingAgentRef.current ?? activeAgent;
    return (
      <aside className="fixed bottom-6 left-6 z-50 flex w-[360px] flex-col overflow-hidden" style={panelStyle}>
        <TopBar back onBack={() => setPhase("select")} />

        {/* Selected agent banner */}
        {pending && (
          <div className="mx-4 mt-4 flex items-center gap-3 rounded-2xl p-3"
            style={{ background: "rgba(200,230,0,.07)", border: "1px solid rgba(200,230,0,.18)" }}>
            <AgentAvatar agent={pending} size={42} active showStatus />
            <div>
              <p className="text-xs font-black text-white">{pending.name}</p>
              <p className="text-[11px]" style={{ color: LIME }}>{pending.dept}</p>
              <p className="flex items-center gap-1 text-[10px]" style={{ color: STATUS_CFG[pending.status].color }}>
                <span className="inline-block size-1.5 rounded-full" style={{ background: STATUS_CFG[pending.status].color }}/>
                {STATUS_CFG[pending.status].label}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={submitForm} className="flex flex-col gap-3 px-4 py-4">
          <p className="text-xs text-white/40">أدخل بياناتك لبدء المحادثة</p>
          {([
            { key: "name"     as const, label: "الاسم الكامل",       placeholder: "أحمد محمد",       type: "text"  },
            { key: "email"    as const, label: "البريد الإلكتروني",  placeholder: "you@example.com", type: "email" },
            { key: "whatsapp" as const, label: "رقم WhatsApp",        placeholder: "+213 5XX XXX XXX", type: "tel"  },
          ] as const).map(({ key, label, placeholder, type }) => (
            <label key={key} className="grid gap-1.5 text-[11px] font-semibold text-white/50">
              {label}
              <input
                required type={type} value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                className="rounded-2xl border border-white/8 bg-white/4 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/20 transition-all"
                onFocus={e  => { e.currentTarget.style.borderColor = `${LIME}55`; e.currentTarget.style.background = "rgba(200,230,0,.04)"; }}
                onBlur={e   => { e.currentTarget.style.borderColor = "rgba(255,255,255,.08)"; e.currentTarget.style.background = "rgba(255,255,255,.04)"; }}
              />
            </label>
          ))}
          {formErr && <p className="rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-2 text-xs text-red-400">{formErr}</p>}
          <button type="submit" disabled={submitting}
            className="mt-1 w-full rounded-2xl py-3 text-sm font-black text-black transition-all hover:opacity-90 active:scale-[.98] disabled:opacity-50"
            style={{ background: `linear-gradient(135deg,${LIME},${LIME_DARK})`, boxShadow: `0 4px 18px rgba(200,230,0,.35)` }}>
            {submitting ? "جارٍ الإنشاء..." : "بدء المحادثة ←"}
          </button>
        </form>
      </aside>
    );
  }

  /* ══════════════════════════════════════════════════════════════════
     CHAT PHASE
  ══════════════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @keyframes lc-msg-in {
          from{opacity:0;transform:translateY(8px) scale(.97)}
          to{opacity:1;transform:translateY(0) scale(1)}
        }
      `}</style>
      <aside className="fixed bottom-6 left-6 z-50 flex w-[360px] flex-col overflow-hidden" style={panelStyle}>

        {/* ── Active agent header ───────────────────────────────── */}
        <div className="shrink-0 px-5 py-4"
          style={{ background: "#111", borderBottom: "1px solid rgba(200,230,0,.12)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {activeAgent
                ? <AgentAvatar agent={activeAgent} size={42} active showStatus />
                : (
                  <div className="grid size-10 shrink-0 place-items-center"
                    style={{ background: LIME, borderRadius: "13px" }}>
                    <svg width="22" height="22" viewBox="0 0 34 34" fill="none">
                      <rect x="8" y="4" width="22" height="16" rx="7" fill="#000" opacity=".9"/>
                      <rect x="4" y="11" width="22" height="16" rx="7" fill="#000"/>
                      <path d="M8 27 L4 33 L14 27" fill="#000"/>
                    </svg>
                  </div>
                )
              }
              <div>
                <h2 className="text-sm font-black text-white">{activeAgent?.name ?? "Growfolo Support"}</h2>
                {activeAgent
                  ? <p className="text-[11px]" style={{ color: LIME }}>{activeAgent.dept}</p>
                  : <p className="flex items-center gap-1 text-[11px] text-white/50"><span className="inline-block size-1.5 rounded-full" style={{ background: LIME }}/> متصل الآن</p>
                }
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPhase("select")}
                className="rounded-xl border border-white/8 bg-white/4 px-2.5 py-1.5 text-[10px] font-bold text-white/50 hover:text-white transition-colors">
                تغيير الوكيل
              </button>
              <button onClick={() => setPhase("closed")}
                className="mr-1 grid size-8 place-items-center rounded-xl text-white/40 hover:bg-white/8 hover:text-white transition-all">
                <X size={15}/>
              </button>
            </div>
          </div>
        </div>

        {/* ── Agent switcher strip ──────────────────────────────── */}
        <div className="shrink-0 flex items-center gap-3 overflow-x-auto px-4 py-3 [scrollbar-width:none]"
          style={{ borderBottom: "1px solid rgba(255,255,255,.05)" }}>
          {AGENTS.map(agent => (
            <button key={agent.id} onClick={() => switchAgent(agent)}
              className="flex shrink-0 flex-col items-center gap-1.5 transition-all duration-200"
              style={{ opacity: agent.id === activeAgent?.id ? 1 : 0.55 }}>
              <AgentAvatar agent={agent} size={36} active={agent.id === activeAgent?.id} showStatus />
              <span className="text-[9px] font-bold whitespace-nowrap"
                style={{ color: agent.id === activeAgent?.id ? LIME : "rgba(255,255,255,.45)" }}>
                {agent.name}
              </span>
            </button>
          ))}
        </div>

        {/* ── Messages ─────────────────────────────────────────── */}
        <div
          className="flex flex-col gap-3 overflow-y-auto px-4 py-4 transition-opacity duration-200"
          style={{ minHeight: 160, maxHeight: 280, opacity: fading ? 0 : 1 }}
        >
          {messages.filter(m => !m.content.startsWith("🎯")).length === 0 && (
            <div className="self-start rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-6 text-white/85"
              style={{ background: "#1c1c1c", border: "1px solid rgba(255,255,255,.06)", animation: "lc-msg-in .3s ease" }}>
              {activeAgent
                ? `مرحباً! أنا ${activeAgent.name} من ${activeAgent.dept}. كيف يمكنني مساعدتك؟`
                : "مرحباً! كيف يمكنني مساعدتك اليوم؟"}
              <span className="mt-1 block text-[10px] text-white/30">{fmt(new Date().toISOString())}</span>
            </div>
          )}
          {messages.filter(m => !m.content.startsWith("🎯")).map((msg, i) => (
            <div key={msg.id} className={`flex ${msg.is_admin ? "justify-start" : "justify-end"}`}
              style={{ animation: `lc-msg-in .25s ease both`, animationDelay: `${Math.min(i, 6) * 30}ms` }}>
              {msg.is_admin && activeAgent && (
                <div className="mr-2 shrink-0 self-end">
                  <AgentAvatar agent={activeAgent} size={24} />
                </div>
              )}
              <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${msg.is_admin ? "rounded-tl-sm text-white/90" : "rounded-tr-sm text-black"}`}
                style={msg.is_admin
                  ? { background: "#1c1c1c", border: "1px solid rgba(255,255,255,.06)" }
                  : { background: `linear-gradient(135deg,${LIME},${LIME_DARK})`, boxShadow: `0 2px 12px rgba(200,230,0,.25)` }
                }>
                {msg.content}
                <span className="mt-0.5 block text-[10px]"
                  style={{ color: msg.is_admin ? "rgba(255,255,255,.3)" : "rgba(0,0,0,.45)" }}>
                  {fmt(msg.created_at)}
                </span>
              </div>
            </div>
          ))}
          <div ref={bottomRef}/>
        </div>

        {/* ── Input ────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center gap-2.5 px-3.5 py-3"
          style={{ borderTop: "1px solid rgba(255,255,255,.05)" }}>
          <input
            ref={inputRef} value={draft}
            onChange={e => setDraft(e.target.value)} onKeyDown={onKey}
            placeholder="اكتب رسالتك..."
            className="min-w-0 flex-1 rounded-2xl border border-white/8 bg-white/4 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/25 transition-all"
            onFocus={e => { e.currentTarget.style.borderColor = `${LIME}44`; }}
            onBlur={e  => { e.currentTarget.style.borderColor = "rgba(255,255,255,.08)"; }}
          />
          <button onClick={send} disabled={!draft.trim()} aria-label="إرسال"
            className="grid size-10 shrink-0 place-items-center rounded-2xl text-black transition-all hover:opacity-90 active:scale-95 disabled:opacity-30"
            style={{ background: `linear-gradient(135deg,${LIME},${LIME_DARK})`, boxShadow: `0 2px 12px rgba(200,230,0,.3)` }}>
            <Send size={15}/>
          </button>
        </div>

        <div className="shrink-0 border-t border-white/4 py-1.5 text-center text-[10px] text-white/18">
          Growfolo Support · Powered by AI
        </div>
      </aside>
    </>
  );
}
