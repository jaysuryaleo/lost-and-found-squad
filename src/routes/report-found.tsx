import { createFileRoute } from "@tanstack/react-router";
import { ReportForm } from "@/components/ReportForm";

export const Route = createFileRoute("/report-found")({
  head: () => ({
    meta: [
      { title: "Report a Found Item — Campus Lost & Found" },
      { name: "description", content: "Found something on campus? Help it get back to its owner." },
      { property: "og:title", content: "Report a Found Item" },
      { property: "og:description", content: "Post a found item report for your campus." },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-3xl px-4 pt-12">
      <h1 className="text-4xl font-bold">Report a <span className="text-gradient">found</span> item</h1>
      <p className="mb-8 mt-2 text-muted-foreground">Thanks for helping a fellow student. Avoid listing private details like card numbers.</p>
      <ReportForm type="found" />
    </div>
  ),
});
