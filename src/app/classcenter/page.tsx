"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useLanguage } from "@/lib/language-context";
import { ClassroomTabs } from "@/components/classroom/classroom-tabs";
import { CourseCard, Course } from "@/components/classroom/course-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Mock Data
const MOCK_COURSES: Course[] = [
    {
        id: "1",
        title: "Complete Web Development Bootcamp 2024",
        image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600",
        lessons: 48,
        completedLessons: 24,
        hoursLeft: 24,
        totalHours: 48,
        expiryDate: "2024-11-27",
        status: 'learning'
    },
    {
        id: "2",
        title: "Advanced React & Next.js Masterclass",
        image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=600",
        lessons: 32,
        completedLessons: 0,
        hoursLeft: 32,
        totalHours: 32,
        expiryDate: "2025-12-15",
        status: 'notStarted'
    },
    {
        id: "3",
        title: "Python for Data Science and Machine Learning",
        image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600",
        lessons: 60,
        completedLessons: 60,
        hoursLeft: 0,
        totalHours: 60,
        expiryDate: "2024-01-01",
        status: 'expired'
    },
    {
        id: "4",
        title: "UI/UX Design Fundamentals with Figma",
        image: "https://images.unsplash.com/photo-1545235617-9465d2a55698?auto=format&fit=crop&q=80&w=600",
        lessons: 24,
        completedLessons: 5,
        hoursLeft: 19,
        totalHours: 24,
        expiryDate: "2025-10-20",
        status: 'learning'
    },
    {
        id: "5",
        title: "Fullstack Golang Masterclass 2025",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600",
        lessons: 50,
        completedLessons: 50,
        hoursLeft: 0,
        totalHours: 50,
        expiryDate: "2025-12-30",
        status: 'learning'
    }
];

export default function ClassroomPage() {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'all' | 'learning' | 'notStarted' | 'expired'>('all');
    const [searchQuery, setSearchQuery] = useState("");

    const filteredCourses = MOCK_COURSES.filter(course => {
        // Filter by Tab
        if (activeTab !== 'all' && course.status !== activeTab) return false;

        // Filter by Search
        if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;

        return true;
    }).sort((a, b) => {
        // 1. Expired courses go to bottom
        if (a.status === 'expired' && b.status !== 'expired') return 1;
        if (a.status !== 'expired' && b.status === 'expired') return -1;

        // 2. Sort by Expiry Date (Ascending - closer date first)
        const dateA = new Date(a.expiryDate).getTime();
        const dateB = new Date(b.expiryDate).getTime();
        return dateA - dateB;
    });

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-gold-500/30">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-white">
                        {t("class.header.title")}
                    </h1>
                    <p className="text-gray-400 max-w-2xl">
                        {t("class.header.subtitle")}
                    </p>

                </div>

                {/* Tabs & Search */}
                <div className="flex flex-col gap-4 mt-4">
                    <ClassroomTabs activeTab={activeTab} onTabChange={setActiveTab} />

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
                                    placeholder={t("class.search.placeholder")}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-4 pr-4 bg-white border-transparent text-black placeholder:text-gray-400 focus:border-gold-500 focus:ring-gold-500 h-12 w-full text-base rounded-lg"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 w-full md:w-auto flex-shrink-0 order-2 md:order-2">
                            <Button className="flex-1 md:flex-none bg-gold-500 hover:bg-gold-400 text-black font-bold h-12 px-6 rounded-lg min-w-[120px]">
                                {t("class.search.button")}
                            </Button>

                            {/* Show clear button always but disabled if empty, or conditionally render. Logic kept as requested. */}
                            <Button
                                className={`flex-1 md:flex-none font-bold h-12 px-6 rounded-lg min-w-[120px] transition-colors ${searchQuery
                                    ? "bg-crimson-600 hover:bg-crimson-700 text-white"
                                    : "bg-gray-600 text-gray-300 hover:bg-gray-500 cursor-not-allowed"
                                    }`}
                                onClick={() => setSearchQuery("")}
                                disabled={!searchQuery}
                            >
                                {t("class.search.clear")}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Course Grid */}
                {filteredCourses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCourses.map(course => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-[#161616] rounded-xl border border-white/5">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No courses found</h3>
                        <p className="text-gray-400">Try adjusting your search or filter to find what you're looking for.</p>
                        <Button
                            variant="link"
                            className="text-gold-500 mt-2"
                            onClick={() => {
                                setActiveTab('all');
                                setSearchQuery("");
                            }}
                        >
                            Clear all filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
