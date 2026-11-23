import "server-only";
import { Pool } from "pg";

const databaseGlobal = globalThis as typeof globalThis & { wixPool?: Pool };

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDatabase() {
  if (!process.env.DATABASE_URL) throw new Error("Database connection is not configured");

  if (!databaseGlobal.wixPool) {
    databaseGlobal.wixPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 2,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 10000,
      statement_timeout: 10000,
      allowExitOnIdle: true,
    });
    databaseGlobal.wixPool.on("error", () => {
      console.error("An idle catalog database connection failed");
    });
  }

  return databaseGlobal.wixPool;
}
