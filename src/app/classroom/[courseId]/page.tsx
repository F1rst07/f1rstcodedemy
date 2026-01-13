"use client";


import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CheckCircle, PlayCircle, FileText, ChevronDown, Check, MessageCircleQuestion, Video, Settings2, Maximize, Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, ChevronsLeft, ChevronsRight, PictureInPicture2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import Hls from "hls.js";
import { useSession } from "next-auth/react";

// ... (existing imports and code)


import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar"; // Assuming global navbar is desired
// For now, I will hardcode a mockup course data for the player to ensure it works standalone.

// Mock Data for the Player - Extended to support multiple courses
const COURSES_DATA: Record<string, {
    id: string;
    title: string;
    progress: number;
    totalLessons: number;
    completedLessons: number;
    hoursLeft: number;
    totalHours: number;
    chapters: {
        id: string;
        title: string;
        lessons: { id: string; title: string; type: "video" | "doc"; duration: string; completed: boolean; videoUrl?: string }[]
    }[]
}> = {
    "1": {
        id: "1",
        title: "Complete Web Development Bootcamp 2024",
        progress: 50,
        totalLessons: 48,
        completedLessons: 24,
        hoursLeft: 24,
        totalHours: 48,
        chapters: [
            {
                id: "ch1",
                title: "Introduction to Web Development",
                lessons: [
                    { id: "l1", title: "Course Overview", type: "video", duration: "5:20", completed: true, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
                    { id: "l2", title: "How the Internet Works", type: "video", duration: "12:15", completed: true, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
                    { id: "l2b", title: "Adaptive Streaming Demo (HLS)", type: "video", duration: "10:00", completed: false, videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
                    { id: "l3", title: "Setting up Environmental", type: "doc", duration: "5 min", completed: false }
                ]
            },
            {
                id: "ch2",
                title: "HTML5 Fundamentals",
                lessons: [
                    { id: "l4", title: "HTML Structure", type: "video", duration: "15:30", completed: true },
                    { id: "l5", title: "Tags and Attributes", type: "video", duration: "20:00", completed: true },
                    { id: "l6", title: "Forms and Inputs", type: "video", duration: "25:45", completed: false }
                ]
            },
            {
                id: "ch3",
                title: "CSS3 Mastery",
                lessons: [
                    { id: "l7", title: "CSS Selectors", type: "video", duration: "18:20", completed: false },
                    { id: "l8", title: "Box Model", type: "video", duration: "22:15", completed: false }
                ]
            }
        ]
    },
    "2": {
        id: "2",
        title: "Advanced React & Next.js Masterclass",
        progress: 0,
        totalLessons: 32,
        completedLessons: 0,
        hoursLeft: 32,
        totalHours: 32,
        chapters: [
            {
                id: "ch1",
                title: "React Fundamentals Refresher",
                lessons: [
                    { id: "l1", title: "JSX & Virtual DOM", type: "video", duration: "10:00", completed: false },
                    { id: "l2", title: "Props & State", type: "video", duration: "15:00", completed: false }
                ]
            },
            {
                id: "ch2",
                title: "Next.js App Router",
                lessons: [
                    { id: "l3", title: "Routing Basics", type: "video", duration: "20:00", completed: false },
                    { id: "l4", title: "Server Components", type: "video", duration: "25:00", completed: false }
                ]
            }
        ]
    },
    "4": {
        id: "4",
        title: "UI/UX Design Fundamentals with Figma",
        progress: 21,
        totalLessons: 24,
        completedLessons: 5,
        hoursLeft: 19,
        totalHours: 24,
        chapters: [
            {
                id: "ch1",
                title: "Design Principles",
                lessons: [
                    { id: "l1", title: "Color Theory", type: "video", duration: "10:00", completed: true },
                    { id: "l2", title: "Typography", type: "video", duration: "12:00", completed: true }
                ]
            },
            {
                id: "ch2",
                title: "Figma Basics",
                lessons: [
                    { id: "l3", title: "Interface Overview", type: "video", duration: "15:00", completed: false },
                    { id: "l4", title: "Frames & Groups", type: "video", duration: "18:00", completed: false }
                ]
            }
        ]
    },
    "5": {
        id: "5",
        title: "Fullstack Golang Masterclass 2025",
        progress: 100,
        totalLessons: 50,
        completedLessons: 50,
        hoursLeft: 0,
        totalHours: 50,
        chapters: [
            {
                id: "ch1",
                title: "Go Basics",
                lessons: [
                    { id: "l1", title: "Variables & Types", type: "video", duration: "8:00", completed: true },
                    { id: "l2", title: "Functions", type: "video", duration: "10:00", completed: true }
                ]
            }
        ]
    }
};



export default function CoursePlayerPage() {
    const params = useParams();
    const courseId = params.courseId as string;
    const { t } = useLanguage();
    const { data: session } = useSession();
    // 1. Determine which course data to use (Fetch from API with fallback)
    const [courseData, setCourseData] = useState<any>(COURSES_DATA[courseId] || COURSES_DATA["1"]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            // If ID is short (mock ID), skip fetch or try?
            // Let's always try fetching.
            try {
                const res = await fetch(`/api/courses/${courseId}`);
                if (res.ok) {
                    const data = await res.json();
                    // Transform Prisma data to match our UI shape if needed (it mostly matches)
                    // We need to inject 'completed' = false since we don't have user auth progress yet
                    const transformed = {
                        ...data,
                        progress: 0,
                        completedLessons: 0,
                        totalLessons: data.chapters.reduce((acc: number, ch: any) => acc + ch.lessons.length, 0),
                        chapters: data.chapters.map((ch: any) => ({
                            ...ch,
                            lessons: ch.lessons.map((l: any) => ({ ...l, completed: false, type: l.type || 'video', duration: l.duration || '10:00' }))
                        }))
                    };
                    setCourseData(transformed);
                }
            } catch (err) {
                console.error("Failed to load course from API, using mock", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourse();
    }, [params.courseId]);

    const course = courseData;

    // Determine Logic Color Progress
    // < 30% -> Red
    // 30 - 70 -> Orange
    // > 70 -> Green-Gold
    const getProgressColor = (progress: number) => {
        if (progress < 30) return "from-red-600 to-red-900";
        if (progress < 70) return "from-orange-500 to-amber-600";
        return "from-green-500 to-emerald-700"; // Or Gold theme if preferred for high score
    };

    // 2. State initialization
    // We default to the first incomplete lesson, or the very first lesson if none are started/all done
    const initialLesson = course.chapters.flatMap((c: any) => c.lessons).find((l: any) => !l.completed) || course.chapters[0]?.lessons[0];

    // Update currentLesson if course changes (e.g. after fetch)
    const [currentLesson, setCurrentLesson] = useState(initialLesson);

    // Video Player State & Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [showSettings, setShowSettings] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const [selectedQuality, setSelectedQuality] = useState("Auto");
    const [hlsQualityLevels, setHlsQualityLevels] = useState<{ height: number; index: number }[]>([]);
    const [videoZoom, setVideoZoom] = useState(1);

    // Effect: Update currentLesson when course data is loaded/updated
    useEffect(() => {
        if (!currentLesson && course) {
            const init = course.chapters.flatMap((c: any) => c.lessons).find((l: any) => !l.completed) || course.chapters[0]?.lessons[0];
            setCurrentLesson(init);
        } else if (currentLesson && course && !course.chapters.flatMap((c: any) => c.lessons).some((l: any) => l.id === currentLesson.id)) {
            // If the current lesson is no longer in the new course data, reset to the first lesson
            const init = course.chapters.flatMap((c: any) => c.lessons).find((l: any) => !l.completed) || course.chapters[0]?.lessons[0];
            setCurrentLesson(init);
        }
    }, [course]);

    // Effect: Initialize HLS for .m3u8 streams
    useEffect(() => {
        const video = videoRef.current;
        const videoUrl = currentLesson?.videoUrl;

        // Cleanup previous HLS instance
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        if (!video || !videoUrl) return;

        const isHLS = videoUrl.endsWith('.m3u8') || videoUrl.includes('.m3u8');

        if (isHLS && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
            });
            hlsRef.current = hls;
            hls.loadSource(videoUrl);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                const levels = hls.levels.map((level, index) => ({
                    height: level.height,
                    index,
                }));
                setHlsQualityLevels(levels);
                setSelectedQuality("Auto");
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('HLS Error:', data);
            });

            return () => {
                hls.destroy();
            };
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            video.src = videoUrl;
        }
    }, [currentLesson?.videoUrl]);

    // Effect: Reset player state when lesson changes
    useEffect(() => {
        setIsPlaying(false);
        setCurrentTime(0);
        setVideoZoom(1); // Reset zoom to normal
        // If it's a direct video, we might want to auto-play or wait. 
        // For now, let's reset.
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            if (!currentLesson?.videoUrl?.includes('.m3u8')) {
                videoRef.current.load();
            }
        }
    }, [currentLesson]);

    // Function: Change HLS quality
    const changeHlsQuality = (qualityLabel: string) => {
        setSelectedQuality(qualityLabel);
        if (hlsRef.current) {
            if (qualityLabel === "Auto") {
                hlsRef.current.currentLevel = -1; // Auto
            } else {
                const height = parseInt(qualityLabel.replace('p', ''));
                const level = hlsQualityLevels.find(l => l.height === height);
                if (level) {
                    hlsRef.current.currentLevel = level.index;
                }
            }
        }
    };

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const skipTime = (seconds: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime += seconds;
        }
    };

    const handleVolumeChange = (newVolume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        setVolume(clampedVolume);
        if (videoRef.current) {
            videoRef.current.volume = clampedVolume;
        }
    };

    const handleVolumeKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowUp" || e.key === "ArrowRight") {
            e.preventDefault();
            handleVolumeChange(volume + 0.1);
        } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
            e.preventDefault();
            handleVolumeChange(volume - 0.1);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const [expandedChapters, setExpandedChapters] = useState<string[]>(["ch1", "ch2", course.chapters[0]?.id]); // Expand first loaded chapter

    // Initialize completed lessons state
    const [completedLessons, setCompletedLessons] = useState<Set<string>>(() => {
        const initialCompleted = new Set<string>();
        course.chapters.forEach((c: any) => {
            c.lessons.forEach((l: any) => {
                if (l.completed) initialCompleted.add(l.id);
            });
        });
        return initialCompleted;
    });

    const toggleChapter = (chapterId: string) => {
        setExpandedChapters(prev =>
            prev.includes(chapterId)
                ? prev.filter(id => id !== chapterId)
                : [...prev, chapterId]
        );
    };

    // Navigation Helper
    const allLessons = course.chapters.flatMap((c: any) => c.lessons);
    const currentLessonIndex = allLessons.findIndex((l: any) => l.id === currentLesson?.id);

    const hasNext = currentLessonIndex < allLessons.length - 1;
    const hasPrev = currentLessonIndex > 0;

    const handleNextLesson = () => {
        if (hasNext) {
            setCurrentLesson(allLessons[currentLessonIndex + 1]);
        }
    };

    const handlePrevLesson = () => {
        if (hasPrev) {
            setCurrentLesson(allLessons[currentLessonIndex - 1]);
        }
    };

    const isCurrentLessonCompleted = currentLesson ? completedLessons.has(currentLesson.id) : false;

    const handleCompleteLesson = () => {
        if (!currentLesson) return;
        setCompletedLessons(prev => {
            const newSet = new Set(prev);
            if (newSet.has(currentLesson.id)) {
                newSet.delete(currentLesson.id);
            } else {
                newSet.add(currentLesson.id);
                // Optional: Auto-advance only when marking as complete
                // if (hasNext) handleNextLesson(); 
            }
            return newSet;
        });
    };

    // Calculate dynamic progress
    const totalLessonsCount = allLessons.length;
    const completedLessonsCount = completedLessons.size;
    const progressPercentage = totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;
    const totalHours = course.totalHours; // Assuming totalHours is still from mock data
    const completedHours = (completedLessonsCount / totalLessonsCount) * totalHours; // Estimate completed hours
    const hoursLeft = totalHours - completedHours;


    if (isLoading) return <div className="text-white p-10">Loading course...</div>;
    if (!course || !currentLesson) return <div className="text-white p-10">Course content not available.</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
            <Navbar /> {/* Ensure Navbar is present */}

            <div className="pt-20 lg:pt-24 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Top Bar: Back Link and Admin Button */}
                <div className="mb-6 flex items-center justify-between">
                    <Link href="/classcenter" className="flex items-center text-gray-400 hover:text-gold-400 transition-colors">
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        <span className="font-medium">{t("classroom.back")}</span>
                    </Link>

                    {(session?.user as any)?.role === 'ADMIN' && (
                        <Button asChild variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-gold-500 hover:text-black hover:border-transparent transition-all">
                            <Link href="/admin/courses" target="_blank">
                                <Settings2 className="w-4 h-4 mr-2" />
                                {t("classroom.admin")}
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    {/* Main Content (Left Column) */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Title Header */}
                        <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 sm:p-6 lg:p-8 relative overflow-hidden group">
                            {/* Dynamic Background Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                            {/* Dynamic Icon */}
                            <div className="absolute top-1/2 -translate-y-1/2 right-4 sm:right-8 text-white/5 pointer-events-none">
                                {currentLesson.type === 'video' ? (
                                    <Video className="w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32" />
                                ) : (
                                    <FileText className="w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32" />
                                )}
                            </div>

                            <div className="relative z-10 pr-4 sm:pr-24">
                                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4 tracking-tight">
                                    {currentLesson.title}
                                </h2>
                                <div className="flex items-center flex-wrap gap-3">
                                    <span className="bg-[#1F1F1F] px-3 py-1 rounded-md text-xs sm:text-sm font-bold text-[#FFB800] border border-white/10 shadow-sm">
                                        EP.{currentLessonIndex + 1}
                                    </span>
                                    <span className="text-gray-400 text-base">
                                        {course.title}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Advanced Video Player */}
                        <div className="aspect-video bg-black rounded-xl border border-white/10 overflow-hidden relative group select-none">
                            {/* Main Content (Slides/Screen) */}
                            <div className="absolute inset-0 bg-[#0F0F0F] flex items-center justify-center z-10">
                                {currentLesson?.videoUrl ? (
                                    currentLesson.videoUrl.includes('youtube') || currentLesson.videoUrl.includes('youtu.be') ? (
                                        <iframe
                                            src={currentLesson.videoUrl.includes('watch?v=') ? currentLesson.videoUrl.replace('watch?v=', 'embed/') : currentLesson.videoUrl}
                                            className="w-full h-full object-contain"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <video
                                            ref={videoRef}
                                            src={currentLesson.videoUrl}
                                            className="w-full h-full object-contain transition-transform duration-200"
                                            style={{ transform: `scale(${videoZoom})` }}
                                            controls={false}
                                            playsInline
                                            onClick={togglePlay}
                                            onTimeUpdate={handleTimeUpdate}
                                            onLoadedMetadata={handleLoadedMetadata}
                                            onWheel={(e) => {
                                                e.preventDefault();
                                                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                                                setVideoZoom(prev => Math.max(1, Math.min(3, prev + delta)));
                                            }}
                                            onEnded={() => {
                                                setIsPlaying(false);
                                                if (currentLesson && !completedLessons.has(currentLesson.id)) {
                                                    setCompletedLessons(prev => new Set(prev).add(currentLesson.id));
                                                }
                                            }}
                                        />
                                    )
                                ) : (
                                    /* Placeholder for Main Video Source */
                                    <div className="text-center opacity-20">
                                        <FileText className="w-20 h-20 mx-auto mb-4" />
                                        <p className="text-lg font-bold">Main Screen / Slides</p>
                                    </div>
                                )}
                            </div>




                            {/* Center Play Button (Visible on Pause) */}
                            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                <div className={`w-24 h-24 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white transition-all transform duration-300 shadow-2xl ${isPlaying ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100 pointer-events-auto'}`}>
                                    <button onClick={togglePlay} className="pointer-events-auto w-full h-full flex items-center justify-center rounded-full">
                                        {isPlaying ? (
                                            <Pause className="w-10 h-10 fill-current ml-1" />
                                        ) : (
                                            <Play className="w-10 h-10 fill-current ml-1" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Controls Overlay */}
                            <div className={`absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black via-black/80 to-transparent px-4 pb-4 pt-16 transition-all duration-300 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                                {/* Progress Bar */}
                                <div className="relative group/progress mb-4 cursor-pointer">
                                    {/* Seek Input */}
                                    <input
                                        type="range"
                                        min="0"
                                        max={duration || 100}
                                        value={currentTime}
                                        onChange={handleSeek}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                                    />
                                    {/* Hitbox */}
                                    <div className="absolute -top-2 -bottom-2 inset-x-0"></div>
                                    {/* Track */}
                                    <div className="h-1 bg-white/20 rounded-full w-full overflow-hidden group-hover/progress:h-1.5 transition-all duration-200">
                                        <div className="h-full bg-white/10 w-full relative">
                                            {/* Buffered */}
                                            <div className="absolute top-0 left-0 h-full bg-white/30 w-[0%]"></div>
                                            {/* Played */}
                                            <div
                                                className="absolute top-0 left-0 h-full bg-gold-500 relative"
                                                style={{ width: `${(currentTime / duration) * 100}%` }}
                                            >
                                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full h-full shadow-[0_0_20px_rgba(255,193,7,0.5)]"></div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Thumb (Visible on hover) */}
                                    <div
                                        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-gold-500 rounded-full border-2 border-white scale-0 group-hover/progress:scale-100 transition-transform duration-200 shadow-lg pointer-events-none"
                                        style={{ left: `${(currentTime / duration) * 100}%` }}
                                    ></div>
                                </div>

                                {/* Control Buttons */}
                                <div className="flex items-center justify-between font-sans">
                                    {/* Left Side */}
                                    <div className="flex items-center gap-4 sm:gap-6">
                                        <button
                                            onClick={togglePlay}
                                            className="text-white hover:text-gray-200 transition-colors transform active:scale-95"
                                        >
                                            {isPlaying ? (
                                                <Pause className="w-6 h-6 fill-white stroke-none" />
                                            ) : (
                                                <Play className="w-6 h-6 fill-white stroke-none" />
                                            )}
                                        </button>

                                        <div className="flex items-center gap-2 text-white font-bold text-sm">
                                            <button onClick={() => skipTime(-10)} className="group/skip flex items-center gap-1 hover:text-gray-200 transition-colors" title="Rewind 10s">
                                                <ChevronsLeft className="w-6 h-6 stroke-[3]" />
                                                <span>10</span>
                                            </button>
                                            <button onClick={() => skipTime(10)} className="group/skip flex items-center gap-1 hover:text-gray-200 transition-colors" title="Forward 10s">
                                                <span>10</span>
                                                <ChevronsRight className="w-6 h-6 stroke-[3]" />
                                            </button>
                                        </div>

                                        {/* Volume Control */}
                                        <div className="flex items-center gap-3 group/volume cursor-pointer relative">
                                            <button
                                                className="text-white hover:text-gray-200 transition-colors focus:outline-none focus:scale-110 active:scale-95"
                                                onClick={() => handleVolumeChange(volume === 0 ? 1 : 0)}
                                                onKeyDown={handleVolumeKeyDown}
                                            >
                                                {volume === 0 ? <VolumeX className="w-6 h-6 stroke-[2.5]" /> : <Volume2 className="w-6 h-6 stroke-[2.5]" />}
                                            </button>
                                            <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300 ease-out flex items-center">
                                                <div className="w-20 h-1.5 bg-white/30 rounded-full relative flex items-center ml-2">
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="1"
                                                        step="0.1"
                                                        value={volume}
                                                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                                    />
                                                    <div
                                                        className="absolute top-0 left-0 h-full bg-white rounded-full pointer-events-none"
                                                        style={{ width: `${volume * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-sm font-medium text-white ml-2 select-none">
                                            {formatTime(currentTime)} / {formatTime(duration || 0)}
                                        </div>
                                    </div>

                                    {/* Right Side */}
                                    <div className="flex items-center gap-4">
                                        <button
                                            className="text-white hover:text-gray-200 transition-colors"
                                            title="Picture in Picture"
                                            onClick={async () => {
                                                if (videoRef.current) {
                                                    if (document.pictureInPictureElement) {
                                                        await document.exitPictureInPicture();
                                                    } else if (document.pictureInPictureEnabled) {
                                                        await videoRef.current.requestPictureInPicture();
                                                    }
                                                }
                                            }}
                                        >
                                            <PictureInPicture2 className="w-6 h-6 stroke-[2]" />
                                        </button>

                                        {/* Settings Menu */}
                                        <div className="relative">
                                            <button
                                                className="text-white hover:text-gray-200 transition-colors"
                                                title="Settings"
                                                onClick={() => setShowSettings(!showSettings)}
                                            >
                                                <Settings2 className="w-6 h-6 stroke-[2]" />
                                            </button>

                                            {/* Settings Dropdown */}
                                            {showSettings && (
                                                <div className="absolute bottom-full right-0 mb-2 w-56 bg-[#2a2a2a] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                                                    {/* Playback Speed */}
                                                    <div className="px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/10">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-white font-medium">Playback Speed</span>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-sm text-gray-300">{playbackSpeed}x</span>
                                                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                                            </div>
                                                        </div>
                                                        {/* Speed Options */}
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {speedOptions.map((speed) => (
                                                                <button
                                                                    key={speed}
                                                                    onClick={() => {
                                                                        setPlaybackSpeed(speed);
                                                                        if (videoRef.current) {
                                                                            videoRef.current.playbackRate = speed;
                                                                        }
                                                                    }}
                                                                    className={`px-2 py-1 text-xs rounded ${playbackSpeed === speed
                                                                        ? 'bg-[#FFB800] text-black font-bold'
                                                                        : 'bg-white/10 text-white hover:bg-white/20'
                                                                        }`}
                                                                >
                                                                    {speed}x
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {/* Quality */}
                                                    <div className="px-4 py-3 hover:bg-white/5 cursor-pointer">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-white font-medium">Quality</span>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-sm text-gray-300">{selectedQuality}</span>
                                                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                                            </div>
                                                        </div>
                                                        {/* Quality Options */}
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            <button
                                                                onClick={() => changeHlsQuality("Auto")}
                                                                className={`px-2 py-1 text-xs rounded ${selectedQuality === "Auto"
                                                                    ? 'bg-[#FFB800] text-black font-bold'
                                                                    : 'bg-white/10 text-white hover:bg-white/20'
                                                                    }`}
                                                            >
                                                                Auto
                                                            </button>
                                                            {hlsQualityLevels.length > 0 ? (
                                                                [...hlsQualityLevels].sort((a, b) => b.height - a.height).map((level) => (
                                                                    <button
                                                                        key={level.height}
                                                                        onClick={() => changeHlsQuality(`${level.height}p`)}
                                                                        className={`px-2 py-1 text-xs rounded ${selectedQuality === `${level.height}p`
                                                                            ? 'bg-[#FFB800] text-black font-bold'
                                                                            : 'bg-white/10 text-white hover:bg-white/20'
                                                                            }`}
                                                                    >
                                                                        {level.height}p
                                                                    </button>
                                                                ))
                                                            ) : (
                                                                ["1080p", "720p", "480p", "360p"].map((quality) => (
                                                                    <button
                                                                        key={quality}
                                                                        onClick={() => setSelectedQuality(quality)}
                                                                        className={`px-2 py-1 text-xs rounded ${selectedQuality === quality
                                                                            ? 'bg-[#FFB800] text-black font-bold'
                                                                            : 'bg-white/10 text-white hover:bg-white/20'
                                                                            }`}
                                                                    >
                                                                        {quality}
                                                                    </button>
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            className="text-white hover:text-gray-200 transition-colors"
                                            title="Fullscreen"
                                            onClick={() => {
                                                const videoContainer = document.querySelector('.aspect-video');
                                                if (videoContainer) {
                                                    if (document.fullscreenElement) {
                                                        document.exitFullscreen();
                                                    } else {
                                                        videoContainer.requestFullscreen();
                                                    }
                                                }
                                            }}
                                        >
                                            <Maximize className="w-6 h-6 stroke-[2]" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between bg-[#161616] border border-white/10 rounded-2xl p-2 sm:p-4 shadow-lg gap-2">
                            <Button
                                variant="ghost"
                                onClick={handlePrevLesson}
                                disabled={!hasPrev}
                                className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5"
                            >
                                <ChevronLeft className="w-5 h-5 sm:mr-2" />
                                <span className="hidden sm:inline">{t("classroom.prev")}</span>
                            </Button>

                            <Button
                                onClick={handleCompleteLesson}
                                className={`font-bold h-10 sm:h-12 px-4 sm:px-8 rounded-full text-sm sm:text-base shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2 ${isCurrentLessonCompleted
                                    ? "bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                                    : "bg-[#FFB800] hover:bg-[#F59E0B] text-black hover:shadow-[0_0_20px_rgba(255,184,0,0.4)]"
                                    }`}
                            >
                                <CheckCircle className={`w-5 h-5 ${isCurrentLessonCompleted ? "fill-white/20" : ""}`} />
                                {isCurrentLessonCompleted ? t("classroom.completed") : t("classroom.markComplete")}
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={handleNextLesson}
                                disabled={!hasNext}
                                className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5"
                            >
                                <span className="hidden sm:inline">{t("classroom.next")}</span>
                                <ChevronRight className="w-5 h-5 sm:ml-2" />
                            </Button>
                        </div>

                        {/* Description / Tabs (Optional, can be added later) */}
                        <div className="bg-[#161616] border border-white/10 rounded-xl p-6 min-h-[200px]">
                            <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">{t("classroom.details")}</h3>
                            <p className="text-gray-400 leading-relaxed">
                                รายละเอียดสำหรับบทเรียน {currentLesson.title} ในหลักสูตร {course.title} เนื้อหาจะครอบคลุมส่วนสำคัญที่จำเป็นสำหรับการเรียนรู้เรื่องนี้...
                            </p>
                        </div>
                    </div>

                    {/* Sidebar (Right Column) */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 h-fit">
                        {/* Course Progress Card */}
                        <div className="bg-[#161616] border border-white/10 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-white">{t("classroom.progress.title")}</h3>
                                <span className="text-gold-500 font-bold">{progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2 mb-4 overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{
                                        width: `${progressPercentage}%`,
                                        background: 'linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #22c55e 100%)'
                                    }}
                                ></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                                <div>
                                    <p className="text-white font-bold">{completedLessonsCount}/{totalLessonsCount}</p>
                                    <p>{t("classroom.progress.completed")}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white font-bold">{Math.round(hoursLeft)} {t("class.unit.hours")}</p>
                                    <p>{t("classroom.progress.timeLeft")}</p>
                                </div>
                            </div>
                        </div>

                        {/* Curriculum Sidebar */}
                        <div className="bg-[#161616] border border-white/10 rounded-xl overflow-hidden">
                            <div className="p-4 border-b border-white/10">
                                <h3 className="font-bold text-white">{t("classroom.curriculum.title")}</h3>
                            </div>
                            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                                {course.chapters.map((chapter: any) => {
                                    const isExpanded = expandedChapters.includes(chapter.id);
                                    const completedInChapter = chapter.lessons.filter((l: any) => completedLessons.has(l.id)).length;

                                    return (
                                        <div key={chapter.id} className="border-b border-white/5 last:border-0">
                                            <button
                                                onClick={() => toggleChapter(chapter.id)}
                                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors bg-gradient-to-r from-[#1a1a1a] to-[#222]"
                                            >
                                                <div className="text-left">
                                                    <h4 className="text-sm font-bold text-gray-200 mb-1">{chapter.title}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${completedInChapter === chapter.lessons.length
                                                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                                                            : "bg-white/5 text-gray-400 border-white/10"
                                                            }`}>
                                                            {completedInChapter}/{chapter.lessons.length} {t("classroom.completed")}
                                                        </span>
                                                    </div>
                                                </div>
                                                <ChevronDown
                                                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                                                />
                                            </button>

                                            <div
                                                className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                                                    }`}
                                            >
                                                <div className="bg-[#0a0a0a]/50 p-2 space-y-1">
                                                    {chapter.lessons.map((lesson: any) => {
                                                        const isActive = currentLesson.id === lesson.id;
                                                        const isCompleted = completedLessons.has(lesson.id);

                                                        return (
                                                            <button
                                                                key={lesson.id}
                                                                onClick={() => setCurrentLesson(lesson)}
                                                                className={`w-full flex items-start p-3 rounded-lg transition-all group ${isActive
                                                                    ? "bg-gradient-to-r from-gold-500/10 to-transparent border-l-[3px] border-gold-500"
                                                                    : "hover:bg-white/5 border-l-[3px] border-transparent"
                                                                    }`}
                                                            >
                                                                <div className={`mt-0.5 mr-3 rounded-full p-1 transition-colors ${isCompleted
                                                                    ? "text-green-500 bg-green-500/10"
                                                                    : isActive
                                                                        ? "bg-gold-500 text-black shadow-[0_0_10px_rgba(255,193,7,0.3)]"
                                                                        : "text-gray-600 bg-white/5 group-hover:bg-white/10"
                                                                    }`}>
                                                                    {isCompleted ? (
                                                                        <CheckCircle className="w-4 h-4" />
                                                                    ) : (
                                                                        lesson.type === 'video' ? <PlayCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />
                                                                    )}
                                                                </div>
                                                                <div className="text-left">
                                                                    <p className={`text-sm font-medium mb-0.5 transition-colors ${isActive ? "text-gold-400" : "text-gray-300 group-hover:text-white"
                                                                        }`}>
                                                                        {lesson.title}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 flex items-center gap-2">
                                                                        {lesson.type === 'video' ? (
                                                                            <span className="flex items-center"><PlayCircle className="w-3 h-3 mr-1" /> {lesson.duration}</span>
                                                                        ) : (
                                                                            <span className="flex items-center"><FileText className="w-3 h-3 mr-1" /> {lesson.duration}</span>
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Connection Card (Mockup) moved to bottom */}
                        <Button
                            className="w-full bg-[#FFB800] hover:bg-[#F59E0B] text-black font-bold h-12 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                        >
                            <MessageCircleQuestion className="w-6 h-6" />
                            <span className="tracking-wide">{t("classroom.ask")}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
