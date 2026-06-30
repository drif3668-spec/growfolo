import { Suspense } from "react";
import { ForgotPasswordForm } from "@/features/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <Suspense fallback={<div className="text-white/40 text-sm animate-pulse">جارٍ التحميل…</div>}>
        <ForgotPasswordForm />
      </Suspense>
    </main>
  );
}
