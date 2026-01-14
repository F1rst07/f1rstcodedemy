"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, FileText, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";

interface OrderItem {
    course: { title: string; price: number };
}

interface Order {
    id: string;
    total: number;
    status: string;
    slipUrl: string | null;
    createdAt: string;
    user: { name: string; email: string };
    items: OrderItem[];
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("PENDING"); // PENDING, COMPLETED, CANCELLED, ALL

    const fetchOrders = async () => {
        try {
            const query = filter === "ALL" ? "" : `?status=${filter}`;
            const res = await fetch(`/api/admin/orders${query}`);
            const data = await res.json();
            setOrders(data);
        } catch (error) {
            console.error("Failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [filter]);

    const updateStatus = async (orderId: string, status: string) => {
        if (!confirm(`Are you sure you want to mark this order as ${status}?`)) return;
        try {
            const res = await fetch("/api/admin/orders", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, status })
            });
            if (res.ok) fetchOrders();
        } catch (error) {
            console.error(error);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const colors: any = {
            PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
            PENDING_REVIEW: "bg-blue-500/10 text-blue-500 border-blue-500/20",
            COMPLETED: "bg-green-500/10 text-green-500 border-green-500/20",
            CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
        };
        return (
            <span className={`px-2 py-1 rounded text-xs font-bold border ${colors[status] || "bg-gray-500/10 text-gray-500"}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="py-8 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold">Order Management</h1>
                <div className="flex gap-2 p-1 bg-white/5 rounded-lg border border-white/10">
                    {["PENDING", "PENDING_REVIEW", "COMPLETED", "CANCELLED", "ALL"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === s ? "bg-gold-500 text-black shadow-lg" : "text-gray-400 hover:text-white"
                                }`}
                        >
                            {s === "ALL" ? "All Orders" : s.replace("_", " ")}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin text-gold-500 w-10 h-10" /></div>
            ) : (
                <div className="bg-[#161616] border border-white/10 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="p-4 font-semibold text-gray-400">Order ID & Date</th>
                                <th className="p-4 font-semibold text-gray-400">Customer</th>
                                <th className="p-4 font-semibold text-gray-400">Items</th>
                                <th className="p-4 font-semibold text-gray-400">Amount</th>
                                <th className="p-4 font-semibold text-gray-400">Status</th>
                                <th className="p-4 font-semibold text-gray-400">Slip</th>
                                <th className="p-4 font-semibold text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-10 text-center text-gray-500">No orders found.</td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="p-4">
                                            <p className="font-mono text-xs text-gray-500">#{order.id.slice(-6)}</p>
                                            <p className="text-xs text-gray-500 mt-1">{format(new Date(order.createdAt), "dd MMM yyyy")}</p>
                                            <p className="text-xs text-gray-500">{format(new Date(order.createdAt), "HH:mm")}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-medium text-sm">{order.user.name}</p>
                                            <p className="text-xs text-gray-500">{order.user.email}</p>
                                        </td>
                                        <td className="p-4 text-sm max-w-[200px]">
                                            <div className="space-y-1">
                                                {order.items?.map((item, i) => (
                                                    <div key={i} className="flex justify-between text-xs text-gray-300">
                                                        <span className="truncate mr-2">- {item.course.title}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4 font-mono font-bold text-gold-400">฿{order.total.toLocaleString()}</td>
                                        <td className="p-4"><StatusBadge status={order.status} /></td>
                                        <td className="p-4">
                                            {order.slipUrl ? (
                                                <a href={order.slipUrl} target="_blank" rel="noreferrer" className="flex items-center text-blue-400 hover:text-blue-300 text-xs">
                                                    <FileText className="w-3 h-3 mr-1" /> View Slip
                                                </a>
                                            ) : (
                                                <span className="text-gray-600 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            {(order.status === "PENDING" || order.status === "PENDING_REVIEW") && (
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" onClick={() => updateStatus(order.id, "COMPLETED")} className="bg-green-600 hover:bg-green-500 h-8">
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="sm" variant="destructive" onClick={() => updateStatus(order.id, "CANCELLED")} className="h-8">
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
