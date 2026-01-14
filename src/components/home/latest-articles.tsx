"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface Article {
    id: string;
    title: string;
    imageUrl: string | null;
    createdAt: string;
    updatedAt: string;
    content: string;
}

export function LatestArticles() {
    const { t, language } = useLanguage();
    const [articles, setArticles] = useState<Article[]>([]);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                // Add timestamp to force bypass cache
                const res = await fetch(`/api/articles?t=${Date.now()}`, { cache: "no-store" });
                if (res.ok) {
                    const data = await res.json();
                    console.log("Articles Data:", data); // Debug
                    setArticles(data.slice(0, 3));
                }
            } catch (error) {
                console.error("Failed to fetch articles", error);
            }
        };
        fetchArticles();
    }, []);

    if (articles.length === 0) return null;

    return (
        <section className="py-16 px-4 bg-black relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-[128px] -z-10" />

            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
                    <div className="space-y-2">
                        <h2 className="text-2xl md:text-4xl font-bold text-white">
                            {language === 'TH' ? "บทความล่าสุด" : "Latest Articles"}
                        </h2>
                        <p className="text-gray-400 text-sm md:text-base">
                            {language === 'TH'
                                ? "อัปเดตข่าวสารและบทความที่น่าสนใจ"
                                : "Stay updated with our latest news and insights"
                            }
                        </p>
                    </div>
                    <Link href="/articles" className="hidden sm:inline-block">
                        <span className="inline-flex items-center text-gold-500 hover:text-white transition-colors text-sm font-medium">
                            {language === 'TH' ? "ดูทั้งหมด" : "View All"} <ArrowRight className="ml-2 w-4 h-4" />
                        </span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article, index) => {
                        // Check if updated
                        const isUpdated = new Date(article.updatedAt).getTime() > new Date(article.createdAt).getTime();

                        // Strip HTML tags for preview
                        const plainText = article.content.replace(/<[^>]+>/g, '');

                        return (
                            <motion.div
                                key={article.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group bg-[#111] border border-white/10 rounded-xl overflow-hidden hover:border-gold-500/30 transition-all duration-300 flex flex-col h-full hover:-translate-y-1 hover:shadow-lg hover:shadow-gold-500/5"
                            >
                                <Link href={`/articles/${article.id}`} className="flex flex-col h-full">
                                    <div className="aspect-video relative overflow-hidden bg-gray-900 border-b border-white/5">
                                        {article.imageUrl ? (
                                            <Image
                                                src={article.imageUrl}
                                                alt={article.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <FileText className="w-10 h-10 text-white/20" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5 flex flex-col flex-grow">
                                        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gold-500 mb-3 font-medium uppercase tracking-wider">
                                            <Calendar className="w-3 h-3" />
                                            <span>
                                                {language === 'EN'
                                                    ? format(new Date(article.createdAt), "MMM d, yyyy")
                                                    : `${format(new Date(article.createdAt), "d MMM", { locale: th })} ${new Date(article.createdAt).getFullYear() + 543}`
                                                }
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors line-clamp-2 mb-2 leading-tight">
                                            {article.title}
                                        </h3>
                                        <p className="text-gray-400 text-xs sm:text-sm line-clamp-2 mb-4 flex-grow">
                                            {plainText.substring(0, 100)}...
                                        </p>
                                        <div className="mt-auto flex items-center text-xs text-white/40 group-hover:text-white/80 transition-colors">
                                            {language === 'TH' ? "อ่านต่อ" : "Read More"} <ArrowRight className="ml-1 w-3 h-3" />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="mt-8 text-center sm:hidden">
                    <Link href="/articles">
                        <Button variant="outline" className="border-gold-500/50 text-gold-500 hover:bg-gold-500 hover:text-black">
                            {language === 'TH' ? "ดูบทความทั้งหมด" : "View All Articles"}
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
