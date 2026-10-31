
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ItemType = "lost" | "found";
export type ItemStatus = "open" | "returned";

export const CATEGORIES = [
  "Watches",
  "Wallets",
  "ID Cards",
  "Earphones",
  "Bags",
  "Books",
  "Electronics",
  "Other",
] as const;

export const LOCATIONS = [
  "Library",
  "Cafeteria",
  "Main Auditorium",
  "Sports Complex",
  "Engineering Block",
  "Hostel A",
  "Parking Lot",
  "Lecture Hall 3",
] as const;

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
  contactPhone?: string;
  photo?: string;
  createdAt: number;
}

// Kept empty for compatibility with any existing imports.
// No demo items are displayed.
export const DEMO_ITEMS: Item[] = [];

type DbItem = {
  id: number;
  created_at: string;
  item_name: string;
  category: string;
  description: string | null;
  location: string;
  item_date: string | null;
  contact: string;
  photo_url: string | null;
  status: string;
  item_type: string;
};

function fromDatabase(row: DbItem): Item {
  let contact = {
    contactName: "Campus member",
    contactEmail: "",
    contactPhone: "",
  };

  try {
    contact = {
      ...contact,
      ...JSON.parse(row.contact || "{}"),
    };
  } catch {
    contact.contactName = row.contact || "Campus member";
  }

  return {
    id: String(row.id),
    type: row.item_type === "found" ? "found" : "lost",
    status: row.status === "returned" ? "returned" : "open",
    name: row.item_name,
    category: row.category,
    description: row.description || "",
    location: row.location,
    date: row.item_date || "",
    contactName: contact.contactName,
    contactEmail: contact.contactEmail,
    contactPhone: contact.contactPhone,
    ...(row.photo_url ? { photo: row.photo_url } : {}),
    createdAt: new Date(row.created_at).getTime(),
  };
}

async function fetchItems(): Promise<Item[]> {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data || []) as DbItem[]).map(fromDatabase);
}

export async function addItem(
  data: Omit<Item, "id" | "createdAt" | "status">
): Promise<Item> {
  const contact = JSON.stringify({
    contactName: data.contactName,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone || "",
  });

  const { data: saved, error } = await supabase
    .from("items")
    .insert({
      item_name: data.name,
      category: data.category,
      description: data.description,
      location: data.location,
      item_date: data.date || null,
      contact,
      photo_url: data.photo || null,
      status: "open",
      item_type: data.type,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Supabase insert failed:", error);
    throw error;
  }

  return fromDatabase(saved as DbItem);
}

export async function setStatus(
  id: string,
  status: ItemStatus
): Promise<void> {
  const numericId = Number(id);

  if (!Number.isFinite(numericId)) {
    throw new Error("Invalid item ID");
  }

  const { error } = await supabase
    .from("items")
    .update({ status })
    .eq("id", numericId);

  if (error) {
    console.error("Supabase status update failed:", error);
    throw error;
  }
}

export function resetDemo() {
  console.warn("Demo data is disabled. Supabase is the only data source.");
}

export function useItems(): Item[] {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const records = await fetchItems();

        if (active) {
          setItems(records);
        }
      } catch (error) {
        console.error("Could not load Supabase items:", error);

        if (active) {
          setItems([]);
        }
      }
    };

    load();

    const channel = supabase
      .channel("items-live-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "items",
        },
        () => {
          load();
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return [...items].sort(
    (a, b) => b.createdAt - a.createdAt
  );
}

export function filterItems(
  items: Item[],
  f: {
    q?: string;
    category?: string;
    location?: string;
    type?: string;
    status?: string;
  }
) {
  const q = (f.q ?? "").trim().toLowerCase();

  return items.filter(
    (i) =>
      (!q ||
        `${i.name} ${i.description} ${i.category} ${i.location}`
          .toLowerCase()
          .includes(q)) &&
      (!f.category || i.category === f.category) &&
      (!f.location || i.location === f.location) &&
      (!f.type || i.type === f.type) &&
      (!f.status || i.status === f.status)
  );
}
