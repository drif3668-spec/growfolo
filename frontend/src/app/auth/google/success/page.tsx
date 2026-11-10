"use client";

/**
 * /auth/google/success
 * ====================
 * The Python backend redirects here after a successful Google OAuth exchange.
 * URL format: /auth/google/success?token=<jwt>
 *
 * This page:
 *  1. Reads the JWT from the query string.
 *  2. Clears stale session data.
 *  3. Saves the token to localStorage (same key used everywhere: "gf_token").
 *  4. Decodes the JWT to detect admin status.
 *  5. Redirects to /admin or /dashboard.
 */

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function GoogleSuccessHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      router.replace("/login?error=google_oauth_failed");
      return;
    }

    // Clear any previous user's session data
    const sessionKeys = [
      "gf_cart", "gf_my_email", "gf_pay_method",
      "gf_checkout_data", "gf_order_v2",
      "gf_instapay_order_code", "gf_baridimob_order_code",
    ];
    sessionKeys.forEach(k => { try { localStorage.removeItem(k); } catch {} });

    // Save token
    localStorage.setItem("gf_token", token);

    // Decode JWT to check admin flag
    try {
      const payload = JSON.parse(atob(token.split(".")[1])) as { is_admin?: boolean };
      router.replace(payload.is_admin ? "/admin" : "/dashboard");
    } catch {
      router.replace("/dashboard");
    }
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-center">
        <div className="mb-4 animate-spin text-4xl text-[var(--gf-brand)]">⟳</div>
        <p className="text-sm text-[var(--gf-text-muted)]">جاري تسجيل الدخول...</p>
      </div>
    </div>
  );
}

export default function GoogleSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black">
          <div className="animate-spin text-4xl text-[var(--gf-brand)]">⟳</div>
        </div>
      }
    >
      <GoogleSuccessHandler />
    </Suspense>
  );
}
