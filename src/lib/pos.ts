export const LOW_STOCK_THRESHOLD = 5;
export const DISCOUNT_PERCENT = 20;

export const CATEGORIES = [
  "Tools",
  "Fasteners",
  "Paint",
  "Plumbing",
  "Electrical",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Role = "owner" | "cashier";

export type User = {
  id: string;
  username: string;
  role: Role;
  salt: string;
  passwordHash: string;
};

// Money is stored as whole centavos so totals never pick up floating-point errors.
export type Product = {
  id: string;
  name: string;
  priceCents: number;
  stock: number;
  category: Category;
  // A bundled picture path or an uploaded photo as a data URL.
  image: string | null;
};

export type SaleLine = {
  productId: string;
  name: string;
  priceCents: number;
  qty: number;
};

export type Sale = {
  id: string;
  number: number;
  createdAt: string;
  cashier: string;
  lines: SaleLine[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  cashCents: number;
  changeCents: number;
};

// Maps product id to quantity.
export type Cart = Record<string, number>;

export function parsePesos(input: string): number | null {
  const match = /^(\d{1,9})(?:\.(\d{1,2}))?$/.exec(
    input.trim().replaceAll(",", ""),
  );
  if (!match) return null;
  return Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
}

export function formatPesos(cents: number): string {
  const amount = (Math.abs(cents) / 100).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${cents < 0 ? "-" : ""}₱${amount}`;
}

export function isLowStock(product: Product): boolean {
  return product.stock < LOW_STOCK_THRESHOLD;
}

export function filterProducts(
  products: Product[],
  search: string,
  category: Category | "All",
): Product[] {
  const query = search.trim().toLowerCase();
  return products.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      p.name.toLowerCase().includes(query),
  );
}

export function cartLines(products: Product[], cart: Cart): SaleLine[] {
  return products.flatMap((product) => {
    const qty = cart[product.id];
    if (!qty) return [];
    return [
      {
        productId: product.id,
        name: product.name,
        priceCents: product.priceCents,
        qty,
      },
    ];
  });
}

export function computeTotals(lines: SaleLine[], discounted: boolean) {
  const subtotalCents = lines.reduce(
    (sum, line) => sum + line.priceCents * line.qty,
    0,
  );
  const discountCents = discounted
    ? Math.round((subtotalCents * DISCOUNT_PERCENT) / 100)
    : 0;
  return {
    subtotalCents,
    discountCents,
    totalCents: subtotalCents - discountCents,
  };
}

type CheckoutInput = {
  products: Product[];
  sales: Sale[];
  cart: Cart;
  discounted: boolean;
  cashCents: number;
  cashier: string;
  id: string;
  now: Date;
};

export function checkout(input: CheckoutInput) {
  const { products, sales, cart, discounted, cashCents } = input;
  const lines = cartLines(products, cart);
  if (lines.length === 0) throw new Error("The cart is empty.");

  const stockById = new Map(products.map((p) => [p.id, p.stock]));
  for (const line of lines) {
    if (line.qty > (stockById.get(line.productId) ?? 0)) {
      throw new Error(`Not enough stock for ${line.name}.`);
    }
  }

  const totals = computeTotals(lines, discounted);
  if (cashCents < totals.totalCents) {
    throw new Error("Cash given is less than the total.");
  }

  const sale: Sale = {
    id: input.id,
    number: (sales.at(-1)?.number ?? 0) + 1,
    createdAt: input.now.toISOString(),
    cashier: input.cashier,
    lines,
    ...totals,
    cashCents,
    changeCents: cashCents - totals.totalCents,
  };
  return {
    sale,
    products: products.map((product) => ({
      ...product,
      stock: product.stock - (cart[product.id] ?? 0),
    })),
  };
}
