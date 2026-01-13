"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/lib/language-context";
import Image from "next/image";
import { useState } from "react";
import { Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

interface ForgotPasswordModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onBackToLogin: () => void;
}

export function ForgotPasswordModal({ open, onOpenChange, onBackToLogin }: ForgotPasswordModalProps) {
    const { t } = useLanguage();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!email.trim()) {
            setError(t("auth.error.emailRequired"));
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to reset password");
            }

            setIsSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] max-w-[425px] bg-[#161616] border-white/10 text-white p-0">
                {isSuccess ? (
                    <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle className="w-8 h-8 text-gold-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">เช็คอีเมลของคุณ</h3>
                        <p className="text-gray-400">
                            เราได้ส่งรหัสผ่านใหม่ไปที่ <span className="text-white font-medium">{email}</span> แล้ว
                        </p>
                        <Button
                            onClick={onBackToLogin}
                            className="mt-4 w-full bg-white/10 hover:bg-white/20 text-white"
                        >
                            กลับไปเข้าสู่ระบบ
                        </Button>
                    </div>
                ) : (
                    <div className="p-8">
                        <div className="flex flex-col items-center justify-center mb-6">
                            <div className="relative w-16 h-16 mb-4 drop-shadow-[0_0_15px_rgba(255,160,0,0.6)]">
                                <Image
                                    src="/logo.png"
                                    alt="F1RSTCODE DEMY"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <DialogTitle className="text-2xl font-bold text-center">
                                {t("auth.forgotPassword")}
                            </DialogTitle>
                            <p className="text-gray-400 text-sm mt-2 text-center">
                                กรอกอีเมลที่คุณใช้สมัครสมาชิก เพื่อรับรหัสผ่านใหม่
                            </p>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <Label htmlFor="reset-email">{t("auth.email")}</Label>
                                <Input
                                    id="reset-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t("auth.placeholder.email")}
                                    className="bg-white/5 border-white/10 text-white focus:border-gold-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 mt-6 bg-gold-500 hover:bg-gold-400 text-black font-bold text-base rounded-lg shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    "ส่งรหัสผ่านใหม่"
                                )}
                            </Button>

                            {error && (
                                <div className="mt-4 text-red-500 text-sm text-center flex items-center justify-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <div className="mt-4 text-center">
                                <button
                                    type="button"
                                    onClick={onBackToLogin}
                                    className="text-gray-400 hover:text-white text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    ย้อนกลับ
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
