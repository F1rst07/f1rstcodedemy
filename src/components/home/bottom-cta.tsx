"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { RegisterModal } from "@/components/auth/register-modal";
import { LoginModal } from "@/components/auth/login-modal";
import { useState } from "react";

export function BottomCTA() {
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
        <section className="py-20 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-5xl font-bold text-white mb-6"
                >
                    {t("cta.title")}
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    viewport={{ once: true }}
                    className="text-white/60 text-lg mb-8 max-w-2xl mx-auto"
                >
                    {t("cta.desc")}
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    <RegisterModal
                        open={registerOpen}
                        onOpenChange={setRegisterOpen}
                        onSwitchToLogin={switchToLogin}
                        trigger={
                            <Button
                                size="lg"
                                className="bg-gold-500 text-black font-bold text-lg h-14 px-10 rounded-full hover:bg-gold-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] transition-all"
                            >
                                {t("cta.button")}
                            </Button>
                        } />

                    {/* Hidden Login Modal for switching capability */}
                    <LoginModal
                        open={loginOpen}
                        onOpenChange={setLoginOpen}
                        onSwitchToRegister={switchToRegister}
                    />
                </motion.div>
            </div>

            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-900/50 to-transparent -z-10" />
        </section>
    );
}
