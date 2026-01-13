"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Globe, Menu, LogOut, Settings, User, ChevronDown, FileText, CreditCard, UserPen, Crown, ShoppingCart } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { RegisterModal } from "@/components/auth/register-modal";
import { LoginModal } from "@/components/auth/login-modal";
import { motion } from "framer-motion";

import { useLanguage } from "@/lib/language-context";

export function Navbar() {
    const { language, setLanguage, t } = useLanguage();
    const { data: session, status } = useSession();
    const pathname = usePathname();

    const [scrolled, setScrolled] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [registerOpen, setRegisterOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isHome = pathname === "/";

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        // Check initial scroll position
        handleScroll();

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const switchToRegister = () => {
        setLoginOpen(false);
        setTimeout(() => setRegisterOpen(true), 100);
    };

    const switchToLogin = () => {
        setRegisterOpen(false);
        setTimeout(() => setLoginOpen(true), 100);
    };

    const handleLogout = () => {
        signOut({ callbackUrl: "/" });
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-6 lg:px-8 ${scrolled || !isHome ? "bg-black/95 backdrop-blur-md shadow-md" : "bg-transparent"
                }`}
        >
            <div className={`max-w-7xl mx-auto flex items-center justify-between transition-all duration-300 ${scrolled ? "h-16" : "h-20"}`}>
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
                    <div className="relative w-8 h-8 sm:w-10 sm:h-10 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(255,160,0,0.4)]">
                        <Image
                            src="/logo.png"
                            alt="F1RSTCODE DEMY Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <span className="font-bold text-sm xs:text-base sm:text-lg md:text-xl tracking-wide text-white group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all">
                        F1RST<span className="text-gold-400">CODE</span> <span className="text-crimson-500 ml-0.5 sm:ml-1 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">DEMY</span>
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    {[
                        "home",
                        "membership",
                        "courses",
                        ...(session ? ["classcenter"] : []),
                        ...((session?.user as any)?.role === 'ADMIN' ? ["admin"] : [])
                    ].map((item) => {
                        const href = item === "home" ? "/" : item === "admin" ? "/admin/courses" : `/${item}`;
                        const isActive = pathname === href || (item === "admin" && pathname.startsWith("/admin"));

                        return (
                            <Link
                                key={item}
                                href={href}
                                className={`font-medium transition-colors ${isActive ? "text-gold-400 font-bold" : "text-gray-300 hover:text-gold-400"} ${item === "admin" ? "flex items-center gap-1" : ""}`}
                            >
                                {item === "admin" ? (
                                    <>
                                        <Crown className="w-4 h-4 text-gold-500" />
                                        <span>Admin</span>
                                    </>
                                ) : (
                                    t(`nav.${item}`)
                                )}
                            </Link>
                        );
                    })}
                </div>

                <div className="flex items-center gap-4">
                    {/* Language Switcher */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
                                <Globe className="w-5 h-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#161616] border-white/10 text-white">
                            <DropdownMenuItem
                                onClick={() => setLanguage('EN')}
                                className="focus:bg-white/10 focus:text-gold-400 cursor-pointer"
                            >
                                🇬🇧 English
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setLanguage('TH')}
                                className="focus:bg-white/10 focus:text-gold-400 cursor-pointer"
                            >
                                🇹🇭 ภาษาไทย
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Shopping Cart - Only show when logged in */}
                    {session && (
                        <Link href="/cart">
                            <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
                                <ShoppingCart className="w-5 h-5" />
                            </Button>
                        </Link>
                    )}



                    {/* Auth Buttons - Conditional based on session */}
                    {status === "loading" ? (
                        <div className="w-24 h-10 bg-white/5 animate-pulse rounded-xl" />
                    ) : session ? (
                        // Logged in - Show Logout button
                        <div className="flex items-center gap-2 sm:gap-4">
                            {/* User Profile Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="flex items-center gap-0 sm:gap-3 pl-0 pr-0 sm:pl-1.5 sm:pr-4 py-1.5 h-10 sm:h-12 border-0 sm:border sm:border-white/10 bg-transparent sm:bg-white/5 sm:hover:bg-white/10 sm:hover:border-gold-500/30 sm:data-[state=open]:bg-white/10 sm:data-[state=open]:border-gold-500/30 rounded-full transition-all duration-300 group max-w-none">
                                        <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center group-hover:border-gold-500/50 transition-colors shrink-0 overflow-hidden relative">
                                            {/* Always try to show image first, fallback to User icon on error */}
                                            {session?.user?.image ? (
                                                <Image
                                                    src={session.user.image}
                                                    alt={session?.user?.name || "User"}
                                                    fill
                                                    className="object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        const parent = e.currentTarget.parentElement;
                                                        if (parent) parent.classList.add('fallback-icon-visible');
                                                    }}
                                                />
                                            ) : (session?.user as any)?.isCustomImage ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={`/api/user/avatar?t=${Date.now()}`}
                                                    alt={session?.user?.name || "User"}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        const parent = e.currentTarget.parentElement;
                                                        if (parent) parent.classList.add('fallback-icon-visible');
                                                    }}
                                                />
                                            ) : (
                                                <User className="w-4 h-4 sm:w-5 sm:h-5 text-gold-400" />
                                            )}
                                            {/* Fallback icon that shows if image is hidden */}
                                            <User className="w-4 h-4 sm:w-5 sm:h-5 text-gold-400 absolute hidden [.fallback-icon-visible_&]:block" />
                                        </div>
                                        <span className="font-medium text-white tracking-wide group-hover:text-gold-400 transition-colors hidden xs:inline overflow-hidden text-ellipsis whitespace-nowrap text-sm sm:text-base">
                                            {session.user?.name
                                                ? (session.user.name.length > 3 ? `${session.user.name.slice(0, 3)}...` : session.user.name)
                                                : "User"}
                                        </span>
                                        <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-gold-400 transition-colors shrink-0" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64 bg-[#161616] border-white/10 text-white p-2 text-sm sm:text-base">
                                    <div className="px-2 py-3 border-b border-white/10 mb-2">
                                        <p className="font-bold text-white truncate">{session.user?.name || "User"}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-xs px-2 py-0.5 rounded border ${((session.user as any)?.role?.toLowerCase() === 'admin')
                                                ? "bg-red-500/20 text-red-500 border-red-500/30"
                                                : ((session.user as any)?.role?.toLowerCase() === 'teacher' || (session.user as any)?.role?.toLowerCase() === 'instructor')
                                                    ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
                                                    : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                                                }`}>
                                                {(session.user as any)?.role || "STUDENT"}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded border ${((session.user as any)?.plan?.toLowerCase() === 'pro')
                                                ? "bg-gold-500/20 text-gold-400 border-gold-500/30"
                                                : ((session.user as any)?.plan?.toLowerCase() === 'plus')
                                                    ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                                                    : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                                                }`}>
                                                {(session.user as any)?.plan || "Free"}
                                            </span>
                                        </div>
                                    </div>
                                    <Link href="/subscribe">
                                        <DropdownMenuItem className="focus:bg-white/10 focus:text-gold-400 cursor-pointer py-2 text-gold-400 font-medium">
                                            <Crown className="w-4 h-4 mr-2" />
                                            {t("nav.subscribe")}
                                        </DropdownMenuItem>
                                    </Link>
                                    <div className="h-px bg-white/10 my-1" />
                                    <Link href="/orders">
                                        <DropdownMenuItem className="focus:bg-white/10 focus:text-gold-400 cursor-pointer py-2">
                                            <FileText className="w-4 h-4 mr-2" />
                                            {t("nav.orderStatus")}
                                        </DropdownMenuItem>
                                    </Link>
                                    <Link href="/payment">
                                        <DropdownMenuItem className="focus:bg-white/10 focus:text-gold-400 cursor-pointer py-2">
                                            <CreditCard className="w-4 h-4 mr-2" />
                                            {t("nav.paymentNotify")}
                                        </DropdownMenuItem>
                                    </Link>
                                    <Link href="/profile">
                                        <DropdownMenuItem className="focus:bg-white/10 focus:text-gold-400 cursor-pointer py-2">
                                            <UserPen className="w-4 h-4 mr-2" />
                                            {t("nav.editProfile")}
                                        </DropdownMenuItem>
                                    </Link>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                onClick={handleLogout}
                                className="hidden sm:flex bg-red-600 hover:bg-red-500 text-white font-bold text-base h-11 px-6 rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:shadow-[0_0_20px_rgba(220,38,38,0.6)] transition-all duration-300"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                {t("nav.logout")}
                            </Button>
                        </div>
                    ) : (
                        // Not logged in - Show Login & Register
                        <div className="hidden sm:flex items-center gap-4">
                            <LoginModal
                                open={loginOpen}
                                onOpenChange={setLoginOpen}
                                onSwitchToRegister={switchToRegister}
                                trigger={
                                    <Button
                                        variant="outline"
                                        className="border-white/20 bg-white/5 text-white hover:bg-black hover:border-gold-400 hover:text-gold-400 font-bold text-base h-11 px-6 rounded-xl transition-all duration-300"
                                    >
                                        {t("nav.login")}
                                    </Button>
                                }
                            />

                            <RegisterModal
                                open={registerOpen}
                                onOpenChange={setRegisterOpen}
                                onSwitchToLogin={switchToLogin}
                                trigger={
                                    <div className="cursor-pointer">
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Button className="bg-gold-500 hover:bg-gold-400 text-black font-bold text-base h-11 px-6 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all duration-300">
                                                {t("nav.register")}
                                            </Button>
                                        </motion.div>
                                    </div>
                                }
                            />
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden text-white"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <Menu className="w-6 h-6" />
                    </Button>
                </div>
            </div>

            {/* Mobile Menu Panel */}
            {
                mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="md:hidden absolute top-full left-0 right-0 max-h-[calc(100vh-4rem)] overflow-y-auto bg-black/95 backdrop-blur-md border-t border-white/10 p-4"
                    >
                        <div className="flex flex-col landscape:grid landscape:grid-cols-2 gap-3 sm:gap-4">
                            <div className="flex flex-col gap-2">
                                {[
                                    "home",
                                    "membership",
                                    "courses",
                                    ...(session ? ["classcenter"] : []),
                                    ...((session?.user as any)?.role === 'ADMIN' ? ["admin"] : [])
                                ].map((item) => {
                                    const href = item === "home" ? "/" : item === "admin" ? "/admin/courses" : `/${item}`;
                                    const isActive = pathname === href || (item === "admin" && pathname.startsWith("/admin"));
                                    return (
                                        <Link
                                            key={item}
                                            href={href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`font-medium py-1.5 sm:py-2 transition-colors text-sm sm:text-base ${isActive
                                                ? "text-gold-400 font-bold"
                                                : "text-gray-300 hover:text-gold-400"
                                                } ${item === "admin" ? "flex items-center gap-1" : ""}`}
                                        >
                                            {item === "admin" ? (
                                                <>
                                                    <Crown className="w-4 h-4 text-gold-500" />
                                                    <span>Admin</span>
                                                </>
                                            ) : (
                                                t(`nav.${item}`)
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                            <div className="flex flex-col gap-2 sm:gap-3 pt-2 landscape:pt-0 border-t landscape:border-t-0 landscape:border-l border-white/10 landscape:pl-4">
                                {session ? (
                                    // Logged in - Show Logout in mobile
                                    <Button
                                        onClick={handleLogout}
                                        className="w-full h-10 sm:h-11 bg-red-600 hover:bg-red-500 text-white font-bold text-sm sm:text-base shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:shadow-[0_0_20px_rgba(220,38,38,0.6)]"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        {t("nav.logout")}
                                    </Button>
                                ) : (
                                    // Not logged in - Show Login & Register in mobile
                                    <>
                                        <LoginModal
                                            open={loginOpen}
                                            onOpenChange={setLoginOpen}
                                            onSwitchToRegister={switchToRegister}
                                            trigger={
                                                <Button
                                                    variant="outline"
                                                    className="w-full h-10 sm:h-11 border-white/20 bg-white/5 text-white hover:bg-black hover:border-gold-400 hover:text-gold-400 font-bold text-sm sm:text-base"
                                                >
                                                    {t("nav.login")}
                                                </Button>
                                            }
                                        />
                                        <RegisterModal
                                            open={registerOpen}
                                            onOpenChange={setRegisterOpen}
                                            onSwitchToLogin={switchToLogin}
                                            trigger={
                                                <Button className="w-full h-10 sm:h-11 bg-gold-500 hover:bg-gold-400 text-black font-bold text-sm sm:text-base">
                                                    {t("nav.register")}
                                                </Button>
                                            }
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )
            }
        </nav >
    );
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
    return (
        <Link
            href={href}
            className={`relative text-sm font-medium transition-colors hover:text-gold-400 ${active ? "text-white" : "text-white/60"
                }`}
        >
            {children}
            {active && (
                <span className="absolute -bottom-8 left-0 right-0 h-1 bg-gradient-to-r from-gold-400 to-crimson-600 rounded-t-full shadow-[0_-2px_10px_rgba(255,179,0,0.5)]" />
            )}
        </Link>
    )
}
