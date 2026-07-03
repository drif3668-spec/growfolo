import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "سياسة الخصوصية — Growfolo",
  description: "تعرف على سياسة الخصوصية الخاصة بمنصة Growfolo وكيفية حماية بياناتك الشخصية.",
};

export default function PrivacyLayout({ children }: { children: ReactNode }) {
  return children;
}
