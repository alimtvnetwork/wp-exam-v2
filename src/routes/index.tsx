import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WordPress Q&A App" },
      {
        name: "description",
        content: "A study and practice app for WordPress questions and answers.",
      },
      { property: "og:title", content: "WordPress Q&A App" },
      {
        property: "og:description",
        content: "A study and practice app for WordPress questions and answers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 text-center">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          WordPress Q&A App
        </h1>
        <p className="text-lg text-muted-foreground">
          A focused study and practice tool for WordPress questions and answers.
        </p>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-card-foreground">
            Project scaffold ready
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Share the exam name, feature set, and WordPress/data details to start building the
            full learning experience.
          </p>
        </div>
      </div>
    </main>
  );
}
