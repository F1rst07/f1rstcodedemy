import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { ResetPasswordEmail } from "@/components/emails/reset-password-email";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { message: "กรุณาระบุอีเมล" },
                { status: 400 }
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            // For security, don't reveal that the user doesn't exist, just say success or generic error?
            // User requested "send password to email", implies feedback.
            // Let's return 404 but with a nice message for the frontend to handle or just fake success.
            // Actually, for better UX in this specific demo context:
            return NextResponse.json(
                { message: "ไม่พบผู้ใช้งานในระบบ" },
                { status: 404 }
            );
        }

        // Generate new random password (8 chars, alphanumeric)
        const newPassword = Math.random().toString(36).slice(-8);

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        });

        // Send Email
        try {
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
                from: "F1RSTCODE DEMY <onboarding@resend.dev>",
                to: email,
                subject: "รีเซ็ตรหัสผ่าน F1RSTCODE DEMY",
                react: ResetPasswordEmail({ name: user.name || "User", newPassword }),
            });
            console.log("Reset password email sent to:", email);
        } catch (emailError) {
            console.error("Failed to send reset email:", emailError);
            return NextResponse.json(
                { message: "เกิดข้อผิดพลาดในการส่งอีเมล" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: "ส่งรหัสผ่านใหม่ไปที่อีเมลเรียบร้อยแล้ว" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
