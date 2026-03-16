
import "@css/swiper-bundle.min.css";
import "@css/animate.css";
import "@css/magnific-popup.css";
import "@css/meanmenu.css";
import "@css/nice-select.css";
import "@css/main.css";
import type { Metadata } from "next";
import { Chelsea_Market, Inter, Playfair_Display } from "next/font/google"; // 1. Import
import "./globals.css";
import Preloader from "@/layout/Preloader";

// Using Proxy Mode: FE → Next.js API (service_role) → Supabase
// This allows using service_role key safely (server-side only)
import { AuthProvider } from "@/contexts/AuthContextProxy";
import { ToastProvider } from "@/components/ui/Toast";
import BannedAccountWrapper from "@/components/BannedAccountWrapper";

const dmSans = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});
const chelsea_market = Chelsea_Market({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-chelsea_market",
  display: "swap",
});
const playfair = Playfair_Display({ // 2. Configure
  subsets: ["latin", "vietnamese"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TrustFundMe - Transparent Crowdfunding",
  description: "A transparent and trusted crowdfunding platform for community projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css"
          integrity="sha512-b2QcS5SsA8tZodcDtGRELiGv5SaKSk1vDHDaQRda0htPYWZ6046lr3kJ5bAAQdpV2mmA/4v0wQF9MyU6/fuEnw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
          integrity="sha512-z3gLpd7yknf1YoNbCzqRKc4qyor8gaKU1qmn+CShxbuBusANI9QpRohGBreCFkKxLhei6S9CQXFEbbKuqLg0DA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className={`${chelsea_market.variable} ${dmSans.variable} ${playfair.variable}`}>
        <AuthProvider>
          <BannedAccountWrapper>
            <ToastProvider>
              <Preloader />
              {children}
            </ToastProvider>
          </BannedAccountWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
