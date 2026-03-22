
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
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/magnific-popup.js/1.1.0/magnific-popup.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/meanmenu/2.0.8/meanmenu.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/jquery-nice-select/1.1.0/css/nice-select.min.css"
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
