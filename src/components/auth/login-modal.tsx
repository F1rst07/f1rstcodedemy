"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/lib/language-context";
import Image from "next/image";
import { useState } from "react";
import { Loader2, CheckCircle, LogIn, AlertCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface LoginModalProps {
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSwitchToRegister?: () => void;
}

export function LoginModal({ trigger, open: controlledOpen, onOpenChange: setControlledOpen, onSwitchToRegister }: LoginModalProps) {
    const { t } = useLanguage();
    const [internalOpen, setInternalOpen] = useState(false);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? setControlledOpen : setInternalOpen;

    const [view, setView] = useState<'login' | 'forgot'>('login');
    const [forgotEmail, setForgotEmail] = useState("");
    const [isForgotLoading, setIsForgotLoading] = useState(false);
    const [forgotSuccess, setForgotSuccess] = useState(false);
    const [forgotError, setForgotError] = useState<string | null>(null);

    // Restore missing login state
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>("");
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Custom validation
        if (!formData.email.trim()) {
            setError(t("auth.error.emailRequired"));
            setIsLoading(false);
            return;
        }
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

        try {
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                if (result.error.includes("User not found")) {
                    setError("User not found");
                } else if (result.error.includes("Invalid password")) {
                    setError("Incorrect password");
                } else {
                    setError(result.error === "CredentialsSignin" ? "Invalid email or password" : result.error);
                }
            } else {
                try {
                    const sessionRes = await fetch('/api/auth/session');
                    const session = await sessionRes.json();
                    if (session?.user?.name) {
                        setUserName(session.user.name);
                    }
                } catch (e) {
                    // Ignore
                }
                setIsSuccess(true);
                // Set remember me cookie if checked
                if (rememberMe) {
                    document.cookie = `remember-me=true; max-age=${30 * 24 * 60 * 60}; path=/`;
                }
                router.refresh();
                setTimeout(() => {
                    setOpen?.(false);
                    setIsSuccess(false);
                    setFormData({ email: "", password: "" });
                    setRememberMe(false);
                    setUserName("");
                    setView('login');
                }, 2000);
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleForgotSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsForgotLoading(true);
        setForgotError(null);

        if (!forgotEmail.trim()) {
            setForgotError(t("auth.error.emailRequired"));
            setIsForgotLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: forgotEmail }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to reset password");
            }

            setForgotSuccess(true);
        } catch (err: any) {
            setForgotError(err.message);
        } finally {
            setIsForgotLoading(false);
        }
    };

    // Reset state when opening/closing
    const handleOpenChange = (val: boolean) => {
        setOpen?.(val);
        if (!val) {
            // Reset to login view after a delay to clear transitions? 
            // Or immediately.
            setTimeout(() => {
                setView('login');
                setForgotSuccess(false);
                setForgotEmail("");
                setForgotError(null);
            }, 300);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto bg-[#161616] border-white/10 text-white p-0">
                {view === 'forgot' ? (
                    isSuccess || forgotSuccess ? ( // Re-using isSuccess variable name might be confusing, using forgotSuccess
                        <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mb-2">
                                <CheckCircle className="w-8 h-8 text-gold-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">{t("auth.forgot.checkEmail")}</h3>
                            <p className="text-gray-400">
                                {t("auth.forgot.sentTo")} <span className="text-white font-medium">{forgotEmail}</span>
                            </p>
                            <Button
                                onClick={() => {
                                    setView('login');
                                    setForgotSuccess(false);
                                    setForgotEmail("");
                                    setForgotEmail("");
                                }}
                                className="mt-4 w-full bg-white/10 hover:bg-white/20 text-white"
                            >
                                {t("auth.forgot.backToLogin")}
                            </Button>
                        </div>
                    ) : (
                        <div className="p-6 sm:p-8">
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
                                    {t("auth.forgot.desc")}
                                </p>
                            </div>

                            <form className="space-y-4" onSubmit={handleForgotSubmit}>
                                <div className="space-y-2">
                                    <Label htmlFor="reset-email">{t("auth.email")}</Label>
                                    <Input
                                        id="reset-email"
                                        type="email"
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        placeholder={t("auth.placeholder.email")}
                                        className="bg-white/5 border-white/10 text-white focus:border-gold-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isForgotLoading}
                                    className="w-full h-12 mt-6 bg-gold-500 hover:bg-gold-400 text-black font-bold text-base rounded-lg shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all"
                                >
                                    {isForgotLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {t("auth.forgot.sending")}
                                        </>
                                    ) : (
                                        t("auth.forgot.sendButton")
                                    )}
                                </Button>

                                {forgotError && (
                                    <div className="mt-4 text-red-500 text-sm text-center flex items-center justify-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {forgotError}
                                    </div>
                                )}

                                <div className="mt-4 text-center">
                                    <button
                                        type="button"
                                        onClick={() => setView('login')}
                                        className="text-gray-400 hover:text-white text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        ย้อนกลับ
                                    </button>
                                </div>
                            </form>
                        </div>
                    )
                ) : ( // Login View 
                    isSuccess ? (
                        <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gold-500/10 rounded-full flex items-center justify-center mb-2">
                                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gold-500" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-white">Welcome! {userName || "User"}</h3>
                            <p className="text-sm sm:text-base text-gray-400">You have successfully logged in.</p>
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
                                    {t("nav.login")}
                                </DialogTitle>
                            </div>

                            <form className="space-y-4" onSubmit={handleSubmit} noValidate>

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
                                        <div className="flex items-center justify-between mt-2">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={rememberMe}
                                                    onChange={(e) => setRememberMe(e.target.checked)}
                                                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-gold-500 focus:ring-gold-500/50 cursor-pointer accent-gold-500"
                                                />
                                                <span className="text-xs text-gray-400 group-hover:text-white transition-colors">{t("auth.rememberMe")}</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setView('forgot')}
                                                className="text-xs text-gold-500 hover:text-gold-400"
                                            >
                                                {t("auth.forgotPassword")}
                                            </button>
                                        </div>
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
                                            Logging in...
                                        </>
                                    ) : (
                                        t("auth.loginSubmit")
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
                                {t("auth.noAccount")}{" "}
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (onSwitchToRegister) {
                                            onSwitchToRegister();
                                        } else {
                                            setOpen?.(false);
                                        }
                                    }}
                                    className="text-gold-500 hover:text-gold-400 transition-colors font-medium"
                                >
                                    {t("nav.register")}
                                </button>
                            </div>
                        </div>
                    ))}
            </DialogContent>
        </Dialog>
    );
}
