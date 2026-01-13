import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./profile-form";
import { ProfileHeader } from "./profile-header";

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/");
    }

    const user = await prisma.user.findUnique({
        where: {
            email: session.user.email,
        },
    });

    if (!user) {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <ProfileHeader />

                <ProfileForm user={{
                    name: user.name || "",
                    email: user.email || "",
                    image: user.image || "",
                    role: user.role,
                    plan: user.plan
                }} />
            </div>
        </div>
    );
}

