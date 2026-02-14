import { Card, CardContent } from "@repo/ui/components/card";

interface BrandCard {
  type: "brand";
  name: string;
  color: string;
}

interface QuoteCard {
  type: "quote";
  quote: string;
  author: string;
  role: string;
  initials: string;
}

type TestimonialCard = BrandCard | QuoteCard;

const TESTIMONIALS: readonly TestimonialCard[] = [
  {
    type: "brand",
    name: "TechCorp",
    color: "bg-neutral-800",
  },
  {
    type: "quote",
    quote:
      "Acme transformed how our team ships features. We went from monthly to weekly releases in just 3 weeks.",
    author: "Sarah Chen",
    role: "VP of Engineering, TechCorp",
    initials: "SC",
  },
  {
    type: "brand",
    name: "DataFlow",
    color: "bg-[#c97b84]",
  },
  {
    type: "quote",
    quote:
      "The AI-powered workflows saved us hundreds of hours. Our developers can now focus on what matters most.",
    author: "Marcus Johnson",
    role: "CTO, DataFlow",
    initials: "MJ",
  },
  {
    type: "brand",
    name: "CloudBase",
    color: "bg-neutral-700",
  },
  {
    type: "quote",
    quote:
      "Switching to Acme was the best decision we made. Our team productivity increased by 3x within the first month.",
    author: "Emily Park",
    role: "Head of Product, CloudBase",
    initials: "EP",
  },
  {
    type: "brand",
    name: "Nextera",
    color: "bg-[#b89a9e]",
  },
  {
    type: "brand",
    name: "Synthwave",
    color: "bg-neutral-900",
  },
] as const;

export function Testimonials() {
  return (
    <section id="customers" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-12 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
          What our customers say
        </h2>

        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none">
          {TESTIMONIALS.map((card, i) =>
            card.type === "brand" ? (
              <Card
                key={i}
                className={`${card.color} flex min-w-[220px] shrink-0 items-center justify-center rounded-3xl border-0 p-10`}
              >
                <span className="text-2xl font-bold text-white">
                  {card.name}
                </span>
              </Card>
            ) : (
              <Card
                key={i}
                className="min-w-[360px] shrink-0 rounded-3xl border-border/40"
              >
                <CardContent className="flex flex-col gap-5 p-7">
                  <p className="leading-relaxed text-foreground">
                    &ldquo;{card.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium dark:bg-neutral-800">
                      {card.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{card.author}</p>
                      <p className="text-xs text-muted-foreground">
                        {card.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
