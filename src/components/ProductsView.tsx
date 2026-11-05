"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { resizePhoto } from "@/lib/image";
import {
  CATEGORIES,
  filterProducts,
  formatPesos,
  isLowStock,
  parsePesos,
  type Category,
  type Product,
} from "@/lib/pos";
import { PHOTO_CREDITS } from "@/lib/photoCredits";
import { deleteProduct, saveProduct } from "@/lib/store";
import CategoryTabs from "./CategoryTabs";
import ProductImage from "./ProductImage";
import {
  cardClass,
  dangerButtonClass,
  errorClass,
  errorMessage,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "./ui";

function ProductForm({
  product,
  onDone,
}: {
  product: Product | null;
  onDone: () => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(
    product ? (product.priceCents / 100).toFixed(2) : "",
  );
  const [stock, setStock] = useState(product ? String(product.stock) : "");
  const [category, setCategory] = useState<Category>(
    product?.category ?? "Tools",
  );
  const [image, setImage] = useState(product?.image ?? null);
  const [error, setError] = useState("");

  async function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setImage(await resizePhoto(file));
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const priceCents = parsePesos(price);
    if (priceCents === null) {
      setError("Enter a valid price, like 350 or 350.50.");
      return;
    }
    if (!/^\d{1,6}$/.test(stock.trim())) {
      setError("Stock must be a whole number.");
      return;
    }
    try {
      saveProduct(
        { name, priceCents, stock: Number(stock), category, image },
        product?.id ?? null,
      );
      onDone();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label={product ? "Edit product" : "Add product"}
      className={`${cardClass} grid gap-3 sm:grid-cols-[1fr_9rem_7rem]`}
    >
      <label className="flex flex-col gap-1 text-sm font-medium">
        Name
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Price (₱)
        <input
          className={inputClass}
          inputMode="decimal"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Stock
        <input
          className={inputClass}
          inputMode="numeric"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Category
        <select
          className={inputClass}
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <div className="flex items-center gap-3 sm:col-span-2">
        <ProductImage image={image} className="size-16 shrink-0" />
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm font-medium">
          Photo
          <input
            className="text-sm font-normal file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:font-medium dark:file:bg-zinc-800"
            type="file"
            accept="image/*"
            onChange={handlePhoto}
          />
        </label>
        {image && (
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={() => setImage(null)}
          >
            Remove photo
          </button>
        )}
      </div>
      {error && <p className={`${errorClass} sm:col-span-3`}>{error}</p>}
      <div className="flex gap-2 sm:col-span-3">
        <button className={primaryButtonClass}>Save</button>
        <button
          type="button"
          className={secondaryButtonClass}
          onClick={onDone}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function ProductsView({
  products,
  canManage,
}: {
  products: Product[];
  canManage: boolean;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");
  const [editing, setEditing] = useState<Product | "new" | null>(null);

  const matches = filterProducts(products, search, category);

  function handleDelete(product: Product) {
    if (window.confirm(`Delete ${product.name}?`)) {
      deleteProduct(product.id);
      if (editing !== "new" && editing?.id === product.id) setEditing(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          className={inputClass}
          type="search"
          placeholder="Search product"
          aria-label="Search product"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {canManage && (
          <button
            className={`${primaryButtonClass} shrink-0`}
            onClick={() => setEditing("new")}
          >
            Add product
          </button>
        )}
      </div>
      <CategoryTabs
        products={products}
        active={category}
        onChange={setCategory}
      />

      {editing && (
        <ProductForm
          key={editing === "new" ? "new" : editing.id}
          product={editing === "new" ? null : editing}
          onDone={() => setEditing(null)}
        />
      )}

      {matches.length === 0 && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          No products found.
        </p>
      )}
      <ul className="flex flex-col gap-2">
        {matches.map((product) => (
          <li
            key={product.id}
            className={`${cardClass} flex flex-wrap items-center gap-x-4 gap-y-2`}
          >
            <ProductImage image={product.image} className="size-14 shrink-0" />
            <div className="min-w-40 flex-1">
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {formatPesos(product.priceCents)} · {product.category}
              </p>
            </div>
            <span
              className={`text-sm ${
                isLowStock(product)
                  ? "font-medium text-amber-700 dark:text-amber-400"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              {product.stock} left{isLowStock(product) && " · Low stock"}
            </span>
            {canManage && (
              <div className="flex gap-2">
                <button
                  className={secondaryButtonClass}
                  aria-label={`Edit ${product.name}`}
                  onClick={() => setEditing(product)}
                >
                  Edit
                </button>
                <button
                  className={dangerButtonClass}
                  aria-label={`Delete ${product.name}`}
                  onClick={() => handleDelete(product)}
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <details className="text-sm text-zinc-600 dark:text-zinc-400">
        <summary className="cursor-pointer">Photo credits</summary>
        <ul className="mt-2 flex flex-col gap-1">
          {PHOTO_CREDITS.map((credit) => (
            <li key={credit.item}>
              {credit.item}:{" "}
              <a className="underline" href={credit.source}>
                photo
              </a>{" "}
              by {credit.author},{" "}
              {credit.licenseUrl ? (
                <a className="underline" href={credit.licenseUrl}>
                  {credit.license}
                </a>
              ) : (
                credit.license
              )}
              , edited
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
