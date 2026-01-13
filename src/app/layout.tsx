import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/navbar";
import { Providers } from "@/components/providers";

import { Footer } from "@/components/layout/footer";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "F1RSTCODE DEMY | Premium Online Learning",
  description: "The premier platform for coding mastery.",
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
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
