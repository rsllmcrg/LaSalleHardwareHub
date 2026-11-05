"use client";

import { useState } from "react";
import { formatPesos, type Sale } from "@/lib/pos";
import Receipt from "./Receipt";
import { cardClass, inputClass } from "./ui";

function localDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export default function SalesView({ sales }: { sales: Sale[] }) {
  const [day, setDay] = useState(() => localDate(new Date()));
  const [selected, setSelected] = useState<Sale | null>(null);

  const daySales = sales
    .filter((sale) => localDate(new Date(sale.createdAt)) === day)
    .reverse();
  const dayTotal = daySales.reduce((sum, sale) => sum + sale.totalCents, 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Date
          <input
            className={inputClass}
            type="date"
            value={day}
            onChange={(e) => setDay(e.target.value)}
          />
        </label>
        <div className="text-right">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {daySales.length} {daySales.length === 1 ? "sale" : "sales"}
          </p>
          <p className="text-xl font-semibold">{formatPesos(dayTotal)}</p>
        </div>
      </div>

      {daySales.length === 0 && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          No sales on this date.
        </p>
      )}
      <ul className="flex flex-col gap-2">
        {daySales.map((sale) => (
          <li key={sale.id}>
            <button
              className={`${cardClass} flex w-full items-center justify-between gap-4 text-left hover:border-green-600`}
              onClick={() => setSelected(sale)}
            >
              <span>
                <span className="block font-medium">
                  #{String(sale.number).padStart(6, "0")}
                </span>
                <span className="block text-sm text-zinc-600 dark:text-zinc-400">
                  {new Date(sale.createdAt).toLocaleTimeString("en-PH")} ·{" "}
                  {sale.cashier}
                </span>
              </span>
              <span className="font-medium">{formatPesos(sale.totalCents)}</span>
            </button>
          </li>
        ))}
      </ul>

      {selected && (
        <Receipt
          sale={selected}
          closeLabel="Close"
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
