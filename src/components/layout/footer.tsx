"use client";

import Link from "next/link";
import { Facebook, Instagram, Youtube, Mail } from "lucide-react";
import Image from "next/image";

import { useLanguage } from "@/lib/language-context";

export function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="bg-black border-t border-white/10 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="relative w-10 h-10">
                                <Image
                                    src="/logo.png"
                                    alt="F1RSTCODE DEMY"
                                    fill
                                    className="object-contain drop-shadow-[0_0_10px_rgba(220,20,60,0.5)]"
                                />
                            </div>
                            <span className="font-bold text-lg text-white">
                                F1RST<span className="text-gold-400">CODE</span> <span className="text-crimson-500 ml-1">DEMY</span>
                            </span>
                        </div>
                        <p className="text-white/80 text-sm leading-relaxed">
                            {t("footer.desc")}
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="font-bold text-white mb-4">{t("footer.learn")}</h3>
                        <ul className="space-y-2 text-sm text-white/80">
                            <li><Link href="/courses" className="hover:text-gold-400 transition-colors">{t("nav.courses")}</Link></li>
                            <li><Link href="#" className="hover:text-gold-400 transition-colors">{t("footer.free")}</Link></li>
                            <li><Link href="#" className="hover:text-gold-400 transition-colors">{t("footer.plus")}</Link></li>
                            <li><Link href="#" className="hover:text-gold-400 transition-colors">{t("footer.pro")}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-white mb-4">{t("footer.support")}</h3>
                        <ul className="space-y-2 text-sm text-white/80">
                            <li><Link href="#" className="hover:text-gold-400 transition-colors">{t("footer.faq")}</Link></li>
                            <li><Link href="#" className="hover:text-gold-400 transition-colors">{t("footer.contact")}</Link></li>
                            <li><Link href="#" className="hover:text-gold-400 transition-colors">{t("footer.terms")}</Link></li>
                            <li><Link href="#" className="hover:text-gold-400 transition-colors">{t("footer.privacy")}</Link></li>
                        </ul>
                    </div>

                    {/* Connect */}
                    <div>
                        <h3 className="font-bold text-white mb-4">{t("footer.connect")}</h3>
                        <div className="flex gap-4">
                            <SocialLink icon={Facebook} />
                            <SocialLink icon={Instagram} />
                            <SocialLink icon={Youtube} />
                        </div>
                        <div className="mt-6">
                            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">{t("footer.subscribe")}</h4>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500 w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/60">
                    <p>© {new Date().getFullYear()} F1RSTCODE DEMY. {t("footer.rights")}</p>
                    <div className="flex gap-4">
                        <span>{t("footer.madeWith")}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ icon: Icon }: { icon: any }) {
    return (
        <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-gold-500 hover:text-black transition-all">
            <Icon className="w-4 h-4" />
        </a>
    )
}

function LineIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M19.01 1.94H4.99C3.3 1.94 1.94 3.3 1.94 4.99v14.02c0 1.69 1.36 3.05 3.05 3.05h14.02c1.69 0 3.05-1.36 3.05-3.05V4.99c0-1.69-1.36-3.05-3.05-3.05zM20.211 11.23c0 2.92-2.368 5.29-5.292 5.29c-.47 0-.936-.062-1.378-.184l-2.094 1.13c-.221.119-.444-.065-.398-.31l.247-1.328c-1.01-.842-1.671-2.126-1.671-3.598c0-2.924 2.37-5.292 5.292-5.292s5.292 2.368 5.292 5.292zm-7.608-2.029h-.615c-.105 0-.192.087-.192.193v3.673c0 .106.087.193.192.193h.615c.106 0 .193-.087.193-.193v-3.673c0-.106-.087-.193-.193-.193zm4.624 0h-.615c-.105 0-.192.087-.192.193v2.091l-1.92-2.203a.24.24 0 0 0-.013-.016a.2.2 0 0 0-.174-.065c-.105 0-.193.087-.193.193v3.673c0 .106.088.193.193.193h.615c.106 0 .193-.087.193-.193V11.23l1.92 2.203c.005.005.013.01.018.016a.214.214 0 0 0 .167.065c.106 0 .193-.087.193-.193v-3.673c0-.106-.087-.193-.193-.193zm2.146 1.772v1.901c0 .106-.087.193-.193.193h-1.6c-.106 0-.193-.087-.193-.193v-3.673c0-.106.087-.193.193-.193h.615c.106 0 .193.087.193.193V11h.992c.106 0 .193.087.193.193s-.087.193-.193.193h-.992v.387h.992c.106 0 .193.087.193.193s-.087.193-.193.193zM9.9 9.201h-.615c-.106 0-.193.087-.193.193v3.673c0 .106.087.193.193.193H11.5c.106 0 .193-.087.193-.193s-.087-.193-.193-.193h-.985V9.394c0-.106-.087-.193-.193-.193z" />
        </svg>
    )
}
