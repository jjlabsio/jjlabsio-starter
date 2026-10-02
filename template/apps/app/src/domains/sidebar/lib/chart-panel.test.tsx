import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LineChart } from "recharts";
import { expect, it } from "vitest";
import { CardContent } from "@repo/ui/components/card";
import { ChartContainer } from "@repo/ui/components/chart";

it("shares filling chart panels without changing ordinary card/chart layouts", () => {
  const panel = renderToStaticMarkup(
    <CardContent padding="chart">
      <ChartContainer config={{}} variant="panel">
        <LineChart />
      </ChartContainer>
    </CardContent>,
  );
  expect(panel).toContain('data-variant="panel"');
  expect(panel).toContain("min-h-(--chart-panel-min-height)");
  expect(panel).toContain("flex-1");
  expect(panel).toContain("aspect-auto");
  expect(panel).not.toContain("aspect-video");

  const ordinary = renderToStaticMarkup(
    <CardContent>
      <ChartContainer config={{}}>
        <LineChart />
      </ChartContainer>
    </CardContent>,
  );
  expect(ordinary).toContain("px-(--card-spacing)");
  expect(ordinary).toContain("aspect-video");
  expect(ordinary).not.toContain("--chart-panel-min-height");
});
