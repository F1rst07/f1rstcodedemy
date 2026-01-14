"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Shield, User, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

interface UserData {
    id: string;
    name: string | null;
    email: string | null;
    role: "ADMIN" | "STUDENT";
    createdAt: string;
    _count: { orders: number; purchases: number };
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users");
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const changeRole = async (userId: string, newRole: string) => {
        const res = await fetch(`/api/admin/users/${userId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: newRole })
        });
        if (res.ok) fetchUsers();
    };

    const deleteUser = async (userId: string) => {
        if (!confirm("Are you sure? This action cannot be undone.")) return;
        const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
        if (res.ok) fetchUsers();
    };

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-gold-500 w-10 h-10" /></div>;

    return (
        <div className="py-8 text-white">
            <h1 className="text-3xl font-bold mb-8">User Management</h1>

            <div className="bg-[#161616] border border-white/10 rounded-xl overflow-hidden shadow-xl">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            <th className="p-4 font-semibold text-gray-400">User</th>
                            <th className="p-4 font-semibold text-gray-400">Role</th>
                            <th className="p-4 font-semibold text-gray-400">Join Date</th>
                            <th className="p-4 font-semibold text-gray-400">Stats</th>
                            <th className="p-4 font-semibold text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center font-bold text-gray-300">
                                            {user.name?.[0] || "U"}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{user.name || "No Name"}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold border ${user.role === "ADMIN" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-gray-400">
                                    {format(new Date(user.createdAt), "dd MMM yyyy")}
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2 text-xs">
                                        <span className="bg-white/5 px-2 py-1 rounded">{user._count.purchases} Courses</span>
                                        <span className="bg-white/5 px-2 py-1 rounded">{user._count.orders} Orders</span>
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-white/10 text-white">
                                            <DropdownMenuItem onClick={() => changeRole(user.id, user.role === "ADMIN" ? "STUDENT" : "ADMIN")}>
                                                <Shield className="mr-2 h-4 w-4" />
                                                {user.role === "ADMIN" ? "Demote to Student" : "Promote to Admin"}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => deleteUser(user.id)} className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete User
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
