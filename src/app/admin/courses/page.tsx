
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Loader2, Edit, Trash2, X } from "lucide-react";

interface Course {
    id: string;
    title: string;
    chapters: { lessons: any[] }[];
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCourseTitle, setNewCourseTitle] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const fetchCourses = async () => {
        try {
            const res = await fetch("/api/courses");
            const data = await res.json();
            setCourses(data);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSeed = async () => {
        setIsLoading(true);
        await fetch("/api/courses?seed=true");
        await fetchCourses();
    };

    const handleCreateCourse = async () => {
        if (!newCourseTitle.trim()) return;
        setIsCreating(true);
        try {
            const res = await fetch("/api/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newCourseTitle })
            });
            if (res.ok) {
                setNewCourseTitle("");
                setShowCreateModal(false);
                await fetchCourses();
            }
        } catch (error) {
            console.error("Failed to create course", error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteCourse = async (courseId: string) => {
        if (!confirm("Are you sure you want to delete this course? This will delete all chapters and lessons.")) return;
        try {
            await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
            await fetchCourses();
        } catch (error) {
            console.error("Failed to delete course", error);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    return (
        <div className="p-6 max-w-7xl mx-auto text-white">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-100">Course Manager</h1>
                <div className="flex gap-3">
                    <Button onClick={() => setShowCreateModal(true)} className="bg-gold-500 hover:bg-gold-400 text-black">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Create Course
                    </Button>
                    <Button onClick={handleSeed} variant="outline" className="text-black border-white/20 hover:bg-white/10">
                        {courses.length === 0 ? "Initialize Demo Data" : "Refresh Data"}
                    </Button>
                </div>
            </div>

            {/* Create Course Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Create New Course</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">Course Title</label>
                                <Input
                                    value={newCourseTitle}
                                    onChange={(e) => setNewCourseTitle(e.target.value)}
                                    placeholder="Enter course title..."
                                    className="bg-black border-white/10 focus:border-gold-500"
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateCourse()}
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                                <Button onClick={handleCreateCourse} disabled={isCreating || !newCourseTitle.trim()} className="bg-gold-500 hover:bg-gold-400 text-black">
                                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center p-10"><Loader2 className="animate-spin w-10 h-10 text-gold-500" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <div key={course.id} className="bg-[#161616] border border-white/10 rounded-xl p-6 hover:border-gold-500/50 transition-all group">
                            <div className="flex items-start justify-between mb-2">
                                <h2 className="text-xl font-bold truncate flex-1">{course.title}</h2>
                                <button
                                    onClick={() => handleDeleteCourse(course.id)}
                                    className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                                    title="Delete Course"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-400 mb-6">
                                {course.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)} Lessons
                            </p>
                            <Link href={`/admin/courses/${course.id}`}>
                                <Button className="w-full bg-white/5 hover:bg-gold-500 hover:text-black transition-colors border border-white/10">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Manage Content
                                </Button>
                            </Link>
                        </div>
                    ))}

                    {courses.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-xl">
                            No courses found. Click "Initialize Demo Data" or "Create Course" to start.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
