"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { PlayCircle, ArrowRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import Image from "next/image";
import dynamic from "next/dynamic";
import { RegisterModal } from "@/components/auth/register-modal";
import { LoginModal } from "@/components/auth/login-modal";
import { TypewriterText } from "@/components/ui/typewriter-text";
import { useState } from "react";

// Dynamic imports for below-the-fold components (lazy load)
const FeatureCards = dynamic(() => import("@/components/home/feature-cards").then(mod => ({ default: mod.FeatureCards })), {
  loading: () => <div className="h-96 bg-black" />,
});
const RecommendedLessons = dynamic(() => import("@/components/home/recommended-lessons").then(mod => ({ default: mod.RecommendedLessons })), {
  loading: () => <div className="h-96 bg-black" />,
});
const BottomCTA = dynamic(() => import("@/components/home/bottom-cta").then(mod => ({ default: mod.BottomCTA })), {
  loading: () => <div className="h-64 bg-black" />,
});

// Blur placeholder for hero image (tiny base64 placeholder)
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

        {/* Decorative Gradients (Subtle for depth) */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-crimson-600/5 rounded-full blur-[128px] animate-pulse z-0" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-500/3 rounded-full blur-[128px] animate-pulse delay-1000 z-0" />

        <div className="text-center space-y-4 sm:space-y-6 md:space-y-8 relative z-10 w-full max-w-4xl mx-auto px-2">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-400 text-sm font-medium backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              <span>{t("hero.badge")}</span>
            </span>
          </motion.div>

          {/* Main Title */}
          <div className="space-y-2">
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-wide"
            >
              <span className="inline-block bg-gradient-to-br from-white via-gray-200 to-gray-500 bg-clip-text text-transparent drop-shadow-2xl">
                F1RST
              </span>
              <span className="inline-block bg-gradient-to-br from-gold-300 via-gold-500 to-amber-700 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(251,191,36,0.4)]">
                CODE
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex items-center justify-center gap-2 sm:gap-4"
            >
              <div className="h-px w-8 sm:w-12 md:w-24 bg-gradient-to-r from-transparent to-crimson-500" />
              <span className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-crimson-500 tracking-[0.15em] sm:tracking-[0.2em] uppercase font-mono drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                DEMY
              </span>
              <div className="h-px w-8 sm:w-12 md:w-24 bg-gradient-to-l from-transparent to-crimson-500" />
            </motion.div>
          </div>

          {/* Subtitle with Typewriter Effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="max-w-2xl mx-auto px-4"
          >
            <TypewriterText
              text={`${t("hero.subtitle")}${t("hero.master")}`}
              className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 font-light leading-relaxed"
              delay={0.8}
              repeatDelay={45000}
            />
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <LoginModal
              open={loginOpen}
              onOpenChange={setLoginOpen}
              onSwitchToRegister={switchToRegister}
              trigger={
                <Button size="lg" className="bg-gold-500 text-black hover:bg-gold-400 font-bold text-sm sm:text-base md:text-lg h-12 sm:h-14 px-6 sm:px-8 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all">
                  {t("hero.start")} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              } />

            {/* Hidden Register Modal for switching capability from Home interaction */}
            <RegisterModal
              open={registerOpen}
              onOpenChange={setRegisterOpen}
              onSwitchToLogin={switchToLogin}
            />
            <Button size="lg" variant="outline" className="text-sm sm:text-base md:text-lg h-12 sm:h-14 px-6 sm:px-8 rounded-full border-white/10 hover:bg-white/5 hover:text-white backdrop-blur-sm group">
              <PlayCircle className="mr-2 w-5 h-5 group-hover:text-crimson-500 transition-colors" /> {t("hero.trailer")}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Content Sections */}
      <FeatureCards />
      <RecommendedLessons />
      <BottomCTA />

    </main>
  );
}
