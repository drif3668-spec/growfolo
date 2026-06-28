"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, Package, ReceiptText, Send, ShieldCheck, Users, CheckCircle } from "lucide-react";
import { orders, products } from "@/lib/mock-data";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const WS_URL = API_URL.replace(/^http/, "ws");

type ChatSession = {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  is_resolved: boolean;
  created_at: string;
  last_message: string | null;
};

type ChatMessage = {
  id: string;
  content: string;
  is_admin: boolean;
  created_at: string;
  session_id?: string;
};

type NavSection = "orders" | "products" | "chat" | "settings";

export function AdminDashboard() {
  const [nav, setNav] = useState<NavSection>("orders");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const activeSessionRef = useRef<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    activeSessionRef.current = activeSession;
  }, [activeSession]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load sessions
  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/chat/sessions`);
      if (res.ok) setSessions(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    if (nav === "chat") loadSessions();
  }, [nav, loadSessions]);

  // Admin WebSocket
  useEffect(() => {
    if (nav !== "chat") return;

    const ws = new WebSocket(`${WS_URL}/api/v1/chat/admin/ws`);
    ws.onmessage = (event) => {
      try {
        const msg: ChatMessage = JSON.parse(event.data);
        setMessages((prev) =>
          activeSessionRef.current?.id === msg.session_id ? [...prev, msg] : prev
        );
        setSessions((prev) =>
          prev.map((s) =>
            s.id === msg.session_id ? { ...s, last_message: msg.content } : s
          )
        );
      } catch {}
    };
    wsRef.current = ws;
    return () => ws.close();
  }, [nav]);

  const openSession = useCallback(
    async (session: ChatSession) => {
      setActiveSession(session);
      setMessages([]);
      try {
        const res = await fetch(`${API_URL}/api/v1/chat/sessions/${session.id}/messages`);
        if (res.ok) setMessages(await res.json());
      } catch {}
    },
    []
  );

  const sendReply = useCallback(() => {
    if (!reply.trim() || !activeSession || !wsRef.current) return;
    if (wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ session_id: activeSession.id, content: reply.trim() }));
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        content: reply.trim(),
        is_admin: true,
        created_at: new Date().toISOString(),
      },
    ]);
    setReply("");
  }, [reply, activeSession]);

  const resolveSession = useCallback(async (id: string) => {
    await fetch(`${API_URL}/api/v1/chat/sessions/${id}/resolve`, { method: "PATCH" });
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, is_resolved: true } : s)));
    if (activeSession?.id === id) setActiveSession((prev) => prev ? { ...prev, is_resolved: true } : prev);
  }, [activeSession?.id]);

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("ar-DZ", { day: "numeric", month: "short" });
    } catch {
      return "";
    }
  };

  return (
    <main className="flex min-h-screen bg-[#0d0b14] text-white">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 right-0 w-64 border-l border-white/8 bg-[#09080f] p-5">
        <div className="pixel-logo mb-8 text-2xl font-black">
          <span className="text-purple-500">GROW</span>
          <span className="text-lime-400">FOLO</span>
          <span className="block text-xs font-normal text-white/40 mt-0.5">لوحة التحكم</span>
        </div>
        <nav className="grid gap-1 text-sm">
          {(
            [
              { id: "orders", label: "الطلبات", icon: ReceiptText },
              { id: "products", label: "المنتجات", icon: Package },
              { id: "chat", label: "الشات المباشر", icon: MessageCircle },
              { id: "settings", label: "الإعدادات", icon: ShieldCheck },
            ] as { id: NavSection; label: string; icon: typeof ReceiptText }[]
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setNav(id)}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-right font-semibold transition-colors ${
                nav === id
                  ? "bg-purple-600/20 text-purple-300"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={17} />
              {label}
              {id === "chat" && sessions.filter((s) => !s.is_resolved).length > 0 && (
                <span className="mr-auto grid size-5 place-items-center rounded-full bg-purple-600 text-[10px] font-bold text-white">
                  {sessions.filter((s) => !s.is_resolved).length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 pr-64">
        <div className="mx-auto max-w-5xl p-8">
          {/* Dashboard Stats */}
          {nav === "orders" && (
            <>
              <h2 className="mb-6 text-2xl font-black">لوحة التحكم</h2>
              <div className="mb-6 grid gap-4 md:grid-cols-3">
                <StatCard icon={<ReceiptText size={20} />} label="الطلبات" value={orders.length.toString()} color="text-purple-400" />
                <StatCard icon={<Package size={20} />} label="المنتجات" value={products.length.toString()} color="text-blue-400" />
                <StatCard icon={<Users size={20} />} label="المحادثات" value={sessions.length.toString()} color="text-lime-400" />
              </div>
              <div className="rounded-3xl border border-white/8 bg-[#0d0b14]">
                <div className="border-b border-white/8 px-5 py-4 font-black">أحدث الطلبات</div>
                {orders.map((order) => (
                  <div key={order.id} className="grid gap-2 border-b border-white/6 px-5 py-4 text-sm md:grid-cols-4">
                    <span className="text-white/50 font-mono text-xs">{order.id}</span>
                    <span className="font-semibold">{order.customerName}</span>
                    <span className={`text-xs rounded-full px-2 py-1 w-fit ${
                      order.status === "paid" ? "bg-lime-500/15 text-lime-400" :
                      order.status === "pending_proof" ? "bg-yellow-500/15 text-yellow-400" :
                      "bg-blue-500/15 text-blue-400"
                    }`}>{order.status}</span>
                    <span className="font-black">${order.total}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Chat Section */}
          {nav === "chat" && (
            <>
              <h2 className="mb-6 text-2xl font-black">الشات المباشر</h2>
              <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
                {/* Sessions List */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={loadSessions}
                    className="mb-1 rounded-xl bg-white/5 px-3 py-1.5 text-xs text-white/50 hover:bg-white/8 text-right"
                  >
                    تحديث المحادثات ↻
                  </button>
                  {sessions.length === 0 && (
                    <div className="rounded-2xl border border-white/8 p-5 text-center text-sm text-white/40">
                      لا توجد محادثات بعد
                    </div>
                  )}
                  {sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => openSession(session)}
                      className={`flex flex-col gap-1 rounded-2xl border p-4 text-right transition-colors ${
                        activeSession?.id === session.id
                          ? "border-purple-500/40 bg-purple-600/10"
                          : "border-white/8 bg-white/3 hover:bg-white/6"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-white truncate">{session.name}</span>
                        {session.is_resolved ? (
                          <CheckCircle size={13} className="text-lime-400 shrink-0" />
                        ) : (
                          <span className="size-2 shrink-0 rounded-full bg-purple-400" />
                        )}
                      </div>
                      <span className="text-xs text-white/40 truncate">{session.email}</span>
                      {session.last_message && (
                        <span className="text-xs text-white/55 truncate">{session.last_message}</span>
                      )}
                      <span className="text-[10px] text-white/30">{formatDate(session.created_at)}</span>
                    </button>
                  ))}
                </div>

                {/* Conversation */}
                {activeSession ? (
                  <div className="flex flex-col rounded-3xl border border-white/8 bg-[#0d0b14] overflow-hidden">
                    {/* Session Header */}
                    <div className="flex items-center justify-between gap-3 border-b border-white/8 px-5 py-4">
                      <div>
                        <h3 className="font-black text-white">{activeSession.name}</h3>
                        <p className="text-xs text-white/45">{activeSession.email} — {activeSession.whatsapp}</p>
                      </div>
                      {!activeSession.is_resolved && (
                        <button
                          onClick={() => resolveSession(activeSession.id)}
                          className="flex items-center gap-1.5 rounded-xl bg-lime-500/15 px-3 py-1.5 text-xs font-bold text-lime-400 hover:bg-lime-500/25"
                        >
                          <CheckCircle size={13} /> إغلاق المحادثة
                        </button>
                      )}
                    </div>

                    {/* Messages */}
                    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5" style={{ maxHeight: 400 }}>
                      {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.is_admin ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-6 ${
                              msg.is_admin
                                ? "rounded-tl-sm bg-purple-600/80 text-white"
                                : "rounded-tr-sm bg-white/8 text-white"
                            }`}
                          >
                            {msg.content}
                            <span className="mt-0.5 block text-[10px] text-white/40">{formatTime(msg.created_at)}</span>
                          </div>
                        </div>
                      ))}
                      <div ref={bottomRef} />
                    </div>

                    {/* Reply Input */}
                    {!activeSession.is_resolved && (
                      <div className="flex items-center gap-2 border-t border-white/8 p-4">
                        <input
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              sendReply();
                            }
                          }}
                          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-purple-500/50"
                          placeholder="اكتب ردك هنا..."
                          autoFocus
                        />
                        <button
                          onClick={sendReply}
                          disabled={!reply.trim()}
                          className="grid size-10 shrink-0 place-items-center rounded-2xl bg-purple-600 text-white shadow-[0_0_16px_rgba(168,85,247,0.5)] disabled:opacity-40"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    )}
                    {activeSession.is_resolved && (
                      <div className="border-t border-white/8 px-5 py-3 text-center text-xs text-white/35">
                        هذه المحادثة مغلقة
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center rounded-3xl border border-white/8 bg-[#0d0b14] text-white/25 text-sm" style={{ minHeight: 300 }}>
                    اختر محادثة للبدء
                  </div>
                )}
              </div>
            </>
          )}

          {nav === "products" && (
            <>
              <h2 className="mb-6 text-2xl font-black">المنتجات</h2>
              <div className="rounded-3xl border border-white/8 bg-[#0d0b14]">
                <div className="border-b border-white/8 px-5 py-4 font-black">قائمة المنتجات</div>
                {products.map((p) => (
                  <div key={p.id} className="grid gap-2 border-b border-white/6 px-5 py-4 text-sm md:grid-cols-3">
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-white/55 text-xs">{p.description}</span>
                    <span className="font-black text-lime-400">${p.price}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {nav === "settings" && (
            <div className="text-white/40 py-12 text-center">قسم الإعدادات — قريباً</div>
          )}
        </div>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-3xl border border-white/8 bg-[#0d0b14] p-5">
      <div className={`mb-4 ${color}`}>{icon}</div>
      <p className="text-sm text-white/50">{label}</p>
      <p className="mt-1 text-3xl font-black text-white">{value}</p>
    </div>
  );
}
