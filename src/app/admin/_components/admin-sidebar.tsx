"use client";

import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    BookOpen,
    ShoppingBag,
    Ticket,
    LogOut,
    Menu,
    X,
    FileText,
    ChevronLeft,
    ChevronRight,
    Crown
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";

const routes = [
    {
        label: "Dashboard",
        labelTh: "แดชบอร์ด",
        icon: LayoutDashboard,
        href: "/admin",
        color: "text-sky-500",
    },
    {
        label: "Articles",
        labelTh: "บทความ",
        icon: FileText,
        href: "/admin/articles",
        color: "text-amber-500",
    },
    {
        label: "Courses",
        labelTh: "คอร์สเรียน",
        icon: BookOpen,
        href: "/admin/courses",
        color: "text-violet-500",
    },
    {
        label: "Orders",
        labelTh: "ออเดอร์",
        icon: ShoppingBag,
        href: "/admin/orders",
        color: "text-pink-700",
    },
    {
        label: "Users",
        labelTh: "ผู้ใช้งาน",
        icon: Users,
        href: "/admin/users",
        color: "text-orange-700",
    },
    {
        label: "Coupons",
        labelTh: "คูปอง",
        icon: Ticket,
        href: "/admin/coupons",
        color: "text-emerald-500",
    },
];

interface AdminSidebarProps {
    isCollapsed?: boolean;
    onCollapse?: () => void;
}

export const AdminSidebar = ({ isCollapsed = false, onCollapse }: AdminSidebarProps) => {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileOpen]);

    if (!isMounted) return null;

    return (
        <>
            {/* Mobile/Tablet Trigger Button - Show only when closed */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className={cn(
                    "xl:hidden fixed top-20 left-4 z-50 w-10 h-10 bg-black/80 backdrop-blur-md border border-white/20 shadow-lg rounded-lg flex items-center justify-center hover:bg-gold-500 hover:text-black transition-all duration-300",
                    isMobileOpen ? "opacity-0 pointer-events-none -translate-x-full" : "opacity-100 translate-x-0"
                )}
                aria-label="Open Menu"
            >
                <Menu className="w-5 h-5 text-white" />
            </button>

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 bg-[#111] text-white border-r border-white/10 transition-all duration-300 flex flex-col pt-20",
                // Desktop width based on collapsed state
                isCollapsed ? "xl:w-20" : "xl:w-64",
                // Mobile/Tablet overlay width (always full or fixed wide)
                "w-72 xl:translate-x-0", // Desktop always visible
                // Mobile transform
                !isMobileOpen && "-translate-x-full xl:translate-x-0"
            )}>
                {/* Header */}
                <div className="p-4 flex-1 overflow-y-auto overflow-x-hidden">
                    {/* Logo & Toggle */}
                    <div className={cn("flex items-center mb-10 transition-all duration-300", isCollapsed ? "justify-center" : "justify-between")}>
                        {/* Logo - only show when expanded */}
                        {!isCollapsed && (
                            <Link href="/" className="flex items-center group pl-2">
                                <h1 className="text-sm font-bold whitespace-nowrap flex items-center gap-2">
                                    <Crown className="w-4 h-4 text-gold-500 fill-gold-500/10" />
                                    <span className="bg-gradient-to-r from-gold-400 to-amber-600 bg-clip-text text-transparent tracking-wide">
                                        {session?.user?.name || "ADMIN"}
                                    </span>
                                </h1>
                            </Link>
                        )}

                        {/* Toggle Button */}
                        <button
                            onClick={() => {
                                // On mobile: close menu. On desktop: toggle collapse
                                if (window.innerWidth < 1280) {
                                    setIsMobileOpen(false);
                                } else {
                                    onCollapse?.();
                                }
                            }}
                            className={cn(
                                "p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-gold-500 hover:text-black hover:border-gold-500 text-gray-400 transition-all duration-300",
                                isCollapsed ? "w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-gold-500" : ""
                            )}
                            title={isCollapsed ? "ขยายเมนู" : "ย่อเมนู"}
                        >
                            <ChevronLeft className={cn(
                                "w-4 h-4 transition-transform duration-500",
                                isCollapsed && "rotate-180"
                            )} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-2">
                        {routes.map((route) => {
                            const isActive = pathname === route.href || (route.href !== "/admin" && pathname?.startsWith(route.href));

                            return (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={cn(
                                        "group flex items-center font-medium rounded-xl transition-all duration-300 relative",
                                        isCollapsed
                                            ? "justify-center w-10 h-10 mx-auto"
                                            : "w-full p-3 pl-4",
                                        isActive
                                            ? "text-white bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                                            : "text-zinc-500 hover:text-white hover:bg-white/5"
                                    )}
                                    title={isCollapsed ? route.labelTh : undefined}
                                >
                                    <route.icon className={cn(
                                        "flex-shrink-0 transition-all duration-300",
                                        isActive ? route.color : "group-hover:text-white",
                                        isCollapsed ? "h-5 w-5" : "h-5 w-5 mr-3"
                                    )} />

                                    {!isCollapsed && (
                                        <span className="text-sm whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                                            {route.labelTh}
                                        </span>
                                    )}

                                    {/* Active Indicator (Expanded only) */}
                                    {!isCollapsed && isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-gold-500 rounded-r-full shadow-[0_0_10px_#EAB308]" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Logout Button */}
                <div className="p-4 border-t border-white/10">
                    <Button
                        variant="ghost"
                        className={cn(
                            "justify-start text-zinc-400 hover:text-white hover:bg-white/10 transition-all",
                            isCollapsed ? "w-12 px-0 justify-center mx-auto" : "w-full"
                        )}
                        onClick={() => signOut({ callbackUrl: "/" })}
                        title={isCollapsed ? "ออกจากระบบ" : undefined}
                    >
                        <LogOut className={cn("flex-shrink-0", isCollapsed ? "h-5 w-5" : "h-5 w-5")} />
                        {!isCollapsed && <span className="ml-3">ออกจากระบบ</span>}
                    </Button>
                </div>
            </aside>

            {/* Overlay for mobile/tablet */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-30 xl:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    );
};
