"use client";

import { useLanguage } from "@/lib/language-context";

interface ClassroomTabsProps {
    activeTab: 'all' | 'learning' | 'notStarted' | 'expired';
    onTabChange: (tab: 'all' | 'learning' | 'notStarted' | 'expired') => void;
}

export function ClassroomTabs({ activeTab, onTabChange }: ClassroomTabsProps) {
    const { t } = useLanguage();

    const tabs = [
        { id: 'all', label: t("class.tabs.all") },
        { id: 'learning', label: t("class.tabs.learning") },
        { id: 'notStarted', label: t("class.tabs.notStarted") },
        { id: 'expired', label: t("class.tabs.expired") },
    ] as const;

    return (
        <div className="flex flex-nowrap items-center gap-2 sm:gap-8 border-b border-white/10 overflow-x-auto pb-1 hide-scrollbar">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`relative text-sm sm:text-base font-medium pb-3 px-2 sm:px-4 transition-colors whitespace-nowrap ${activeTab === tab.id
                        ? "text-gold-500 font-bold"
                        : "text-gray-400 hover:text-white"
                        }`}
                >
                    {tab.label}
                    {activeTab === tab.id && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500 rounded-t-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                    )}
                </button>
            ))}
        </div>
    );
}
