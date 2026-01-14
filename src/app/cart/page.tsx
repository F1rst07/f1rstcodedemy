"use client";

import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, ShoppingCart, Loader2, Ticket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CartPage() {
    const { items, removeFromCart, cartTotal, clearCart } = useCart();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const router = useRouter();

    // Coupon State
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [discountAmount, setDiscountAmount] = useState(0);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsVerifying(true);
        try {
            const res = await fetch("/api/coupons/verify", {
                method: "POST",
                body: JSON.stringify({ code: couponCode, cartTotal })
            });
            const data = await res.json();

            if (res.ok && data.isValid) {
                setAppliedCoupon(data.coupon);
                setDiscountAmount(data.discountAmount);
                toast.success("Coupon applied!");
            } else {
                setAppliedCoupon(null);
                setDiscountAmount(0);
                toast.error(data.message || "Invalid Coupon");
            }
        } catch (error) {
            toast.error("Failed to verify coupon");
        } finally {
            setIsVerifying(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setCouponCode("");
    };

    const handleCheckout = async () => {
        if (items.length === 0) return;
        setIsCheckingOut(true);

        try {
            const courseIds = items.map(item => item.courseId);

            const response = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    courseIds,
                    couponCode: appliedCoupon ? appliedCoupon.code : undefined
                }),
            });

            if (!response.ok) {
                const text = await response.text();
                toast.error(text || "Checkout failed");
                return;
            }

            const order = await response.json();

            clearCart(); // Clear cart after successful order creation

            if (order.status === "COMPLETED") {
                toast.success("Order Completed!");
                router.push('/orders');
            } else {
                router.push(`/payment?orderId=${order.id}`);
            }

        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <div className="min-h-screen bg-black pt-28 pb-20 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                    <ShoppingCart className="w-8 h-8 text-gold-500" />
                    Shopping Cart
                </h1>

                {items.length === 0 ? (
                    <div className="bg-[#161616] border border-white/10 rounded-xl p-10 text-center space-y-4">
                        <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto" />
                        <h2 className="text-xl font-semibold text-white">Your cart is empty</h2>
                        <p className="text-gray-400">Looks like you haven't added any courses yet.</p>
                        <Link href="/courses">
                            <Button className="mt-4 bg-gold-500 hover:bg-gold-400 text-black">
                                Browse Courses
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item) => (
                                <div key={item.courseId} className="bg-[#161616] border border-white/10 rounded-xl p-4 flex gap-4 items-center group hover:border-gold-500/30 transition-all">
                                    <div className="w-24 h-16 bg-zinc-800 rounded-lg overflow-hidden relative shrink-0">
                                        {item.imageUrl ? (
                                            <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No Img</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-white truncate">{item.title}</h3>
                                        <p className="text-sm text-gray-400">Course</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gold-400">
                                            {item.price === 0 ? "Free" : `฿${item.price.toLocaleString()}`}
                                        </p>
                                        <button
                                            onClick={() => removeFromCart(item.courseId)}
                                            className="text-gray-500 hover:text-red-500 text-xs mt-1 flex items-center gap-1 ml-auto"
                                        >
                                            <Trash2 className="w-3 h-3" /> Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-[#161616] border border-white/10 rounded-xl p-6 sticky top-24">
                                <h3 className="text-xl font-bold text-white mb-4">Summary</h3>
                                <div className="space-y-4 mb-6">
                                    {/* Coupon Input */}
                                    {!appliedCoupon ? (
                                        <div className="flex gap-2">
                                            <Input
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                placeholder="Coupon Code"
                                                className="bg-black border-white/10 text-white uppercase"
                                            />
                                            <Button onClick={handleApplyCoupon} disabled={isVerifying || !couponCode} variant="outline" className="border-white/20 text-white hover:text-gold-400">
                                                {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex title items-center justify-between p-3 bg-gold-500/10 border border-gold-500/30 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Ticket className="w-4 h-4 text-gold-500" />
                                                <span className="font-bold text-gold-500">{appliedCoupon.code}</span>
                                            </div>
                                            <button onClick={removeCoupon} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                                        </div>
                                    )}

                                    <div className="space-y-2 text-gray-300 pt-2">
                                        <div className="flex justify-between">
                                            <span>Subtotal ({items.length} items)</span>
                                            <span>฿{cartTotal.toLocaleString()}</span>
                                        </div>
                                        {discountAmount > 0 && (
                                            <div className="flex justify-between text-emerald-400">
                                                <span>Discount</span>
                                                <span>- ฿{discountAmount.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="border-t border-white/10 my-2 pt-2 flex justify-between text-lg font-bold text-white">
                                            <span>Total</span>
                                            <span className="text-gold-500">฿{Math.max(0, cartTotal - discountAmount).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleCheckout}
                                    disabled={isCheckingOut}
                                    className="w-full bg-gold-500 hover:bg-gold-400 text-black font-bold h-12 text-lg"
                                >
                                    {isCheckingOut ? <Loader2 className="animate-spin" /> : "Checkout"}
                                </Button>
                                <p className="text-xs text-gray-500 text-center mt-4">
                                    Secure Checkout by F1RSTCODE
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
