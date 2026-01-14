"use client";

import { useState, useEffect, useRef } from "react";
import { CreditCard, DollarSign, Users, BookOpen, FileText, Ticket, ShoppingBag, TrendingUp, ArrowUpRight, RefreshCw, Clock, Sparkles, Calendar, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface RevenueDataPoint {
    label: string;
    revenue: number;
    orders: number;
    date?: string;
}

interface DashboardData {
    totalUsers: number;
    totalCourses: number;
    totalRevenue: number;
    totalSales: number;
    pendingOrders: number;
    recentOrders: {
        id: string;
        total: number;
        userName: string;
        userInitial: string;
        courseTitle: string;
    }[];
    revenueData: {
        daily: RevenueDataPoint[];
        weekly: RevenueDataPoint[];
        monthly: RevenueDataPoint[];
        yearly: RevenueDataPoint[];
    };
    periodSummary: {
        today: { revenue: number; orders: number };
        thisWeek: { revenue: number; orders: number };
        thisMonth: { revenue: number; orders: number };
        thisYear: { revenue: number; orders: number };
    };
}

const DashboardCard = ({ label, value, icon: Icon, description, gradient }: any) => {
    return (
        <div className="group relative bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 hover:border-gold-500/40 transition-all duration-500 hover:shadow-[0_0_40px_rgba(245,158,11,0.15)] overflow-hidden">
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient}`} />
            <div className="relative z-10">
                <div className="flex items-center justify-between pb-2">
                    <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">{label}</p>
                    <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-white/10 transition-all duration-300 group-hover:scale-110">
                        <Icon className="h-5 w-5 text-gold-500" />
                    </div>
                </div>
                <div className="text-4xl font-bold text-white mt-3 tracking-tight">{value}</div>
                <p className="text-xs text-gray-500 mt-3 group-hover:text-gray-400 transition-colors">{description}</p>
            </div>
        </div>
    );
};

const QuickActionCard = ({ href, icon: Icon, label, description, gradient, iconColor }: any) => (
    <Link href={href} className="group block">
        <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 hover:border-gold-500/40 transition-all duration-300 overflow-hidden">
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ${gradient}`} />
            <div className="relative z-10 flex items-center gap-4">
                <div className={`p-3.5 rounded-xl ${iconColor} transition-all duration-300 group-hover:scale-110`}>
                    <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                    <p className="font-semibold text-white group-hover:text-gold-400 transition-colors">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-600 group-hover:text-gold-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
            </div>
        </div>
    </Link>
);

const RealtimeClock = () => {
    const [time, setTime] = useState<string>("");
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const formatted = now.toLocaleString('th-TH', {
                timeZone: 'Asia/Bangkok',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            setTime(formatted);
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-3 bg-gradient-to-r from-[#0a0a0a] to-[#111] border border-white/10 rounded-xl px-5 py-3 shadow-lg">
            <div className="relative">
                <Clock className="h-5 w-5 text-gold-500" />
                <div className="absolute inset-0 animate-ping">
                    <Clock className="h-5 w-5 text-gold-500/30" />
                </div>
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-gray-500">เวลาปัจจุบัน</span>
                <span className="text-gold-400 font-mono font-semibold tabular-nums text-sm">{time || "..."}</span>
            </div>
        </div>
    );
};

// Revenue Chart Component
type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly';

const RevenueChart = ({
    revenueData,
    periodSummary
}: {
    revenueData: DashboardData['revenueData'];
    periodSummary: DashboardData['periodSummary'];
}) => {
    const [activePeriod, setActivePeriod] = useState<PeriodType>('daily');
    const [viewOffset, setViewOffset] = useState(0);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Date picker state - default to today
    const now = new Date();
    const currentYear = now.getFullYear();
    const [searchDay, setSearchDay] = useState<number>(now.getDate());
    const [searchMonth, setSearchMonth] = useState<number>(now.getMonth() + 1);
    const [searchYear, setSearchYear] = useState<number>(currentYear);

    const periods: { key: PeriodType; label: string; icon: string }[] = [
        { key: 'daily', label: 'รายวัน', icon: '📅' },
        { key: 'weekly', label: 'รายสัปดาห์', icon: '📆' },
        { key: 'monthly', label: 'รายเดือน', icon: '📊' },
        { key: 'yearly', label: 'รายปี', icon: '📈' },
    ];

    const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

    // Items per view based on period
    const ITEMS_PER_VIEW = activePeriod === 'daily' ? 14 : activePeriod === 'weekly' ? 6 : activePeriod === 'monthly' ? 12 : 5;

    const allData = revenueData[activePeriod] || [];
    const totalItems = allData.length;

    // Calculate max offset
    const maxOffset = Math.max(0, totalItems - ITEMS_PER_VIEW);

    // Reset to latest data when period changes
    useEffect(() => {
        setViewOffset(maxOffset);
    }, [activePeriod, maxOffset]);

    // Calculate visible data slice
    const startIndex = Math.max(0, Math.min(viewOffset, maxOffset));
    const endIndex = Math.min(startIndex + ITEMS_PER_VIEW, totalItems);
    const currentData = allData.slice(startIndex, endIndex);

    // Calculate max revenue for visible data for better bar proportions
    const visibleMaxRevenue = Math.max(...currentData.map(d => d.revenue), 1);

    // Navigation
    const canGoBack = startIndex > 0;
    const canGoForward = endIndex < totalItems;

    const handlePrev = () => {
        setViewOffset(prev => Math.max(0, prev - Math.ceil(ITEMS_PER_VIEW / 2)));
    };

    const handleNext = () => {
        setViewOffset(prev => Math.min(maxOffset, prev + Math.ceil(ITEMS_PER_VIEW / 2)));
    };

    const handleGoToStart = () => {
        setViewOffset(0);
    };

    const handleGoToEnd = () => {
        setViewOffset(maxOffset);
    };

    // Search handler
    const handleSearch = () => {
        if (activePeriod === 'daily') {
            const targetDate = new Date(searchYear, searchMonth - 1, searchDay);
            const yearStart = new Date(currentYear, 0, 1);
            const daysDiff = Math.floor((targetDate.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
            setViewOffset(Math.max(0, Math.min(daysDiff, maxOffset)));
        } else if (activePeriod === 'monthly') {
            setViewOffset(0); // Show from start for monthly
        } else if (activePeriod === 'weekly') {
            const targetDate = new Date(searchYear, searchMonth - 1, searchDay);
            const yearStart = new Date(currentYear, 0, 1);
            const weekNum = Math.ceil((targetDate.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24 * 7));
            setViewOffset(Math.max(0, Math.min(weekNum - 1, maxOffset)));
        }
        setShowDatePicker(false);
    };

    // Calculate summary for visible range
    const summary = {
        revenue: currentData.reduce((acc, d) => acc + d.revenue, 0),
        orders: currentData.reduce((acc, d) => acc + d.orders, 0)
    };

    // Get current period summary
    const getPeriodSummary = () => {
        switch (activePeriod) {
            case 'daily': return periodSummary.today;
            case 'weekly': return periodSummary.thisWeek;
            case 'monthly': return periodSummary.thisMonth;
            case 'yearly': return periodSummary.thisYear;
        }
    };

    const todaySummary = getPeriodSummary();

    return (
        <div className="col-span-1 lg:col-span-4 bg-gradient-to-br from-[#0a0a0a] via-[#0d0d0d] to-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-3xl" />

            {/* Header */}
            <div className="relative flex flex-col gap-4 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-gold-500/20 to-amber-500/10 rounded-xl border border-gold-500/20">
                            <BarChart3 className="h-5 w-5 text-gold-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">ภาพรวมรายได้ ปี {currentYear + 543}</h3>
                            <p className="text-xs text-gray-500">ข้อมูล Real-time ตั้งแต่ 1 ม.ค. {currentYear + 543}</p>
                        </div>
                    </div>
                </div>

                {/* Period Tabs */}
                <div className="flex flex-wrap items-center gap-2">
                    {periods.map(period => (
                        <button
                            key={period.key}
                            onClick={() => setActivePeriod(period.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${activePeriod === period.key
                                ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-black shadow-lg shadow-gold-500/20'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                                }`}
                        >
                            <span className="text-sm">{period.icon}</span>
                            {period.label}
                        </button>
                    ))}

                    {/* Date Picker Toggle */}
                    <button
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ml-auto ${showDatePicker
                            ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                            }`}
                    >
                        <Calendar className="h-4 w-4" />
                        ค้นหาวันที่
                    </button>
                </div>

                {/* Date Picker Panel */}
                {showDatePicker && (
                    <div className="p-4 bg-black/60 backdrop-blur-sm rounded-xl border border-gold-500/20">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-400">วันที่:</label>
                                <select
                                    value={searchDay}
                                    onChange={(e) => setSearchDay(parseInt(e.target.value))}
                                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold-500 transition-colors"
                                >
                                    {Array.from({ length: 31 }, (_, i) => (
                                        <option key={i + 1} value={i + 1} className="bg-black">{i + 1}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-400">เดือน:</label>
                                <select
                                    value={searchMonth}
                                    onChange={(e) => setSearchMonth(parseInt(e.target.value))}
                                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold-500 transition-colors"
                                >
                                    {thaiMonths.map((month, i) => (
                                        <option key={i} value={i + 1} className="bg-black">{month}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-400">ปี:</label>
                                <select
                                    value={searchYear}
                                    onChange={(e) => setSearchYear(parseInt(e.target.value))}
                                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold-500 transition-colors"
                                >
                                    <option value={currentYear} className="bg-black">{currentYear + 543}</option>
                                </select>
                            </div>
                            <button
                                onClick={handleSearch}
                                className="px-5 py-2 bg-gradient-to-r from-gold-500 to-amber-500 text-black font-bold rounded-lg hover:shadow-lg hover:shadow-gold-500/30 transition-all text-sm"
                            >
                                🔍 ค้นหา
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between mb-4 bg-white/5 rounded-xl p-3 border border-white/5">
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleGoToStart}
                        disabled={!canGoBack}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs text-gray-400 hover:text-white"
                        title="ไปวันแรก"
                    >
                        ⏮️ 1 ม.ค.
                    </button>
                    <button
                        onClick={handlePrev}
                        disabled={!canGoBack}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft className="h-4 w-4 text-white" />
                    </button>
                </div>

                <div className="text-center flex-1">
                    <div className="text-sm font-semibold text-white">
                        {currentData.length > 0 ? `${currentData[0]?.label} - ${currentData[currentData.length - 1]?.label}` : 'ไม่มีข้อมูล'}
                    </div>
                    <div className="text-xs text-gray-500">
                        แสดง {startIndex + 1} - {endIndex} จาก {totalItems} {
                            activePeriod === 'daily' ? 'วัน' :
                                activePeriod === 'weekly' ? 'สัปดาห์' :
                                    activePeriod === 'monthly' ? 'เดือน' : 'ปี'
                        }
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={handleNext}
                        disabled={!canGoForward}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight className="h-4 w-4 text-white" />
                    </button>
                    <button
                        onClick={handleGoToEnd}
                        disabled={!canGoForward}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs text-gray-400 hover:text-white"
                        title="ไปวันนี้"
                    >
                        วันนี้ ⏭️
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-xl p-4">
                    <div className="text-xs text-green-400/80 mb-1">💰 รายได้ช่วงที่แสดง</div>
                    <div className="text-xl font-bold text-green-400">฿{summary.revenue.toLocaleString()}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-xl p-4">
                    <div className="text-xs text-blue-400/80 mb-1">📦 ออเดอร์ช่วงที่แสดง</div>
                    <div className="text-xl font-bold text-blue-400">{summary.orders} รายการ</div>
                </div>
                <div className="bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-500/20 rounded-xl p-4">
                    <div className="text-xs text-gold-400/80 mb-1">⭐ รายได้{activePeriod === 'daily' ? 'วันนี้' : activePeriod === 'weekly' ? 'สัปดาห์นี้' : activePeriod === 'monthly' ? 'เดือนนี้' : 'ปีนี้'}</div>
                    <div className="text-xl font-bold text-gold-400">฿{todaySummary.revenue.toLocaleString()}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-xl p-4">
                    <div className="text-xs text-purple-400/80 mb-1">🛒 ออเดอร์{activePeriod === 'daily' ? 'วันนี้' : activePeriod === 'weekly' ? 'สัปดาห์นี้' : activePeriod === 'monthly' ? 'เดือนนี้' : 'ปีนี้'}</div>
                    <div className="text-xl font-bold text-purple-400">{todaySummary.orders} รายการ</div>
                </div>
            </div>

            {/* Bar Chart */}
            <div className="h-[200px] flex items-end gap-1 bg-white/[0.02] rounded-xl p-4 border border-white/5">
                {currentData.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        ไม่มีข้อมูลในช่วงเวลานี้
                    </div>
                ) : (
                    currentData.map((item, index) => {
                        const height = visibleMaxRevenue > 0 ? (item.revenue / visibleMaxRevenue) * 100 : 0;
                        const isToday = item.date === now.toISOString().split('T')[0];

                        return (
                            <div key={index} className="flex-1 min-w-[35px] flex flex-col items-center group relative">
                                <div className="w-full relative" style={{ height: '150px' }}>
                                    {/* Tooltip */}
                                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 pointer-events-none">
                                        <div className="bg-black/90 backdrop-blur border border-gold-500/30 rounded-xl px-4 py-3 text-xs whitespace-nowrap shadow-xl">
                                            <div className="text-gold-400 font-bold text-base">฿{item.revenue.toLocaleString()}</div>
                                            <div className="text-gray-400 mt-1">{item.orders} ออเดอร์</div>
                                            <div className="text-gray-500 mt-1">{item.label}</div>
                                        </div>
                                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gold-500/30" />
                                    </div>

                                    {/* Bar */}
                                    <div
                                        className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-500 cursor-pointer ${item.revenue > 0
                                            ? isToday
                                                ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-lg shadow-emerald-500/30'
                                                : 'bg-gradient-to-t from-gold-600 to-gold-400 hover:from-gold-500 hover:to-amber-400 group-hover:shadow-lg group-hover:shadow-gold-500/30'
                                            : 'bg-white/10 hover:bg-white/20'
                                            }`}
                                        style={{
                                            height: `${Math.max(height, 5)}%`,
                                            minHeight: '8px'
                                        }}
                                    />
                                </div>
                                <div className={`text-[9px] mt-2 text-center truncate w-full px-0.5 ${isToday ? 'text-emerald-400 font-bold' : 'text-gray-500'}`}>
                                    {item.label}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-t from-gold-600 to-gold-400 rounded" />
                    <span>รายได้</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded" />
                    <span>วันนี้</span>
                </div>
            </div>
        </div>
    );
};

export default function AdminDashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchData = async (showRefreshing = false) => {
        if (showRefreshing) setIsRefreshing(true);
        try {
            const res = await fetch("/api/admin/dashboard", { cache: 'no-store' });
            if (res.ok) {
                const json = await res.json();
                setData(json);
                setLastUpdate(new Date());
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => fetchData(), 30000);
        return () => clearInterval(interval);
    }, []);

    const handleManualRefresh = () => {
        window.location.reload();
    };

    if (isLoading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[600px]">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-gold-500/20 rounded-full animate-pulse" />
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-gold-500 rounded-full animate-spin" />
                    </div>
                    <p className="text-gray-400 mt-6 font-medium">กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return <div className="p-8 text-red-500">ไม่สามารถโหลดข้อมูลได้</div>;
    }

    return (
        <div className="py-8 space-y-10">
            {/* Header */}
            <div className="relative">
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-gold-500/5 rounded-full blur-[100px]" />
                <div className="absolute -top-10 right-0 w-48 h-48 bg-crimson-500/5 rounded-full blur-[80px]" />

                <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="h-6 w-6 text-gold-500" />
                            <span className="text-xs font-medium text-gold-500 uppercase tracking-widest">Admin Panel</span>
                        </div>
                        <h2 className="text-4xl font-black tracking-tight text-white">แดชบอร์ด</h2>
                        <p className="text-gray-400 mt-2 text-lg">ภาพรวมของระบบ F1RSTCODE DEMY</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <RealtimeClock />
                        <button
                            onClick={handleManualRefresh}
                            disabled={isRefreshing}
                            className="group flex items-center gap-2 bg-gradient-to-r from-gold-500 to-amber-500 text-black font-bold rounded-xl px-5 py-3 hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all duration-300 disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                            <span>รีเฟรชข้อมูล</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-3">
                    <div className="p-2 bg-gold-500/10 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-gold-500" />
                    </div>
                    การดำเนินการด่วน
                </h3>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <QuickActionCard
                        href="/admin/articles/create"
                        icon={FileText}
                        label="สร้างบทความใหม่"
                        description="เพิ่มบทความหรือข่าวสาร"
                        gradient="bg-gradient-to-br from-amber-500/10 to-transparent"
                        iconColor="bg-amber-500"
                    />
                    <QuickActionCard
                        href="/admin/courses"
                        icon={BookOpen}
                        label="จัดการคอร์ส"
                        description="สร้างและแก้ไขคอร์สเรียน"
                        gradient="bg-gradient-to-br from-violet-500/10 to-transparent"
                        iconColor="bg-violet-500"
                    />
                    <QuickActionCard
                        href="/admin/coupons"
                        icon={Ticket}
                        label="จัดการคูปอง"
                        description="สร้างโค้ดส่วนลด"
                        gradient="bg-gradient-to-br from-emerald-500/10 to-transparent"
                        iconColor="bg-emerald-500"
                    />
                    <QuickActionCard
                        href="/admin/orders"
                        icon={ShoppingBag}
                        label={`ออเดอร์รอตรวจสอบ ${data.pendingOrders > 0 ? `(${data.pendingOrders})` : ''}`}
                        description="ตรวจสอบการชำระเงิน"
                        gradient="bg-gradient-to-br from-pink-500/10 to-transparent"
                        iconColor="bg-pink-500"
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                <DashboardCard
                    label="รายได้ทั้งหมด"
                    value={`฿${data.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    description="รายได้สะสมตลอดการใช้งาน"
                    gradient="bg-gradient-to-br from-green-500/10 via-transparent to-transparent"
                />
                <DashboardCard
                    label="นักเรียนทั้งหมด"
                    value={data.totalUsers.toLocaleString()}
                    icon={Users}
                    description="จำนวนผู้ลงทะเบียนทั้งหมด"
                    gradient="bg-gradient-to-br from-blue-500/10 via-transparent to-transparent"
                />
                <DashboardCard
                    label="คอร์สทั้งหมด"
                    value={data.totalCourses.toLocaleString()}
                    icon={BookOpen}
                    description="คอร์สเรียนที่เปิดสอน"
                    gradient="bg-gradient-to-br from-violet-500/10 via-transparent to-transparent"
                />
                <DashboardCard
                    label="ยอดขายทั้งหมด"
                    value={data.totalSales.toLocaleString()}
                    icon={CreditCard}
                    description="จำนวนออเดอร์ที่ชำระแล้ว"
                    gradient="bg-gradient-to-br from-pink-500/10 via-transparent to-transparent"
                />
            </div>

            {/* Charts and Recent Sales */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
                {/* Revenue Chart */}
                {data.revenueData && data.periodSummary && (
                    <RevenueChart revenueData={data.revenueData} periodSummary={data.periodSummary} />
                )}

                {/* Recent Sales */}
                <div className="col-span-1 lg:col-span-3 bg-gradient-to-br from-[#0a0a0a] to-[#111] border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white">ยอดขายล่าสุด</h3>
                        <Link href="/admin/orders" className="text-xs text-gold-500 hover:text-gold-400 flex items-center gap-1 group">
                            ดูทั้งหมด <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {data.recentOrders.length === 0 ? (
                            <div className="py-12 text-center">
                                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                                    <ShoppingBag className="h-7 w-7 text-gray-600" />
                                </div>
                                <p className="text-gray-500 text-sm">ยังไม่มียอดขาย</p>
                            </div>
                        ) : (
                            data.recentOrders.map((order, index) => (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all duration-300 group"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 via-gold-500 to-amber-600 flex items-center justify-center text-black font-bold text-sm shadow-lg">
                                            {order.userInitial}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white group-hover:text-gold-400 transition-colors">{order.userName}</p>
                                            <p className="text-xs text-gray-500 truncate max-w-[150px]">{order.courseTitle}</p>
                                        </div>
                                    </div>
                                    <div className="font-bold text-gold-400 bg-gold-500/10 px-3 py-1 rounded-lg">
                                        +฿{order.total.toLocaleString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Auto-refresh indicator */}
            <div className="text-center text-xs text-gray-600 flex items-center justify-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>ข้อมูลจะอัปเดตอัตโนมัติทุก 30 วินาที</span>
                {lastUpdate && (
                    <span className="text-gray-500">
                        • อัปเดตล่าสุด: {lastUpdate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                )}
            </div>
        </div>
    );
}
