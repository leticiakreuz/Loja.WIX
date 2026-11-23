import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { readCatalog, seedDemoCatalog } from "../db/catalog.mjs";

test("PostgreSQL catalog preserves prices, inventory and product identity", async context => {
  const database = new PGlite();
  context.after(() => database.close());
  const migration = await readFile(new URL("../db/migrations/001_catalog.sql", import.meta.url), "utf8");
  const demo = JSON.parse(await readFile(new URL("../data/demo-catalog.json", import.meta.url), "utf8"));
  await database.exec(migration);

  await context.test("an empty database returns an empty catalog", async () => {
    const catalog = await readCatalog(database);
    assert.equal(catalog.source, "database");
    assert.deepEqual(catalog.products, []);
  });

  await seedDemoCatalog(database, demo);
  const firstCatalog = await readCatalog(database);
  const firstProduct = firstCatalog.products[0];

  await context.test("price conversion and demo flags remain correct", () => {
    assert.equal(firstCatalog.categories.length, 6);
    assert.equal(firstCatalog.products.length, 6);
    assert.equal(firstProduct.price, 129.9);
    assert.equal(firstCatalog.products[2].old, 119.9);
    assert.ok(firstCatalog.products.every(product => product.isDemo));
  });

  await context.test("repeating demo setup preserves stock, prices and IDs", async () => {
    await database.query("UPDATE wix.products SET stock = 3, price_cents = 12000 WHERE id = $1", [firstProduct.id]);
    await seedDemoCatalog(database, demo);
    const repeated = await readCatalog(database);
    assert.equal(repeated.products.length, 6);
    assert.equal(repeated.products[0].id, firstProduct.id);
    assert.equal(repeated.products[0].stock, 3);
    assert.equal(repeated.products[0].price, 120);
  });

  await context.test("database constraints reject invalid commercial data", async () => {
    await assert.rejects(database.query("UPDATE wix.products SET stock = -1 WHERE id = $1", [firstProduct.id]));
    await assert.rejects(database.query("UPDATE wix.products SET price_cents = 0 WHERE id = $1", [firstProduct.id]));
    await assert.rejects(database.query("UPDATE wix.products SET compare_at_price_cents = 1 WHERE id = $1", [firstProduct.id]));
    await assert.rejects(database.query("UPDATE wix.products SET category_slug = 'missing' WHERE id = $1", [firstProduct.id]));
  });

  await context.test("inactive products and categories stay out of the storefront", async () => {
    await database.query("UPDATE wix.products SET active = false WHERE id = $1", [firstProduct.id]);
    await database.query("UPDATE wix.categories SET active = false WHERE slug = 'perfumes'");
    const catalog = await readCatalog(database);
    assert.equal(catalog.products.length, 4);
    assert.ok(catalog.categories.every(category => category.slug !== "perfumes"));
    assert.ok(catalog.products.every(product => product.id !== firstProduct.id && product.category !== "Perfumes"));
  });
});
