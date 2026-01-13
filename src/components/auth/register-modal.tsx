"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/lib/language-context";
import Image from "next/image";
import { useState } from "react";
import { Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";

interface RegisterModalProps {
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSwitchToLogin?: () => void;
}

export function RegisterModal({ trigger, open: controlledOpen, onOpenChange: setControlledOpen, onSwitchToLogin }: RegisterModalProps) {
    const { t } = useLanguage();
    const [internalOpen, setInternalOpen] = useState(false);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? setControlledOpen : setInternalOpen;

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Custom validation
        if (!formData.name.trim()) {
            setError(t("auth.error.nameRequired"));
            setIsLoading(false);
            return;
        }
        if (!formData.email.trim()) {
            setError(t("auth.error.emailRequired"));
            setIsLoading(false);
            return;
        }
        // Basic email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError(t("auth.error.emailInvalid"));
            setIsLoading(false);
            return;
        }
        if (!formData.password) {
            setError(t("auth.error.passwordRequired"));
            setIsLoading(false);
            return;
        }
        if (formData.password.length <= 6) {
            setError(t("auth.error.passwordTooShort"));
            setIsLoading(false);
            return;
        }
        if (!formData.confirmPassword) {
            setError(t("auth.error.confirmPasswordRequired"));
            setIsLoading(false);
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError(t("auth.error.passwordMismatch"));
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            let data;
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await res.json();
            } else {
                // If not JSON, probably an HTML error page (500/404)
                const text = await res.text();
                console.error("Non-JSON response:", text);
                throw new Error("System error. Please contact support.");
            }

            if (!res.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            setIsSuccess(true);
            setTimeout(() => {
                setOpen?.(false);
                setIsSuccess(false);
                setFormData({ name: "", email: "", password: "", confirmPassword: "" });
                // Optional: switch to login
                onSwitchToLogin?.();
            }, 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto bg-[#161616] border-white/10 text-white p-0">
                {isSuccess ? (
                    <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white">Welcome, {formData.name || "Student"}!</h3>
                        <p className="text-sm sm:text-base text-gray-400">Your account has been created successfully.</p>
                    </div>
                ) : (
                    <div className="p-4 sm:p-6 md:p-8">
                        <div className="flex flex-col items-center justify-center mb-4 sm:mb-6">
                            {/* Logo */}
                            <div className="relative w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 drop-shadow-[0_0_15px_rgba(255,160,0,0.6)]">
                                <Image
                                    src="/logo.png"
                                    alt="F1RSTCODE DEMY"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <DialogTitle className="text-xl sm:text-2xl font-bold text-center">
                                {t("auth.createAccount")}
                            </DialogTitle>
                        </div>

                        <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit} noValidate>

                            <div className="space-y-2">
                                <Label htmlFor="name">{t("auth.name")}</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder={t("auth.placeholder.name")}
                                    className="bg-white/5 border-white/10 text-white focus:border-gold-500 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 sm:h-11 text-sm sm:text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">{t("auth.email")}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder={t("auth.placeholder.email")}
                                    className="bg-white/5 border-white/10 text-white focus:border-gold-500 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 sm:h-11 text-sm sm:text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">{t("auth.password")}</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder={t("auth.placeholder.password")}
                                        autoComplete="new-password"
                                        className="bg-white/5 border-white/10 text-white focus:border-gold-500 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 sm:h-11 text-sm sm:text-base pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? (
                                            <Eye className="w-5 h-5" />
                                        ) : (
                                            <EyeOff className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder={t("auth.placeholder.confirmPassword")}
                                        autoComplete="new-password"
                                        className="bg-white/5 border-white/10 text-white focus:border-gold-500 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 sm:h-11 text-sm sm:text-base pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showConfirmPassword ? (
                                            <Eye className="w-5 h-5" />
                                        ) : (
                                            <EyeOff className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-10 sm:h-12 mt-4 sm:mt-6 bg-gold-500 hover:bg-gold-400 text-black font-bold text-sm sm:text-base rounded-lg shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    t("auth.submit")
                                )}
                            </Button>
                            {error && (
                                <div className="mt-4 text-red-500 text-sm text-center flex items-center justify-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}
                        </form>

                        <div className="mt-6 text-center text-sm text-gray-400">
                            {t("auth.haveAccount")}{" "}
                            <button
                                type="button"
                                onClick={() => {
                                    if (onSwitchToLogin) {
                                        onSwitchToLogin();
                                    } else {
                                        // Fallback if not handled? Or just close?
                                        setOpen?.(false);
                                    }
                                }}
                                className="text-gold-500 hover:text-gold-400 transition-colors font-medium"
                            >
                                {t("nav.login")}
                            </button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
