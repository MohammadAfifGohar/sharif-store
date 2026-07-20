const STORE_API_URL =
  process.env.WORDPRESS_URL ??
  "https://thesharifstore.in";

export type WooImage = {
  id: number;
  src: string;
  thumbnail: string;
  alt: string;
};

export type WooCategory = {
  id: number;
  name: string;
  slug: string;
  parent: number;
  count: number;
  permalink: string;
  image: WooImage | null;
};

export type WooProduct = {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  type: "simple" | "variable" | string;
  on_sale: boolean;
  images: WooImage[];
  categories: Array<Pick<WooCategory, "id" | "name" | "slug">>;
  prices: {
    price: string;
    regular_price: string;
    sale_price: string;
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
    price_range: {
      min_amount: string;
      max_amount: string;
    } | null;
  };
  is_in_stock: boolean;
  has_options: boolean;
};

async function fetchStoreApi<T>(path: string): Promise<T> {
  const response = await fetch(
    `${STORE_API_URL}/wp-json/wc/store/v1/${path}`,
    {
      next: {
        revalidate: 300,
        tags: ["woocommerce"],
      },
    },
  );

  if (!response.ok) {
    throw new Error(`WooCommerce request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getHomepageCommerceData() {
  const [products, categories] = await Promise.all([
    fetchStoreApi<WooProduct[]>("products?per_page=8"),
    fetchStoreApi<WooCategory[]>(
      "products/categories?hide_empty=false&per_page=100",
    ),
  ]);

  return {
    products,
    categories: categories.filter((category) => category.parent === 0),
  };
}

export function formatPrice(product: WooProduct) {
  const divisor = 10 ** product.prices.currency_minor_unit;
  const price = Number(product.prices.price) / divisor;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: product.prices.currency_code,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatRegularPrice(product: WooProduct) {
  const divisor = 10 ** product.prices.currency_minor_unit;
  const price = Number(product.prices.regular_price) / divisor;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: product.prices.currency_code,
    maximumFractionDigits: 0,
  }).format(price);
}
