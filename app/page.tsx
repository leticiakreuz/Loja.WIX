import { connection } from "next/server";
import { getCatalog } from "../lib/catalog";
import Storefront from "./storefront";

export default async function HomePage() {
  await connection();
  const catalog = await getCatalog();
  return <Storefront catalog={catalog} />;
}
