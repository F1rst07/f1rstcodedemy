import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Priority: TURSO_DATABASE_URL -> DATABASE_URL -> Local Dev DB
const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "file:./prisma/dev.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

// Detect LibSQL/Turso based on protocol
const isLibSQL = url.startsWith("libsql:") || url.startsWith("https:") || url.startsWith("http:");

export const prisma =
    globalForPrisma.prisma ||
    (() => {
        // Always use the adapter, as the generated client expects it.
        // The adapter supports 'file:' protocol for local SQLite.
        const adapter = new PrismaLibSql({
            url: url,
            authToken: authToken || "", // Handle missing auth token gracefully if url is local
        });

        return new PrismaClient({
            adapter,
            log: ["query"],
        });
    })();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
