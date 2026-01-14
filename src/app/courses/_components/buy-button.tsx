"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCart } from "@/context/cart-context";

import { LoginModal } from "@/components/auth/login-modal";

interface BuyButtonProps {
    courseId: string;
    title: string;
    price: number;
    isWebLoggedIn: boolean;
    isPurchased?: boolean;
}

export const BuyButton = ({ courseId, title, price, isWebLoggedIn, isPurchased }: BuyButtonProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const router = useRouter();
    const { addToCart, isInCart } = useCart();

    const onClick = async () => {
        // If purchased, redirect to classroom
        if (isPurchased) {
            router.push(`/classroom/${courseId}`);
            return;
        }

        if (!isWebLoggedIn) {
            setLoginOpen(true);
            return;
        }

        try {
            setIsLoading(true);

            // If Free, enroll immediately
            if (price === 0) {
                const response = await fetch("/api/orders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ courseIds: [courseId] }), // Updated to courseIds
                });

                if (!response.ok) {
                    const errorMsg = await response.text();
                    throw new Error(errorMsg || "Enrollment failed");
                }
                const data = await response.json();
                if (data.status === "COMPLETED") {
                    toast.success("Enrolled successfully!");
                    router.push(`/classroom/${courseId}`);
                    return;
                }
            } else {
                // If Paid, Add to Cart and Redirect to Cart
                addToCart({ courseId, title, price });
                router.push('/cart');
            }

        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!isWebLoggedIn) {
            setLoginOpen(true);
            return;
        }

        addToCart({ courseId, title, price });
    };

    const isFree = price === 0;

    return (
        <>
            <LoginModal
                open={loginOpen}
                onOpenChange={setLoginOpen}
                onSwitchToRegister={() => {
                    setLoginOpen(false);
                    // We might need a way to open register modal, but for now just close login
                    // Or ideally we pass a prop or use a global context for auth modals
                }}
                trigger={null}
            />
            <div className="flex gap-2 w-full">
                <Button
                    onClick={onClick}
                    disabled={isLoading}
                    size="sm"
                    className={`flex-1 font-semibold transition-all ${isPurchased
                        ? "bg-gray-700 text-gray-400 hover:bg-gray-700 cursor-default"
                        : "bg-white/10 hover:bg-gold-500 hover:text-black text-white"
                        }`}
                    variant={isPurchased ? "secondary" : "default"}
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            {isPurchased ? (
                                "Owned"
                            ) : (
                                <>
                                    {isFree ? null : <ShoppingCart className="h-4 w-4 mr-2" />}
                                    {isFree ? "Enroll Free" : "Buy Now"}
                                </>
                            )}
                        </>
                    )}
                </Button>
                {!isPurchased && (
                    <Button
                        onClick={handleAddToCart}
                        disabled={isInCart(courseId)}
                        size="icon"
                        className={`w-9 h-9 shrink-0 transition-colors ${isInCart(courseId)
                            ? "bg-gray-700 text-gray-400 cursor-not-allowed border-transparent"
                            : "bg-gold-500 text-black hover:bg-gold-400 border-transparent shadow-[0_0_10px_rgba(255,193,7,0.3)]"
                            }`}
                        title={isInCart(courseId) ? "Already in Cart" : "Add to Cart"}
                    >
                        <ShoppingCart className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </>
    );
};
