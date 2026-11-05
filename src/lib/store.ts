import { useSyncExternalStore } from "react";
import { checkout, type Cart, type Product, type Sale, type User } from "./pos";

const STORAGE_KEY = "lasalle-hardware-hub.v1";
const PBKDF2_ITERATIONS = 100_000;
const MIN_PASSWORD_LENGTH = 6;

type StoreData = {
  users: User[];
  products: Product[];
  sales: Sale[];
  // Missing on stores saved before the extra sample products were added.
  sampleVersion?: number;
};

export type Snapshot = StoreData & { session: User | null };

const FIRST_SAMPLE_PRODUCTS: Omit<Product, "id">[] = [
  {
    name: "Claw Hammer 16oz",
    priceCents: 35000,
    stock: 12,
    category: "Tools",
    image: "/products/hammer.jpg",
  },
  {
    name: "Common Nails 2in (1kg)",
    priceCents: 9500,
    stock: 40,
    category: "Fasteners",
    image: "/products/nails.jpg",
  },
  {
    name: "Wood Screws 1in (100pcs)",
    priceCents: 12000,
    stock: 25,
    category: "Fasteners",
    image: "/products/screws.jpg",
  },
  {
    name: "Flathead Screwdriver",
    priceCents: 8500,
    stock: 18,
    category: "Tools",
    image: "/products/screwdriver.jpg",
  },
  {
    name: "Latex Paint White 4L",
    priceCents: 62000,
    stock: 8,
    category: "Paint",
    image: "/products/paint.jpg",
  },
  {
    name: "Paint Brush 2in",
    priceCents: 6500,
    stock: 3,
    category: "Paint",
    image: "/products/brush.jpg",
  },
  {
    name: "Measuring Tape 5m",
    priceCents: 14500,
    stock: 15,
    category: "Tools",
    image: "/products/tape.jpg",
  },
  {
    name: "PVC Pipe 1/2in x 3m",
    priceCents: 11000,
    stock: 4,
    category: "Plumbing",
    image: "/products/pipe.jpg",
  },
];

// Added after the first release; stores saved before then get these once.
const MORE_SAMPLE_PRODUCTS: Omit<Product, "id">[] = [
  {
    name: "Adjustable Wrench 10in",
    priceCents: 32000,
    stock: 10,
    category: "Tools",
    image: "/products/wrench.jpg",
  },
  {
    name: "Combination Pliers 8in",
    priceCents: 27500,
    stock: 14,
    category: "Tools",
    image: "/products/pliers.jpg",
  },
  {
    name: "Phillips Screwdriver",
    priceCents: 8500,
    stock: 20,
    category: "Tools",
    image: "/products/phillips.jpg",
  },
  {
    name: "Hacksaw 12in",
    priceCents: 29000,
    stock: 7,
    category: "Tools",
    image: "/products/hacksaw.jpg",
  },
  {
    name: "Pruning Saw 10in",
    priceCents: 38000,
    stock: 5,
    category: "Tools",
    image: "/products/pruning-saw.jpg",
  },
  {
    name: "Utility Knife 18mm",
    priceCents: 7500,
    stock: 30,
    category: "Tools",
    image: "/products/utility-knife.jpg",
  },
  {
    name: "Wood Chisel 3/4in",
    priceCents: 22000,
    stock: 6,
    category: "Tools",
    image: "/products/chisel.jpg",
  },
  {
    name: "Allen Key Set (8pcs)",
    priceCents: 15500,
    stock: 12,
    category: "Tools",
    image: "/products/allen-keys.jpg",
  },
  {
    name: "Spirit Level 24in",
    priceCents: 34500,
    stock: 6,
    category: "Tools",
    image: "/products/level.jpg",
  },
  {
    name: "Pipe Wrench 14in",
    priceCents: 48000,
    stock: 4,
    category: "Tools",
    image: "/products/pipe-wrench.jpg",
  },
  {
    name: "Wire Stripper",
    priceCents: 26000,
    stock: 9,
    category: "Tools",
    image: "/products/wire-stripper.jpg",
  },
  {
    name: "Cordless Drill 12V",
    priceCents: 245000,
    stock: 3,
    category: "Tools",
    image: "/products/drill.jpg",
  },
  {
    name: "Hex Bolt & Nut M12 (10pcs)",
    priceCents: 9000,
    stock: 35,
    category: "Fasteners",
    image: "/products/bolts.jpg",
  },
  {
    name: "Thread Seal Tape",
    priceCents: 3500,
    stock: 50,
    category: "Plumbing",
    image: "/products/ptfe-tape.jpg",
  },
  {
    name: "Electrical Tape",
    priceCents: 4500,
    stock: 40,
    category: "Electrical",
    image: "/products/electrical-tape.jpg",
  },
  {
    name: "LED Bulb 9W",
    priceCents: 12500,
    stock: 24,
    category: "Electrical",
    image: "/products/bulb.jpg",
  },
  {
    name: "Extension Cord Reel 10m",
    priceCents: 89000,
    stock: 4,
    category: "Electrical",
    image: "/products/extension-cord.jpg",
  },
];

const SAMPLE_PRODUCTS = [...FIRST_SAMPLE_PRODUCTS, ...MORE_SAMPLE_PRODUCTS];
const SAMPLE_VERSION = 2;

function seedData(): StoreData {
  return {
    users: [],
    products: SAMPLE_PRODUCTS.map((p) => ({ ...p, id: crypto.randomUUID() })),
    sales: [],
    sampleVersion: SAMPLE_VERSION,
  };
}

// Saved right away so the new products keep the same ids on every read.
function addMoreSamples(data: StoreData): StoreData {
  const names = new Set(data.products.map((p) => p.name.toLowerCase()));
  const next = {
    ...data,
    products: [
      ...data.products,
      ...MORE_SAMPLE_PRODUCTS.filter((s) => !names.has(s.name.toLowerCase())).map(
        (s) => ({ ...s, id: crypto.randomUUID() }),
      ),
    ],
    sampleVersion: SAMPLE_VERSION,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage is full; try again on a later read rather than hand out ids that change.
    return data;
  }
  return next;
}

// Products saved before categories and photos existed get them filled in here.
function withCategoryAndImage(
  product: Omit<Product, "category" | "image"> & Partial<Product>,
): Product {
  const sample = SAMPLE_PRODUCTS.find((s) => s.name === product.name);
  return {
    category: sample?.category ?? "Other",
    ...product,
    // The sample pictures were drawings saved as .svg before they became photos.
    image: product.image?.replace(/\.svg$/, ".jpg") ?? sample?.image ?? null,
  };
}

function readData(): StoreData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seedData();
  try {
    const parsed = JSON.parse(raw) as StoreData;
    const data = { ...parsed, products: parsed.products.map(withCategoryAndImage) };
    return (data.sampleVersion ?? 1) < SAMPLE_VERSION ? addMoreSamples(data) : data;
  } catch {
    // Keep the unreadable copy so a corrupted save can still be recovered by hand.
    localStorage.setItem(`${STORAGE_KEY}.corrupt`, raw);
    return seedData();
  }
}

let session: User | null = null;
let snapshot: Snapshot | null = null;
const listeners = new Set<() => void>();

function publish(data: StoreData) {
  snapshot = { ...data, session };
  listeners.forEach((listener) => listener());
}

// Re-reads before every write so a second open tab cannot overwrite newer data.
function write(change: (data: StoreData) => StoreData) {
  const next = change(readData());
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (err) {
    if (err instanceof DOMException && err.name === "QuotaExceededError") {
      throw new Error("Storage is full. Remove some product photos and try again.");
    }
    throw err;
  }
  publish(next);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  snapshot ??= { ...readData(), session };
  return snapshot;
}

export function useStore(): Snapshot | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string) {
  return Uint8Array.from(hex.match(/../g) ?? [], (b) => parseInt(b, 16));
}

async function hashPassword(password: string, salt: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: fromHex(salt),
      iterations: PBKDF2_ITERATIONS,
    },
    key,
    256,
  );
  return toHex(new Uint8Array(bits));
}

async function buildUser(
  username: string,
  password: string,
  role: User["role"],
): Promise<User> {
  const name = username.trim().toLowerCase();
  if (!name) throw new Error("Enter a username.");
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    );
  }
  if (readData().users.some((u) => u.username === name)) {
    throw new Error("That username is already taken.");
  }
  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
  return {
    id: crypto.randomUUID(),
    username: name,
    role,
    salt,
    passwordHash: await hashPassword(password, salt),
  };
}

export async function createOwner(username: string, password: string) {
  if (readData().users.length > 0) {
    throw new Error("An owner account already exists.");
  }
  const owner = await buildUser(username, password, "owner");
  session = owner;
  write((data) => ({ ...data, users: [owner] }));
}

export async function login(username: string, password: string) {
  const name = username.trim().toLowerCase();
  const data = readData();
  const user = data.users.find((u) => u.username === name);
  const hash = user && (await hashPassword(password, user.salt));
  if (!user || hash !== user.passwordHash) {
    throw new Error("Wrong username or password.");
  }
  session = user;
  publish(data);
}

export function logout() {
  session = null;
  publish(readData());
}

export async function addCashier(username: string, password: string) {
  const cashier = await buildUser(username, password, "cashier");
  write((data) => ({ ...data, users: [...data.users, cashier] }));
}

export function removeCashier(id: string) {
  write((data) => ({
    ...data,
    users: data.users.filter((u) => u.id !== id || u.role !== "cashier"),
  }));
}

export function saveProduct(
  fields: Omit<Product, "id">,
  id: string | null,
): void {
  const name = fields.name.trim();
  if (!name) throw new Error("Enter a product name.");
  const duplicate = readData().products.some(
    (p) => p.id !== id && p.name.toLowerCase() === name.toLowerCase(),
  );
  if (duplicate) throw new Error("A product with that name already exists.");

  write((data) => ({
    ...data,
    products: id
      ? data.products.map((p) =>
          p.id === id ? { ...fields, name, id } : p,
        )
      : [...data.products, { ...fields, name, id: crypto.randomUUID() }],
  }));
}

export function deleteProduct(id: string) {
  write((data) => ({
    ...data,
    products: data.products.filter((p) => p.id !== id),
  }));
}

export function completeSale(
  cart: Cart,
  discounted: boolean,
  cashCents: number,
): Sale {
  if (!session) throw new Error("Log in first.");
  const cashier = session.username;
  let sale: Sale | undefined;
  write((data) => {
    const result = checkout({
      products: data.products,
      sales: data.sales,
      cart,
      discounted,
      cashCents,
      cashier,
      id: crypto.randomUUID(),
      now: new Date(),
    });
    sale = result.sale;
    return {
      ...data,
      products: result.products,
      sales: [...data.sales, result.sale],
    };
  });
  return sale!;
}
