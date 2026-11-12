import type { Expense, Product, Sale } from "./pos";

export type Period = "today" | "week" | "month";

export const PERIOD_LABELS: Record<Period, string> = {
  today: "Today",
  week: "Last 7 days",
  month: "This month",
};

export function startOfDay(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

// The same YYYY-MM-DD form expenses are saved in, in local time.
export function localDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

// "week" is the last 7 days including today, so early in the week still shows a full week.
export function periodStart(period: Period, now: Date): Date {
  const today = startOfDay(now);
  if (period === "week") return addDays(today, -6);
  if (period === "month") return new Date(today.getFullYear(), today.getMonth(), 1);
  return today;
}

export function salesBetween(sales: Sale[], from: Date, to: Date): Sale[] {
  return sales.filter((sale) => {
    const time = new Date(sale.createdAt);
    return time >= from && time < to;
  });
}

export function summarize(sales: Sale[]) {
  const totalCents = sales.reduce((sum, sale) => sum + sale.totalCents, 0);
  return {
    totalCents,
    count: sales.length,
    averageCents: sales.length ? Math.round(totalCents / sales.length) : 0,
    discountCents: sales.reduce((sum, sale) => sum + sale.discountCents, 0),
  };
}

// Whole percent change, or null when there is nothing to compare against.
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export function dailyTotals(sales: Sale[], now: Date, days = 7) {
  const today = startOfDay(now);
  return Array.from({ length: days }, (_, i) => {
    const day = addDays(today, i - days + 1);
    const daySales = salesBetween(sales, day, addDays(day, 1));
    return { day, totalCents: summarize(daySales).totalCents };
  });
}

export function bestSellers(sales: Sale[], limit = 5) {
  const byProduct = new Map<string, { name: string; qty: number }>();
  for (const sale of sales) {
    for (const line of sale.lines) {
      const entry = byProduct.get(line.productId);
      if (entry) entry.qty += line.qty;
      else byProduct.set(line.productId, { name: line.name, qty: line.qty });
    }
  }
  return [...byProduct.values()]
    .sort((a, b) => b.qty - a.qty || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export function salesByCashier(sales: Sale[]) {
  const byCashier = new Map<string, { cashier: string; totalCents: number; count: number }>();
  for (const sale of sales) {
    const entry = byCashier.get(sale.cashier) ?? { cashier: sale.cashier, totalCents: 0, count: 0 };
    entry.totalCents += sale.totalCents;
    entry.count += 1;
    byCashier.set(sale.cashier, entry);
  }
  return [...byCashier.values()].sort((a, b) => b.totalCents - a.totalCents);
}

export function monthlyTotals(sales: Sale[], now: Date, months = 6) {
  return Array.from({ length: months }, (_, i) => {
    const month = new Date(now.getFullYear(), now.getMonth() - months + 1 + i, 1);
    const next = new Date(month.getFullYear(), month.getMonth() + 1, 1);
    return { month, totalCents: summarize(salesBetween(sales, month, next)).totalCents };
  });
}

// Both days count, so an expense dated today shows up in today's numbers.
export function expensesBetween(expenses: Expense[], from: Date, to: Date): Expense[] {
  const first = localDateKey(from);
  const last = localDateKey(to);
  return expenses.filter((e) => e.date >= first && e.date <= last);
}

export function totalExpenses(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amountCents, 0);
}

// Uses the cost saved with each sale, falling back to today's cost for sales made
// before costs were tracked. Items with no cost at all are counted, not guessed.
export function costOfSales(sales: Sale[], products: Product[]) {
  const currentCost = new Map(products.map((p) => [p.id, p.costCents]));
  let costCents = 0;
  let missingQty = 0;
  for (const sale of sales) {
    for (const line of sale.lines) {
      const cost = line.costCents ?? currentCost.get(line.productId) ?? null;
      if (cost === null) missingQty += line.qty;
      else costCents += cost * line.qty;
    }
  }
  return { costCents, missingQty };
}

export function inventoryValue(products: Product[]) {
  let costCents = 0;
  let retailCents = 0;
  let missingCost = 0;
  for (const p of products) {
    retailCents += p.priceCents * p.stock;
    if (p.costCents === null) {
      if (p.stock > 0) missingCost += 1;
    } else {
      costCents += p.costCents * p.stock;
    }
  }
  return { costCents, retailCents, missingCost };
}
