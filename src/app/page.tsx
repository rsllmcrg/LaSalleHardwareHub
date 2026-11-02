const sections = [
  {
    title: "Inventory",
    description: "Track stock levels, reorder points, and supplier lead times.",
  },
  {
    title: "Orders",
    description: "Manage customer and contractor orders from quote to pickup.",
  },
  {
    title: "Suppliers",
    description: "Keep vendor contacts, pricing, and purchase history in one place.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <span className="text-lg font-semibold tracking-tight">
            LaSalle Hardware Hub
          </span>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
            Live
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-16">
        <section className="flex flex-col gap-4">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Your hardware store, organized.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            LaSalle Hardware Hub is the central place for inventory, orders, and
            supplier management. This is the initial deployment. Features are on
            the way.
          </p>
        </section>

        <section className="grid gap-6 sm:grid-cols-3">
          {sections.map((s) => (
            <div
              key={s.title}
              className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h2 className="text-base font-semibold">{s.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {s.description}
              </p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-zinc-200 px-6 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800">
        LaSalle Hardware Hub
      </footer>
    </div>
  );
}
