import { Button } from "@/components/ui/button";
import { ShoppingBag, Eye, CreditCard, Clock, CheckCircle } from "lucide-react";

export function OrderHistory() {
    const orders = [
        {
            id: "#108084",
            date: "มกราคม 11, 2026",
            status: "pending_payment", // Waiting for payment
            statusLabel: "รอแจ้งชำระเงิน",
            items: 1,
            total: "฿3,590.00",
            actions: ["details", "payment"]
        },
        {
            id: "#107844",
            date: "ธันวาคม 13, 2025",
            status: "completed", // Shipped/Completed
            statusLabel: "จัดส่งแล้ว",
            items: 1,
            total: "฿799.00",
            actions: ["details"]
        }
    ];

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
                return <Clock className="w-4 h-4" />;
            case "completed":
                return <CheckCircle className="w-4 h-4" />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-[#161616] border border-white/10 rounded-2xl p-6 sm:p-8 mt-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gold-500/10 rounded-lg">
                    <ShoppingBag className="w-6 h-6 text-gold-500api" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">ประวัติการสั่งซื้อ</h2>
                    <p className="text-sm text-gray-400">รายการคำสั่งซื้อทั้งหมดของคุณ</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10 text-left">
                            <th className="py-4 px-4 text-gray-300 font-medium">คำสั่งซื้อ</th>
                            <th className="py-4 px-4 text-gray-300 font-medium">วันที่</th>
                            <th className="py-4 px-4 text-gray-300 font-medium">สถานะ</th>
                            <th className="py-4 px-4 text-gray-300 font-medium">รวม</th>
                            <th className="py-4 px-4 text-gray-300 font-medium text-right">เลือกคำสั่ง</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                <td className="py-4 px-4 text-gold-500 font-bold">{order.id}</td>
                                <td className="py-4 px-4 text-white">{order.date}</td>
                                <td className="py-4 px-4">
                                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        {order.statusLabel}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-white">
                                    {order.items} รายการ - <span className="font-bold">{order.total}</span>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="outline" size="sm" className="h-8 border-white/10 hover:bg-white/10 text-gray-300 hover:text-white">
                                            <Eye className="w-3 h-3 mr-2" />
                                            ดูรายละเอียด
                                        </Button>
                                        {order.actions.includes("payment") && (
                                            <Button size="sm" className="h-8 bg-gold-500 hover:bg-gold-400 text-black font-bold">
                                                <CreditCard className="w-3 h-3 mr-2" />
                                                แจ้งชำระเงิน
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
