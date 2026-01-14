"use client";

import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { CreditCard, Upload, Send, Wallet, ShoppingCart, X } from "lucide-react";
import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";

function PaymentContent() {
    const { t } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");

    const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [selectedBank, setSelectedBank] = useState<'ktb' | 'promptpay'>('ktb');

    const [orderTotal, setOrderTotal] = useState<number>(0);
    const [orderItems, setOrderItems] = useState<any[]>([]);

    useEffect(() => {
        if (orderId) {
            fetch(`/api/orders?id=${orderId}`)
                .then(res => res.json())
                .then(orders => {
                    const order = orders.find((o: any) => o.id === orderId);
                    if (order) {
                        setOrderTotal(order.total);
                        setOrderItems(order.items || []);
                    }
                })
                .catch(err => console.error(err));
        }
    }, [orderId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleFileRemove = () => {
        setFile(null);
        setFilePreview(null);
    };

    return (
        <div className="min-h-screen bg-black pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 flex items-center gap-2 sm:gap-3">
                        <CreditCard className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-gold-400" />
                        <span className="truncate">{t("payment.title")}</span>
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Left Column: Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6"
                    >
                        {/* Order Summary */}
                        {orderItems.length > 0 && (
                            <div className="bg-[#161616] border border-white/10 rounded-2xl p-6">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <ShoppingCart className="w-4 h-4 text-gold-500" /> Order Summary
                                </h3>
                                <div className="space-y-3">
                                    {orderItems.map((item: any) => (
                                        <div key={item.id} className="flex justify-between text-sm text-gray-400">
                                            <span>{item.course?.title || "Course"}</span>
                                            <span>฿{(item.price || 0).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div className="h-px bg-white/10 my-2" />
                                    <div className="flex justify-between text-white font-bold text-lg">
                                        <span>Total</span>
                                        <span className="text-gold-500">฿{orderTotal.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-[#161616] border border-white/10 rounded-2xl p-6 sm:p-8">
                            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-gold-500" />
                                {t("payment.formTitle")}
                            </h2>
                            <form className="space-y-4" onSubmit={async (e) => {
                                e.preventDefault();
                                if (!orderId) {
                                    toast.error("Order ID is missing");
                                    return;
                                }

                                const form = e.target as HTMLFormElement;
                                const formData = new FormData(form);

                                try {
                                    setIsLoading(true);

                                    // 1. Upload Slip if exists
                                    let slipUrl = "";
                                    if (file) {
                                        const uploadFormData = new FormData();
                                        uploadFormData.append("file", file);

                                        const uploadRes = await fetch("/api/upload", {
                                            method: "POST",
                                            body: uploadFormData
                                        });

                                        if (!uploadRes.ok) throw new Error("File upload failed");
                                        const uploadData = await uploadRes.json();
                                        slipUrl = uploadData.url;
                                    } else {
                                        toast.error("Please upload payment slip");
                                        setIsLoading(false);
                                        return;
                                    }

                                    // 2. Update Order
                                    const updateRes = await fetch(`/api/orders/${orderId}`, {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                            slipUrl: slipUrl,
                                            status: "PENDING_REVIEW" // Or keep PENDING depending on logic
                                        })
                                    });

                                    if (!updateRes.ok) throw new Error("Failed to update order");

                                    toast.success("Payment submitted successfully!");
                                    window.location.href = "/orders"; // Redirect to orders page

                                } catch (error) {
                                    console.error(error);
                                    toast.error("Something went wrong");
                                } finally {
                                    setIsLoading(false);
                                }
                            }}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-gray-300">{t("payment.name")} *</Label>
                                        <Input name="name" id="name" required placeholder="" className="bg-white/5 border-white/10 text-white focus-visible:ring-gold-500/50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-gray-300">{t("payment.phone")} *</Label>
                                        <Input name="phone" id="phone" required placeholder="08x-xxx-xxxx" className="bg-white/5 border-white/10 text-white focus-visible:ring-gold-500/50" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-gray-300">{t("payment.email")} *</Label>
                                    <Input name="email" id="email" type="email" required placeholder="email@example.com" className="bg-white/5 border-white/10 text-white focus-visible:ring-gold-500/50" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="orderId" className="text-gray-300">{t("payment.orderId")} *</Label>
                                        <Input
                                            name="orderId"
                                            id="orderId"
                                            defaultValue={orderId || ""}
                                            readOnly
                                            placeholder="#xxxxxx"
                                            className="bg-white/5 border-white/10 text-white focus-visible:ring-gold-500/50 cursor-not-allowed opacity-70"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="amount" className="text-gray-300">{t("payment.amount")} *</Label>
                                        <Input
                                            name="amount"
                                            id="amount"
                                            required
                                            placeholder="0.00"
                                            defaultValue={orderTotal > 0 ? orderTotal : ""}
                                            className="bg-white/5 border-white/10 text-white focus-visible:ring-gold-500/50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="details" className="text-gray-300">{t("payment.details")}</Label>
                                    <textarea
                                        name="details"
                                        id="details"
                                        rows={3}
                                        className="flex w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white"
                                        placeholder={t("payment.detailsPlaceholder")}
                                    />
                                </div>

                                <div className="space-y-3 pt-2">
                                    <Label className="text-gray-300">{t("payment.bank")} *</Label>
                                    <div className="grid gap-3">
                                        <label
                                            className={`flex items-center space-x-3 p-4 rounded-xl border cursor-pointer transition-all ${selectedBank === 'ktb'
                                                ? 'border-gold-500/50 bg-gold-500/10'
                                                : 'border-white/10 bg-white/5 hover:bg-white/10'
                                                }`}
                                            onClick={() => setSelectedBank('ktb')}
                                        >
                                            <input type="radio" name="bank" className="accent-gold-500 w-4 h-4" checked={selectedBank === 'ktb'} onChange={() => setSelectedBank('ktb')} value="ktb" />
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                                                    <Image src="/images/ktb-logo-new.png" alt="KTB" width={40} height={40} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-sm">{t("payment.ktb")}</p>
                                                    <p className="text-xs text-gray-400">{t("payment.accountNo")} 662-5-46707-3</p>
                                                </div>
                                            </div>
                                        </label>
                                        <label
                                            className={`flex items-center space-x-3 p-4 rounded-xl border cursor-pointer transition-all ${selectedBank === 'promptpay'
                                                ? 'border-gold-500/50 bg-gold-500/10'
                                                : 'border-white/10 bg-white/5 hover:bg-white/10'
                                                }`}
                                            onClick={() => setSelectedBank('promptpay')}
                                        >
                                            <input type="radio" name="bank" className="accent-gold-500 w-4 h-4" checked={selectedBank === 'promptpay'} onChange={() => setSelectedBank('promptpay')} value="promptpay" />
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                                                    <Image src="/images/promptpay-logo.png" alt="PromptPay" width={40} height={40} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-sm">{t("payment.promptpay")}</p>
                                                    <p className="text-xs text-gray-400">1 8407 01108 92 5</p>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <Label className="text-gray-300">{t("payment.slip")} *</Label>
                                    {!filePreview ? (
                                        <div className="flex items-center justify-center w-full">
                                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/10 border-dashed rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                                                    <p className="text-sm text-gray-400"><span className="font-semibold text-gold-400">{t("payment.uploadClick")}</span> {t("payment.uploadDrag")}</p>
                                                </div>
                                                <input id="dropzone-file" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="relative w-full border-2 border-white/10 rounded-lg overflow-hidden bg-white/5">
                                            <div className="relative">
                                                <Image
                                                    src={filePreview}
                                                    alt="Slip Preview"
                                                    width={400}
                                                    height={300}
                                                    className="w-full h-auto max-h-64 object-contain"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleFileRemove}
                                                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors shadow-lg"
                                                    aria-label="Remove image"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="p-3 bg-white/5 border-t border-white/10">
                                                <p className="text-xs text-gray-400 truncate">{file?.name}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-gray-300">{t("payment.date")} *</Label>
                                        <Input name="date" type="date" required className="bg-white/5 border-white/10 text-white appearance-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-300">{t("payment.time")} *</Label>
                                        <Input name="time" type="time" required className="bg-white/5 border-white/10 text-white appearance-none" />
                                    </div>
                                </div>

                                <Button type="submit" disabled={isLoading} className="w-full h-11 sm:h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base sm:text-lg mt-4 disabled:opacity-50">
                                    {isLoading ? <span className="animate-spin mr-2">⏳</span> : <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />}
                                    {t("payment.submit")}
                                </Button>
                            </form>
                        </div>
                    </motion.div>

                    {/* Right Column: Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="space-y-6"
                    >
                        <div className="bg-[#161616] border border-white/10 rounded-2xl p-4 sm:p-6 lg:p-8 lg:sticky lg:top-24">
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">{t("payment.channelTitle")}</h2>
                            <p className="text-gray-400 mb-6 text-sm">
                                {t("payment.channelDesc")}
                            </p>

                            <div className="space-y-6">
                                {/* Bank Card */}
                                <div className="space-y-3">
                                    <h3 className="text-white font-bold text-xs sm:text-sm">{t("payment.bankChannel")}</h3>
                                    <div className="bg-sky-500/20 border border-sky-500/30 rounded-xl p-3 sm:p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
                                                <Image src="/images/ktb-logo-new.png" alt="KTB" width={48} height={48} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm sm:text-base">{t("payment.ktb")}</p>
                                                <p className="text-xs sm:text-sm text-gray-300">662-5-46707-3</p>
                                                <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">นาย พีรพัฒน์ คชสวัสดิ์</p>
                                            </div>
                                        </div>

                                    </div>
                                    <p className="text-xs text-red-400">{t("payment.warning")}</p>
                                </div>

                                <div className="h-px bg-white/10" />

                                {/* PromptPay */}
                                <div className="space-y-3">
                                    <h3 className="text-white font-bold text-xs sm:text-sm">{t("payment.promptpayChannel")}</h3>
                                    <div className="bg-white p-3 sm:p-4 rounded-xl flex flex-col items-center justify-center space-y-2 sm:space-y-3 max-w-[200px] sm:max-w-[250px] mx-auto">
                                        <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white flex items-center justify-center overflow-hidden">
                                            <Image src="/images/payment-qr-new.jpg" alt="PromptPay QR" width={160} height={160} className="w-full h-full object-contain" />
                                        </div>
                                        <p className="text-xs text-black font-medium text-center">{t("payment.scanQR")}</p>
                                    </div>
                                    <p className="text-xs text-center text-gray-400">{t("payment.promptpayNo")} 1 8407 01108 92 5</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black pt-24 text-white text-center">Loading...</div>}>
            <PaymentContent />
        </Suspense>
    );
}
