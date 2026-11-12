"use client";

import { useState } from "react";
import { isLowStock, type Cart } from "@/lib/pos";
import { logout, useStore } from "@/lib/store";
import AuthScreen from "./AuthScreen";
import DashboardView from "./DashboardView";
import ExpensesView from "./ExpensesView";
import Logo from "./Logo";
import OrdersView from "./OrdersView";
import ProductsView from "./ProductsView";
import SalesView from "./SalesView";
import SellView from "./SellView";
import UsersView from "./UsersView";

type View = "dashboard" | "sell" | "products" | "orders" | "expenses" | "sales" | "users";

const VIEWS: { id: View; label: string; ownerOnly: boolean }[] = [
  { id: "dashboard", label: "Dashboard", ownerOnly: true },
  { id: "sell", label: "Sell", ownerOnly: false },
  { id: "products", label: "Products", ownerOnly: false },
  { id: "orders", label: "Orders", ownerOnly: true },
  { id: "expenses", label: "Expenses", ownerOnly: true },
  { id: "sales", label: "Sales", ownerOnly: true },
  { id: "users", label: "Users", ownerOnly: true },
];

export default function PosApp() {
  const store = useStore();
  // Null until someone picks a tab, so each role lands on its own home screen.
  const [chosenView, setView] = useState<View | null>(null);
  const [cart, setCart] = useState<Cart>({});

  if (!store) return null;
  if (!store.session) {
    return <AuthScreen needsOwner={store.users.length === 0} />;
  }

  const isOwner = store.session.role === "owner";
  const view = chosenView ?? (isOwner ? "dashboard" : "sell");
  const lowStock = store.products.filter(isLowStock);

  function handleLogout() {
    setView(null);
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
        {view === "dashboard" && (
          <DashboardView
            sales={store.sales}
            products={store.products}
            expenses={store.expenses}
            orders={store.purchaseOrders}
            onOpen={setView}
          />
        )}
        {view === "sell" && (
          <SellView products={store.products} cart={cart} setCart={setCart} />
        )}
        {view === "products" && (
          <ProductsView products={store.products} canManage={isOwner} />
        )}
        {view === "orders" && (
          <OrdersView products={store.products} orders={store.purchaseOrders} />
        )}
        {view === "expenses" && <ExpensesView expenses={store.expenses} />}
        {view === "sales" && <SalesView sales={store.sales} />}
        {view === "users" && <UsersView users={store.users} />}
      </main>
    </div>
  );
}
