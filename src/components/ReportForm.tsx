import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { addItem, CATEGORIES, LOCATIONS, type ItemType } from "@/lib/items";

const field = "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/15";

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
  return <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">{children}</label>;
}

export function ReportForm({ type }: { type: ItemType }) {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<string>();
  const verb = type === "lost" ? "lost" : "found";

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { toast.error("Photo must be under 3 MB"); return; }
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const scale = Math.min(1, 900 / img.width);
        const c = document.createElement("canvas");
        c.width = img.width * scale; c.height = img.height * scale;
        c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
        setPhoto(c.toDataURL("image/jpeg", 0.8));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const g = (k: string) => String(f.get(k) ?? "").trim();
    try {
      const item = addItem({
        type, name: g("name"), category: g("category"), description: g("description"),
        location: g("location"), date: g("date"), contactName: g("contactName"),
        contactEmail: g("contactEmail"), contactPhone: g("contactPhone") || undefined, photo,
      });
      toast.success(`Your ${verb} item report is live!`);
      navigate({ to: "/items/$id", params: { id: item.id } });
    } catch {
      toast.error("Couldn't save — try a smaller photo.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="animate-rise space-y-6 rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label htmlFor="name">Item name *</Label>
          <input id="name" name="name" required maxLength={80} placeholder="e.g. Black leather wallet" className={field} />
        </div>
        <div>
          <Label htmlFor="category">Category *</Label>
          <select id="category" name="category" required defaultValue="" className={field}>
            <option value="" disabled>Select category</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor="location">Location {verb} *</Label>
          <select id="location" name="location" required defaultValue="" className={field}>
            <option value="" disabled>Select location</option>
            {LOCATIONS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="description">Description *</Label>
          <textarea id="description" name="description" required rows={4} maxLength={600} placeholder="Color, brand, distinguishing marks…" className={field} />
        </div>
        <div>
          <Label htmlFor="date">Date {verb} *</Label>
          <input id="date" name="date" type="date" required max={new Date().toISOString().slice(0, 10)} className={field} />
        </div>
        <div>
          <Label htmlFor="contactName">Your name *</Label>
          <input id="contactName" name="contactName" required maxLength={60} className={field} />
        </div>
        <div>
          <Label htmlFor="contactEmail">Email *</Label>
          <input id="contactEmail" name="contactEmail" type="email" required placeholder="you@campus.edu" className={field} />
        </div>
        <div>
          <Label htmlFor="contactPhone">Phone (optional)</Label>
          <input id="contactPhone" name="contactPhone" type="tel" maxLength={20} className={field} />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="photo">Photo</Label>
          {photo ? (
            <div className="relative inline-block">
              <img src={photo} alt="Preview" className="h-48 rounded-xl object-cover" />
              <button type="button" onClick={() => setPhoto(undefined)} aria-label="Remove photo"
                className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 shadow-card"><X className="size-4" /></button>
            </div>
          ) : (
            <label htmlFor="photo" className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/50 p-8 text-sm text-muted-foreground transition hover:border-ring hover:bg-accent/40">
              <ImagePlus className="size-8 text-accent-foreground" />
              Click to upload a photo (max 3 MB)
              <input id="photo" type="file" accept="image/*" onChange={onFile} className="sr-only" />
            </label>
          )}
        </div>
      </div>
      <Button type="submit" variant="hero" size="lg" className="w-full md:w-auto">Submit {verb} item report</Button>
    </form>
  );
}
