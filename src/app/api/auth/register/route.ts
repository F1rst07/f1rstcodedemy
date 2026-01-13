import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { WelcomeEmail } from "@/components/emails/welcome-email";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        if (password.length <= 6) {
            return NextResponse.json(
                { message: "Password must be more than 6 characters" },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingEmail = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existingEmail) {
            return NextResponse.json(
                { message: "Email already exists" },
                { status: 409 }
            );
        }

        // Check if name already exists
        const existingName = await prisma.user.findFirst({
            where: {
                name,
            },
        });

        if (existingName) {
            return NextResponse.json(
                { message: "Name already taken" },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        // Send Welcome Email

        try {
            const resend = new Resend(process.env.RESEND_API_KEY);
            console.log("Attempting to send email to:", email);
            const { data, error } = await resend.emails.send({
                from: "F1RSTCODE DEMY <onboarding@resend.dev>",
                to: email,
                subject: "ยินดีต้อนรับเข้าสู่ F1RSTCODE DEMY",
                react: WelcomeEmail({ name: name, email: email }),
            });

            if (error) {
                console.error("Resend returned error:", error);
            } else {
                console.log("Resend success data:", data);
            }
        } catch (emailError) {
            console.error("Failed to send welcome email (exception):", emailError);
        }

        return NextResponse.json(
            { message: "User created successfully", user: { id: user.id, name: user.name, email: user.email } },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
