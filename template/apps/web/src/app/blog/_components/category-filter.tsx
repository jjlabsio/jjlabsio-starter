const CATEGORIES = [
  "All",
  "Product",
  "Engineering",
  "Design",
  "Company",
] as const;

export function CategoryFilter() {
  return (
    <section className="pb-12">
      <div className="mx-auto flex max-w-6xl gap-2 px-6">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            className={`rounded-full px-4 py-2 text-sm transition-colors ${
              category === "All"
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </section>
  );
}
