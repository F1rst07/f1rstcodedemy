"use client";

import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, Crown, Star, Zap } from "lucide-react";
import { useSession } from "next-auth/react";

export default function SubscribePage() {
    const { t } = useLanguage();
    const { data: session } = useSession();

    const currentPlan = (session?.user as any)?.plan || "Free";

    const plans = [
        {
            id: "Free",
            name: "pricing.free",
            price: "฿0",
            icon: Star,
            color: "text-gray-400",
            bgColor: "bg-gray-500/10",
            borderColor: "border-gray-500/20",
            buttonColor: "bg-white/10 hover:bg-white/20 text-white",
            features: [
                { key: "pricing.feature.community", included: true },
                { key: "pricing.feature.allCourses", included: false },
                { key: "pricing.feature.cert", included: false },
                { key: "pricing.feature.offline", included: false },
                { key: "pricing.feature.mentor", included: false },
            ]
        },
        {
            id: "Plus",
            name: "pricing.plus",
            price: "฿299",
            icon: Zap,
            color: "text-purple-400",
            bgColor: "bg-purple-500/10",
            borderColor: "border-purple-500/20",
            buttonColor: "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]",
            features: [
                { key: "pricing.feature.community", included: true },
                { key: "pricing.feature.allCourses", included: true },
                { key: "pricing.feature.cert", included: true },
                { key: "pricing.feature.offline", included: false },
                { key: "pricing.feature.mentor", included: false },
            ]
        },
        {
            id: "Pro",
            name: "pricing.pro",
            price: "฿599",
            icon: Crown,
            color: "text-gold-400",
            bgColor: "bg-gold-500/10",
            borderColor: "border-gold-500/20",
            buttonColor: "bg-gold-500 hover:bg-gold-400 text-black font-bold shadow-[0_0_20px_rgba(234,179,8,0.4)]",
            popular: true,
            features: [
                { key: "pricing.feature.community", included: true },
                { key: "pricing.feature.allCourses", included: true },
                { key: "pricing.feature.cert", included: true },
                { key: "pricing.feature.offline", included: true },
                { key: "pricing.feature.mentor", included: true },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-black pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
            {/* Background Decorations */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="mx-auto max-w-6xl relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6"
                    >
                        {t("pricing.title")}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto"
                    >
                        {t("pricing.subtitle")}
                    </motion.p>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, index) => {
                        const isCurrent = currentPlan === plan.id;
                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 + 0.2 }}
                                className={`relative p-8 rounded-3xl border ${plan.borderColor} ${plan.bgColor} backdrop-blur-sm flex flex-col group hover:scale-105 transition-transform duration-300`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold-500 text-black text-xs font-bold uppercase tracking-wider rounded-full shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                                        Most Popular
                                    </div>
                                )}

                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${plan.color} bg-white/5`}>
                                        <plan.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className={`text-xl font-bold ${plan.color}`}>{t(plan.name)}</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-bold text-white">{plan.price}</span>
                                            <span className="text-gray-500 text-sm">{t("pricing.month")}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8 flex-grow">
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${feature.included ? 'bg-green-500/20 text-green-500' : 'bg-white/5 text-gray-600'}`}>
                                                <Check className="w-3 h-3" />
                                            </div>
                                            <span className={`text-sm ${feature.included ? 'text-gray-300' : 'text-gray-600'}`}>
                                                {t(feature.key)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    className={`w-full h-12 rounded-xl text-base font-medium transition-all duration-300 ${plan.buttonColor}`}
                                    disabled={isCurrent}
                                >
                                    {isCurrent ? t("pricing.current") : t("pricing.select")}
                                </Button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
