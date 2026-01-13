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
        if (isLibSQL) {
            // Pass config object directly as required by this adapter version
            const adapter = new PrismaLibSql({
                url,
                authToken,
            });
            return new PrismaClient({
                adapter,
                log: ["query"],
            });
        } else {
            // Local SQLite Fallback
            // Use datasources to override the empty schema configuration
            return new PrismaClient({
                datasources: {
                    db: {
                        url,
                    },
                },
                log: ["query"],
            } as any);
        }
    })();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
