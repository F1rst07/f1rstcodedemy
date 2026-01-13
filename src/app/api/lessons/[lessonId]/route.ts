
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust path

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ lessonId: string }> }
) {
    try {
        const { lessonId } = await params;
        const { videoUrl, title, isPublished } = await req.json();

        const lesson = await prisma.lesson.update({
            where: { id: lessonId },
            data: {
                videoUrl,
                title,
                ...(isPublished !== undefined && { isPublished }),
            }
        });

        return NextResponse.json(lesson);
    } catch (error) {
        console.error("[LESSON_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
