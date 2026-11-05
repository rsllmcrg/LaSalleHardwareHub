import { CATEGORIES, type Category, type Product } from "@/lib/pos";

export default function CategoryTabs({
  products,
  active,
  onChange,
}: {
  products: Product[];
  active: Category | "All";
  onChange: (category: Category | "All") => void;
}) {
  const used = CATEGORIES.filter((c) => products.some((p) => p.category === c));

  return (
    <div role="group" aria-label="Category" className="flex gap-2 overflow-x-auto pb-1">
      {(["All", ...used] as const).map((category) => (
        <button
          key={category}
          aria-pressed={active === category}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${
            active === category
              ? "bg-green-700 text-white"
              : "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800 dark:hover:bg-zinc-800"
          }`}
          onClick={() => onChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
