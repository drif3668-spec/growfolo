import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { LiveChat } from "@/components/chat/live-chat";
import { CartProvider } from "@/context/cart-context";
import { CartSidebar } from "@/components/cart/cart-sidebar";
import { CurrencyProvider } from "@/context/currency-context";
import { FavoritesProvider } from "@/context/favorites-context";
import { NotificationsProvider } from "@/context/notifications-context";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.growol.store";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Growfolo — اشتراكات وأدوات رقمية أصلية",
    template: "%s | Growfolo",
  },
  description:
    "متجر Growfolo للخدمات الرقمية: اشتراكات أصلية وأدوات ذكاء اصطناعي بأسعار تنافسية، تفعيل سريع ودعم عربي.",
  applicationName: "Growfolo",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Growfolo",
    locale: "ar_DZ",
    url: siteUrl,
    title: "Growfolo — اشتراكات وأدوات رقمية أصلية",
    description:
      "اشتراكات أصلية وأدوات ذكاء اصطناعي بأسعار تنافسية، تفعيل سريع ودعم عربي.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Growfolo — اشتراكات وأدوات رقمية أصلية",
    description: "اشتراكات أصلية وأدوات ذكاء اصطناعي بأسعار تنافسية.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070B14",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Cairo:wght@600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <NotificationsProvider>
          <FavoritesProvider>
            <CartProvider>
              <CurrencyProvider>
                {children}
                <CartSidebar />
                <LiveChat />
              </CurrencyProvider>
            </CartProvider>
          </FavoritesProvider>
        </NotificationsProvider>
      </body>
    </html>
  );
}
