
import { createClient } from '@libsql/client';

const client = createClient({
    url: process.env.TURSO_DATABASE_URL || "libsql://f1rstcodedemy-f1rst07.aws-ap-northeast-1.turso.io",
    authToken: process.env.TURSO_AUTH_TOKEN || ""
});

async function migrate() {
    console.log("🚀 Running Turso Course Schema Migration...");

    try {
        // Update Course table
        try {
            await client.execute(`ALTER TABLE "Course" ADD COLUMN "description" TEXT`);
            console.log("✅ Added description column to Course");
        } catch (e: any) {
            if (!e.message.includes("duplicate column name")) console.log("ℹ️ description column already exists or error: " + e.message);
        }

        try {
            await client.execute(`ALTER TABLE "Course" ADD COLUMN "imageUrl" TEXT`);
            console.log("✅ Added imageUrl column to Course");
        } catch (e: any) {
            if (!e.message.includes("duplicate column name")) console.log("ℹ️ imageUrl column already exists or error: " + e.message);
        }

        try {
            await client.execute(`ALTER TABLE "Course" ADD COLUMN "price" REAL`);
            console.log("✅ Added price column to Course");
        } catch (e: any) {
            if (!e.message.includes("duplicate column name")) console.log("ℹ️ price column already exists or error: " + e.message);
        }

        try {
            await client.execute(`ALTER TABLE "Course" ADD COLUMN "isPublished" BOOLEAN DEFAULT 0`);
            console.log("✅ Added isPublished column to Course");
        } catch (e: any) {
            if (!e.message.includes("duplicate column name")) console.log("ℹ️ isPublished column already exists or error: " + e.message);
        }

        // Update Chapter table
        try {
            await client.execute(`ALTER TABLE "Chapter" ADD COLUMN "description" TEXT`);
            console.log("✅ Added description column to Chapter");
        } catch (e: any) {
            if (!e.message.includes("duplicate column name")) console.log("ℹ️ description column already exists or error: " + e.message);
        }

        try {
            await client.execute(`ALTER TABLE "Chapter" ADD COLUMN "isPublished" BOOLEAN DEFAULT 0`);
            console.log("✅ Added isPublished column to Chapter");
        } catch (e: any) {
            if (!e.message.includes("duplicate column name")) console.log("ℹ️ isPublished column already exists or error: " + e.message);
        }

        try {
            await client.execute(`ALTER TABLE "Chapter" ADD COLUMN "isFree" BOOLEAN DEFAULT 0`);
            console.log("✅ Added isFree column to Chapter");
        } catch (e: any) {
            if (!e.message.includes("duplicate column name")) console.log("ℹ️ isFree column already exists or error: " + e.message);
        }

        // Update Lesson table
        try {
            await client.execute(`ALTER TABLE "Lesson" ADD COLUMN "description" TEXT`);
            console.log("✅ Added description column to Lesson");
        } catch (e: any) {
            if (!e.message.includes("duplicate column name")) console.log("ℹ️ description column already exists or error: " + e.message);
        }

        try {
            await client.execute(`ALTER TABLE "Lesson" ADD COLUMN "isPublished" BOOLEAN DEFAULT 0`);
            console.log("✅ Added isPublished column to Lesson");
        } catch (e: any) {
            if (!e.message.includes("duplicate column name")) console.log("ℹ️ isPublished column already exists or error: " + e.message);
        }

        try {
            await client.execute(`ALTER TABLE "Lesson" ADD COLUMN "isFree" BOOLEAN DEFAULT 0`);
            console.log("✅ Added isFree column to Lesson");
        } catch (e: any) {
            if (!e.message.includes("duplicate column name")) console.log("ℹ️ isFree column already exists or error: " + e.message);
        }

        try {
            await client.execute(`ALTER TABLE "Lesson" ADD COLUMN "duration" TEXT`);
            console.log("✅ Added duration column to Lesson");
        } catch (e: any) {
            if (!e.message.includes("duplicate column name")) console.log("ℹ️ duration column already exists or error: " + e.message);
        }

        try {
            await client.execute(`ALTER TABLE "Lesson" ADD COLUMN "type" TEXT DEFAULT 'video'`);
            console.log("✅ Added type column to Lesson");
        } catch (e: any) {
            if (!e.message.includes("duplicate column name")) console.log("ℹ️ type column already exists or error: " + e.message);
        }


        console.log("\n🎉 Course Schema Update complete!");
    } catch (error) {
        console.error("❌ Migration failed:", error);
    } finally {
        client.close();
    }
}

migrate();
