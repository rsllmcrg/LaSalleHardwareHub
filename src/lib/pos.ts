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
  // What the shop pays per item; null until the owner enters it.
  costCents: number | null;
};

export type SaleLine = {
  productId: string;
  name: string;
  priceCents: number;
  qty: number;
  // The cost when it was sold, so later cost changes don't rewrite past profit.
  // Missing on sales made before costs were tracked.
  costCents?: number | null;
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
        costCents: product.costCents,
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

export const EXPENSE_CATEGORIES = [
  "Rent",
  "Electricity",
  "Water",
  "Salaries",
  "Supplies",
  "Transport",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export type Expense = {
  id: string;
  // A local calendar date, YYYY-MM-DD.
  date: string;
  category: ExpenseCategory;
  description: string;
  amountCents: number;
};

export type OrderLine = {
  productId: string;
  name: string;
  qty: number;
  costCents: number;
};

export type PurchaseOrder = {
  id: string;
  number: number;
  supplier: string;
  createdAt: string;
  status: "pending" | "received" | "cancelled";
  lines: OrderLine[];
  totalCents: number;
};

export function orderTotal(lines: OrderLine[]): number {
  return lines.reduce((sum, line) => sum + line.costCents * line.qty, 0);
}

// Receiving adds the ordered stock and takes the order's cost as the new cost price.
export function receiveOrder(products: Product[], order: PurchaseOrder): Product[] {
  return products.map((product) => {
    const lines = order.lines.filter((l) => l.productId === product.id);
    if (lines.length === 0) return product;
    return {
      ...product,
      stock: product.stock + lines.reduce((sum, l) => sum + l.qty, 0),
      costCents: lines.at(-1)!.costCents,
    };
  });
}
