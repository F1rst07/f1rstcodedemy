import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL || "file:./prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
    // Check both lowercase and exact case to be sure
    const targets = ["phiraphat061228@gmail.com", "Phiraphat061228@gmail.com"];
    let updated = false;

    for (const email of targets) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
            console.log(`Found user: ${email}, Current Role: ${user.role}`);

            await prisma.user.update({
                where: { email },
                data: {
                    role: "ADMIN",
                    plan: "PRO"
                }
            });
            console.log(`✅ Successfully promoted ${email} to ADMIN and upgraded to PRO plan`);
            updated = true;
            break;
        }
    }

    if (!updated) {
        console.log("⚠️ User not found. Please double check the email used for registration.");
    }
}

main();
