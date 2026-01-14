
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowLeft, Clock } from "lucide-react";
import { Metadata } from 'next';
import { notFound } from "next/navigation";

// Generate Metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ articleId: string }> }): Promise<Metadata> {
    const { articleId } = await params;
    const article = await prisma.article.findUnique({ where: { id: articleId } });

    if (!article) return { title: 'Article Not Found' };

    return {
        title: `${article.title} | F1RSTCODE DEMY`,
        description: article.content.substring(0, 150), // Simple snippet
        openGraph: {
            title: article.title,
            description: article.content.substring(0, 150),
            images: article.imageUrl ? [article.imageUrl] : [],
        }
    };
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ articleId: string }> }) {
    const { articleId } = await params;

    const article = await prisma.article.findUnique({
        where: { id: articleId }
    });

    if (!article) {
        notFound();
    }

    // Determine Language (Simple check or default EN/TH, Server Components don't access Context easily without cookies)
    // We will default to standard formatting, maybe use a client wrapper for rigorous localization if needed.
    // For now, hardcode "TH" format preference since user asked for "Translate to Thai".

    return (
        <div className="min-h-screen bg-black pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <article className="mx-auto max-w-4xl">
                {/* Back Link */}
                <Link href="/articles" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors group">
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Articles
                </Link>

                {/* Hero Image */}
                {article.imageUrl && (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-8 border border-white/10 shadow-2xl">
                        <Image
                            src={article.imageUrl}
                            alt={article.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                )}

                {/* Header */}
                <header className="mb-10">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                        <span className="flex items-center text-gold-500">
                            <Calendar className="w-4 h-4 mr-2" />
                            {(() => {
                                const isUpdated = new Date(article.updatedAt).getTime() > new Date(article.createdAt).getTime() + 1000;
                                return (
                                    <>
                                        {`${format(new Date(article.createdAt), "d MMMM", { locale: th })} ${new Date(article.createdAt).getFullYear() + 543}`}
                                        {isUpdated && (
                                            <span className="text-gray-400 ml-2">
                                                (อัปเดต {format(new Date(article.updatedAt), "d MMM", { locale: th })} {new Date(article.updatedAt).getFullYear() + 543} {format(new Date(article.updatedAt), "HH:mm")} น.)
                                            </span>
                                        )}
                                    </>
                                );
                            })()}
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                        {article.title}
                    </h1>
                </header>

                {/* Content */}
                <div
                    className="prose prose-invert prose-lg max-w-none 
                    prose-headings:text-white prose-p:text-gray-300 prose-a:text-gold-400 prose-strong:text-white
                    prose-img:rounded-xl prose-img:border prose-img:border-white/10"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />
            </article>
        </div>
    );
}
