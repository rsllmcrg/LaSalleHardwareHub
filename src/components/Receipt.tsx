import { DISCOUNT_PERCENT, formatPesos, type Sale } from "@/lib/pos";
import { primaryButtonClass } from "./ui";

function Row({ label, cents }: { label: string; cents: number }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span>{formatPesos(cents)}</span>
    </div>
  );
}

export default function Receipt({
  sale,
  closeLabel,
  onClose,
}: {
  sale: Sale;
  closeLabel: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-label={`Receipt ${sale.number}`}
        className="flex max-h-full w-full max-w-sm flex-col gap-3 overflow-y-auto rounded-xl bg-white p-5 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
      >
        <div className="text-center">
          <h2 className="text-lg font-semibold">LaSalle Hardware Hub</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Receipt #{String(sale.number).padStart(6, "0")}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {new Date(sale.createdAt).toLocaleString("en-PH")}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Cashier: {sale.cashier}
          </p>
        </div>

        <ul className="flex flex-col gap-2 border-y border-dashed border-zinc-300 py-3 text-sm dark:border-zinc-700">
          {sale.lines.map((line) => (
            <li key={line.productId} className="flex justify-between gap-4">
              <span>
                {line.name}
                <span className="block text-zinc-600 dark:text-zinc-400">
                  {line.qty} × {formatPesos(line.priceCents)}
                </span>
              </span>
              <span>{formatPesos(line.priceCents * line.qty)}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-1 text-sm">
          <Row label="Subtotal" cents={sale.subtotalCents} />
          {sale.discountCents > 0 && (
            <Row
              label={`Senior/PWD discount (${DISCOUNT_PERCENT}%)`}
              cents={-sale.discountCents}
            />
          )}
          <div className="text-base font-semibold">
            <Row label="Total" cents={sale.totalCents} />
          </div>
          <Row label="Cash" cents={sale.cashCents} />
          <Row label="Change" cents={sale.changeCents} />
        </div>

        <button className={primaryButtonClass} onClick={onClose}>
          {closeLabel}
        </button>
      </div>
    </div>
  );
}
