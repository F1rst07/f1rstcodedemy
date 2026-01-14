import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const totalUsers = await prisma.user.count({ where: { role: "STUDENT" } });
        const totalCourses = await prisma.course.count();

        const paidOrders = await prisma.order.findMany({
            where: { status: "COMPLETED" },
            orderBy: { createdAt: "asc" }
        });

        const pendingOrders = await prisma.order.count({
            where: { status: "PENDING_REVIEW" }
        });

        const totalRevenue = paidOrders.reduce((acc, order) => acc + order.total, 0);
        const totalSales = paidOrders.length;

        const recentOrders = await prisma.order.findMany({
            where: { status: "COMPLETED" },
            take: 5,
            orderBy: { createdAt: "desc" },
            include: { user: true, course: true }
        });

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentDate = now.getDate();

        // Year start (Jan 1st)
        const yearStart = new Date(currentYear, 0, 1);

        // Calculate days from Jan 1 to today
        const daysSinceYearStart = Math.floor((now.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        // Daily revenue (from Jan 1st to today)
        const dailyRevenue: { label: string; revenue: number; orders: number; date: string }[] = [];
        for (let i = 0; i < daysSinceYearStart; i++) {
            const date = new Date(yearStart);
            date.setDate(yearStart.getDate() + i);
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

            const dayOrders = paidOrders.filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= dayStart && orderDate < dayEnd;
            });

            dailyRevenue.push({
                label: date.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric' }),
                date: date.toISOString().split('T')[0],
                revenue: dayOrders.reduce((acc, o) => acc + o.total, 0),
                orders: dayOrders.length
            });
        }

        // Weekly revenue (from week 1 to current week)
        const currentWeekStart = new Date(now);
        currentWeekStart.setDate(now.getDate() - now.getDay());
        currentWeekStart.setHours(0, 0, 0, 0);

        const weeklyRevenue: { label: string; revenue: number; orders: number }[] = [];
        let weekNumber = 1;
        let weekStart = new Date(yearStart);
        // Adjust to start of week
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());

        while (weekStart <= now) {
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 7);

            const weekOrders = paidOrders.filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= weekStart && orderDate < weekEnd && orderDate >= yearStart;
            });

            weeklyRevenue.push({
                label: `สัปดาห์ ${weekNumber}`,
                revenue: weekOrders.reduce((acc, o) => acc + o.total, 0),
                orders: weekOrders.length
            });

            weekStart.setDate(weekStart.getDate() + 7);
            weekNumber++;
        }

        // Monthly revenue (Jan to current month)
        const monthlyRevenue: { label: string; revenue: number; orders: number }[] = [];
        for (let i = 0; i <= currentMonth; i++) {
            const monthStart = new Date(currentYear, i, 1);
            const monthEnd = new Date(currentYear, i + 1, 1);

            const monthOrders = paidOrders.filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= monthStart && orderDate < monthEnd;
            });

            monthlyRevenue.push({
                label: monthStart.toLocaleDateString('th-TH', { month: 'short' }),
                revenue: monthOrders.reduce((acc, o) => acc + o.total, 0),
                orders: monthOrders.length
            });
        }

        // Yearly revenue (last 5 years)
        const yearlyRevenue: { label: string; revenue: number; orders: number }[] = [];
        for (let i = 4; i >= 0; i--) {
            const year = currentYear - i;
            const yStart = new Date(year, 0, 1);
            const yEnd = new Date(year + 1, 0, 1);

            const yearOrders = paidOrders.filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= yStart && orderDate < yEnd;
            });

            yearlyRevenue.push({
                label: `${year + 543}`, // Thai Buddhist year
                revenue: yearOrders.reduce((acc, o) => acc + o.total, 0),
                orders: yearOrders.length
            });
        }

        // Period summaries
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayOrders = paidOrders.filter(o => new Date(o.createdAt) >= todayStart);
        const todayRevenue = todayOrders.reduce((acc, o) => acc + o.total, 0);

        const thisWeekOrders = paidOrders.filter(o => new Date(o.createdAt) >= currentWeekStart);
        const thisWeekRevenue = thisWeekOrders.reduce((acc, o) => acc + o.total, 0);

        const thisMonthStart = new Date(currentYear, currentMonth, 1);
        const thisMonthOrders = paidOrders.filter(o => new Date(o.createdAt) >= thisMonthStart);
        const thisMonthRevenue = thisMonthOrders.reduce((acc, o) => acc + o.total, 0);

        const thisYearOrders = paidOrders.filter(o => new Date(o.createdAt) >= yearStart);
        const thisYearRevenue = thisYearOrders.reduce((acc, o) => acc + o.total, 0);

        return NextResponse.json({
            totalUsers,
            totalCourses,
            totalRevenue,
            totalSales,
            pendingOrders,
            recentOrders: recentOrders.map(order => ({
                id: order.id,
                total: order.total,
                userName: order.user.name || order.user.email,
                userInitial: order.user.name?.[0] || order.user.email?.[0] || '?',
                courseTitle: order.course?.title || 'ไม่ระบุคอร์ส'
            })),
            revenueData: {
                daily: dailyRevenue,
                weekly: weeklyRevenue,
                monthly: monthlyRevenue,
                yearly: yearlyRevenue
            },
            periodSummary: {
                today: { revenue: todayRevenue, orders: todayOrders.length },
                thisWeek: { revenue: thisWeekRevenue, orders: thisWeekOrders.length },
                thisMonth: { revenue: thisMonthRevenue, orders: thisMonthOrders.length },
                thisYear: { revenue: thisYearRevenue, orders: thisYearOrders.length }
            },
            currentDate: {
                year: currentYear,
                month: currentMonth,
                date: currentDate,
                dayOfYear: daysSinceYearStart
            }
        });
    } catch (error: any) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
