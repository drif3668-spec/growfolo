import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LiveChat } from "@/components/chat/live-chat";
import { CartProvider } from "@/context/cart-context";
import { CurrencyProvider } from "@/context/currency-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Growfolo.io",
  description: "Modern ecommerce platform for Growfolo.io"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <CartProvider>
          <CurrencyProvider>
            {children}
            <LiveChat />
          </CurrencyProvider>
        </CartProvider>
      </body>
    </html>
  );
}
