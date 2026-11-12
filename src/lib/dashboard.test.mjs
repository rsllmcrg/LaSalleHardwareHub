import assert from "node:assert/strict";
import { test } from "node:test";
import {
  bestSellers,
  costOfSales,
  dailyTotals,
  expensesBetween,
  inventoryValue,
  monthlyTotals,
  percentChange,
  periodStart,
  salesBetween,
  salesByCashier,
  summarize,
  totalExpenses,
} from "./dashboard.ts";

function sale(createdAt, cashier, lines, discountCents = 0) {
  const subtotalCents = lines.reduce((sum, l) => sum + l.priceCents * l.qty, 0);
  return {
    id: createdAt,
    number: 1,
    createdAt: new Date(createdAt).toISOString(),
    cashier,
    lines,
    subtotalCents,
    discountCents,
    totalCents: subtotalCents - discountCents,
    cashCents: subtotalCents,
    changeCents: discountCents,
  };
}

const hammer = (qty) => ({ productId: "h", name: "Hammer", priceCents: 35000, qty });
const nails = (qty) => ({ productId: "n", name: "Nails", priceCents: 9500, qty });

// Local times, so the tests pass in any time zone.
const now = new Date(2026, 10, 10, 15, 0);
const sales = [
  sale(new Date(2026, 9, 30, 9, 0), "ana", [hammer(1)]),
  sale(new Date(2026, 10, 9, 9, 0), "ana", [nails(2)]),
  sale(new Date(2026, 10, 10, 8, 0), "ben", [hammer(2), nails(1)], 7000),
  sale(new Date(2026, 10, 10, 14, 30), "ana", [nails(3)]),
];

test("periodStart covers today, the last 7 days, or this month", () => {
  assert.deepEqual(periodStart("today", now), new Date(2026, 10, 10));
  assert.deepEqual(periodStart("week", now), new Date(2026, 10, 4));
  assert.deepEqual(periodStart("month", now), new Date(2026, 10, 1));
});

test("summarize totals today's sales", () => {
  const today = salesBetween(sales, periodStart("today", now), now);
  assert.deepEqual(summarize(today), {
    totalCents: 70000 + 9500 - 7000 + 28500,
    count: 2,
    averageCents: Math.round((70000 + 9500 - 7000 + 28500) / 2),
    discountCents: 7000,
  });
  assert.deepEqual(summarize([]), { totalCents: 0, count: 0, averageCents: 0, discountCents: 0 });
});

test("percentChange skips a zero baseline", () => {
  assert.equal(percentChange(150, 100), 50);
  assert.equal(percentChange(50, 100), -50);
  assert.equal(percentChange(100, 0), null);
});

test("dailyTotals gives one bar per day, oldest first", () => {
  const days = dailyTotals(sales, now);
  assert.equal(days.length, 7);
  assert.deepEqual(days[6].day, new Date(2026, 10, 10));
  assert.equal(days[6].totalCents, 101000);
  assert.equal(days[5].totalCents, 19000);
  assert.equal(days[0].totalCents, 0);
});

test("bestSellers ranks by quantity sold", () => {
  assert.deepEqual(bestSellers(sales), [
    { name: "Nails", qty: 6 },
    { name: "Hammer", qty: 3 },
  ]);
  assert.equal(bestSellers(sales, 1).length, 1);
});

test("salesByCashier sorts by total", () => {
  assert.deepEqual(salesByCashier(sales), [
    { cashier: "ana", totalCents: 35000 + 19000 + 28500, count: 3 },
    { cashier: "ben", totalCents: 72500, count: 1 },
  ]);
});

test("monthlyTotals gives one bar per month, oldest first", () => {
  const months = monthlyTotals(sales, now);
  assert.equal(months.length, 6);
  assert.deepEqual(months[5].month, new Date(2026, 10, 1));
  assert.equal(months[5].totalCents, 19000 + 101000);
  assert.equal(months[4].totalCents, 35000);
});

test("expensesBetween includes both end days", () => {
  const expenses = [
    { id: "a", date: "2026-11-01", category: "Rent", description: "Rent", amountCents: 500000 },
    { id: "b", date: "2026-11-10", category: "Electricity", description: "Meralco", amountCents: 120000 },
    { id: "c", date: "2026-10-31", category: "Water", description: "Water", amountCents: 30000 },
  ];
  const month = expensesBetween(expenses, new Date(2026, 10, 1), now);
  assert.deepEqual(month.map((e) => e.id), ["a", "b"]);
  assert.equal(totalExpenses(month), 620000);
});

test("costOfSales prefers the saved cost and counts items with none", () => {
  const products = [
    { id: "h", costCents: 25000 },
    { id: "n", costCents: null },
  ];
  const withSavedCost = [sale(now, "ana", [{ ...hammer(2), costCents: 20000 }, nails(3)])];
  assert.deepEqual(costOfSales(withSavedCost, products), { costCents: 40000, missingQty: 3 });
  const oldSale = [sale(now, "ana", [hammer(1)])];
  assert.deepEqual(costOfSales(oldSale, products), { costCents: 25000, missingQty: 0 });
});

test("inventoryValue totals stock at cost and at selling price", () => {
  const products = [
    { id: "h", priceCents: 35000, costCents: 25000, stock: 4 },
    { id: "n", priceCents: 9500, costCents: null, stock: 10 },
    { id: "x", priceCents: 1000, costCents: null, stock: 0 },
  ];
  assert.deepEqual(inventoryValue(products), {
    costCents: 100000,
    retailCents: 140000 + 95000,
    missingCost: 1,
  });
});
