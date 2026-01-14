"use client";

import { SessionProvider } from "next-auth/react";

import { Toaster } from "react-hot-toast";

import { CartProvider } from "@/context/cart-context";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <CartProvider>
                <Toaster position="bottom-right" />
                {children}
            </CartProvider>
        </SessionProvider>
    );
}
