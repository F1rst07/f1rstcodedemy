"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface CartItem {
    courseId: string;
    title: string;
    price: number;
    imageUrl?: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (courseId: string) => void;
    clearCart: () => void;
    isInCart: (courseId: string) => boolean;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("cart", JSON.stringify(items));
        }
    }, [items, isLoaded]);

    const addToCart = (item: CartItem) => {
        if (items.some((i) => i.courseId === item.courseId)) {
            toast("Already in cart", { icon: "🛒" });
            return;
        }
        setItems((prev) => [...prev, item]);
        toast.success("Added to cart");
    };

    const removeFromCart = (courseId: string) => {
        setItems((prev) => prev.filter((item) => item.courseId !== courseId));
        toast.success("Removed from cart");
    };

    const clearCart = () => {
        setItems([]);
    };

    const isInCart = (courseId: string) => {
        return items.some((item) => item.courseId === courseId);
    };

    const cartTotal = items.reduce((total, item) => total + (item.price || 0), 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, isInCart, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
