"use client";

import { useState } from "react";
import {
  bestSellers,
  costOfSales,
  dailyTotals,
  expensesBetween,
  inventoryValue,
  monthlyTotals,
  percentChange,
  PERIOD_LABELS,
  periodStart,
  salesBetween,
  salesByCashier,
  startOfDay,
  summarize,
  totalExpenses,
  type Period,
} from "@/lib/dashboard";
import {
  formatPesos,
  isLowStock,
  type Expense,
  type Product,
  type PurchaseOrder,
  type Sale,
} from "@/lib/pos";
import { orderLabel } from "./OrdersView";
import Receipt from "./Receipt";
import { cardClass, secondaryButtonClass } from "./ui";

type Destination = "products" | "orders" | "expenses" | "sales";

const mutedClass = "text-sm text-zinc-600 dark:text-zinc-400";
const noteClass = "text-xs text-zinc-600 dark:text-zinc-400";

function Stat({
  label,
  value,
  note,
  tone = "default",
}: {
  label: string;
  value: string;
  note?: React.ReactNode;
  tone?: "default" | "bad";
}) {
  return (
    <div className={`${cardClass} flex flex-col gap-1`}>
      <span className={mutedClass}>{label}</span>
      <span
        className={`text-2xl font-semibold tabular-nums ${
          tone === "bad" ? "text-red-700 dark:text-red-400" : ""
        }`}
      >
        {value}
      </span>
      {note}
    </div>
  );
}

function Change({ percent }: { percent: number | null }) {
  if (percent === null) return <span className={noteClass}>No sales yesterday</span>;
  const up = percent >= 0;
  return (
    <span
      className={`text-xs font-medium ${
        up ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
      }`}
    >
      {up ? "▲" : "▼"} {Math.abs(percent)}% vs yesterday
    </span>
  );
}

function Pills<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Record<T, string>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex gap-2 overflow-x-auto pb-1">
      {(Object.keys(options) as T[]).map((key) => (
        <button
          key={key}
          aria-pressed={value === key}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${
            value === key
              ? "bg-green-700 text-white"
              : "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800 dark:hover:bg-zinc-800"
          }`}
          onClick={() => onChange(key)}
        >
          {options[key]}
        </button>
      ))}
    </div>
  );
}

function Card({
  title,
  action,
  children,
  wide = false,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <section className={`${cardClass} flex flex-col gap-3 ${wide ? "lg:col-span-2" : ""}`}>
      <div className="flex min-h-9 items-center justify-between gap-3">
        <h2 className="font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

const CHART_MODES = { daily: "Last 7 days", monthly: "Last 6 months" } as const;

function SalesChart({ sales, now }: { sales: Sale[]; now: Date }) {
  const [mode, setMode] = useState<keyof typeof CHART_MODES>("daily");
  const bars =
    mode === "daily"
      ? dailyTotals(sales, now).map(({ day, totalCents }) => ({
          key: day.toISOString(),
          label: day.toLocaleDateString("en-PH", { weekday: "short" }),
          longLabel: day.toLocaleDateString("en-PH", { weekday: "long" }),
          totalCents,
        }))
      : monthlyTotals(sales, now).map(({ month, totalCents }) => ({
          key: month.toISOString(),
          label: month.toLocaleDateString("en-PH", { month: "short" }),
          longLabel: month.toLocaleDateString("en-PH", { month: "long", year: "numeric" }),
          totalCents,
        }));
  const max = Math.max(...bars.map((b) => b.totalCents), 1);

  return (
    <Card title="Sales performance">
      <Pills label="Chart range" options={CHART_MODES} value={mode} onChange={setMode} />
      <ol className="flex h-48 items-end gap-2">
        {bars.map((bar, i) => {
          const isCurrent = i === bars.length - 1;
          // Leaves headroom above the tallest bar for its peso label.
          const height = `${Math.max((bar.totalCents / max) * 85, 2)}%`;
          return (
            <li
              key={bar.key}
              className="flex h-full min-w-0 flex-1 flex-col items-center gap-1"
              aria-label={`${bar.longLabel}: ${formatPesos(bar.totalCents)}`}
            >
              <div className="relative w-full flex-1">
                <span
                  className="absolute inset-x-0 text-center text-[10px] text-zinc-600 tabular-nums dark:text-zinc-400"
                  style={{ bottom: `calc(${height} + 2px)` }}
                >
                  {bar.totalCents ? formatPesos(bar.totalCents).replace(/\.00$/, "") : ""}
                </span>
                <span
                  className={`absolute inset-x-0 bottom-0 rounded-t-md ${
                    isCurrent ? "bg-green-700" : "bg-green-200 dark:bg-green-900"
                  }`}
                  style={{ height }}
                />
              </div>
              <span className={`text-xs ${isCurrent ? "font-semibold" : "text-zinc-600 dark:text-zinc-400"}`}>
                {bar.label}
              </span>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

function ProductRows({ products, empty }: { products: Product[]; empty: string }) {
  if (products.length === 0) return <p className={mutedClass}>{empty}</p>;
  return (
    <ul className="flex flex-col gap-2">
      {products.map((p) => (
        <li key={p.id} className="flex justify-between gap-3 text-sm">
          <span className="min-w-0">{p.name}</span>
          <span
            className={`shrink-0 font-medium tabular-nums ${
              p.stock === 0 ? "text-red-700 dark:text-red-400" : "text-amber-700 dark:text-amber-400"
            }`}
          >
            {p.stock === 0 ? "0 left" : `${p.stock} left`}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function DashboardView({
  sales,
  products,
  expenses,
  orders,
  onOpen,
}: {
  sales: Sale[];
  products: Product[];
  expenses: Expense[];
  orders: PurchaseOrder[];
  onOpen: (view: Destination) => void;
}) {
  const [period, setPeriod] = useState<Period>("month");
  const [receipt, setReceipt] = useState<Sale | null>(null);
  const now = new Date();
  const today = startOfDay(now);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const salesFor = (p: Period) => summarize(salesBetween(sales, periodStart(p, now), now));
  const todaySales = salesFor("today");
  const yesterdayTotal = summarize(salesBetween(sales, yesterday, today)).totalCents;

  const periodSales = salesBetween(sales, periodStart(period, now), now);
  const revenue = summarize(periodSales).totalCents;
  const cost = costOfSales(periodSales, products);
  const grossProfit = revenue - cost.costCents;
  const expenseTotal = totalExpenses(expensesBetween(expenses, periodStart(period, now), now));
  const netProfit = grossProfit - expenseTotal;
  const stockValue = inventoryValue(products);

  const top = bestSellers(salesBetween(sales, periodStart("week", now), now));
  const lowStock = products.filter((p) => p.stock > 0 && isLowStock(p)).sort((a, b) => a.stock - b.stock);
  const outOfStock = products.filter((p) => p.stock === 0);
  const recent = sales.slice(-5).reverse();
  const pending = orders.filter((o) => o.status === "pending");
  const cashiers = salesByCashier(periodSales);

  return (
    <div className="flex flex-col gap-4">
      <section aria-label="Total sales" className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="Sales today"
          value={formatPesos(todaySales.totalCents)}
          note={<Change percent={percentChange(todaySales.totalCents, yesterdayTotal)} />}
        />
        {(["week", "month"] as const).map((p) => {
          const s = salesFor(p);
          return (
            <Stat
              key={p}
              label={`Sales, ${PERIOD_LABELS[p].toLowerCase()}`}
              value={formatPesos(s.totalCents)}
              note={<span className={noteClass}>{s.count} {s.count === 1 ? "receipt" : "receipts"}</span>}
            />
          );
        })}
      </section>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Profit and costs for</h2>
        <Pills label="Period" options={PERIOD_LABELS} value={period} onChange={setPeriod} />
      </div>
      <section aria-label="Profit and costs" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Total expenses"
          value={formatPesos(expenseTotal)}
          note={
            <button className="self-start text-xs font-medium text-green-700 dark:text-green-400" onClick={() => onOpen("expenses")}>
              Add or view expenses
            </button>
          }
        />
        <Stat
          label="Gross profit"
          value={formatPesos(grossProfit)}
          tone={grossProfit < 0 ? "bad" : "default"}
          note={
            <span className={noteClass}>
              Sales {formatPesos(revenue)} − cost of goods {formatPesos(cost.costCents)}
              {cost.missingQty > 0 && `. ${cost.missingQty} items sold have no cost price.`}
            </span>
          }
        />
        <Stat
          label="Net profit"
          value={formatPesos(netProfit)}
          tone={netProfit < 0 ? "bad" : "default"}
          note={<span className={noteClass}>Gross profit − expenses</span>}
        />
        <Stat
          label="Inventory value"
          value={formatPesos(stockValue.costCents)}
          note={
            <span className={noteClass}>
              At cost. {formatPesos(stockValue.retailCents)} at selling price
              {stockValue.missingCost > 0 &&
                `. ${stockValue.missingCost} ${stockValue.missingCost === 1 ? "product has" : "products have"} no cost price.`}
            </span>
          }
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <SalesChart sales={sales} now={now} />

        <Card title="Top-selling products, last 7 days">
          {top.length === 0 ? (
            <p className={mutedClass}>No sales in the last 7 days.</p>
          ) : (
            <ol className="flex flex-col gap-2">
              {top.map((item, i) => (
                <li key={item.name} className="flex items-center gap-3 text-sm">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-800 dark:bg-green-900/50 dark:text-green-300">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">{item.name}</span>
                  <span className="font-medium tabular-nums">{item.qty} sold</span>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <Card title="Recent transactions" action={
          sales.length > 0 && (
            <button className={secondaryButtonClass} onClick={() => onOpen("sales")}>
              All sales
            </button>
          )
        }>
          {recent.length === 0 ? (
            <p className={mutedClass}>No sales yet.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {recent.map((sale) => (
                <li key={sale.id}>
                  <button
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    onClick={() => setReceipt(sale)}
                  >
                    <span className="min-w-0">
                      <span className="font-medium">#{String(sale.number).padStart(6, "0")}</span>
                      <span className="text-zinc-600 dark:text-zinc-400">
                        {" "}
                        · {new Date(sale.createdAt).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} · {sale.cashier}
                      </span>
                    </span>
                    <span className="shrink-0 font-medium tabular-nums">{formatPesos(sale.totalCents)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title={`Pending purchase orders${pending.length ? ` (${pending.length})` : ""}`}
          action={
            <button className={secondaryButtonClass} onClick={() => onOpen("orders")}>
              {pending.length ? "View orders" : "New order"}
            </button>
          }
        >
          {pending.length === 0 ? (
            <p className={mutedClass}>No orders waiting for delivery.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {pending.map((o) => (
                <li key={o.id} className="flex justify-between gap-3 text-sm">
                  <span className="min-w-0">
                    <span className="font-medium">{orderLabel(o)}</span> · {o.supplier}
                    <span className="block text-zinc-600 dark:text-zinc-400">
                      {o.lines.reduce((sum, l) => sum + l.qty, 0)} items · ordered{" "}
                      {new Date(o.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                    </span>
                  </span>
                  <span className="shrink-0 font-medium tabular-nums">{formatPesos(o.totalCents)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title={`Low-stock alerts${lowStock.length ? ` (${lowStock.length})` : ""}`}
          action={
            lowStock.length > 0 && (
              <button className={secondaryButtonClass} onClick={() => onOpen("orders")}>
                Reorder
              </button>
            )
          }
        >
          <ProductRows products={lowStock} empty="Everything in stock has 5 or more left." />
        </Card>

        <Card
          title={`Out of stock${outOfStock.length ? ` (${outOfStock.length})` : ""}`}
          action={
            outOfStock.length > 0 && (
              <button className={secondaryButtonClass} onClick={() => onOpen("orders")}>
                Reorder
              </button>
            )
          }
        >
          <ProductRows products={outOfStock} empty="Nothing is out of stock." />
        </Card>

        <Card title={`Sales by cashier, ${PERIOD_LABELS[period].toLowerCase()}`} wide>
          {cashiers.length === 0 ? (
            <p className={mutedClass}>No sales in this period.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {cashiers.map((c) => (
                <li key={c.cashier} className="flex justify-between gap-3 text-sm">
                  <span className="min-w-0 font-medium">{c.cashier}</span>
                  <span className="shrink-0 tabular-nums">
                    {formatPesos(c.totalCents)}{" "}
                    <span className="text-zinc-600 dark:text-zinc-400">
                      ({c.count} {c.count === 1 ? "sale" : "sales"})
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {receipt && <Receipt sale={receipt} closeLabel="Close" onClose={() => setReceipt(null)} />}
    </div>
  );
}
