import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, CheckCircle2, PackageSearch, Search, HandHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ItemCard } from "@/components/ItemCard";
import { useItems } from "@/lib/items";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Campus Lost & Found — Find what's lost. Return what's found." },
      { name: "description", content: "Report lost belongings and find items other students found on campus." },
      { property: "og:title", content: "Campus Lost & Found" },
      { property: "og:description", content: "Find what's lost. Return what's found." },
    ],
  }),
  component: Home,
});

function Home() {
  const items = useItems();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const stats = [
    { label: "Lost items", value: items.filter((i) => i.type === "lost" && i.status === "open").length, icon: PackageSearch },
    { label: "Found items", value: items.filter((i) => i.type === "found" && i.status === "open").length, icon: HandHeart },
    { label: "Returned", value: items.filter((i) => i.status === "returned").length, icon: CheckCircle2 },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-soft">
        <div className="mx-auto max-w-4xl px-4 pb-16 pt-20 text-center md:pt-28">
          <span className="animate-rise inline-block rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-accent-foreground shadow-card">
            🎓 Built for your campus community
          </span>
          <h1 className="animate-rise mt-6 text-4xl font-extrabold md:text-6xl">
            Find what's lost.<br /><span className="text-gradient">Return what's found.</span>
          </h1>
          <p className="animate-rise mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Campus Lost & Found connects students who lost something with those who found it — in seconds.
          </p>
          <form onSubmit={(e) => { e.preventDefault(); navigate({ to: "/browse", search: { q } }); }}
            className="animate-rise mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full border border-border bg-card p-2 shadow-elegant">
            <Search className="ml-3 size-5 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search wallets, ID cards, earphones…"
              className="flex-1 bg-transparent px-2 py-2 text-sm outline-none" aria-label="Search items" />
            <Button type="submit" variant="hero">Search</Button>
          </form>
          <div className="animate-rise mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild variant="hero" size="lg"><Link to="/report-lost">Report Lost Item</Link></Button>
            <Button asChild variant="soft" size="lg"><Link to="/report-found">Report Found Item</Link></Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-3">
        {stats.map((s, i) => (
          <div key={s.label} style={{ animationDelay: `${i * 80}ms` }} className="animate-rise flex items-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-card">
            <span className="grid size-12 place-items-center rounded-xl bg-accent text-accent-foreground"><s.icon /></span>
            <div>
              <p className="font-display text-3xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold">Recently reported</h2>
            <p className="mt-1 text-muted-foreground">The latest items from around campus.</p>
          </div>
          <Link to="/browse" className="flex items-center gap-1 text-sm font-semibold text-accent-foreground hover:underline">
            View all <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.slice(0, 8).map((it, i) => <ItemCard key={it.id} item={it} index={i} />)}
        </div>
      </section>
    </>
  );
}
