import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Create new chapter
export async function POST(req: Request) {
    try {
        const { courseId, title } = await req.json();

        // Get the highest position in existing chapters
        const lastChapter = await prisma.chapter.findFirst({
            where: { courseId },
            orderBy: { position: 'desc' }
        });

        const newPosition = (lastChapter?.position || 0) + 1;

        const chapter = await prisma.chapter.create({
            data: {
                title,
                courseId,
                position: newPosition
            },
            include: {
                lessons: true
            }
        });

        return NextResponse.json(chapter);
    } catch (error) {
        console.error("[CHAPTERS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// DELETE - Delete chapter by ID (via query param)
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const chapterId = searchParams.get('id');

        if (!chapterId) {
            return new NextResponse("Chapter ID required", { status: 400 });
        }

        // Delete all lessons in this chapter first
        await prisma.lesson.deleteMany({
            where: { chapterId }
        });

        // Then delete the chapter
        await prisma.chapter.delete({
            where: { id: chapterId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[CHAPTERS_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
