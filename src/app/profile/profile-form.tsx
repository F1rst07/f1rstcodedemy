"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/lib/language-context";
import { Loader2, Save, User, Mail, Lock, CheckCircle, AlertCircle, Crown, Shield, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";

interface ProfileFormProps {
    user: {
        name: string;
        email: string;
        image: string;
        role: string;
        plan: string;
    };
}

export function ProfileForm({ user }: ProfileFormProps) {
    const { t } = useLanguage();
    const router = useRouter();
    const { data: session, update } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: user.name,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [preview, setPreview] = useState(user.image || null);

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isImageRemoved, setIsImageRemoved] = useState(false);

    useEffect(() => {
        // user.image might change from prop update
        if (!imageFile && !isImageRemoved) { // Only sync if user hasn't selected a new file locally and hasn't explicitly removed it
            setPreview(user.image || null);
        }
    }, [user.image, imageFile, isImageRemoved]); // Added isImageRemoved to dependencies

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            name: user.name,
        }));
    }, [user.name]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        setError(null);
        setIsSuccess(false);
    };

    // Function to resize image using Canvas
    const resizeImage = (file: File, maxSize: number = 400): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                let { width, height } = img;

                // Calculate new dimensions while maintaining aspect ratio
                if (width > height) {
                    if (width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx?.drawImage(img, 0, 0, width, height);

                // Convert to JPEG with 70% quality for smaller file size
                const resizedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                console.log(`[Image Resize] Original: ${file.size} bytes, Resized: ${resizedBase64.length} chars`);
                resolve(resizedBase64);
            };

            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Accept larger files now since we'll resize them
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                setError("ขนาดไฟล์ต้องไม่เกิน 10MB");
                setImageFile(null);
                setPreview(user.image || null);
                return;
            }
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
            setIsImageRemoved(false); // Reset removal state if new image is selected
            setError(null);
            setIsSuccess(false);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setPreview(null);
        setIsImageRemoved(true);
        setError(null);
        setIsSuccess(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // DEBUG: Confirm this code is running
        console.log("[Profile v2] Form submitted!");

        setIsLoading(true);
        setError(null);
        setIsSuccess(false);

        try {
            // Validation if password change is attempted
            if (formData.newPassword || formData.currentPassword) {
                if (!formData.currentPassword) {
                    throw new Error("กรุณาระบรหัสผ่านปัจจุบันเพื่อเปลี่ยนรหัสผ่าน");
                }
                if (!formData.newPassword) {
                    throw new Error("กรุณาระบุรหัสผ่านใหม่");
                }
                if (formData.newPassword.length < 6) {
                    throw new Error("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
                }
                if (formData.newPassword !== formData.confirmPassword) {
                    throw new Error("รหัสผ่านใหม่ไม่ตรงกัน");
                }
            }

            let imageBase64 = undefined; // undefined means no change
            if (imageFile) {
                // Resize image before sending to reduce payload size
                console.log("[Profile] Resizing image...");
                imageBase64 = await resizeImage(imageFile, 400);
                console.log("[Profile] Resized image length:", imageBase64?.length, "chars");
            } else if (isImageRemoved) {
                imageBase64 = null; // explicit null means removal
            }

            console.log("[Profile] Sending request to API...");
            console.log("[Profile] Has image:", !!imageBase64);

            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                    image: imageBase64 !== undefined ? imageBase64 : undefined
                }),
            });

            console.log("[Profile] Response status:", res.status);
            const data = await res.json();
            console.log("[Profile] Response data:", data);

            if (!res.ok) {
                throw new Error(data.message || "Failed to update profile");
            }

            // Update client-side session with new data
            await update({
                ...session,
                user: {
                    ...session?.user,
                    name: data.user.name,
                    image: data.user.image,
                }
            });

            setIsSuccess(true);
            setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
            setImageFile(null); // Clear file selection
            setIsImageRemoved(false); // Reset removal state after successful save
            router.refresh(); // Refresh Server Components

            // Optionally reload to be 100% sure session is fresh
            setTimeout(() => {
                setIsSuccess(false);
            }, 5000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Public Profile Section */}
            <div className="bg-[#161616] border border-white/10 rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-lg ${user.plan?.toLowerCase() === 'pro' ? 'bg-gold-500/10' :
                        user.plan?.toLowerCase() === 'plus' ? 'bg-purple-500/10' :
                            'bg-white/5'
                        }`}>
                        <User className={`w-6 h-6 ${user.plan?.toLowerCase() === 'pro' ? 'text-gold-500' :
                            user.plan?.toLowerCase() === 'plus' ? 'text-purple-400' :
                                'text-gray-400'
                            }`} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{t("profile.publicInfo")}</h2>
                        <p className="text-sm text-gray-400">{t("profile.publicInfoDesc")}</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-8">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative group w-32 h-32 rounded-full overflow-hidden border-2 border-white/10 bg-white/5">
                            {preview ? (
                                <Image
                                    src={preview}
                                    alt="Profile"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                    <User className="w-12 h-12" />
                                </div>
                            )}
                            <label
                                htmlFor="image-upload"
                                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <span className="text-white text-xs font-medium">เปลี่ยนรูป</span>
                            </label>
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </div>
                        {preview && (
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="text-xs text-red-500 hover:text-red-400 font-medium transition-colors"
                            >
                                ลบรูปโปรไฟล์
                            </button>
                        )}
                        <p className="text-xs text-gray-500 whitespace-pre-line text-center">
                            {t("profile.imageHint")}
                        </p>
                    </div>

                    <div className="grid gap-6 max-w-xl flex-1">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-300">{t("profile.email")}</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                                <Input
                                    id="email"
                                    value={user.email}
                                    disabled
                                    className="pl-10 bg-white/5 border-white/10 text-gray-400 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-300">{t("profile.displayName")}</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your name"
                                    className="pl-10 bg-white/5 border-white/10 text-white focus:border-gold-500 focus-visible:ring-0"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-gray-300">{t("profile.membershipStatus")}</Label>
                                <div className={`flex items-center gap-2 p-2.5 rounded-md border
                                ${user.plan?.toLowerCase() === 'pro' ? 'bg-gold-500/10 border-gold-500/30 text-gold-500' :
                                        user.plan?.toLowerCase() === 'plus' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' :
                                            'bg-white/5 border-white/10 text-gray-400'}`}>
                                    <Crown className="w-4 h-4" />
                                    <span className="font-medium">{user.plan || "Free"}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-300">{t("profile.role")}</Label>
                                <div className={`flex items-center gap-2 p-2.5 rounded-md border
                                ${user.role?.toLowerCase() === 'admin' ? 'bg-red-500/10 border-red-500/30 text-red-500' :
                                        user.role?.toLowerCase() === 'instructor' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' :
                                            'bg-white/5 border-white/10 text-gray-400'}`}>
                                    <Shield className="w-4 h-4" />
                                    <span className="font-medium capitalize">{user.role?.toLowerCase() || "student"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Password Section */}
            <div className="bg-[#161616] border border-white/10 rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gold-500/10 rounded-lg">
                        <Lock className="w-6 h-6 text-gold-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{t("profile.changePassword")}</h2>
                        <p className="text-sm text-gray-400">{t("profile.changePasswordDesc")}</p>
                    </div>
                </div>

                <div className="grid gap-6 max-w-xl">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-gray-300">{t("profile.currentPassword")}</Label>
                        <div className="relative">
                            <Input
                                id="currentPassword"
                                type={showCurrentPassword ? "text" : "password"}
                                value={formData.currentPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="bg-white/5 border-white/10 text-white focus:border-gold-500 focus-visible:ring-0 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                            >
                                {showCurrentPassword ? (
                                    <Eye className="w-5 h-5" />
                                ) : (
                                    <EyeOff className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword" className="text-gray-300">{t("profile.newPassword")}</Label>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    type={showNewPassword ? "text" : "password"}
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="bg-white/5 border-white/10 text-white focus:border-gold-500 focus-visible:ring-0 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                >
                                    {showNewPassword ? (
                                        <Eye className="w-5 h-5" />
                                    ) : (
                                        <EyeOff className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-gray-300">{t("profile.confirmPassword")}</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="bg-white/5 border-white/10 text-white focus:border-gold-500 focus-visible:ring-0 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                >
                                    {showConfirmPassword ? (
                                        <Eye className="w-5 h-5" />
                                    ) : (
                                        <EyeOff className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4">
                {error && (
                    <div className="text-red-500 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}
                {isSuccess && (
                    <div className="text-green-500 text-sm flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        {t("profile.saveSuccess")}
                    </div>
                )}
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gold-500 hover:bg-gold-400 text-black font-bold h-11 px-8 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("profile.saving")}
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            {t("profile.saveChanges")}
                        </>
                    )}
                </Button>
            </div>
        </form >
    );
}
