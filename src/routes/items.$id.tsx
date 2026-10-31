
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Calendar, Mail, MapPin, Phone, Tag, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ItemCard, ItemPhoto, StatusBadge } from "@/components/ItemCard";
import { setStatus, useItems } from "@/lib/items";

export const Route = createFileRoute("/items/$id")({
  head: () => ({
    meta: [
      { title: "Item Details — Campus Lost & Found" },
      { name: "description", content: "View details and contact the reporter of a lost or found item." },
      { property: "og:title", content: "Item Details — Campus Lost & Found" },
      { property: "og:description", content: "Photo, location, date and contact for this item." },
    ],
  }),
  component: Details,
});

function Details() {
  const { id } = Route.useParams();
  const items = useItems();
  const [isUpdating, setIsUpdating] = useState(false);

  const item = items.find((i) => i.id === id);

  if (!item) {
    return (
      <div className="mx-auto max-w-md px-4 pt-24 text-center">
        <h1 className="text-2xl font-bold">Item not found</h1>
        <p className="mt-2 text-muted-foreground">It may have been removed.</p>
        <Button asChild variant="hero" className="mt-6">
          <Link to="/browse">Browse items</Link>
        </Button>
      </div>
    );
  }

  const related = items
    .filter((i) => i.id !== item.id && i.category === item.category)
    .slice(0, 3);

  const subject = encodeURIComponent(`About your ${item.type} item: ${item.name}`);

  const rows = [
    { icon: Tag, label: "Category", value: item.category },
    { icon: MapPin, label: `Location ${item.type}`, value: item.location },
    {
      icon: Calendar,
      label: `Date ${item.type}`,
      value: new Date(item.date).toLocaleDateString(undefined, { dateStyle: "long" }),
    },
  ];

  async function handleStatusChange(
    itemId: string,
    status: "open" | "returned"
  ) {
    if (isUpdating) return;

    setIsUpdating(true);

    try {
      await setStatus(itemId, status);
      toast.success(
        status === "returned"
          ? "Marked as returned 🎉"
          : "Reopened"
      );
    } catch (error) {
      console.error("Failed to update item status:", error);
      toast.error("Couldn't update status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8">
      <Link
        to="/browse"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to browse
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="animate-rise overflow-hidden rounded-3xl border border-border shadow-card">
          <ItemPhoto item={item} className="aspect-[4/3] w-full" />
        </div>

        <div className="animate-rise space-y-6">
          <div>
            <StatusBadge item={item} />
            <h1 className="mt-3 text-4xl font-bold">{item.name}</h1>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {rows.map((r) => (
              <div
                key={r.label}
                className="rounded-2xl border border-border bg-card p-4 shadow-card"
              >
                <r.icon className="size-4 text-accent-foreground" />
                <p className="mt-2 text-xs capitalize text-muted-foreground">
                  {r.label}
                </p>
                <p className="font-semibold">{r.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-gradient-soft bg-card p-5 shadow-card">
            <h2 className="font-semibold">
              Contact the {item.type === "lost" ? "owner" : "finder"}
            </h2>

            <div className="mt-3 space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                {item.contactName}
              </p>

              <p className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                {item.contactEmail}
              </p>

              {item.contactPhone && (
                <p className="flex items-center gap-2">
                  <Phone className="size-4 text-muted-foreground" />
                  {item.contactPhone}
                </p>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild variant="hero">
                <a href={`mailto:${item.contactEmail}?subject=${subject}`}>
                  <Mail /> Send email
                </a>
              </Button>

              {item.contactPhone && (
                <Button asChild variant="soft">
                  <a href={`tel:${item.contactPhone.replace(/\s/g, "")}`}>
                    <Phone /> Call
                  </a>
                </Button>
              )}

              {item.status === "open" ? (
                <Button
                  variant="soft"
                  disabled={isUpdating}
                  onClick={() => handleStatusChange(item.id, "returned")}
                >
                  {isUpdating ? "Updating..." : "Mark as returned"}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  disabled={isUpdating}
                  onClick={() => handleStatusChange(item.id, "open")}
                >
                  {isUpdating ? "Updating..." : "Reopen"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold">
            More {item.category.toLowerCase()}
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r, i) => (
              <ItemCard key={r.id} item={r} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
