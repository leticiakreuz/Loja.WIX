import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { Client } from "pg";
import { seedDemoCatalog } from "../db/catalog.mjs";

const command = process.argv[2];
if (!["migrate", "seed-demo"].includes(command)) {
  throw new Error("Use database.mjs migrate or database.mjs seed-demo");
}

const connectionString = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error("Configure DATABASE_MIGRATION_URL or DATABASE_URL locally");

const client = new Client({ connectionString, connectionTimeoutMillis: 15000, statement_timeout: 30000 });
try {
  await client.connect();
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(78231024)");

  if (command === "migrate") {
    await client.query(`
      CREATE SCHEMA IF NOT EXISTS wix;
      CREATE TABLE IF NOT EXISTS wix.schema_migrations (
        version text PRIMARY KEY,
        checksum text NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    const directory = new URL("../db/migrations/", import.meta.url);
    const files = (await readdir(directory)).filter(name => name.endsWith(".sql")).sort();
    for (const version of files) {
      const sql = (await readFile(new URL(version, directory), "utf8")).replace(/\r\n/g, "\n");
      const checksum = createHash("sha256").update(sql).digest("hex");
      const applied = await client.query("SELECT checksum FROM wix.schema_migrations WHERE version = $1", [version]);
      if (applied.rows.length) {
        if (applied.rows[0].checksum !== checksum) throw new Error("A previously applied migration was modified");
        continue;
      }
      await client.query(sql);
      await client.query("INSERT INTO wix.schema_migrations(version, checksum) VALUES ($1, $2)", [version, checksum]);
      console.log(`Applied ${version}`);
    }
  } else {
    const demo = JSON.parse(await readFile(new URL("../data/demo-catalog.json", import.meta.url), "utf8"));
    await seedDemoCatalog(client, demo);
    console.log("Demonstration catalog inserted. Existing products were preserved.");
  }

  await client.query("COMMIT");
  console.log("Database operation completed.");
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  console.error(`Database operation failed (${error.code ?? "configuration or connection error"}).`);
  process.exitCode = 1;
} finally {
  await client.end();
}
