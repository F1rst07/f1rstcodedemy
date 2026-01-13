"use client";

import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FileText, Eye, CreditCard, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

// Mock data to match the user's screenshot
const mockOrders = [
    {
        id: "#108084",
        dateEN: "January 11, 2026",
        dateTH: "มกราคม 11, 2026",
        status: "pending_payment",
        total: "฿3,590.00",
        items: 1,
    },
    {
        id: "#107844",
        dateEN: "December 13, 2025",
        dateTH: "ธันวาคม 13, 2025",
        status: "completed",
        total: "฿799.00",
        items: 1,
    }
];

export default function OrderStatusPage() {
    const { t, language } = useLanguage();

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "pending_payment":
                return t("order.pendingPayment");
            case "completed":
                return t("order.completed");
            case "processing":
                return t("order.processing");
            case "cancelled":
                return t("order.cancelled");
            default:
                return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending_payment":
                return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
            case "completed":
                return "text-green-500 bg-green-500/10 border-green-500/20";
            default:
                return "text-gray-400 bg-white/5 border-white/10";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "pending_payment":
                return <Clock className="w-4 h-4 mr-2" />;
            case "completed":
                return <CheckCircle className="w-4 h-4 mr-2" />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-black pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                        <FileText className="w-8 h-8 text-gold-400" />
                        {t("order.title")}
                    </h1>
                    <p className="text-gray-400 text-lg">
                        {t("order.subtitle")}
                    </p>
                </div>

                {/* Table Container */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-[#161616] border border-white/10 rounded-2xl overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10">
                                    <th className="p-4 sm:p-6 text-white font-bold text-base sm:text-lg whitespace-nowrap">{t("order.orderId")}</th>
                                    <th className="p-4 sm:p-6 text-white font-bold text-base sm:text-lg whitespace-nowrap">{t("order.date")}</th>
                                    <th className="p-4 sm:p-6 text-white font-bold text-base sm:text-lg whitespace-nowrap">{t("order.status")}</th>
                                    <th className="p-4 sm:p-6 text-white font-bold text-base sm:text-lg whitespace-nowrap">{t("order.total")}</th>
                                    <th className="p-4 sm:p-6 text-white font-bold text-base sm:text-lg whitespace-nowrap text-right">{t("order.actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockOrders.map((order, index) => (
                                    <tr
                                        key={index}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                    >
                                        <td className="p-4 sm:p-6">
                                            <span className="text-gold-400 font-bold text-lg">{order.id}</span>
                                        </td>
                                        <td className="p-4 sm:p-6 text-gray-300 font-medium whitespace-nowrap">
                                            {language === 'EN' ? order.dateEN : order.dateTH}
                                        </td>
                                        <td className="p-4 sm:p-6">
                                            <span className={`inline-flex items-center border px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </td>
                                        <td className="p-4 sm:p-6 text-white font-medium whitespace-nowrap">
                                            {order.items} {t("order.items")} - <span className="font-bold">{order.total}</span>
                                        </td>
                                        <td className="p-4 sm:p-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    className="border-white/10 hover:bg-white/10 text-gray-300 hover:text-white"
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    {t("order.viewDetails")}
                                                </Button>
                                                {order.status === "pending_payment" && (
                                                    <Link href={`/payment?orderId=${order.id.replace('#', '')}`}>
                                                        <Button className="bg-gold-500 hover:bg-gold-400 text-black font-bold border-none">
                                                            <CreditCard className="w-4 h-4 mr-2" />
                                                            {t("order.notifyPayment")}
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty State (Hidden if has data, but good for structure) */}
                    {mockOrders.length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            ยังไม่มีรายการคำสั่งซื้อ
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
