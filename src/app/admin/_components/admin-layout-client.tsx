"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { cn } from "@/lib/utils";

interface AdminLayoutClientProps {
    children: React.ReactNode;
}

export const AdminLayoutClient = ({ children }: AdminLayoutClientProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // Optional: Load collapsed state from local storage
        const saved = localStorage.getItem("admin-sidebar-collapsed");
        if (saved) {
            setIsCollapsed(JSON.parse(saved));
        }
    }, []);

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem("admin-sidebar-collapsed", JSON.stringify(newState));
    };

    if (!isMounted) {
        return (
            <div className="h-full bg-black min-h-screen">
                <AdminSidebar isCollapsed={false} onCollapse={() => { }} />
                <main className="h-full pt-20 xl:pt-24 xl:pl-64 transition-all duration-300">
                    <div className="pl-14 xl:pl-0 px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="h-full bg-black min-h-screen">
            <AdminSidebar isCollapsed={isCollapsed} onCollapse={toggleCollapse} />

            {/* Content area */}
            <main
                className={cn(
                    "h-full pt-20 xl:pt-24 transition-all duration-300",
                    isCollapsed ? "xl:pl-20" : "xl:pl-64"
                )}
            >
                <div className={cn(
                    "px-4 sm:px-6 lg:px-8",
                    // Mobile: pl-14 because of fixed hamburger button (top-20 left-4)
                    // Desktop: pl-8 to provide gap from sidebar
                    "pl-14 xl:pl-8"
                )}>
                    {children}
                </div>
            </main>
        </div>
    );
};
