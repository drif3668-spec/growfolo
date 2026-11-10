"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setState("error");
      return;
    }
    setState("sending");
    try {
      const res = await fetch(`${API_URL}/api/v1/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("failed");
      setState("done");
      setEmail("");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="text-sm font-semibold text-[var(--gf-brand)]">
        تم تسجيل بريدك. ستصلك العروض الجديدة أولاً.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
      <label htmlFor="newsletter-email" className="sr-only">
        البريد الإلكتروني
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (state === "error") setState("idle");
        }}
        placeholder="بريدك الإلكتروني"
        className="h-11 flex-1 rounded-[var(--gf-radius-sm)] border border-[var(--gf-line-strong)] bg-[var(--gf-bg)] px-3 text-sm text-[var(--gf-text)] placeholder:text-[var(--gf-text-muted)]"
      />
      <button
        type="submit"
        disabled={state === "sending"}
        className="h-11 rounded-[var(--gf-radius-sm)] bg-[var(--gf-brand)] px-5 text-sm font-bold text-[#052e1c] transition hover:bg-[var(--gf-brand-strong)] hover:text-white disabled:opacity-60"
      >
        {state === "sending" ? "جارٍ الإرسال…" : "اشترك"}
      </button>
      {state === "error" && (
        <p role="alert" className="text-xs text-[var(--gf-danger)] sm:sr-only">
          تعذّر التسجيل، تحقق من البريد.
        </p>
      )}
    </form>
  );
}
