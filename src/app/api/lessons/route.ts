import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Create new lesson
export async function POST(req: Request) {
    try {
        const { chapterId, title, type = 'video' } = await req.json();

        // Get the highest position in existing lessons
        const lastLesson = await prisma.lesson.findFirst({
            where: { chapterId },
            orderBy: { position: 'desc' }
        });

        const newPosition = (lastLesson?.position || 0) + 1;

        const lesson = await prisma.lesson.create({
            data: {
                title,
                chapterId,
                position: newPosition,
                type
            }
        });

        return NextResponse.json(lesson);
    } catch (error) {
        console.error("[LESSONS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// DELETE - Delete lesson by ID (via query param)
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const lessonId = searchParams.get('id');

        if (!lessonId) {
            return new NextResponse("Lesson ID required", { status: 400 });
        }

        await prisma.lesson.delete({
            where: { id: lessonId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[LESSONS_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
