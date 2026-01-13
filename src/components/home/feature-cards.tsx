"use client";

import { motion } from "framer-motion";
import { BookOpen, Map, Users } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export function FeatureCards() {
    const { t } = useLanguage();

    const features = [
        {
            icon: BookOpen,
            title: t("feature.courses"),
            desc: t("feature.courses.desc"),
        },
        {
            icon: Map,
            title: t("feature.paths"),
            desc: t("feature.paths.desc"),
        },
        {
            icon: Users,
            title: t("feature.community"),
            desc: t("feature.community.desc"),
        },
    ];

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-16 md:-mt-20 relative z-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="bg-zinc-900/80 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-xl sm:rounded-2xl hover:border-gold-500/50 hover:bg-zinc-900/90 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6 group-hover:bg-gold-500 group-hover:text-black transition-colors text-gold-400">
                            <feature.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gold-400 transition-colors">
                            {feature.title}
                        </h3>
                        <p className="text-white/60 leading-relaxed">
                            {feature.desc}
                        </p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
