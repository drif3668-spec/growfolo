"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminDashboard } from "@/features/admin/admin-dashboard";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function AdminPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const token = typeof window !== "undefined" ? localStorage.getItem("gf_token") : null;
    if (!token) {
      router.replace("/login");
      return;
    }

    fetch(`${API_URL}/api/v1/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (!res.ok) throw new Error("unauthenticated");
        const me = await res.json();
        if (!me?.is_admin) throw new Error("forbidden");
        if (!cancelled) setAllowed(true);
      })
      .catch(() => {
        if (cancelled) return;
        localStorage.removeItem("gf_token");
        router.replace("/login");
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        <p className="text-sm">جارٍ التحقق من صلاحيات الإدارة…</p>
      </div>
    );
  }

  return <AdminDashboard />;
}
