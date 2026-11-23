/** @typedef {import('../lib/catalog-types').Catalog} Catalog */
/** @typedef {{ query: (sql: string, values?: unknown[]) => Promise<{ rows: any[] }> }} QueryClient */

export const catalogQuery = `
  SELECT c.slug AS category_slug, c.name AS category_name,
         c.image_tile AS category_tile,
         p.id, p.name, p.detail, p.description, p.price_cents,
         p.compare_at_price_cents, p.stock, p.image_tile,
         p.tag, p.is_demo, p.sort_order
  FROM wix.categories c
  LEFT JOIN wix.products p ON p.category_slug = c.slug AND p.active
  WHERE c.active
  ORDER BY c.sort_order, c.name, p.sort_order, p.id
`;

/** @param {QueryClient} client @returns {Promise<Catalog>} */
export async function readCatalog(client) {
  const { rows } = await client.query(catalogQuery);
  const categories = new Map();
  const products = [];

  for (const row of rows) {
    categories.set(row.category_slug, {
      slug: row.category_slug,
      name: row.category_name,
      tile: row.category_tile,
    });
    if (row.id === null) continue;
    products.push({
      id: row.id,
      name: row.name,
      detail: row.detail,
      description: row.description,
      category: row.category_name,
      price: row.price_cents / 100,
      old: row.compare_at_price_cents === null ? undefined : row.compare_at_price_cents / 100,
      stock: row.stock,
      tile: row.image_tile,
      tag: row.tag ?? undefined,
      isDemo: row.is_demo,
      sortOrder: row.sort_order,
    });
  }

  products.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
  return { source: "database", categories: [...categories.values()], products };
}

/** @param {QueryClient} client @param {{categories: any[], products: any[]}} demo */
export async function seedDemoCatalog(client, demo) {
  for (const [index, category] of demo.categories.entries()) {
    await client.query(
      `INSERT INTO wix.categories(slug, name, image_tile, sort_order)
       VALUES ($1, $2, $3, $4) ON CONFLICT (slug) DO NOTHING`,
      [category.slug, category.name, category.tile, index],
    );
  }

  for (const product of demo.products) {
    const category = demo.categories.find(item => item.name === product.category);
    if (!category) throw new Error("Unknown demo category");
    await client.query(
      `INSERT INTO wix.products
       (sku, name, detail, description, category_slug, price_cents,
        compare_at_price_cents, stock, image_tile, tag, sort_order, is_demo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 99, $8, $9, $10, true)
       ON CONFLICT (sku) DO NOTHING`,
      [
        `demo-${product.id}`, product.name, product.detail,
        "Produto demonstrativo. Imagem, descrição e preço ilustrativos.",
        category.slug, Math.round(product.price * 100),
        product.old === undefined ? null : Math.round(product.old * 100),
        product.tile, product.tag ?? null, product.id,
      ],
    );
  }
}
