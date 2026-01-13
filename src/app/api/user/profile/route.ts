import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

export async function PATCH(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, currentPassword, newPassword, image } = body;

        console.log(`[PROFILE_UPDATE] User: ${session.user.email}`);
        console.log(`[PROFILE_UPDATE] Has Image update? ${!!image}`);
        if (image) {
            console.log(`[PROFILE_UPDATE] Image payload length: ${image.length} chars`);
            // Approximate size in bytes
            const sizeInBytes = Math.ceil((image.length * 3) / 4);
            console.log(`[PROFILE_UPDATE] Image approx size: ${(sizeInBytes / 1024 / 1024).toFixed(2)} MB`);
        }

        // Prepare update data
        const updateData: any = { name };

        // Handle Image Upload (Store as Base64 for Vercel persistence)
        if (image === null || image) {
            // If image is null, it means we want to remove it
            // Otherwise, store the base64 string directly in the database
            updateData.image = image;
        }

        // Handle Password Change
        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json(
                    { message: "กรุณาระบุรหัสผ่านปัจจุบัน" },
                    { status: 400 }
                );
            }

            const user = await prisma.user.findUnique({
                where: { email: session.user.email },
            });

            if (!user || user.password === null) {
                // Should handle users who signed up with OAuth separately if they don't have a password
                return NextResponse.json(
                    { message: "User not found or using OAuth provider" },
                    { status: 400 }
                );
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

            if (!isPasswordValid) {
                return NextResponse.json(
                    { message: "รหัสผ่านปัจจุบันไม่ถูกต้อง" },
                    { status: 400 }
                );
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updateData.password = hashedPassword;
        }

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: updateData,
        });

        return NextResponse.json({
            message: "Profile updated successfully",
            user: {
                name: updatedUser.name,
                email: updatedUser.email,
                image: updatedUser.image,
                role: updatedUser.role,
                plan: updatedUser.plan
            }
        });

    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
