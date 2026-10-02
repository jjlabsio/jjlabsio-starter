import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { Tooltip, TooltipTrigger } from "@repo/ui/components/tooltip";

it("shares the info trigger while preserving ordinary tooltip children", () => {
  const info = renderToStaticMarkup(
    createElement(
      Tooltip,
      null,
      createElement(TooltipTrigger, {
        variant: "info",
        "aria-label": "Metric details",
      }),
    ),
  );
  expect(info).toContain("ui-inline-help");
  expect(info).toContain('aria-label="Metric details"');
  expect(info).toContain('stroke-width="2"');

  const ordinary = renderToStaticMarkup(
    createElement(
      Tooltip,
      null,
      createElement(TooltipTrigger, null, "Open item"),
    ),
  );
  expect(ordinary).toContain("Open item");
  expect(ordinary).not.toContain("ui-inline-help");
  expect(ordinary).not.toContain("<svg");

  for (const variant of ["default", "info"] as const) {
    const withStateClass = renderToStaticMarkup(
      createElement(
        Tooltip,
        null,
        createElement(
          TooltipTrigger,
          { variant, className: () => "state-hook" },
          "Details",
        ),
      ),
    );
    expect(withStateClass).toContain("state-hook");
  }
});
