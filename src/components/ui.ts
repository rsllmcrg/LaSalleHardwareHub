export const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/30 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";

export const primaryButtonClass =
  "rounded-lg bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50";

export const secondaryButtonClass =
  "rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800";

export const dangerButtonClass =
  "rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950";

export const cardClass =
  "rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900";

export const errorClass = "text-sm text-red-700 dark:text-red-400";

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}
