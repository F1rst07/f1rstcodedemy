import "dotenv/config";
import dotenv from "dotenv";

// Explicitly load .env.local for Turso credentials
dotenv.config({ path: ".env.local" });

import { createClient } from "@libsql/client";

const localUrl = process.env.DATABASE_URL?.replace("file:", "") || "prisma/dev.db";

// Force Turso connection for the destination
const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || !tursoToken) {
    console.error("❌ TURSO_DATABASE_URL or TURSO_AUTH_TOKEN is missing in .env");
    process.exit(1);
}

const localClient = createClient({
    url: "file:" + localUrl,
});

const tursoClient = createClient({
    url: tursoUrl,
    authToken: tursoToken,
});

async function main() {
    console.log("🚀 Starting Safe Sync (Local -> Turso)...");
    console.log(`📂 Source: ${localUrl}`);
    console.log(`☁️  Target: ${tursoUrl}`);

    try {
        // 1. Get all users from Local
        const users = await localClient.execute("SELECT * FROM User");
        console.log(`📦 Found ${users.rows.length} users in local DB.`);

        let successCount = 0;
        let errorCount = 0;

        for (const u of users.rows) {
            try {
                // 2. Use INSERT OR REPLACE to update existing records or insert new ones
                // This ensures we verify data integrity without deleting old data unless it's overwritten by the same ID
                await tursoClient.execute({
                    sql: `INSERT OR REPLACE INTO User (id, name, email, password, image, role, plan, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    args: [u.id, u.name, u.email, u.password, u.image, u.role, u.plan, u.createdAt, u.updatedAt]
                });
                successCount++;
                process.stdout.write("."); // Progress indicator
            } catch (err) {
                console.error(`\n❌ Failed to sync user ${u.email}:`, err);
                errorCount++;
            }
        }

        console.log("\n\n✅ Sync Complete!");
        console.log(`✨ Successfully synced: ${successCount}`);
        if (errorCount > 0) console.log(`⚠️ Errors: ${errorCount}`);

    } catch (error) {
        console.error("❌ Fatal Error:", error);
    }
}

main();
