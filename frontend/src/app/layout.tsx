import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LiveChat } from "@/components/chat/live-chat";
import "./globals.css";

export const metadata: Metadata = {
  title: "Growfolo.io",
  description: "Modern ecommerce platform for Growfolo.io"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {children}
        <LiveChat />
      </body>
    </html>
  );
}
