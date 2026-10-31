import { useEffect, useState } from "react";

export type ItemType = "lost" | "found";
export type ItemStatus = "open" | "returned";
export const CATEGORIES = ["Watches", "Wallets", "ID Cards", "Earphones", "Bags", "Books", "Electronics", "Other"] as const;
export const LOCATIONS = ["Library", "Cafeteria", "Main Auditorium", "Sports Complex", "Engineering Block", "Hostel A", "Parking Lot", "Lecture Hall 3"] as const;

export interface Item {
  id: string;
  type: ItemType;
  status: ItemStatus;
  name: string;
  category: string;
  description: string;
  location: string;
  date: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string | undefined;
  photo?: string | undefined;
  createdAt: number;
}

const u = (id: string) => `https://images.unsplash.com/${id}?w=800&h=600&fit=crop&auto=format`;

export const DEMO_ITEMS: Item[] = [
  { id: "d1", type: "lost", status: "open", name: "Silver Casio Wristwatch", category: "Watches", description: "Silver metal strap, digital display with a small scratch on the glass. Sentimental value — a gift from my dad.", location: "Sports Complex", date: "2026-10-28", contactName: "Arjun Mehta", contactEmail: "arjun.m@campus.edu", contactPhone: "+91 98765 43210", photo: u("photo-1523275335684-37898b6baf30"), createdAt: 10 },
  { id: "d2", type: "found", status: "open", name: "Brown Leather Wallet", category: "Wallets", description: "Found near the coffee counter. Contains a few cards; no cash. Describe the cards to claim.", location: "Cafeteria", date: "2026-10-29", contactName: "Priya Nair", contactEmail: "priya.n@campus.edu", photo: u("photo-1627123424574-724758594e93"), createdAt: 9 },
  { id: "d3", type: "lost", status: "open", name: "Student ID Card", category: "ID Cards", description: "Blue lanyard with college ID, name Rahul S., Computer Science 3rd year.", location: "Library", date: "2026-10-30", contactName: "Rahul Sharma", contactEmail: "rahul.s@campus.edu", photo: u("photo-1633265486064-086b219458ec"), createdAt: 8 },
  { id: "d4", type: "found", status: "open", name: "White Wireless Earbuds", category: "Earphones", description: "White earbuds in a charging case, left on a desk in row 4.", location: "Lecture Hall 3", date: "2026-10-27", contactName: "Sneha Iyer", contactEmail: "sneha.i@campus.edu", photo: u("photo-1590658268037-6bf12165a8df"), createdAt: 7 },
  { id: "d5", type: "lost", status: "open", name: "Black Laptop Backpack", category: "Bags", description: "Black backpack with a red keychain. Has a calculus textbook and charger inside.", location: "Engineering Block", date: "2026-10-26", contactName: "Vikram Rao", contactEmail: "vikram.r@campus.edu", photo: u("photo-1553062407-98eeb64c6a62"), createdAt: 6 },
  { id: "d6", type: "found", status: "returned", name: "Data Structures Textbook", category: "Books", description: "Cormen 'Introduction to Algorithms', name written on the first page.", location: "Library", date: "2026-10-22", contactName: "Ananya Das", contactEmail: "ananya.d@campus.edu", photo: u("photo-1544947950-fa07a98d237f"), createdAt: 5 },
  { id: "d7", type: "found", status: "open", name: "Analog Watch with Leather Strap", category: "Watches", description: "Gold dial, brown leather strap. Found on a bench outside.", location: "Main Auditorium", date: "2026-10-25", contactName: "Karan Gupta", contactEmail: "karan.g@campus.edu", photo: u("photo-1524592094714-0f0654e20314"), createdAt: 4 },
  { id: "d8", type: "lost", status: "returned", name: "Wired Earphones", category: "Earphones", description: "Black wired earphones with a mic, tangled in a small pouch.", location: "Hostel A", date: "2026-10-20", contactName: "Meera Pillai", contactEmail: "meera.p@campus.edu", photo: u("photo-1484704849700-f032a568e944"), createdAt: 3 },
  { id: "d9", type: "lost", status: "open", name: "Canvas Tote Bag", category: "Bags", description: "Beige tote with a sunflower print. Contains notebooks.", location: "Parking Lot", date: "2026-10-24", contactName: "Isha Kapoor", contactEmail: "isha.k@campus.edu", photo: u("photo-1544816155-12df9643f363"), createdAt: 2 },
  { id: "d10", type: "found", status: "open", name: "Library Card & Bus Pass", category: "ID Cards", description: "Two cards in a clear sleeve, found on the stairs.", location: "Engineering Block", date: "2026-10-30", contactName: "Rohan Joshi", contactEmail: "rohan.j@campus.edu", createdAt: 1 },
];

const KEY = "campus-lf-items-v1";
const EVT = "campus-lf-change";

function read(): Item[] {
  if (typeof window === "undefined") return DEMO_ITEMS;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEMO_ITEMS;
}
function write(items: Item[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVT));
}

export function addItem(data: Omit<Item, "id" | "createdAt" | "status">): Item {
  const item: Item = { ...data, id: crypto.randomUUID().slice(0, 8), status: "open", createdAt: Date.now() };
  write([item, ...read()]);
  return item;
}
export function setStatus(id: string, status: ItemStatus) {
  write(read().map((i) => (i.id === id ? { ...i, status } : i)));
}
export function resetDemo() {
  write(DEMO_ITEMS);
}

export function useItems(): Item[] {
  const [items, setItems] = useState<Item[]>(DEMO_ITEMS);
  useEffect(() => {
    const sync = () => setItems(read());
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return [...items].sort((a, b) => b.createdAt - a.createdAt);
}

export function filterItems(items: Item[], f: { q?: string | undefined; category?: string | undefined; location?: string | undefined; type?: string | undefined; status?: string | undefined }) {
  const q = (f.q ?? "").trim().toLowerCase();
  return items.filter(
    (i) =>
      (!q || `${i.name} ${i.description} ${i.category} ${i.location}`.toLowerCase().includes(q)) &&
      (!f.category || i.category === f.category) &&
      (!f.location || i.location === f.location) &&
      (!f.type || i.type === f.type) &&
      (!f.status || i.status === f.status),
  );
}
