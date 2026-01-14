"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash, FileText, Globe, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import Image from "next/image";
import toast from "react-hot-toast";

interface Article {
    id: string;
    title: string;
    isPublished: boolean;
    imageUrl: string | null;
    createdAt: string;
}

export default function AdminArticlesPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchArticles = async () => {
        try {
            const res = await fetch("/api/admin/articles");
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

    useEffect(() => {
        fetchArticles();
    }, []);

    const deleteArticle = async (id: string) => {
        if (!confirm("Are you sure you want to delete this article?")) return;

        try {
            const res = await fetch(`/api/admin/articles/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Article deleted");
                fetchArticles();
            } else {
                toast.error("Failed to delete");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        }
    };

    return (
        <div className="py-8 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <FileText className="w-8 h-8 text-gold-400" />
                        Article Management
                    </h1>
                    <p className="text-gray-400 mt-2">Create and manage news and articles for the platform.</p>
                </div>
                <Link href="/admin/articles/create">
                    <Button className="bg-gold-500 hover:bg-gold-400 text-black font-bold">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Article
                    </Button>
                </Link>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin text-gold-500 w-10 h-10" /></div>
            ) : (
                <div className="bg-[#161616] border border-white/10 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="p-4 font-semibold text-gray-400">Article</th>
                                <th className="p-4 font-semibold text-gray-400">Status</th>
                                <th className="p-4 font-semibold text-gray-400">Date</th>
                                <th className="p-4 font-semibold text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-10 text-center text-gray-500">No articles found.</td>
                                </tr>
                            ) : (
                                articles.map((article) => (
                                    <tr key={article.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-10 bg-white/5 rounded overflow-hidden relative shrink-0">
                                                    {article.imageUrl ? (
                                                        <Image src={article.imageUrl} alt={article.title} fill className="object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                            <FileText className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-medium truncate max-w-[250px] sm:max-w-md">{article.title}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {article.isPublished ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                                                    <Globe className="w-3 h-3 mr-1" /> Published
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-gray-500/10 text-gray-400 border border-gray-500/20">
                                                    <EyeOff className="w-3 h-3 mr-1" /> Draft
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm text-gray-400">
                                            {format(new Date(article.createdAt), "dd MMM yyyy")}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/admin/articles/${article.id}`}>
                                                    <Button size="sm" variant="outline" className="h-8 border-white/10 hover:bg-white/10 hover:text-white">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="h-8"
                                                    onClick={() => deleteArticle(article.id)}
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
