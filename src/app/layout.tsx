import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/navbar";
import { Providers } from "@/components/providers";

import { Footer } from "@/components/layout/footer";
import { LayoutContent } from "@/components/layout/layout-content";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700"],
  display: "swap", // Show fallback font immediately, swap when loaded
});

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "F1RSTCODE DEMY | Premium Online Learning",
  description: "The premier platform for coding mastery.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

import { LanguageProvider } from "@/lib/language-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(outfit.className, "antialiased bg-black text-foreground min-h-screen custom-scrollbar")}>
        <Providers>
          <LanguageProvider>
            <LayoutContent>
              {children}
            </LayoutContent>
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
