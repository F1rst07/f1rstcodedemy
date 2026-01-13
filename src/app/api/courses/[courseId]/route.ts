
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust path

export async function GET(
    req: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const { courseId } = await params;
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                chapters: {
                    orderBy: { position: 'asc' },
                    include: {
                        lessons: {
                            orderBy: { position: 'asc' }
                        }
                    }
                }
            }
        });

        if (!course) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(course);
    } catch (error) {
        console.error("[COURSE_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const { courseId } = await params;
        // Delete all lessons in all chapters
        const chapters = await prisma.chapter.findMany({
            where: { courseId },
            select: { id: true }
        });

        for (const chapter of chapters) {
            await prisma.lesson.deleteMany({
                where: { chapterId: chapter.id }
            });
        }

        // Delete all chapters
        await prisma.chapter.deleteMany({
            where: { courseId }
        });

        // Delete the course
        await prisma.course.delete({
            where: { id: courseId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[COURSE_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
