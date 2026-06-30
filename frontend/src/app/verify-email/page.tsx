"use client";

import { Suspense } from "react";
import { VerifyEmailForm } from "@/features/auth/verify-email-form";

export default function VerifyEmailPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <Suspense
        fallback={
          <div className="text-white/40 text-sm animate-pulse">جارٍ التحميل…</div>
        }
      >
        <VerifyEmailForm />
      </Suspense>
    </main>
  );
}
