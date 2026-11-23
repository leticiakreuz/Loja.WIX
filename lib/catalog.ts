import "server-only";
import demo from "../data/demo-catalog.json";
import { readCatalog } from "../db/catalog.mjs";
import { getDatabase, hasDatabase } from "./database";
import type { Catalog } from "./catalog-types";

export async function getCatalog(): Promise<Catalog> {
  if (!hasDatabase()) {
    return {
      source: "demo",
      categories: demo.categories,
      products: demo.products.map(product => ({
        ...product,
        description: "Produto demonstrativo. Imagem, descrição e preço ilustrativos.",
        stock: 99,
        isDemo: true,
      })),
    };
  }

  return readCatalog(getDatabase());
}
