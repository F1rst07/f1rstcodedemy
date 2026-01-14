
import "dotenv/config";
import { prisma } from "./src/lib/prisma";

async function main() {
    // Check both lowercase and exact case to be sure
    const targets = ["phiraphat061228@gmail.com", "Phiraphat061228@gmail.com"];
    let updated = false;

    console.log("Checking for users...");

    for (const email of targets) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
            console.log(`Found user: ${email}, Current Role: ${user.role}`);

            await prisma.user.update({
                where: { email },
                data: { role: "ADMIN" }
            });
            console.log(`✅ Successfully promoted ${email} to ADMIN`);
            updated = true;
            break;
        }
    }

    if (!updated) {
        console.log("⚠️ User not found. Please double check the email used for registration.");

        // List all users to help debugging
        const allUsers = await prisma.user.findMany({ select: { email: true, role: true } });
        console.log("Existing users in DB:", allUsers);
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
