"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export function LayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminPage = pathname?.startsWith("/admin");

    return (
        <>
            <Navbar />
            <main className="min-h-screen">
                {children}
            </main>
            {!isAdminPage && <Footer />}
        </>
    );
}
