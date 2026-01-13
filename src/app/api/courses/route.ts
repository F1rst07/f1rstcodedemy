
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust path if needed

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const shouldSeed = searchParams.get('seed') === 'true';

        if (shouldSeed) {
            // Check if courses exist to avoid duplicates
            const count = await prisma.course.count();
            if (count === 0) {
                await prisma.course.create({
                    data: {
                        title: "Complete Web Development Bootcamp 2024",
                        description: "Become a full-stack web developer with just one course.",
                        userId: "admin-user",
                        imageUrl: "/course-1.jpg",
                        chapters: {
                            create: [
                                {
                                    title: "Introduction to Web Development",
                                    position: 1,
                                    lessons: {
                                        create: [
                                            { title: "Course Overview", position: 1, type: "video", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "5:20" },
                                            { title: "How the Internet Works", position: 2, type: "video", duration: "12:15" }
                                        ]
                                    }
                                },
                                {
                                    title: "HTML5 Fundamentals",
                                    position: 2,
                                    lessons: {
                                        create: [
                                            { title: "HTML Structure", position: 1, type: "video", duration: "15:30" },
                                            { title: "Tags and Attributes", position: 2, type: "video", duration: "20:00" }
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                });
                return NextResponse.json({ message: "Seeded mockup course" });
            }
        }

        const courses = await prisma.course.findMany({
            include: {
                chapters: {
                    include: {
                        lessons: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(courses);
    } catch (error) {
        console.error("[COURSES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { title, userId } = await req.json();
        const course = await prisma.course.create({
            data: {
                title,
                userId: userId || "admin-1",
            }
        });
        return NextResponse.json(course);
    } catch (error) {
        console.error("[COURSES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
