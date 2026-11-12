"use client";

import { useState, type FormEvent } from "react";
import { localDateKey, totalExpenses } from "@/lib/dashboard";
import {
  EXPENSE_CATEGORIES,
  formatPesos,
  parsePesos,
  type Expense,
  type ExpenseCategory,
} from "@/lib/pos";
import { addExpense, deleteExpense } from "@/lib/store";
import {
  cardClass,
  dangerButtonClass,
  errorClass,
  errorMessage,
  inputClass,
  primaryButtonClass,
} from "./ui";

export default function ExpensesView({ expenses }: { expenses: Expense[] }) {
  const today = localDateKey(new Date());
  const [date, setDate] = useState(today);
  const [category, setCategory] = useState<ExpenseCategory>("Rent");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [month, setMonth] = useState(today.slice(0, 7));

  const monthExpenses = expenses
    .filter((e) => e.date.startsWith(month))
    .sort((a, b) => b.date.localeCompare(a.date));

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const amountCents = parsePesos(amount);
    if (amountCents === null || amountCents === 0) {
      setError("Enter a valid amount, like 1500 or 1500.50.");
      return;
    }
    try {
      addExpense({ date, category, description, amountCents });
      setDescription("");
      setAmount("");
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <form
        onSubmit={handleSubmit}
        aria-label="Add expense"
        className={`${cardClass} grid gap-3 sm:grid-cols-[10rem_10rem_1fr]`}
      >
        <h2 className="font-semibold sm:col-span-3">Add expense</h2>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Date
          <input
            className={inputClass}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Category
          <select
            className={inputClass}
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          What for
          <input
            className={inputClass}
            placeholder="e.g. Meralco bill"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Amount (₱)
          <input
            className={inputClass}
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </label>
        {error && <p className={`${errorClass} sm:col-span-3`}>{error}</p>}
        <button className={`${primaryButtonClass} self-end sm:col-span-2 sm:justify-self-start`}>
          Add expense
        </button>
      </form>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Month
          <input
            className={inputClass}
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </label>
        <div className="text-right">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {monthExpenses.length} {monthExpenses.length === 1 ? "expense" : "expenses"}
          </p>
          <p className="text-xl font-semibold">{formatPesos(totalExpenses(monthExpenses))}</p>
        </div>
      </div>

      {monthExpenses.length === 0 && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">No expenses in this month.</p>
      )}
      <ul className="flex flex-col gap-2">
        {monthExpenses.map((e) => (
          <li key={e.id} className={`${cardClass} flex flex-wrap items-center gap-x-4 gap-y-2`}>
            <div className="min-w-40 flex-1">
              <p className="font-medium">{e.description}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {new Date(`${e.date}T00:00`).toLocaleDateString("en-PH", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                · {e.category}
              </p>
            </div>
            <span className="font-medium tabular-nums">{formatPesos(e.amountCents)}</span>
            <button
              className={dangerButtonClass}
              aria-label={`Delete ${e.description}`}
              onClick={() => {
                if (window.confirm(`Delete ${e.description}?`)) deleteExpense(e.id);
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
