import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LiveChat } from "@/components/chat/live-chat";
import { CartProvider } from "@/context/cart-context";
import { CurrencyProvider } from "@/context/currency-context";
import { FavoritesProvider } from "@/context/favorites-context";
import { NotificationsProvider } from "@/context/notifications-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Growfolo",
  description: "منصة Growfolo للخدمات الرقمية — اشتراكات أصلية بأسعار تنافسية",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <NotificationsProvider>
          <FavoritesProvider>
            <CartProvider>
              <CurrencyProvider>
                {children}
                <LiveChat />
              </CurrencyProvider>
            </CartProvider>
          </FavoritesProvider>
        </NotificationsProvider>
      </body>
    </html>
  );
}
