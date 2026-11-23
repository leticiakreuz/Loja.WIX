CREATE SCHEMA IF NOT EXISTS wix;

CREATE TABLE wix.categories (
  slug text PRIMARY KEY CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text NOT NULL UNIQUE CHECK (length(trim(name)) > 0),
  image_tile smallint NOT NULL CHECK (image_tile BETWEEN 0 AND 5),
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE wix.products (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sku text NOT NULL UNIQUE CHECK (length(trim(sku)) > 0),
  name text NOT NULL CHECK (length(trim(name)) > 0),
  detail text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  category_slug text NOT NULL REFERENCES wix.categories(slug),
  price_cents integer NOT NULL CHECK (price_cents > 0),
  compare_at_price_cents integer CHECK (compare_at_price_cents > price_cents),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_tile smallint NOT NULL CHECK (image_tile BETWEEN 0 AND 5),
  tag text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX products_catalog_idx ON wix.products(category_slug, sort_order) WHERE active;

CREATE FUNCTION wix.touch_product_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER products_updated_at BEFORE UPDATE ON wix.products
FOR EACH ROW EXECUTE FUNCTION wix.touch_product_updated_at();

REVOKE ALL ON SCHEMA wix FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA wix FROM PUBLIC;
