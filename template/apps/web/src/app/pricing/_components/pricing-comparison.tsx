import { IconCheck, IconMinus } from "@tabler/icons-react";
import {
  TIERS,
  type BillingPeriod,
  type TierConfig,
} from "@repo/billing/plan-config";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";

type FeatureRow = {
  label: string;
  value: (tier: TierConfig) => string | number | boolean;
};

const featureSections: readonly {
  title: string;
  rows: readonly FeatureRow[];
}[] = [
  {
    title: "Workspace",
    rows: [
      {
        label: "Projects",
        value: (tier) => tier.limits.projects ?? "Unlimited",
      },
      {
        label: "Team members",
        value: (tier) => tier.limits.members ?? "Unlimited",
      },
      { label: "Storage", value: (tier) => `${tier.limits.storageGB} GB` },
    ],
  },
  {
    title: "Insights & automation",
    rows: [
      {
        label: "Basic analytics",
        value: (tier) =>
          tier.features.some(
            (feature) =>
              feature === "Basic analytics" || feature === "Advanced analytics",
          ),
      },
      {
        label: "Advanced analytics",
        value: (tier) => tier.features.includes("Advanced analytics"),
      },
      {
        label: "Activity history",
        value: (tier) =>
          ({ starter: "30 days", pro: "90 days", premium: "1 year" })[tier.id],
      },
      {
        label: "Custom workflows",
        value: (tier) => tier.features.includes("Custom workflows"),
      },
    ],
  },
  {
    title: "Support & access",
    rows: [
      {
        label: "Email support",
        value: (tier) =>
          tier.features.some(
            (feature) =>
              feature === "Email support" || feature === "Priority support",
          ),
      },
      {
        label: "Priority support",
        value: (tier) => tier.features.includes("Priority support"),
      },
      {
        label: "API access",
        value: (tier) => tier.features.includes("API access"),
      },
    ],
  },
];

export function PricingComparison({ period }: { period: BillingPeriod }) {
  return (
    <section
      aria-labelledby="plan-comparison-title"
      className="mx-auto max-w-5xl px-6 pb-20 md:pb-24"
    >
      <div className="mb-10 text-center">
        <h2
          id="plan-comparison-title"
          className="text-3xl font-medium tracking-tight md:text-4xl"
        >
          Compare plans
        </h2>
        <p className="mt-4 type-ui-reading text-muted-foreground">
          A closer look at what&apos;s included in each plan.
        </p>
      </div>
      <Table
        className="min-w-[640px] table-fixed"
        containerProps={{
          tabIndex: 0,
          role: "region",
          "aria-label":
            "Plan feature comparison. Scroll horizontally to compare all plans.",
        }}
      >
        <caption className="sr-only">
          Plan prices and features, grouped by category
        </caption>
        <colgroup>
          <col className="w-[28%] sm:w-[34%]" />
          {TIERS.map((tier) => (
            <col key={tier.id} />
          ))}
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHead
              scope="col"
              className="sticky left-0 z-10 bg-background whitespace-normal"
            >
              <span className="type-ui-body-medium text-foreground">
                Features
              </span>
            </TableHead>
            {TIERS.map((tier) => (
              <TableHead key={tier.id} scope="col" className="py-5 text-center">
                <div className="type-ui-body-medium text-foreground">
                  {tier.name}
                </div>
                <div className="mt-2 flex items-baseline justify-center gap-1">
                  <span className="type-ui-title-lg text-foreground">
                    {tier[period].formattedPrice}
                  </span>
                  <span className="type-ui-caption">{tier[period].period}</span>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        {featureSections.map((section) => (
          <TableBody key={section.title} aria-label={section.title}>
            <TableRow>
              <TableHead
                colSpan={TIERS.length + 1}
                scope="colgroup"
                className="pb-3 pt-8"
              >
                <h3 className="sticky left-3 w-fit type-ui-title-sm text-foreground">
                  {section.title}
                </h3>
              </TableHead>
            </TableRow>
            {section.rows.map((row) => (
              <TableRow key={row.label}>
                <TableHead
                  scope="row"
                  className="sticky left-0 z-10 bg-background whitespace-normal"
                >
                  <span className="type-ui-body text-foreground">
                    {row.label}
                  </span>
                </TableHead>
                {TIERS.map((tier) => {
                  const value = row.value(tier);
                  const Icon = value ? IconCheck : IconMinus;
                  return (
                    <TableCell
                      key={tier.id}
                      className="text-center tabular-nums"
                    >
                      {typeof value === "boolean" ? (
                        <>
                          <Icon
                            aria-hidden="true"
                            className="mx-auto size-4 text-muted-foreground"
                          />
                          <span className="sr-only">
                            {value ? "Included" : "Not included"}
                          </span>
                        </>
                      ) : (
                        value
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        ))}
      </Table>
    </section>
  );
}
