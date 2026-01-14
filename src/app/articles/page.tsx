"use client";

import { useLanguage } from "@/lib/language-context";
import { motion } from "framer-motion";
import { FileText, Calendar, ArrowRight, Loader2, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Article {
    id: string;
    title: string;
    imageUrl: string | null;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
    content: string; // for snippet
}

export default function ArticlesPage() {
    const { t, language } = useLanguage();
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<'all' | 'latest' | 'popular'>('all');

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                // Fetch public articles with cache busting
                const res = await fetch(`/api/articles?t=${Date.now()}`, { cache: "no-store" });
                if (res.ok) {
                    const data = await res.json();
                    setArticles(data);
                }
            } catch (error) {
                console.error("Failed to fetch articles", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchArticles();
    }, []);

    // Helper to strip HTML and get text snippet
    const getSnippet = (html: string) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        return doc.body.textContent?.slice(0, 100) + "..." || "";
    };

    const filteredArticles = articles.filter(article => {
        // Filter by Search
        if (searchQuery && !article.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;

        // Filter by Tab (Mock logic for now as we don't have popularity metrics yet)
        // 'latest' is default sort, 'popular' could be random or same for now
        return true;
    });

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-gold-500/30">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-white">
                        {language === 'TH' ? "บทความและข่าวสาร" : "News & Articles"}
                    </h1>
                    <p className="text-gray-400 max-w-2xl">
                        {language === 'TH'
                            ? "อัปเดตความรู้ เทคนิคใหม่ๆ และข่าวสารในวงการโปรแกรมมิ่ง"
                            : "Stay updated with the latest insights, tutorials, and news from the coding world."}
                    </p>
                </div>

                {/* Tabs & Search */}
                <div className="flex flex-col gap-4 mt-4">
                    {/* Visual Tabs */}
                    <div className="flex items-center gap-6 border-b border-white/10 overflow-x-auto no-scrollbar">
                        {[
                            { id: 'all', label: language === 'TH' ? 'ทั้งหมด' : 'All' },
                            { id: 'latest', label: language === 'TH' ? 'ล่าสุด' : 'Latest' },
                            { id: 'popular', label: language === 'TH' ? 'ยอดนิยม' : 'Popular' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`pb-4 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === tab.id
                                        ? "text-gold-500"
                                        : "text-gray-400 hover:text-white"
                                    }`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full mt-2">
                        {/* Search Input Group */}
                        <div className="flex items-center gap-3 flex-grow order-1">
                            {/* Search Icon */}
                            <div className="flex-shrink-0 w-12 h-12 bg-black border-2 border-white rounded-full flex items-center justify-center">
                                <Search className="w-6 h-6 text-white" />
                            </div>

                            {/* Search Input */}
                            <div className="relative flex-grow">
                                <Input
                                    placeholder={language === 'TH' ? "ค้นหาบทความ..." : "Search articles..."}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-4 pr-4 bg-white border-transparent text-black placeholder:text-gray-400 focus:border-gold-500 focus:ring-gold-500 h-12 w-full text-base rounded-lg"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 w-full md:w-auto flex-shrink-0 order-2 md:order-2">
                            <Button className="flex-1 md:flex-none bg-gold-500 hover:bg-gold-400 text-black font-bold h-12 px-6 rounded-lg min-w-[120px]">
                                {language === 'TH' ? "ค้นหา" : "Search"}
                            </Button>

                            <Button
                                className={`flex-1 md:flex-none font-bold h-12 px-6 rounded-lg min-w-[120px] transition-colors ${searchQuery
                                    ? "bg-crimson-600 hover:bg-crimson-700 text-white"
                                    : "bg-gray-600 text-gray-300 hover:bg-gray-500 cursor-not-allowed"
                                    }`}
                                onClick={() => setSearchQuery("")}
                                disabled={!searchQuery}
                            >
                                {language === 'TH' ? "ล้างค่า" : "Clear"}
                            </Button>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-20"><Loader2 className="animate-spin text-gold-500 w-10 h-10" /></div>
                ) : (
                    <>
                        {filteredArticles.length === 0 ? (
                            <div className="text-center py-20 bg-[#161616] rounded-xl border border-white/5 mx-auto w-full">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-gray-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {language === 'TH' ? "ไม่พบบทความ" : "No articles found"}
                                </h3>
                                <p className="text-gray-400">
                                    {language === 'TH' ? "ลองปรับการค้นหาของคุณดูใหม่อีกครั้ง" : "Try adjusting your search to find what you're looking for."}
                                </p>
                                <Button
                                    variant="link"
                                    className="text-gold-500 mt-2"
                                    onClick={() => setSearchQuery("")}
                                >
                                    {language === 'TH' ? "ล้างตัวกรองทั้งหมด" : "Clear filters"}
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredArticles.map((article, index) => {
                                    const isUpdated = new Date(article.updatedAt).getTime() > new Date(article.createdAt).getTime();

                                    return (
                                        <Link href={`/articles/${article.id}`} key={article.id} className="block h-full group">
                                            <div className="bg-[#161616] border border-white/10 rounded-xl overflow-hidden hover:border-gold-500/50 transition-all duration-300 flex flex-col h-full hover:-translate-y-1 hover:shadow-xl hover:shadow-gold-500/10">
                                                {/* Image */}
                                                <div className="relative h-48 w-full bg-gray-900 shrink-0">
                                                    {article.imageUrl ? (
                                                        <Image
                                                            src={article.imageUrl}
                                                            alt={article.title}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-600 bg-white/5">
                                                            <FileText className="w-12 h-12 opacity-50" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="p-4 flex flex-col flex-grow">
                                                    <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 min-h-[3.5rem] group-hover:text-gold-400 transition-colors">
                                                        {article.title}
                                                    </h3>

                                                    <p className="text-gray-400 text-sm mb-6 line-clamp-2">
                                                        <div dangerouslySetInnerHTML={{ __html: article.content.substring(0, 80) + "..." }} />
                                                    </p>

                                                    <div className="mt-auto pt-4 border-t border-white/10 flex flex-col gap-1.5 text-xs text-gray-400">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-3.5 h-3.5 text-gold-500" />
                                                            <span>
                                                                {language === 'EN'
                                                                    ? format(new Date(article.createdAt), "MMMM d, yyyy")
                                                                    : `${format(new Date(article.createdAt), "d MMMM", { locale: th })} ${new Date(article.createdAt).getFullYear() + 543}`
                                                                }
                                                            </span>
                                                        </div>
                                                        {isUpdated && (
                                                            <span className="text-gray-500 pl-[22px]"> {/* Align with text above */}
                                                                (
                                                                {language === 'EN'
                                                                    ? `Updated ${format(new Date(article.updatedAt), "MMM d, yyyy HH:mm")}`
                                                                    : `อัปเดต ${format(new Date(article.updatedAt), "d MMM", { locale: th })} ${new Date(article.updatedAt).getFullYear() + 543} ${format(new Date(article.updatedAt), "HH:mm")} น.`
                                                                }
                                                                )
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
