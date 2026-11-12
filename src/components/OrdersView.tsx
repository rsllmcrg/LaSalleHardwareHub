"use client";

import { useState, type FormEvent } from "react";
import {
  formatPesos,
  orderTotal,
  parsePesos,
  type OrderLine,
  type Product,
  type PurchaseOrder,
} from "@/lib/pos";
import {
  cancelPurchaseOrder,
  createPurchaseOrder,
  receivePurchaseOrder,
} from "@/lib/store";
import {
  cardClass,
  dangerButtonClass,
  errorClass,
  errorMessage,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "./ui";

const STATUS_STYLES: Record<PurchaseOrder["status"], string> = {
  pending: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200",
  received: "bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-200",
  cancelled: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

export function orderLabel(order: PurchaseOrder) {
  return `PO-${String(order.number).padStart(4, "0")}`;
}

function OrderForm({ products }: { products: Product[] }) {
  const sorted = [...products].sort((a, b) => a.name.localeCompare(b.name));
  const [supplier, setSupplier] = useState("");
  const [productId, setProductId] = useState(sorted[0]?.id ?? "");
  const [qty, setQty] = useState("");
  const [cost, setCost] = useState(() => costText(sorted[0]));
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [error, setError] = useState("");

  function costText(product: Product | undefined) {
    return product?.costCents != null ? (product.costCents / 100).toFixed(2) : "";
  }

  function pickProduct(id: string) {
    setProductId(id);
    setCost(costText(products.find((p) => p.id === id)));
  }

  function addLine() {
    const product = products.find((p) => p.id === productId);
    const costCents = parsePesos(cost);
    if (!product) return;
    if (!/^\d{1,5}$/.test(qty.trim()) || Number(qty) === 0) {
      setError("Quantity must be a whole number above 0.");
      return;
    }
    if (costCents === null) {
      setError("Enter the cost per item, like 245 or 245.50.");
      return;
    }
    setLines([
      ...lines.filter((l) => l.productId !== product.id),
      { productId: product.id, name: product.name, qty: Number(qty), costCents },
    ]);
    setQty("");
    setError("");
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      createPurchaseOrder(supplier, lines);
      setSupplier("");
      setLines([]);
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-label="New purchase order" className={`${cardClass} flex flex-col gap-3`}>
      <h2 className="font-semibold">New purchase order</h2>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Supplier
        <input
          className={inputClass}
          placeholder="e.g. Ace Hardware Supply"
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
          required
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-[1fr_6rem_8rem_auto] sm:items-end">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Product
          <select className={inputClass} value={productId} onChange={(e) => pickProduct(e.target.value)}>
            {sorted.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.stock} left)
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Quantity
          <input className={inputClass} inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Cost each (₱)
          <input className={inputClass} inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} />
        </label>
        <button type="button" className={secondaryButtonClass} onClick={addLine}>
          Add to order
        </button>
      </div>

      {lines.length > 0 && (
        <ul className="flex flex-col gap-2 border-t border-zinc-200 pt-3 text-sm dark:border-zinc-800">
          {lines.map((line) => (
            <li key={line.productId} className="flex items-center justify-between gap-3">
              <span className="min-w-0">
                {line.name}
                <span className="block text-zinc-600 dark:text-zinc-400">
                  {line.qty} × {formatPesos(line.costCents)}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <span className="tabular-nums">{formatPesos(line.qty * line.costCents)}</span>
                <button
                  type="button"
                  className="font-medium text-red-700 dark:text-red-400"
                  aria-label={`Remove ${line.name}`}
                  onClick={() => setLines(lines.filter((l) => l.productId !== line.productId))}
                >
                  Remove
                </button>
              </span>
            </li>
          ))}
          <li className="flex justify-between font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{formatPesos(orderTotal(lines))}</span>
          </li>
        </ul>
      )}
      {error && <p className={errorClass}>{error}</p>}
      <button className={`${primaryButtonClass} self-start`} disabled={lines.length === 0}>
        Create order
      </button>
    </form>
  );
}

export default function OrdersView({
  products,
  orders,
}: {
  products: Product[];
  orders: PurchaseOrder[];
}) {
  const [error, setError] = useState("");
  // Pending orders first, then the newest.
  const sorted = [...orders].sort(
    (a, b) => Number(b.status === "pending") - Number(a.status === "pending") || b.number - a.number,
  );

  function act(action: () => void) {
    try {
      action();
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <OrderForm products={products} />
      {error && <p className={errorClass}>{error}</p>}
      {sorted.length === 0 && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          No purchase orders yet. Create one above when you order stock from a supplier.
        </p>
      )}
      <ul className="flex flex-col gap-2">
        {sorted.map((order) => (
          <li key={order.id} className={`${cardClass} flex flex-col gap-3`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">
                  {orderLabel(order)} · {order.supplier}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {new Date(order.createdAt).toLocaleDateString("en-PH")} ·{" "}
                  {order.lines.map((l) => `${l.qty} × ${l.name}`).join(", ")}
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-3">
                <span className="font-medium tabular-nums">{formatPesos(order.totalCents)}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[order.status]}`}>
                  {order.status}
                </span>
              </span>
            </div>
            {order.status === "pending" && (
              <div className="flex gap-2">
                <button
                  className={primaryButtonClass}
                  onClick={() => {
                    if (window.confirm(`Mark ${orderLabel(order)} received and add its items to stock?`)) {
                      act(() => receivePurchaseOrder(order.id));
                    }
                  }}
                >
                  Mark received
                </button>
                <button
                  className={dangerButtonClass}
                  onClick={() => {
                    if (window.confirm(`Cancel ${orderLabel(order)}?`)) {
                      act(() => cancelPurchaseOrder(order.id));
                    }
                  }}
                >
                  Cancel order
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
