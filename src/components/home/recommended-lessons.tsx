"use client";

import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";

import { formatDate } from "@/lib/utils";

export function RecommendedLessons() {
    const { t, language } = useLanguage();

    const lessons = [
        {
            title: "HTML/CSS Basics",
            tag: "beginner",
            lastUpdated: "2024-01-10",
            color: "text-green-400 bg-green-400/10 border-green-400/20",
        },
        {
            title: "JavaScript Fundamentals",
            tag: "beginner",
            lastUpdated: "2024-01-12",
            color: "text-green-400 bg-green-400/10 border-green-400/20",
        },
        {
            title: "React Hooks Deep Dive",
            tag: "intermediate",
            lastUpdated: "2024-01-15",
            color: "text-gold-400 bg-gold-400/10 border-gold-400/20",
        },
        {
            title: "Next.js App Router",
            tag: "advanced",
            lastUpdated: "2024-01-20",
            color: "text-red-500 bg-red-500/10 border-red-500/20",
        },
    ];

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="text-2xl sm:text-3xl font-bold text-white"
                >
                    {t("rec.title")}
                </motion.h2>
                <Button variant="ghost" className="text-white/60 hover:text-white group">
                    {t("rec.viewAll")} <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {lessons.map((lesson, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all cursor-pointer group flex flex-col h-full min-h-[180px]"
                    >
                        <div className="flex-grow">
                            <span className={`inline-block px-3 py-1 rounded text-xs font-semibold mb-4 border ${lesson.color}`}>
                                {t(`rec.${lesson.tag}`)}
                            </span>
                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-gold-400 transition-colors">
                                {lesson.title}
                            </h3>
                        </div>
                        <div className="mt-4 flex items-center justify-center text-white/30 text-xs w-full">
                            <Calendar className="w-3 h-3 mr-1" />
                            {t("rec.lastUpdated")} <span className="ml-1">{formatDate(lesson.lastUpdated, language)}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
