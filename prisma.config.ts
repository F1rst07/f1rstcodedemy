import "dotenv/config";
import { defineConfig } from "prisma/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

// Priority: TURSO_DATABASE_URL -> DATABASE_URL -> Local Dev DB
const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "file:./prisma/dev.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

let adapter;

if (url) {
  console.log("Initializing Adapter for URL:", url);
  // @ts-ignore
  adapter = new PrismaLibSql({ url, authToken });
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // @ts-ignore - adapter property is supported in Prisma 7 runtime config
  ...(adapter ? { adapter } : {}),
  datasource: {
    // Trick: Standard engine validation needs a valid 'file:' URL for sqlite provider
    // The adapter will override this for actual connection.
    url: "file:./prisma/dev.db",
  },
});
