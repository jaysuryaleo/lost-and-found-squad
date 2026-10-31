import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ItemCard } from "@/components/ItemCard";
import { CATEGORIES, LOCATIONS, filterItems, useItems } from "@/lib/items";
import { cn } from "@/lib/utils";

type S = { q?: string | undefined; category?: string | undefined; location?: string | undefined; type?: "lost" | "found" | undefined; status?: "open" | "returned" | undefined };

export const Route = createFileRoute("/browse")({
  validateSearch: (s: { q?: unknown; category?: unknown; location?: unknown; type?: unknown; status?: unknown }): S => ({
    q: typeof s.q === "string" && s.q ? s.q : undefined,
    category: typeof s.category === "string" && s.category ? s.category : undefined,
    location: typeof s.location === "string" && s.location ? s.location : undefined,
    type: s.type === "lost" || s.type === "found" ? s.type : undefined,
    status: s.status === "open" || s.status === "returned" ? s.status : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Browse Items — Campus Lost & Found" },
      { name: "description", content: "Search and filter lost and found items reported on campus." },
      { property: "og:title", content: "Browse Lost & Found Items" },
      { property: "og:description", content: "Search by category, location and status." },
    ],
  }),
  component: Browse,
});

const sel = "rounded-xl border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-ring";

function Browse() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/browse" });
  const set = (patch: Partial<S>) => navigate({ search: (p) => ({ ...p, ...patch }), replace: true });
  const results = filterItems(useItems(), search);
  const tabs = [{ v: undefined, l: "All" }, { v: "lost", l: "Lost" }, { v: "found", l: "Found" }] as const;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-12">
      <h1 className="text-4xl font-bold">Browse items</h1>
      <p className="mt-2 text-muted-foreground">Search everything reported on campus.</p>

      <div className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-4 shadow-card">
        <div className="flex items-center gap-2 rounded-xl border border-input px-3">
          <Search className="size-4 text-muted-foreground" />
          <input value={search.q ?? ""} onChange={(e) => set({ q: e.target.value || undefined })}
            placeholder="Search by name, description…" className="flex-1 bg-transparent py-2.5 text-sm outline-none" aria-label="Search" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-full bg-secondary p-1">
            {tabs.map((t) => (
              <button key={t.l} onClick={() => set({ type: t.v })}
                className={cn("rounded-full px-4 py-1.5 text-sm font-medium transition", search.type === t.v ? "bg-gradient-primary text-primary-foreground shadow-elegant" : "text-muted-foreground hover:text-foreground")}>
                {t.l}
              </button>
            ))}
          </div>
          <select aria-label="Category" className={sel} value={search.category ?? ""} onChange={(e) => set({ category: e.target.value || undefined })}>
            <option value="">All categories</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select aria-label="Location" className={sel} value={search.location ?? ""} onChange={(e) => set({ location: e.target.value || undefined })}>
            <option value="">All locations</option>{LOCATIONS.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select aria-label="Status" className={sel} value={search.status ?? ""} onChange={(e) => set({ status: (e.target.value || undefined) as S["status"] })}>
            <option value="">Any status</option><option value="open">Still open</option><option value="returned">Returned</option>
          </select>
          <Button variant="ghost" size="sm" asChild><Link to="/browse" search={{}}>Clear filters</Link></Button>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">{results.length} item{results.length !== 1 && "s"} found</p>
      {results.length ? (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((it, i) => <ItemCard key={it.id} item={it} index={i} />)}
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-border p-12 text-center">
          <SearchX className="size-10 text-muted-foreground" />
          <p className="mt-3 font-semibold">No items match your filters</p>
          <p className="mt-1 text-sm text-muted-foreground">Try clearing filters, or report your item.</p>
          <div className="mt-5 flex gap-3">
            <Button asChild variant="hero"><Link to="/report-lost">Report Lost Item</Link></Button>
            <Button asChild variant="soft"><Link to="/report-found">Report Found Item</Link></Button>
          </div>
        </div>
      )}
    </div>
  );
}
