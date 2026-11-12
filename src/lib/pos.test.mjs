import assert from "node:assert/strict";
import { test } from "node:test";
import {
  cartLines,
  checkout,
  computeTotals,
  filterProducts,
  formatPesos,
  isLowStock,
  orderTotal,
  parsePesos,
  receiveOrder,
} from "./pos.ts";

const hammer = { id: "h", name: "Hammer", priceCents: 35000, stock: 10 };
const nails = { id: "n", name: "Nails", priceCents: 1999, stock: 4 };

function sell(overrides = {}) {
  return checkout({
    products: [hammer, nails],
    sales: [],
    cart: { h: 2, n: 1 },
    discounted: false,
    cashCents: 100000,
    cashier: "ana",
    id: "sale-1",
    now: new Date("2026-11-02T10:00:00Z"),
    ...overrides,
  });
}

test("parsePesos reads valid amounts as centavos", () => {
  assert.equal(parsePesos("120"), 12000);
  assert.equal(parsePesos("120.5"), 12050);
  assert.equal(parsePesos("1,250.75"), 125075);
  assert.equal(parsePesos(" 0.07 "), 7);
});

test("parsePesos rejects invalid amounts", () => {
  for (const input of ["", "abc", "-5", "1.234", "1.2.3", "."]) {
    assert.equal(parsePesos(input), null, input);
  }
});

test("formatPesos shows two decimals and thousands separators", () => {
  assert.equal(formatPesos(125075), "₱1,250.75");
  assert.equal(formatPesos(0), "₱0.00");
  assert.equal(formatPesos(-15300), "-₱153.00");
});

test("filterProducts matches both the search text and the category", () => {
  const tools = { ...hammer, category: "Tools" };
  const fasteners = { ...nails, category: "Fasteners" };
  const all = [tools, fasteners];
  assert.deepEqual(filterProducts(all, "", "All"), all);
  assert.deepEqual(filterProducts(all, "", "Tools"), [tools]);
  assert.deepEqual(filterProducts(all, " NAIL ", "All"), [fasteners]);
  assert.deepEqual(filterProducts(all, "nail", "Tools"), []);
});

test("isLowStock is true below five", () => {
  assert.equal(isLowStock({ ...hammer, stock: 4 }), true);
  assert.equal(isLowStock({ ...hammer, stock: 5 }), false);
});

test("computeTotals applies the 20% discount and rounds to the centavo", () => {
  const lines = cartLines([hammer, nails], { h: 2, n: 1 });
  assert.deepEqual(computeTotals(lines, false), {
    subtotalCents: 71999,
    discountCents: 0,
    totalCents: 71999,
  });
  assert.deepEqual(computeTotals(lines, true), {
    subtotalCents: 71999,
    discountCents: 14400,
    totalCents: 57599,
  });
});

test("checkout computes change, numbers the sale, and reduces stock", () => {
  const { sale, products } = sell();
  assert.equal(sale.number, 1);
  assert.equal(sale.totalCents, 71999);
  assert.equal(sale.changeCents, 28001);
  assert.deepEqual(
    products.map((p) => p.stock),
    [8, 3],
  );
});

test("checkout continues numbering from the last sale", () => {
  const { sale } = sell({ sales: [{ number: 41 }] });
  assert.equal(sale.number, 42);
});

test("checkout accepts exact cash", () => {
  assert.equal(sell({ cashCents: 71999 }).sale.changeCents, 0);
});

test("checkout refuses bad sales", () => {
  assert.throws(() => sell({ cart: {} }), /empty/);
  assert.throws(() => sell({ cart: { gone: 1 } }), /empty/);
  assert.throws(() => sell({ cart: { n: 5 } }), /Not enough stock/);
  assert.throws(() => sell({ cashCents: 71998 }), /less than the total/);
});

test("checkout skips cart items that were deleted from the product list", () => {
  const { sale } = sell({ cart: { h: 1, gone: 3 } });
  assert.deepEqual(
    sale.lines.map((line) => line.productId),
    ["h"],
  );
  assert.equal(sale.totalCents, 35000);
});

test("receiveOrder adds stock and updates cost", () => {
  const lines = [{ productId: "h", name: "Hammer", qty: 5, costCents: 26000 }];
  const order = { id: "o1", number: 1, supplier: "Ace", createdAt: "", status: "pending", lines, totalCents: orderTotal(lines) };
  assert.equal(order.totalCents, 130000);
  const [h, n] = receiveOrder([{ ...hammer, costCents: 25000 }, { ...nails, costCents: null }], order);
  assert.equal(h.stock, 15);
  assert.equal(h.costCents, 26000);
  assert.equal(n.stock, 4);
  assert.equal(n.costCents, null);
});
