import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const purchases = await prisma.purchase.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                course: {
                    include: {
                        chapters: {
                            where: { isPublished: true },
                            include: {
                                lessons: {
                                    where: { isPublished: true },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Transform data to match the Course interface expected by the frontend
        const enrolledCourses = purchases.map((purchase) => {
            const course = purchase.course;
            const totalLessons = course.chapters.reduce(
                (acc, chapter) => acc + chapter.lessons.length,
                0
            );

            // TODO: Calculate real progress based on UserProgress
            // For now, return 0 completed

            return {
                id: course.id,
                title: course.title,
                image: course.imageUrl || "",
                lessons: totalLessons,
                completedLessons: 0, // Placeholder
                hoursLeft: 0, // Placeholder
                totalHours: 0, // Placeholder
                expiryDate: null, // Lifetime access usually
                status: "learning", // Default status
            };
        });

        return NextResponse.json(enrolledCourses);
    } catch (error) {
        console.error("[ENROLLED_COURSES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
