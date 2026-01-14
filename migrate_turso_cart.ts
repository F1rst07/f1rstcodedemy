
import { createClient } from '@libsql/client';

const client = createClient({
    url: process.env.TURSO_DATABASE_URL || "libsql://f1rstcodedemy-f1rst07.aws-ap-northeast-1.turso.io",
    authToken: process.env.TURSO_AUTH_TOKEN || ""
});

async function migrate() {
    console.log("🚀 Running Turso Cart Schema Migration...");

    try {
        // Create OrderItem table
        await client.execute(`
            CREATE TABLE IF NOT EXISTS "OrderItem" (
                "id" TEXT PRIMARY KEY NOT NULL,
                "orderId" TEXT NOT NULL,
                "courseId" TEXT NOT NULL,
                "price" REAL NOT NULL,
                "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" DATETIME NOT NULL,
                FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE
            )
        `);
        console.log("✅ OrderItem table created/exists");

        // Indexes for OrderItem
        await client.execute(`CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId")`);
        await client.execute(`CREATE INDEX IF NOT EXISTS "OrderItem_courseId_idx" ON "OrderItem"("courseId")`);
        console.log("✅ OrderItem indexes created");

        // We can't drop columns easily in SQLite/Turso without full table recreate, 
        // so we will just make courseId optional in schema logic (it's already nullable in PRISMA if we defined it as such,
        // but physically in DB we can keep it as is, just won't enforce NOT NULL if it wasn't).
        // Actually Order.courseId in previous creation was NOT NULL implicitly? 
        // Let's check previous migrate script 'migrate_turso.ts'.
        // It had "courseId" TEXT NOT NULL check. 

        // Since sqlite ALTER TABLE DROP COLUMN is supported in newer versions (LibSQL supports it usually),
        // let's try to remove NOT NULL constraint or drop it.
        // But safer is just to allow it to be there for legacy orders.
        // However, for NEW orders, we want to insert NULL or something.
        // Making it nullable: ALTER TABLE Order ALTER COLUMN courseId DROP NOT NULL doesn't exist in standard SQLite.

        // We will just leave it be for now and maybe insert a dummy or empty string if needed, 
        // OR better, we just ignore it if we can. 
        // BUT, if the column is NOT NULL, we MUST provide a value.
        // Let's try to drop the column and re-add it as nullable, OR just drop it if we are confident.
        // Actually, let's try to ALTER TABLE to remove NOT NULL (not straightforward).

        // Strategy: We will assume we can write "empty" string or just use one of the course Ids as the "main" one for legacy compat if needed.
        // BUT, to be clean, let's try to Drop foreign key constraint first? 
        // Complex. 

        // Let's try to keep it simple: We will NOT use courseId column for new orders logic, 
        // but if the DB requires it, we will put the FIRST courseId there.
        // OR we can try to re-create the table. Re-creating Order table is dangerous for existing data.

        // Let's rely on the fact that we can just put the first course ID in `courseId` column for backward compatibility 
        // and also fill OrderItems. 

        console.log("\n🎉 Cart Schema Update complete!");
    } catch (error) {
        console.error("❌ Migration failed:", error);
    } finally {
        client.close();
    }
}

migrate();
