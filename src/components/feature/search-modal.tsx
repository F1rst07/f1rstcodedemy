"use client";

import { Search, Code, Palette, Database, BarChart, Smartphone, Globe, Cloud } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const categories = [
    { name: "Web Development", icon: Globe, color: "text-blue-400", bg: "bg-blue-400/10" },
    { name: "Mobile App", icon: Smartphone, color: "text-green-400", bg: "bg-green-400/10" },
    { name: "Data Science", icon: Database, color: "text-purple-400", bg: "bg-purple-400/10" },
    { name: "UI/UX Design", icon: Palette, color: "text-pink-400", bg: "bg-pink-400/10" },
    { name: "Cloud Computing", icon: Cloud, color: "text-sky-400", bg: "bg-sky-400/10" },
    { name: "Backend", icon: Code, color: "text-orange-400", bg: "bg-orange-400/10" },
];

export function SearchModal({ trigger }: { trigger: React.ReactNode }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl bg-[#0a0a0a] border-white/10">
                <div className="space-y-6">
                    {/* Header / Input */}
                    <div className="relative">
                        <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                        <input
                            placeholder="Search for courses, skills, or instructors..."
                            className="w-full h-12 pl-12 pr-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                        />
                    </div>

                    {/* Popular Categories */}
                    <div>
                        <h3 className="text-sm font-medium text-white/50 mb-3 uppercase tracking-wider">Browse Categories</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {categories.map((cat) => (
                                <button
                                    key={cat.name}
                                    className={`flex items-center gap-3 p-3 rounded-lg border border-white/5 hover:border-gold-500/30 transition-all group ${cat.bg} bg-opacity-5 hover:bg-opacity-10`}
                                >
                                    <cat.icon className={`h-5 w-5 ${cat.color}`} />
                                    <span className="text-sm font-medium text-white/80 group-hover:text-white">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Recent / Footer */}
                    <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs text-muted-foreground">
                        <span>Press <kbd className="px-1 py-0.5 rounded bg-white/10 text-white">⌘</kbd> <kbd className="px-1 py-0.5 rounded bg-white/10 text-white">K</kbd> to open</span>
                        <span className="hover:text-gold-400 cursor-pointer">View all courses</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
