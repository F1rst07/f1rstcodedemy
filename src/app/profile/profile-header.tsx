"use client";

import { useLanguage } from "@/lib/language-context";

export function ProfileHeader() {
    const { t } = useLanguage();

    return (
        <div>
            <h1 className="text-3xl font-bold text-white">{t("profile.title")}</h1>
            <p className="mt-2 text-gray-400">
                {t("profile.subtitle")}
            </p>
        </div>
    );
}
