"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Save, Upload, X } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ArticleEditorPage({ params }: { params: Promise<{ articleId: string }> }) {
    const router = useRouter();
    // Unwrap params using React.use()
    const { articleId } = use(params);
    const isNew = articleId === "create";

    const [isLoading, setIsLoading] = useState(!isNew);
    const [isSaving, setIsSaving] = useState(false);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isPublished, setIsPublished] = useState(false);

    // File upload state
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (!isNew) {
            const fetchArticle = async () => {
                try {
                    const res = await fetch(`/api/admin/articles/${articleId}`);
                    if (!res.ok) throw new Error("Article not found");
                    const data = await res.json();
                    setTitle(data.title);
                    setContent(data.content);
                    setImageUrl(data.imageUrl || "");
                    setIsPublished(data.isPublished);
                    if (data.imageUrl) setFilePreview(data.imageUrl);
                } catch (error) {
                    toast.error("Failed to load article");
                    router.push("/admin/articles");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchArticle();
        }
    }, [articleId, isNew, router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);

            // Preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) {
            toast.error("Title and Content are required");
            return;
        }

        try {
            setIsSaving(true);
            let finalImageUrl = imageUrl;

            // Upload image if selected
            if (file) {
                const formData = new FormData();
                formData.append("file", file);

                // You previously implemented /api/upload for payments, reusing it generally or specifically?
                // Assuming /api/upload works for generic or we used AWS S3? 
                // Let's assume standard /api/upload logic exists.
                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadRes.ok) {
                    const error = await uploadRes.json();
                    throw new Error(error.error || "Image upload failed");
                }
                const uploadData = await uploadRes.json();
                finalImageUrl = uploadData.url;
            }

            const method = isNew ? "POST" : "PATCH";
            const url = isNew ? "/api/admin/articles" : `/api/admin/articles/${articleId}`;

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    content,
                    imageUrl: finalImageUrl || null, // FIX: Send null if empty string
                    isPublished
                })
            });

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error || "Failed to save");
            }

            toast.success(isNew ? "Article created!" : "Article updated!");
            router.push("/admin/articles");
            router.refresh();


        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Something went wrong");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-white"><Loader2 className="animate-spin w-8 h-8 text-gold-500" /></div>;
    }

    return (
        <div className="p-4 sm:p-8 max-w-5xl mx-auto text-white pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/articles">
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">{isNew ? "Create Article" : "Edit Article"}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-gray-300">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter article title..."
                            className="bg-white/5 border-white/10 text-white text-lg h-12 focus-visible:ring-gold-500/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content" className="text-gray-300">Content (HTML Supported)</Label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white min-h-[500px] focus:outline-none focus:ring-2 focus:ring-gold-500/50 font-mono text-sm leading-relaxed"
                            placeholder="<p>Write your content here...</p>"
                        />
                        <p className="text-xs text-gray-500">Currently executing raw HTML support. Be careful with tags.</p>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Actions Card */}
                    <div className="bg-[#161616] border border-white/10 rounded-xl p-6 space-y-4">
                        <h3 className="font-bold text-white">Publishing</h3>

                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <Label htmlFor="published" className="text-sm text-gray-300 cursor-pointer">Published</Label>
                            <input
                                type="checkbox"
                                id="published"
                                checked={isPublished}
                                onChange={(e) => setIsPublished(e.target.checked)}
                                className="w-5 h-5 accent-gold-500 cursor-pointer rounded bg-white/10 border-white/20"
                            />
                        </div>

                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full bg-gold-500 hover:bg-gold-400 text-black font-bold h-12"
                        >
                            {isSaving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Article
                        </Button>
                    </div>

                    <div className="bg-[#161616] border border-white/10 rounded-xl p-6">
                        <h3 className="font-bold text-white mb-4">Cover Image</h3>

                        <div className="space-y-4">
                            {/* Preview */}
                            <div className="aspect-video bg-black/40 rounded-lg border border-white/10 overflow-hidden relative flex items-center justify-center group">
                                {filePreview ? (
                                    <>
                                        <Image src={filePreview || ""} alt="Preview" fill className="object-cover" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => {
                                                    setFile(null);
                                                    setFilePreview(null);
                                                    setImageUrl("");
                                                }}
                                            >
                                                <X className="w-4 h-4" /> Remove
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-4">
                                        <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                                        <span className="text-xs text-gray-500">No image selected</span>
                                    </div>
                                )}
                            </div>

                            {/* Upload Input */}
                            <div>
                                <input
                                    type="file"
                                    id="image-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <Label
                                    htmlFor="image-upload"
                                    className="flex items-center justify-center w-full h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg cursor-pointer transition-colors text-sm font-medium text-gray-300"
                                >
                                    Choose Image
                                </Label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
