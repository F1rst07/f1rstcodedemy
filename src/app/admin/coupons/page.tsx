"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Trash2, TicketPercent, CheckCircle, XCircle, Calendar, Users, RefreshCw, Dice5, Pencil, Copy, Search, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { useLanguage } from "@/lib/language-context";

interface Coupon {
    id: string;
    code: string;
    discountPercent?: number;
    discountAmount?: number;
    maxUses?: number;
    currentUses: number;
    isActive: boolean;
    expiresAt?: string;
    createdAt: string;
}

export default function CouponsPage() {
    const { t, language } = useLanguage();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "EXPIRED">("ALL");

    // Form State
    const [form, setForm] = useState({
        code: "",
        discountType: "PERCENT" as "PERCENT" | "FIXED",
        value: "",
        maxUses: "",
        expiresAt: "",
        isActive: true
    });

    // Visibility State
    const [visibleCoupons, setVisibleCoupons] = useState<Record<string, boolean>>({});

    const toggleVisibility = (id: string) => {
        setVisibleCoupons(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const fetchCoupons = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/coupons");
            if (res.ok) {
                setCoupons(await res.json());
            }
        } catch (error) {
            console.error(error);
            toast.error(t("coupon.toast.error"));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchCoupons(); }, []);

    const generateCode = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        setForm(prev => ({ ...prev, code: result }));
    };

    const openCreateModal = () => {
        setEditingId(null);
        setForm({ code: "", discountType: "PERCENT", value: "", maxUses: "", expiresAt: "", isActive: true });
        setIsCreateOpen(true);
    };

    const openEditModal = (coupon: Coupon) => {
        setEditingId(coupon.id);
        setForm({
            code: coupon.code,
            discountType: coupon.discountPercent ? "PERCENT" : "FIXED",
            value: (coupon.discountPercent || coupon.discountAmount || "").toString(),
            maxUses: coupon.maxUses ? coupon.maxUses.toString() : "",
            expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : "",
            isActive: coupon.isActive
        });
        setIsCreateOpen(true);
    };

    const handleSubmit = async () => {
        if (!form.code || !form.value) {
            toast.error(t("coupon.toast.error"));
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                code: form.code,
                percent: form.discountType === "PERCENT" ? form.value : undefined,
                amount: form.discountType === "FIXED" ? form.value : undefined,
                maxUses: form.maxUses,
                expiresAt: form.expiresAt,
                isActive: form.isActive
            };

            let res;
            if (editingId) {
                res = await fetch("/api/admin/coupons", {
                    method: "PATCH",
                    body: JSON.stringify({ ...payload, id: editingId })
                });
            } else {
                res = await fetch("/api/admin/coupons", {
                    method: "POST",
                    body: JSON.stringify(payload)
                });
            }

            if (res.ok) {
                toast.success(editingId ? t("coupon.toast.updated") : t("coupon.toast.created"));
                setIsCreateOpen(false);
                fetchCoupons();
            } else {
                toast.error(t("coupon.toast.error"));
            }
        } catch (error) {
            toast.error(t("coupon.toast.error"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/admin/coupons`, {
                method: "PATCH",
                body: JSON.stringify({ id, isActive: !currentStatus })
            });
            if (res.ok) {
                toast.success(t("coupon.toast.statusUpdated"));
                fetchCoupons();
            }
        } catch (error) {
            toast.error(t("coupon.toast.error"));
        }
    };

    const deleteCoupon = async (id: string) => {
        if (!confirm(language === "TH" ? "คุณต้องการลบคูปองนี้ใช่หรือไม่?" : "Are you sure you want to delete this coupon?")) return;
        try {
            await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
            toast.success(t("coupon.toast.deleted"));
            fetchCoupons();
        } catch (error) {
            toast.error(t("coupon.toast.error"));
        }
    };

    const stats = {
        total: coupons.length,
        active: coupons.filter(c => c.isActive && (!c.expiresAt || new Date(c.expiresAt) > new Date())).length,
        expired: coupons.filter(c => c.expiresAt && new Date(c.expiresAt) <= new Date()).length
    };

    const dateLocale = language === "TH" ? "th-TH" : "en-US";

    return (
        <div className="py-6 md:py-8 text-white space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gold-400 to-amber-600 bg-clip-text text-transparent">{t("coupon.title")}</h1>
                    <p className="text-gray-400 mt-1">{t("coupon.subtitle")}</p>
                </div>

                <Button onClick={openCreateModal} className="bg-gold-500 hover:bg-gold-600 text-black font-bold gap-2">
                    <Plus className="w-4 h-4" />
                    {t("coupon.createBtn")}
                </Button>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent className="bg-[#1a1a1a] border-white/10 text-white sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{editingId ? t("coupon.form.title.edit") : t("coupon.form.title.create")}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">{t("coupon.form.code")}</label>
                                <div className="flex gap-2">
                                    <Input
                                        value={form.code}
                                        onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                        placeholder="SALE2024"
                                        className="bg-black/50 border-white/10 uppercase font-mono tracking-wider"
                                    />
                                    <Button variant="outline" onClick={generateCode} className="border-white/10 hover:bg-white/5" title="Generate Random Code">
                                        <Dice5 className="w-4 h-4 text-gold-500" />
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">{t("coupon.form.discountType")}</label>
                                    <div className="flex p-1 bg-black/50 rounded-lg border border-white/10">
                                        <button
                                            onClick={() => setForm({ ...form, discountType: "PERCENT" })}
                                            className={cn("flex-1 text-sm py-1.5 rounded-md transition-all font-medium", form.discountType === "PERCENT" ? "bg-gold-500 text-black shadow-lg" : "text-gray-400 hover:text-white")}
                                        >
                                            {t("coupon.form.percent")}
                                        </button>
                                        <button
                                            onClick={() => setForm({ ...form, discountType: "FIXED" })}
                                            className={cn("flex-1 text-sm py-1.5 rounded-md transition-all font-medium", form.discountType === "FIXED" ? "bg-gold-500 text-black shadow-lg" : "text-gray-400 hover:text-white")}
                                        >
                                            {t("coupon.form.fixed")}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">{t("coupon.form.value")}</label>
                                    <Input
                                        type="number"
                                        value={form.value}
                                        onChange={e => setForm({ ...form, value: e.target.value })}
                                        placeholder={form.discountType === "PERCENT" ? "10" : "100"}
                                        className="bg-black/50 border-white/10"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">{t("coupon.form.maxUses")}</label>
                                    <Input
                                        type="number"
                                        value={form.maxUses}
                                        onChange={e => setForm({ ...form, maxUses: e.target.value })}
                                        placeholder={language === "TH" ? "ไม่จำกัด" : "Unlimited"}
                                        className="bg-black/50 border-white/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">{t("coupon.form.expiresAt")}</label>
                                    <Input
                                        type="datetime-local"
                                        value={form.expiresAt}
                                        onChange={e => setForm({ ...form, expiresAt: e.target.value })}
                                        className="bg-black/50 border-white/10 [color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                                <label className="text-sm font-medium text-gray-300">{t("coupon.form.activeStatus")}</label>
                                <button
                                    onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                                    className={cn("w-12 h-6 rounded-full transition-colors relative", form.isActive ? "bg-emerald-500" : "bg-zinc-700")}
                                >
                                    <div className={cn("w-4 h-4 rounded-full bg-white absolute top-1 transition-all", form.isActive ? "left-7" : "left-1")} />
                                </button>
                            </div>

                            <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-gold-500 hover:bg-gold-600 text-black font-bold h-11 mt-4">
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingId ? t("coupon.form.btnUpdate") : t("coupon.form.btnCreate"))}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#111] p-6 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm font-medium">{t("coupon.stats.total")}</p>
                        <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500">
                        <TicketPercent className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-[#111] p-6 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm font-medium">{t("coupon.stats.active")}</p>
                        <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.active}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-[#111] p-6 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm font-medium">{t("coupon.stats.expired")}</p>
                        <p className="text-2xl font-bold text-red-400 mt-1">{stats.expired + (stats.total - stats.active - stats.expired)}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                        <XCircle className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Coupons Table */}
            <div className="bg-[#111] rounded-xl border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10 flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                        <h2 className="font-bold text-lg whitespace-nowrap">{t("coupon.table.title")}</h2>
                        <div className="relative flex-1 w-full sm:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <Input
                                placeholder={t("coupon.search.placeholder")}
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-9 bg-black/50 border-white/10 h-10 text-sm w-full"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex p-1 bg-black/50 rounded-lg border border-white/10">
                            <button
                                onClick={() => setStatusFilter("ALL")}
                                className={cn("px-3 py-1 text-xs rounded-md transition-all font-medium", statusFilter === "ALL" ? "bg-white/10 text-white" : "text-gray-500 hover:text-white")}
                            >{t("coupon.filter.all")}</button>
                            <button
                                onClick={() => setStatusFilter("ACTIVE")}
                                className={cn("px-3 py-1 text-xs rounded-md transition-all font-medium", statusFilter === "ACTIVE" ? "bg-emerald-500/20 text-emerald-400" : "text-gray-500 hover:text-white")}
                            >{t("coupon.filter.active")}</button>
                            <button
                                onClick={() => setStatusFilter("EXPIRED")}
                                className={cn("px-3 py-1 text-xs rounded-md transition-all font-medium", statusFilter === "EXPIRED" ? "bg-red-500/20 text-red-400" : "text-gray-500 hover:text-white")}
                            >{t("coupon.filter.expired")}</button>
                        </div>
                        <Button variant="ghost" size="icon" onClick={fetchCoupons} className="hover:bg-white/5">
                            <RefreshCw className={cn("w-4 h-4 text-gray-400", isLoading && "animate-spin")} />
                        </Button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-black/40 text-gray-400 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4 whitespace-nowrap">{t("coupon.table.code")}</th>
                                <th className="px-6 py-4 whitespace-nowrap">{t("coupon.table.discount")}</th>
                                <th className="px-6 py-4 whitespace-nowrap">{t("coupon.table.status")}</th>
                                <th className="px-6 py-4 whitespace-nowrap">{t("coupon.table.usage")}</th>
                                <th className="px-6 py-4 whitespace-nowrap">{t("coupon.table.period")}</th>
                                <th className="px-6 py-4 text-right whitespace-nowrap">{t("coupon.table.actions")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        {t("coupon.table.loading")}
                                    </td>
                                </tr>
                            ) : coupons.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">{t("coupon.table.noData")}</td>
                                </tr>
                            ) : (
                                coupons
                                    .filter(c => c.code.toLowerCase().includes(searchQuery.toLowerCase()))
                                    .filter(c => {
                                        if (statusFilter === "ACTIVE") return c.isActive && (!c.expiresAt || new Date(c.expiresAt) > new Date());
                                        if (statusFilter === "EXPIRED") return !c.isActive || (c.expiresAt && new Date(c.expiresAt) <= new Date());
                                        return true;
                                    })
                                    .map((c) => (
                                        <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="font-mono font-bold text-white tracking-wide">
                                                        {visibleCoupons[c.id] ? c.code : "••••••••"}
                                                    </div>
                                                    <button
                                                        onClick={() => toggleVisibility(c.id)}
                                                        className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                                                        title={visibleCoupons[c.id] ? "Hide Code" : "Show Code"}
                                                    >
                                                        {visibleCoupons[c.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                    </button>
                                                    <button
                                                        onClick={() => { navigator.clipboard.writeText(c.code); toast.success(t("coupon.toast.copied")); }}
                                                        className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-gold-400 transition-colors"
                                                        title="Copy Code"
                                                    >
                                                        <Copy className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">ID: {c.id.slice(0, 8)}...</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-bold text-gold-400">
                                                    {c.discountPercent ? `${c.discountPercent}% OFF` : `฿${c.discountAmount?.toLocaleString()} OFF`}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => toggleStatus(c.id, c.isActive)}
                                                    className={cn(
                                                        "px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer whitespace-nowrap",
                                                        c.isActive
                                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                                                            : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                                                    )}
                                                >
                                                    {c.isActive ? t("coupon.status.active") : t("coupon.status.inactive")}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20 flex-shrink-0 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-500 rounded-full"
                                                            style={{ width: `${Math.min(100, (c.currentUses / (c.maxUses || 100)) * 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-400 font-mono whitespace-nowrap">
                                                        {c.currentUses}/{c.maxUses || '∞'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                        <Calendar className="w-3 h-3 flex-shrink-0" />
                                                        <span className="whitespace-nowrap">{t("coupon.date.created")}: {new Date(c.createdAt).toLocaleString(dateLocale, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    {c.expiresAt && (
                                                        <div className={cn("flex items-center gap-1.5 text-xs font-medium", new Date(c.expiresAt) < new Date() ? "text-red-400" : "text-amber-400")}>
                                                            <Calendar className="w-3 h-3 flex-shrink-0" />
                                                            <span className="whitespace-nowrap">{t("coupon.date.expires")}: {new Date(c.expiresAt).toLocaleString(dateLocale, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => openEditModal(c)}
                                                        className="h-8 w-8 border-white/10 bg-white/5 text-gray-400 hover:text-gold-400 hover:bg-gold-500/10 hover:border-gold-500/30 transition-all"
                                                        title={language === "TH" ? "แก้ไข" : "Edit"}
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => deleteCoupon(c.id)}
                                                        className="h-8 w-8 border-white/10 bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
                                                        title={language === "TH" ? "ลบ" : "Delete"}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
