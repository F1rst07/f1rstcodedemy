import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "file:./prisma/dev.db";
const authToken = process.env.TURSO_AUTH_TOKEN;
const isLibSQL = url.startsWith("libsql:") || url.startsWith("https:") || url.startsWith("http:");

let prisma: PrismaClient;

if (isLibSQL) {
    const adapter = new PrismaLibSql({ url, authToken });
    prisma = new PrismaClient({ adapter });
} else {
    prisma = new PrismaClient({
        datasources: {
            db: { url }
        }
    } as any);
}

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
                data: { role: "ADMIN" }
            });
            console.log(`✅ Successfully promoted ${email} to ADMIN`);
            updated = true;
            // Stop after finding one match, assuming unique email constraint handles overlap logic closely enough or user only registered once
            break;
        }
    }

    if (!updated) {
        console.log("⚠️ User not found. Please double check the email used for registration.");
    }
}

main();
