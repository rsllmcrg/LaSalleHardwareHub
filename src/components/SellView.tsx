"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import {
  cartLines,
  computeTotals,
  DISCOUNT_PERCENT,
  filterProducts,
  formatPesos,
  isLowStock,
  parsePesos,
  type Cart,
  type Category,
  type Product,
  type Sale,
} from "@/lib/pos";
import { completeSale } from "@/lib/store";
import CategoryTabs from "./CategoryTabs";
import ProductImage from "./ProductImage";
import Receipt from "./Receipt";
import {
  cardClass,
  errorClass,
  errorMessage,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "./ui";

const stepperButtonClass =
  "flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 font-semibold hover:bg-zinc-200 disabled:opacity-40 dark:bg-zinc-800 dark:hover:bg-zinc-700";

export default function SellView({
  products,
  cart,
  setCart,
}: {
  products: Product[];
  cart: Cart;
  setCart: Dispatch<SetStateAction<Cart>>;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");
  const [discounted, setDiscounted] = useState(false);
  const [cash, setCash] = useState("");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<Sale | null>(null);

  const matches = filterProducts(products, search, category);
  const lines = cartLines(products, cart);
  const totals = computeTotals(lines, discounted);
  const cashCents = parsePesos(cash);
  const hasEnoughCash = cashCents !== null && cashCents >= totals.totalCents;

  function setQty(product: Product, qty: number) {
    setError("");
    setCart((current) => {
      const next = { ...current };
      const clamped = Math.min(qty, product.stock);
      if (clamped > 0) next[product.id] = clamped;
      else delete next[product.id];
      return next;
    });
  }

  function handleCompleteSale() {
    try {
      setReceipt(completeSale(cart, discounted, cashCents ?? 0));
      setCart({});
      setDiscounted(false);
      setCash("");
      setSearch("");
      setCategory("All");
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_24rem]">
      <section className="flex min-w-0 flex-col gap-3">
        <input
          className={inputClass}
          type="search"
          placeholder="Search product"
          aria-label="Search product"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <CategoryTabs
          products={products}
          active={category}
          onChange={setCategory}
        />
        {matches.length === 0 && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No products found.
          </p>
        )}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {matches.map((product) => {
            const inCart = cart[product.id] ?? 0;
            return (
              <button
                key={product.id}
                className={`relative flex flex-col gap-2 rounded-xl border bg-white p-2 text-left enabled:hover:border-green-600 enabled:hover:shadow-md disabled:opacity-50 dark:bg-zinc-900 ${
                  inCart > 0
                    ? "border-green-700"
                    : "border-zinc-200 dark:border-zinc-800"
                }`}
                disabled={inCart >= product.stock}
                onClick={() => setQty(product, inCart + 1)}
              >
                <ProductImage image={product.image} className="aspect-square w-full" />
                {inCart > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute top-3 right-3 flex size-7 items-center justify-center rounded-full bg-green-700 text-sm font-semibold text-white"
                  >
                    {inCart}
                  </span>
                )}
                <span className="flex flex-1 flex-col gap-1 px-1 pb-1">
                  <span className="flex-1 text-sm leading-5 font-medium">
                    {product.name}
                  </span>
                  <span className="font-semibold text-green-800 dark:text-green-400">
                    {formatPesos(product.priceCents)}
                  </span>
                  <span
                    className={`text-xs ${
                      isLowStock(product)
                        ? "font-medium text-amber-700 dark:text-amber-400"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {product.stock === 0
                      ? "Out of stock"
                      : `${product.stock} left`}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        {lines.length > 0 && (
          <a
            href="#cart"
            className={`${primaryButtonClass} sticky bottom-3 flex justify-between shadow-lg lg:hidden`}
          >
            <span>View cart</span>
            <span>{formatPesos(totals.totalCents)}</span>
          </a>
        )}
      </section>

      <section
        id="cart"
        aria-label="Cart"
        className={`${cardClass} flex scroll-mt-4 flex-col gap-4 self-start lg:sticky lg:top-4`}
      >
        <h2 className="font-semibold">Cart</h2>
        {lines.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Tap a product to add it.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {lines.map((line) => {
              const product = products.find((p) => p.id === line.productId)!;
              return (
                <li key={line.productId} className="flex gap-3">
                  <ProductImage image={product.image} className="size-14 shrink-0" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="font-medium">{line.name}</span>
                      <span className="shrink-0">
                        {formatPesos(line.priceCents * line.qty)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className={stepperButtonClass}
                        aria-label={`One less ${line.name}`}
                        onClick={() => setQty(product, line.qty - 1)}
                      >
                        −
                      </button>
                      <input
                        className={`${inputClass} !w-14 !px-1 !py-1 text-center`}
                        inputMode="numeric"
                        aria-label={`Quantity of ${line.name}`}
                        value={line.qty}
                        onChange={(e) => {
                          const qty = Number(e.target.value);
                          if (Number.isInteger(qty) && qty > 0) {
                            setQty(product, qty);
                          }
                        }}
                      />
                      <button
                        className={stepperButtonClass}
                        aria-label={`One more ${line.name}`}
                        disabled={line.qty >= product.stock}
                        onClick={() => setQty(product, line.qty + 1)}
                      >
                        +
                      </button>
                      <button
                        className="ml-auto text-sm font-medium text-red-700 dark:text-red-400"
                        aria-label={`Remove ${line.name}`}
                        onClick={() => setQty(product, 0)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <button
          className={`${secondaryButtonClass} ${
            discounted
              ? "!border-green-700 !bg-green-100 text-green-900 dark:!bg-green-900/40 dark:text-green-200"
              : ""
          }`}
          aria-pressed={discounted}
          onClick={() => setDiscounted(!discounted)}
        >
          Senior / PWD discount ({DISCOUNT_PERCENT}%)
        </button>

        <div className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPesos(totals.subtotalCents)}</span>
          </div>
          {discounted && (
            <div className="flex justify-between">
              <span>Discount</span>
              <span>{formatPesos(-totals.discountCents)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatPesos(totals.totalCents)}</span>
          </div>
        </div>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Cash given
          <input
            className={inputClass}
            inputMode="decimal"
            placeholder="0.00"
            value={cash}
            onChange={(e) => setCash(e.target.value)}
          />
        </label>
        {cash !== "" && cashCents === null && (
          <p className={errorClass}>Enter a valid amount, like 500 or 500.50.</p>
        )}
        {cash !== "" && cashCents !== null && !hasEnoughCash && (
          <p className={errorClass}>
            Short by {formatPesos(totals.totalCents - cashCents)}.
          </p>
        )}
        {lines.length > 0 && hasEnoughCash && (
          <div className="flex justify-between text-lg font-semibold">
            <span>Change</span>
            <span>{formatPesos(cashCents - totals.totalCents)}</span>
          </div>
        )}
        {error && <p className={errorClass}>{error}</p>}

        <button
          className={primaryButtonClass}
          disabled={lines.length === 0 || !hasEnoughCash}
          onClick={handleCompleteSale}
        >
          Complete sale
        </button>
      </section>

      {receipt && (
        <Receipt
          sale={receipt}
          closeLabel="New sale"
          onClose={() => setReceipt(null)}
        />
      )}
    </div>
  );
}
