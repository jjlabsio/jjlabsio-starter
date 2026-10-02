import { Card, CardContent } from "@repo/ui/components/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";

const overviewMetrics = [
  { label: "Total visitors", value: "31,420", change: "+12.5%" },
  { label: "New customers", value: "1,234", change: "+8.2%" },
  { label: "Active accounts", value: "45,678", change: "+4.8%" },
  { label: "Growth rate", value: "4.5%", change: "+0.6%" },
  { label: "Conversion rate", value: "8.0%", change: "+0.4%" },
];

export type Metric = {
  label: string;
  value: string;
  change?: string;
  changeTone?: "positive" | "negative" | "neutral";
  description?: string;
};

export function SectionCards({
  metrics = overviewMetrics,
  variant = "strip",
}: {
  metrics?: readonly Metric[];
  variant?: "strip" | "summary" | "band";
}) {
  if (variant === "summary") {
    return (
      <div className="ui-metric-summary" aria-label="Current metrics">
        {metrics.map((metric) => (
          <div key={metric.label} className="ui-metric-summary-item">
            <span className="ui-metric-label">{metric.label}</span>
            <span className="ui-metric-summary-value">{metric.value}</span>
            {metric.change && (
              <span
                className="ui-metric-change"
                data-tone={metric.changeTone ?? "positive"}
              >
                {metric.change}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  const compact = metrics.length === 3;

  return (
    <Card variant={variant === "band" ? "flush" : "panel"}>
      <CardContent
        padding="none"
        className="ui-metric-strip"
        data-columns={compact ? "3" : "5"}
        data-presentation={variant}
      >
        {metrics.map((metric) => (
          <div key={metric.label} className="ui-metric-cell">
            <div className="ui-metric-label-row">
              <p className="ui-metric-label">{metric.label}</p>
              {metric.description && (
                <Tooltip>
                  <TooltipTrigger
                    variant="info"
                    aria-label={`About ${metric.label}`}
                  />
                  <TooltipContent>{metric.description}</TooltipContent>
                </Tooltip>
              )}
            </div>
            <div className="ui-metric-line">
              <p className="ui-metric-value">{metric.value}</p>
              {metric.change && (
                <span
                  className="ui-metric-change"
                  data-tone={metric.changeTone ?? "positive"}
                >
                  {metric.change}
                </span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
