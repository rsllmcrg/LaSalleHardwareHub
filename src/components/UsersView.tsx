"use client";

import { useState, type FormEvent } from "react";
import type { User } from "@/lib/pos";
import { addCashier, removeCashier } from "@/lib/store";
import {
  cardClass,
  dangerButtonClass,
  errorClass,
  errorMessage,
  inputClass,
  primaryButtonClass,
} from "./ui";

export default function UsersView({ users }: { users: User[] }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await addCashier(username, password);
      setUsername("");
      setPassword("");
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="flex max-w-xl flex-col gap-3">
      <form
        onSubmit={handleSubmit}
        aria-label="Add cashier"
        className={`${cardClass} flex flex-col gap-3`}
      >
        <h2 className="font-semibold">Add cashier</h2>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Username
          <input
            className={inputClass}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoCapitalize="none"
            autoComplete="off"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Password
          <input
            className={inputClass}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>
        {error && <p className={errorClass}>{error}</p>}
        <button className={`${primaryButtonClass} self-start`}>Add cashier</button>
      </form>

      <ul className="flex flex-col gap-2">
        {users.map((user) => (
          <li
            key={user.id}
            className={`${cardClass} flex items-center justify-between gap-4`}
          >
            <span>
              <span className="block font-medium">{user.username}</span>
              <span className="block text-sm capitalize text-zinc-600 dark:text-zinc-400">
                {user.role}
              </span>
            </span>
            {user.role === "cashier" && (
              <button
                className={dangerButtonClass}
                aria-label={`Remove ${user.username}`}
                onClick={() => {
                  if (window.confirm(`Remove ${user.username}?`)) {
                    removeCashier(user.id);
                  }
                }}
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
