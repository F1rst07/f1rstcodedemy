"use client";

import { useLanguage } from "@/lib/language-context";
import { motion } from "framer-motion";
import { Search, Loader2, BookOpen, Clock, FileText, BarChart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BuyButton } from "./_components/buy-button";
import { useSession } from "next-auth/react";

interface Course {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    price: number | null;
    chapters: any[];
}

export default function CoursesPage() {
    const { t, language } = useLanguage();
    const { data: session } = useSession();
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<'all' | 'new' | 'recommended'>('all');

    const [purchasedCourseIds, setPurchasedCourseIds] = useState<string[]>([]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch(`/api/courses?t=${Date.now()}`);
                if (res.ok) {
                    const data = await res.json();
                    setCourses(data);
                }
            } catch (error) {
                console.error("Failed to fetch courses", error);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchPurchases = async () => {
            if (!session?.user) return;
            try {
                const res = await fetch(`/api/user/purchases`);
                if (res.ok) {
                    const ids = await res.json();
                    setPurchasedCourseIds(ids);
                }
            } catch (error) {
                console.error("Failed to fetch purchases", error);
            }
        };

        fetchCourses();
        fetchPurchases();
    }, [session]);

    const filteredCourses = courses.filter(course => {
        if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-gold-500/30">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-white">
                        {language === 'TH' ? "คอร์สเรียนทั้งหมด" : "All Courses"}
                    </h1>
                    <p className="text-gray-400 max-w-2xl">
                        {language === 'TH'
                            ? "สำรวจคอร์สเรียนคุณภาพสูงที่เราคัดสรรมาเพื่อพัฒนาทักษะของคุณ"
                            : "Explore our premium courses designed to take your coding skills to the next level."}
                    </p>
                </div>

                {/* Tabs & Search */}
                <div className="flex flex-col gap-4 mt-4">
                    {/* Visual Tabs */}
                    <div className="flex items-center gap-6 border-b border-white/10 overflow-x-auto no-scrollbar">
                        {[
                            { id: 'all', label: language === 'TH' ? 'ทั้งหมด' : 'All' },
                            { id: 'new', label: language === 'TH' ? 'มาใหม่' : 'New' },
                            { id: 'recommended', label: language === 'TH' ? 'แนะนำ' : 'Recommended' },
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
                                    placeholder={language === 'TH' ? "ค้นหาคอร์สเรียน..." : "Search courses..."}
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
                        {filteredCourses.length === 0 ? (
                            <div className="text-center py-20 bg-[#161616] rounded-xl border border-white/5 mx-auto w-full">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-gray-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {language === 'TH' ? "ไม่พบคอร์สเรียน" : "No courses found"}
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
                                {filteredCourses.map((course) => {
                                    // Calculate total lessons
                                    const totalLessons = course.chapters?.reduce((acc: number, chapter: any) => acc + (chapter.lessons?.length || 0), 0) || 0;
                                    const isPurchased = purchasedCourseIds.includes(course.id);

                                    return (
                                        <div key={course.id} className="group flex flex-col h-full bg-[#161616] border border-white/10 rounded-xl overflow-hidden hover:border-gold-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gold-500/10">
                                            {/* Image */}
                                            <div className="relative aspect-video w-full bg-gray-900 shrink-0 overflow-hidden">
                                                {course.imageUrl ? (
                                                    <Image
                                                        src={course.imageUrl}
                                                        alt={course.title}
                                                        fill
                                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-600 bg-white/5">
                                                        <BookOpen className="w-12 h-12 opacity-50" />
                                                    </div>
                                                )}

                                                {/* Price Tag Overlay */}
                                                <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                                                    <span className="text-gold-400 font-bold text-sm">
                                                        {course.price ? `฿${course.price.toLocaleString()}` : "Free"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-4 flex flex-col flex-grow">
                                                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-gold-400 transition-colors">
                                                    {course.title}
                                                </h3>

                                                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                                    {course.description || "No description available."}
                                                </p>

                                                {/* Course Meta */}
                                                <div className="flex items-center gap-4 text-xs text-gray-500 font-medium mb-6">
                                                    <div className="flex items-center gap-1.5">
                                                        <FileText className="w-3.5 h-3.5 text-gold-500" />
                                                        <span>{totalLessons} {language === 'TH' ? 'บทเรียน' : 'Lessons'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <BarChart className="w-3.5 h-3.5 text-gold-500" />
                                                        <span>{language === 'TH' ? 'เหมาะสมทุกระดับ' : 'All Levels'}</span>
                                                    </div>
                                                </div>

                                                <div className="mt-auto pt-4 border-t border-white/10 flex items-center gap-3">
                                                    <BuyButton
                                                        courseId={course.id}
                                                        title={course.title}
                                                        price={course.price || 0}
                                                        isWebLoggedIn={!!session?.user}
                                                        isPurchased={isPurchased}
                                                    />
                                                </div>
                                            </div>
                                        </div>
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
