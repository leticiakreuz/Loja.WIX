export type Product = {
  id: number;
  name: string;
  detail: string;
  description: string;
  category: string;
  price: number;
  old?: number;
  tile: number;
  tag?: string;
  stock: number;
  isDemo: boolean;
};

export type Category = {
  slug: string;
  name: string;
  tile: number;
};

export type Catalog = {
  source: "demo" | "database";
  products: Product[];
  categories: Category[];
};
