"use client";

import { Button } from "@/components/ui/button";
import { PlayCircle, ArrowRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import Image from "next/image";
import dynamic from "next/dynamic";
import { RegisterModal } from "@/components/auth/register-modal";
import { LoginModal } from "@/components/auth/login-modal";
import { useState } from "react";

// Dynamic imports for below-the-fold components (lazy load)
const FeatureCards = dynamic(() => import("@/components/home/feature-cards").then(mod => ({ default: mod.FeatureCards })), {
  loading: () => <div className="h-96 bg-black" />,
});

const LatestArticles = dynamic(() => import("@/components/home/latest-articles").then(mod => ({ default: mod.LatestArticles })), {
  loading: () => <div className="h-96 bg-black" />,
});
const BottomCTA = dynamic(() => import("@/components/home/bottom-cta").then(mod => ({ default: mod.BottomCTA })), {
  loading: () => <div className="h-64 bg-black" />,
});

// Blur placeholder for hero image
const heroBlurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgIBAwQDAAAAAAAAAAAAAQIDBBEABRIGITFBUWFx/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQADAQEBAAAAAAAAAAAAAAAAAQIDESH/2gAMAwEAAhEDEEA/AKPTu5bxt+3TWa8yxzSO8jlY1kbJC44FsEDj7HuftIDAEeD+Y0aNKlnyf//Z";

export default function Home() {
  const { t } = useLanguage();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const switchToRegister = () => {
    setLoginOpen(false);
    setTimeout(() => setRegisterOpen(true), 100);
  };

  const switchToLogin = () => {
    setRegisterOpen(false);
    setTimeout(() => setLoginOpen(true), 100);
  };

  return (
    <main className="min-h-screen bg-black overflow-x-hidden">

      {/* Hero Section */}
      <section className="relative min-h-svh flex flex-col items-center justify-center px-4 py-20 sm:py-24 md:py-28">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bg.jpg"
            alt="Hero Background"
            fill
            className="object-cover"
            style={{ objectPosition: "center 35%" }}
            priority
            placeholder="blur"
            blurDataURL={heroBlurDataURL}
            sizes="100vw"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/85" />
          {/* Gradient Overlay for bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
        </div>

        {/* Decorative Gradients */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-crimson-600/5 rounded-full blur-[128px] animate-pulse z-0" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-500/3 rounded-full blur-[128px] animate-pulse z-0" />

        <div className="text-center space-y-4 sm:space-y-6 md:space-y-8 relative z-10 w-full max-w-4xl mx-auto px-2">

          {/* Badge - CSS animation instead of framer-motion */}
          <div className="flex justify-center animate-fade-in">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-400 text-sm font-medium backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              <span>{t("hero.badge")}</span>
            </span>
          </div>

          {/* Main Title - CSS animation */}
          <div className="space-y-2 animate-fade-in-up">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-wide">
              <span className="inline-block bg-gradient-to-br from-white via-gray-200 to-gray-500 bg-clip-text text-transparent drop-shadow-2xl">
                F1RST
              </span>
              <span className="inline-block bg-gradient-to-br from-gold-300 via-gold-500 to-amber-700 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(251,191,36,0.4)]">
                CODE
              </span>
            </h1>

            <div className="flex items-center justify-center gap-2 sm:gap-4 animate-fade-in-up animation-delay-200">
              <div className="h-px w-8 sm:w-12 md:w-24 bg-gradient-to-r from-transparent to-crimson-500" />
              <span className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-crimson-500 tracking-[0.15em] sm:tracking-[0.2em] uppercase font-mono drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                DEMY
              </span>
              <div className="h-px w-8 sm:w-12 md:w-24 bg-gradient-to-l from-transparent to-crimson-500" />
            </div>
          </div>

          {/* Subtitle - Simple text instead of TypewriterText */}
          <div className="max-w-2xl mx-auto px-4 animate-fade-in animation-delay-400">
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 font-light leading-relaxed">
              {t("hero.subtitle")}{t("hero.master")}
            </p>
          </div>

          {/* Actions - CSS animation */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in-up animation-delay-600">
            <LoginModal
              open={loginOpen}
              onOpenChange={setLoginOpen}
              onSwitchToRegister={switchToRegister}
              trigger={
                <Button size="lg" className="bg-gold-500 text-black hover:bg-gold-400 font-bold text-sm sm:text-base md:text-lg h-12 sm:h-14 px-6 sm:px-8 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all">
                  {t("hero.start")} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              } />

            <RegisterModal
              open={registerOpen}
              onOpenChange={setRegisterOpen}
              onSwitchToLogin={switchToLogin}
            />
            <Button size="lg" variant="outline" className="text-sm sm:text-base md:text-lg h-12 sm:h-14 px-6 sm:px-8 rounded-full border-white/10 hover:bg-white/5 hover:text-white backdrop-blur-sm group">
              <PlayCircle className="mr-2 w-5 h-5 group-hover:text-crimson-500 transition-colors" /> {t("hero.trailer")}
            </Button>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <FeatureCards />

      <LatestArticles />
      <BottomCTA />

    </main>
  );
}
