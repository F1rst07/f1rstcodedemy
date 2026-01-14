import { createClient } from '@libsql/client';

const client = createClient({
    url: process.env.TURSO_DATABASE_URL || "libsql://f1rstcodedemy-f1rst07.aws-ap-northeast-1.turso.io",
    authToken: process.env.TURSO_AUTH_TOKEN || ""
});

async function migrate() {
    console.log("🚀 Running Turso Migration...");

    try {
        // Create Purchase table
        await client.execute(`
            CREATE TABLE IF NOT EXISTS "Purchase" (
                "id" TEXT PRIMARY KEY NOT NULL,
                "userId" TEXT NOT NULL,
                "courseId" TEXT NOT NULL,
                "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" DATETIME NOT NULL,
                FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE
            )
        `);
        console.log("✅ Purchase table created/exists");

        // Create Coupon table
        await client.execute(`
            CREATE TABLE IF NOT EXISTS "Coupon" (
                "id" TEXT PRIMARY KEY NOT NULL,
                "code" TEXT NOT NULL UNIQUE,
                "discountAmount" REAL,
                "discountPercent" REAL,
                "maxUses" INTEGER,
                "currentUses" INTEGER NOT NULL DEFAULT 0,
                "isActive" INTEGER NOT NULL DEFAULT 1,
                "expiresAt" DATETIME,
                "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" DATETIME NOT NULL
            )
        `);
        console.log("✅ Coupon table created/exists");

        // Create Order table
        await client.execute(`
            CREATE TABLE IF NOT EXISTS "Order" (
                "id" TEXT PRIMARY KEY NOT NULL,
                "userId" TEXT NOT NULL,
                "courseId" TEXT NOT NULL,
                "total" REAL NOT NULL,
                "status" TEXT NOT NULL DEFAULT 'PENDING',
                "slipUrl" TEXT,
                "couponId" TEXT,
                "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" DATETIME NOT NULL,
                FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE,
                FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE
            )
        `);
        console.log("✅ Order table created/exists");

        // Create Article table
        await client.execute(`
            CREATE TABLE IF NOT EXISTS "Article" (
                "id" TEXT PRIMARY KEY NOT NULL,
                "title" TEXT NOT NULL,
                "content" TEXT NOT NULL,
                "imageUrl" TEXT,
                "isPublished" BOOLEAN NOT NULL DEFAULT 0,
                "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" DATETIME NOT NULL
            )
        `);
        console.log("✅ Article table created/exists");

        // Create indexes
        await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS "Purchase_userId_courseId_key" ON "Purchase"("userId", "courseId")`);
        await client.execute(`CREATE INDEX IF NOT EXISTS "Purchase_courseId_idx" ON "Purchase"("courseId")`);
        await client.execute(`CREATE INDEX IF NOT EXISTS "Order_userId_idx" ON "Order"("userId")`);
        await client.execute(`CREATE INDEX IF NOT EXISTS "Order_courseId_idx" ON "Order"("courseId")`);
        console.log("✅ Indexes created/exist");

        // List all tables
        const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
        console.log("\n📋 All tables in Turso:");
        tables.rows.forEach((row: any) => console.log(`   - ${row.name}`));

        console.log("\n🎉 Migration complete!");
    } catch (error) {
        console.error("❌ Migration failed:", error);
    } finally {
        client.close();
    }
}

migrate();
