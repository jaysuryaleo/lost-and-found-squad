import { Link } from "@tanstack/react-router";
import { Calendar, MapPin, Package } from "lucide-react";
import type { Item } from "@/lib/items";
import { cn } from "@/lib/utils";

export function StatusBadge({ item }: { item: Item }) {
  if (item.status === "returned")
    return <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">Returned</span>;
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold",
      item.type === "lost" ? "bg-destructive/10 text-destructive" : "bg-accent text-accent-foreground")}>
      {item.type === "lost" ? "Lost" : "Found"}
    </span>
  );
}

export function ItemPhoto({ item, className }: { item: Item; className?: string }) {
  return item.photo ? (
    <img src={item.photo} alt={item.name} loading="lazy" className={cn("object-cover", className)} />
  ) : (
    <div className={cn("grid place-items-center bg-gradient-soft bg-secondary text-primary/40", className)}>
      <Package className="size-12" />
    </div>
  );
}

export function ItemCard({ item, index = 0 }: { item: Item; index?: number }) {
  return (
    <Link to="/items/$id" params={{ id: item.id }}
      style={{ animationDelay: `${index * 60}ms` }}
      className="group animate-rise overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant">
      <div className="relative overflow-hidden">
        <ItemPhoto item={item} className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute left-3 top-3"><StatusBadge item={item} /></div>
      </div>
      <div className="space-y-2 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent-foreground">{item.category}</p>
        <h3 className="line-clamp-1 font-semibold">{item.name}</h3>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="size-3.5" />{item.location}</span>
          <span className="flex items-center gap-1"><Calendar className="size-3.5" />{new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
        </div>
      </div>
    </Link>
  );
}
