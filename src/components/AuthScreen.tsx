"use client";

import { useState, type FormEvent } from "react";
import { createOwner, login } from "@/lib/store";
import {
  cardClass,
  errorClass,
  errorMessage,
  inputClass,
  primaryButtonClass,
} from "./ui";

export default function AuthScreen({ needsOwner }: { needsOwner: boolean }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await (needsOwner ? createOwner : login)(username, password);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 p-4 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <form
        onSubmit={handleSubmit}
        className={`${cardClass} flex w-full max-w-sm flex-col gap-4`}
      >
        <div className="text-center">
          <h1>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt="LaSalle Hardware Hub"
              className="mx-auto w-56 rounded-lg bg-white p-2"
            />
          </h1>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            {needsOwner
              ? "Create the owner account to get started."
              : "Log in to continue."}
          </p>
        </div>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Username
          <input
            className={inputClass}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoCapitalize="none"
            autoComplete="username"
            autoFocus
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
            autoComplete={needsOwner ? "new-password" : "current-password"}
            required
          />
        </label>
        {error && <p className={errorClass}>{error}</p>}
        <button className={primaryButtonClass} disabled={busy}>
          {needsOwner ? "Create owner account" : "Log in"}
        </button>
      </form>
    </main>
  );
}
