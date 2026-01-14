
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Video, Save, UploadCloud, PlusCircle, Trash2, X, FolderPlus } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Lesson {
    id: string;
    title: string;
    videoUrl: string | null;
    position: number;
}

interface Chapter {
    id: string;
    title: string;
    lessons: Lesson[];
    position: number;
}

interface Course {
    id: string;
    title: string;
    description: string | null;
    price: number | null;
    isPublished: boolean;
    imageUrl: string | null;
    chapters: Chapter[];
}

export default function CourseEditorPage() {
    const params = useParams();
    const router = useRouter();
    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ title: "", videoUrl: "" });
    const [isSaving, setIsSaving] = useState(false);

    // Chapter creation
    const [showAddChapter, setShowAddChapter] = useState(false);
    const [newChapterTitle, setNewChapterTitle] = useState("");

    // Lesson creation
    const [addingLessonToChapterId, setAddingLessonToChapterId] = useState<string | null>(null);
    const [newLessonTitle, setNewLessonTitle] = useState("");

    const fetchCourse = async () => {
        const res = await fetch(`/api/courses/${params.courseId}`);
        if (!res.ok) return;
        const data = await res.json();
        setCourse(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchCourse();
    }, [params.courseId]);

    const startEditing = (lesson: Lesson) => {
        setEditingLessonId(lesson.id);
        setEditForm({ title: lesson.title, videoUrl: lesson.videoUrl || "" });
    };

    const saveLesson = async () => {
        if (!editingLessonId) return;
        setIsSaving(true);
        try {
            await fetch(`/api/lessons/${editingLessonId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });
            await fetchCourse();
            setEditingLessonId(null);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleMockUpload = () => {
        const mockUrls = [
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        ];
        const randomUrl = mockUrls[Math.floor(Math.random() * mockUrls.length)];
        setEditForm(prev => ({ ...prev, videoUrl: randomUrl }));
        alert("Video uploaded successfully! (Mock)");
    };

    // Chapter CRUD
    const handleAddChapter = async () => {
        if (!newChapterTitle.trim()) return;
        setIsSaving(true);
        try {
            await fetch('/api/chapters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId: params.courseId, title: newChapterTitle })
            });
            setNewChapterTitle("");
            setShowAddChapter(false);
            await fetchCourse();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteChapter = async (chapterId: string) => {
        if (!confirm("Delete this chapter and all its lessons?")) return;
        try {
            await fetch(`/api/chapters?id=${chapterId}`, { method: 'DELETE' });
            await fetchCourse();
        } catch (error) {
            console.error(error);
        }
    };

    // Lesson CRUD
    const handleAddLesson = async (chapterId: string) => {
        if (!newLessonTitle.trim()) return;
        setIsSaving(true);
        try {
            await fetch('/api/lessons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chapterId, title: newLessonTitle })
            });
            setNewLessonTitle("");
            setAddingLessonToChapterId(null);
            await fetchCourse();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateCourse = async (values: Partial<Course>) => {
        setIsSaving(true);
        try {
            await fetch(`/api/courses/${params.courseId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            });
            await fetchCourse();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteLesson = async (lessonId: string) => {
        if (!confirm("Delete this lesson?")) return;
        try {
            await fetch(`/api/lessons?id=${lessonId}`, { method: 'DELETE' });
            await fetchCourse();
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-gold-500" /></div>;
    if (!course) return <div className="p-10 text-white">Course not found</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto text-white">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6 hover:text-gold-500 pl-0">
                <ArrowLeft className="w-5 h-5 mr-2" /> Back to Courses
            </Button>

            <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold">{course.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>ID: {course.id}</span>
                        <span className={course.isPublished ? "text-green-500" : "text-yellow-500"}>
                            {course.isPublished ? "Published" : "Draft"}
                        </span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={() => handleUpdateCourse({ isPublished: !course.isPublished })}
                        variant={course.isPublished ? "destructive" : "default"}
                        className={course.isPublished ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "bg-green-600 hover:bg-green-700 text-white"}
                    >
                        {course.isPublished ? "Unpublish" : "Publish Course"}
                    </Button>
                </div>
            </div>

            {/* Course Metadata Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-[#161616] border border-white/10 rounded-xl p-6 space-y-4">
                    <h3 className="font-bold text-lg border-b border-white/10 pb-2 mb-4">Course Details</h3>
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Title</label>
                        <Input
                            defaultValue={course.title}
                            onBlur={(e) => handleUpdateCourse({ title: e.target.value })}
                            className="bg-black border-white/10 text-white"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Description</label>
                        <textarea
                            defaultValue={course.description || ""}
                            onBlur={(e) => handleUpdateCourse({ description: e.target.value })}
                            className="w-full bg-black border border-white/10 rounded-md p-2 text-white min-h-[100px]"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Price (THB)</label>
                        <Input
                            type="number"
                            defaultValue={course.price || 0}
                            onBlur={(e) => handleUpdateCourse({ price: parseFloat(e.target.value) })}
                            className="bg-black border-white/10 text-white"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Cover Image URL</label>
                        <div className="flex gap-2">
                            <Input
                                defaultValue={course.imageUrl || ""}
                                onBlur={(e) => handleUpdateCourse({ imageUrl: e.target.value })}
                                className="bg-black border-white/10 text-white flex-1"
                                placeholder="http://..."
                            />
                        </div>
                    </div>
                </div>
                {/* Preview Image */}
                <div className="bg-[#161616] border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center min-h-[300px]">
                    {course.imageUrl ? (
                        <img src={course.imageUrl} alt="Cover" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                        <div className="text-gray-500 flex flex-col items-center">
                            <UploadCloud className="w-12 h-12 mb-2 opacity-50" />
                            <p>No Cover Image</p>
                        </div>
                    )}
                </div>
            </div>

            <h3 className="font-bold text-2xl mb-4">Course Content</h3>

            <div className="space-y-6">
                {course.chapters.map((chapter) => (
                    <div key={chapter.id} className="bg-[#161616] border border-white/10 rounded-xl overflow-hidden">
                        <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Chapter {chapter.position}: {chapter.title}</h3>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-400">{chapter.lessons.length} Lessons</span>
                                <button
                                    onClick={() => handleDeleteChapter(chapter.id)}
                                    className="text-gray-500 hover:text-red-500 transition-colors"
                                    title="Delete Chapter"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 space-y-3">
                            {chapter.lessons.map((lesson) => (
                                <div key={lesson.id} className={`p-4 rounded-lg border transition-all ${editingLessonId === lesson.id ? 'bg-[#1F1F1F] border-gold-500' : 'bg-black/20 border-white/5 hover:border-white/10'}`}>
                                    {editingLessonId === lesson.id ? (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Lesson Title</label>
                                                <Input
                                                    value={editForm.title}
                                                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                                    className="bg-black border-white/10 focus:border-gold-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Video Source</label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={editForm.videoUrl}
                                                        onChange={e => setEditForm({ ...editForm, videoUrl: e.target.value })}
                                                        placeholder="Enter Video URL (YouTube, MP4 Link...)"
                                                        className="bg-black border-white/10 focus:border-gold-500 flex-1"
                                                    />
                                                    <Button onClick={handleMockUpload} variant="secondary" className="bg-white/10 hover:bg-white/20">
                                                        <UploadCloud className="w-4 h-4 mr-2" />
                                                        Upload
                                                    </Button>
                                                </div>
                                                <p className="text-[10px] text-gray-500 mt-1">Supports Direct MP4 links, YouTube Embeds, etc.</p>
                                            </div>
                                            <div className="flex justify-end gap-2 mt-2">
                                                <Button variant="ghost" onClick={() => setEditingLessonId(null)} size="sm">Cancel</Button>
                                                <Button onClick={saveLesson} disabled={isSaving} size="sm" className="bg-gold-500 text-black hover:bg-gold-400">
                                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${lesson.videoUrl ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    <Video className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{lesson.position}. {lesson.title}</p>
                                                    <p className="text-xs text-gray-500 truncate max-w-[300px]">{lesson.videoUrl || "No video uploaded"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" variant="outline" onClick={() => startEditing(lesson)} className="border-white/10 hover:bg-white/10 text-xs h-8">
                                                    Edit / Upload
                                                </Button>
                                                <button
                                                    onClick={() => handleDeleteLesson(lesson.id)}
                                                    className="text-gray-500 hover:text-red-500 transition-colors p-1"
                                                    title="Delete Lesson"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Add Lesson */}
                            {addingLessonToChapterId === chapter.id ? (
                                <div className="flex gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                                    <Input
                                        value={newLessonTitle}
                                        onChange={(e) => setNewLessonTitle(e.target.value)}
                                        placeholder="Lesson Title..."
                                        className="bg-black border-white/10 focus:border-gold-500 flex-1"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddLesson(chapter.id)}
                                        autoFocus
                                    />
                                    <Button onClick={() => handleAddLesson(chapter.id)} disabled={isSaving || !newLessonTitle.trim()} size="sm" className="bg-gold-500 text-black hover:bg-gold-400">
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
                                    </Button>
                                    <Button variant="ghost" onClick={() => { setAddingLessonToChapterId(null); setNewLessonTitle(""); }} size="sm">
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setAddingLessonToChapterId(chapter.id)}
                                    className="w-full p-3 border border-dashed border-white/10 rounded-lg text-gray-500 hover:text-gold-500 hover:border-gold-500/50 transition-all flex items-center justify-center gap-2 text-sm"
                                >
                                    <PlusCircle className="w-4 h-4" /> Add Lesson
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {/* Add Chapter */}
                {showAddChapter ? (
                    <div className="bg-[#161616] border border-gold-500/50 rounded-xl p-4 flex gap-3">
                        <Input
                            value={newChapterTitle}
                            onChange={(e) => setNewChapterTitle(e.target.value)}
                            placeholder="Chapter Title..."
                            className="bg-black border-white/10 focus:border-gold-500 flex-1"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddChapter()}
                            autoFocus
                        />
                        <Button onClick={handleAddChapter} disabled={isSaving || !newChapterTitle.trim()} className="bg-gold-500 text-black hover:bg-gold-400">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Chapter"}
                        </Button>
                        <Button variant="ghost" onClick={() => { setShowAddChapter(false); setNewChapterTitle(""); }}>
                            Cancel
                        </Button>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowAddChapter(true)}
                        className="w-full p-6 border-2 border-dashed border-white/10 rounded-xl text-gray-500 hover:text-gold-500 hover:border-gold-500/50 transition-all flex items-center justify-center gap-3 text-lg font-medium"
                    >
                        <FolderPlus className="w-6 h-6" /> Add New Chapter
                    </button>
                )}
            </div>
        </div>
    );
}
