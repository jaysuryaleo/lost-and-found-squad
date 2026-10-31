import { createFileRoute } from "@tanstack/react-router";
import { ReportForm } from "@/components/ReportForm";

export const Route = createFileRoute("/report-lost")({
  head: () => ({
    meta: [
      { title: "Report a Lost Item — Campus Lost & Found" },
      { name: "description", content: "Lost something on campus? Post a report so other students can help." },
      { property: "og:title", content: "Report a Lost Item" },
      { property: "og:description", content: "Post a lost item report for your campus." },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-3xl px-4 pt-12">
      <h1 className="text-4xl font-bold">Report a <span className="text-gradient">lost</span> item</h1>
      <p className="mb-8 mt-2 text-muted-foreground">Share the details — the more specific, the faster it comes back.</p>
      <ReportForm type="lost" />
    </div>
  ),
});
