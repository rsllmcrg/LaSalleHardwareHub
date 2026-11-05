"use client";

import { useState } from "react";
import { isLowStock, type Cart } from "@/lib/pos";
import { logout, useStore } from "@/lib/store";
import AuthScreen from "./AuthScreen";
import Logo from "./Logo";
import ProductsView from "./ProductsView";
import SalesView from "./SalesView";
import SellView from "./SellView";
import UsersView from "./UsersView";

type View = "sell" | "products" | "sales" | "users";

const VIEWS: { id: View; label: string; ownerOnly: boolean }[] = [
  { id: "sell", label: "Sell", ownerOnly: false },
  { id: "products", label: "Products", ownerOnly: false },
  { id: "sales", label: "Sales", ownerOnly: true },
  { id: "users", label: "Users", ownerOnly: true },
];

export default function PosApp() {
  const store = useStore();
  const [view, setView] = useState<View>("sell");
  const [cart, setCart] = useState<Cart>({});

  if (!store) return null;
  if (!store.session) {
    return <AuthScreen needsOwner={store.users.length === 0} />;
  }

  const isOwner = store.session.role === "owner";
  const lowStock = store.products.filter(isLowStock);

  function handleLogout() {
    setView("sell");
    setCart({});
    logout();
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="bg-green-800 px-4 py-3 text-white dark:bg-green-950">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <Logo />
          <nav className="order-last flex w-full gap-1 overflow-x-auto md:order-none md:w-auto md:flex-1">
            {VIEWS.filter((v) => isOwner || !v.ownerOnly).map((v) => (
              <button
                key={v.id}
                aria-current={view === v.id ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  view === v.id
                    ? "bg-white text-green-800"
                    : "hover:bg-white/15"
                }`}
                onClick={() => setView(v.id)}
              >
                {v.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-green-100">
              {store.session.username} ({store.session.role})
            </span>
            <button
              className="rounded-lg border border-white/50 px-3 py-2 text-sm font-medium hover:bg-white/15"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 p-4">
        {lowStock.length > 0 && (
          <p
            role="status"
            className="rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-900 dark:bg-amber-900/40 dark:text-amber-200"
          >
            Low stock: {lowStock.map((p) => `${p.name} (${p.stock})`).join(", ")}
          </p>
        )}
        {view === "sell" && (
          <SellView products={store.products} cart={cart} setCart={setCart} />
        )}
        {view === "products" && (
          <ProductsView products={store.products} canManage={isOwner} />
        )}
        {view === "sales" && <SalesView sales={store.sales} />}
        {view === "users" && <UsersView users={store.users} />}
      </main>
    </div>
  );
}
