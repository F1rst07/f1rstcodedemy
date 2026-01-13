"use client";

import { useLanguage } from "@/lib/language-context";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { RegisterModal } from "@/components/auth/register-modal";

export default function MembershipPage() {
    const { t } = useLanguage();

    const plans = [
        {
            name: "FREE",
            price: "0",
            description: "Start your journey with essential coding basics.",
            features: [
                "Access to free courses",
                "Basic community support",
                "Course completion certificates (Limited)",
                "Mobile access"
            ],
            icon: Star,
            color: "text-gray-400",
            buttonVariant: "outline"
        },
        {
            name: "PLUS",
            price: "490",
            period: "/month",
            description: "Level up with advanced courses and projects.",
            features: [
                "Access to all Standard courses",
                "Priority community support",
                "Unlimited certificates",
                "Project reviews (1/month)",
                "Downloadable resources"
            ],
            icon: Zap,
            color: "text-gold-400",
            buttonVariant: "default",
            popular: true
        },
        {
            name: "PRO",
            price: "990",
            period: "/month",
            description: "Ultimate mastery with mentorship and career path.",
            features: [
                "Access to ALL courses (incl. Premium)",
                "1-on-1 Mentorship sessions",
                "Career guidance & Resume check",
                "Unlimited Project reviews",
                "Exclusive workshops",
                "Offline access"
            ],
            icon: Crown,
            color: "text-crimson-500",
            buttonVariant: "premium"
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-gold-500/30">
            <Navbar />

            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="text-center mb-16 space-y-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400"
                        >
                            Choose Your <span className="text-gold-400">Path</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-gray-400 text-lg max-w-2xl mx-auto"
                        >
                            Unlock your full potential with a plan that fits your learning goals.
                            Upgrade anytime as you grow.
                        </motion.p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.map((plan, index) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 + 0.2 }}
                                className={`relative p-8 rounded-2xl border ${plan.popular ? 'border-gold-500/50 bg-gold-950/10' : 'border-white/10 bg-white/5'} backdrop-blur-sm flex flex-col hover:border-gold-500/30 transition-all duration-300 group`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-gold-500 to-amber-600 text-black px-4 py-1 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                                        MOST POPULAR
                                    </div>
                                )}

                                <div className="mb-8">
                                    <div className={`w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6 ${plan.color}`}>
                                        <plan.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-4">
                                        <span className="text-4xl font-bold">฿{plan.price}</span>
                                        {plan.period && <span className="text-gray-400 text-sm">{plan.period}</span>}
                                    </div>
                                    <p className="text-gray-400 text-sm">{plan.description}</p>
                                </div>

                                <div className="space-y-4 mb-8 flex-grow">
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-gold-500 flex-shrink-0" />
                                            <span className="text-gray-300 text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-auto">
                                    <RegisterModal trigger={
                                        <Button
                                            className={`w-full h-12 text-base font-bold rounded-xl transition-all ${plan.popular
                                                ? 'bg-gold-500 hover:bg-gold-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                                                : 'bg-white/10 hover:bg-white/20 text-white'
                                                }`}
                                        >
                                            {plan.price === "0" ? "Start for Free" : "Get Started"}
                                        </Button>
                                    } />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
