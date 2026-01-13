"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, Calendar, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { formatDate } from "@/lib/utils";

export interface Course {
    id: string;
    title: string;
    image: string;
    lessons: number;
    completedLessons: number;
    hoursLeft: number;
    totalHours: number;
    expiryDate: string;
    status: 'learning' | 'notStarted' | 'expired';
}

interface CourseCardProps {
    course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
    const { t, language } = useLanguage();

    const percentage = Math.round((course.completedLessons / course.lessons) * 100);
    const isExpired = course.status === 'expired';

    const CardContent = (
        <div className={`bg-[#161616] border border-white/10 rounded-xl overflow-hidden hover:border-gold-500/50 transition-all duration-300 group flex flex-col h-full ${isExpired ? 'opacity-75 grayscale' : ''}`}>
            {/* Image Section */}
            <div className="relative h-48 w-full bg-gray-900 shrink-0">
                <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {!isExpired && (
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 flex items-center gap-1">
                        <span className="text-gold-400 font-bold text-sm">{percentage}%</span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-gold-400 transition-colors">
                    {course.title}
                </h3>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-400">{t("class.card.progress")}</span>
                        <span className="text-gold-500 font-bold">{percentage}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${percentage}%`,
                                background: isExpired
                                    ? '#6b7280'
                                    : 'linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #22c55e 100%)'
                            }}
                        />
                    </div>
                </div>

                {/* Details List */}
                <div className="flex flex-col gap-3 text-sm text-gray-300 mb-6 font-medium">
                    <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gold-500" />
                        <span>{course.lessons} {t("class.card.lessons")}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gold-500" />
                        <span>{t("class.card.timeLeft")} {course.hoursLeft} {t("class.unit.hours")}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gold-500" />
                        <span>{t("class.card.totalTime")} {course.totalHours} {t("class.unit.hours")}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gold-500" />
                        <span>{t("class.card.expiry")} {formatDate(course.expiryDate, language)}</span>
                    </div>
                </div>

                {/* Action Button */}
                <div className="mt-auto">
                    {isExpired ? (
                        <Button
                            className="w-full bg-white/10 hover:bg-white/20 text-white font-bold h-12 rounded-full text-lg transition-all"
                        >
                            {t("class.btn.renew")}
                        </Button>
                    ) : (
                        <Button
                            asChild
                            className="w-full bg-gold-500 hover:bg-gold-400 text-black font-bold h-12 rounded-full text-lg shadow-[0_0_20px_rgba(255,193,7,0.4)] hover:shadow-[0_0_25px_rgba(255,193,7,0.6)] transition-all transform hover:-translate-y-0.5"
                        >
                            <span>{t("class.btn.start")}</span>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );

    if (isExpired) {
        return CardContent;
    }

    return (
        <Link href={`/classroom/${course.id}`} className="block h-full group">
            {CardContent}
        </Link>
    );
}
