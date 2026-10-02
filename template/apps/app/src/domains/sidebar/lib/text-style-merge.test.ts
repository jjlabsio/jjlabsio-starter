import { expect, it } from "vitest";
import { cn } from "@repo/ui/lib/utils";

it("replaces composite text styles without removing colors or responsive styles", () => {
  expect(cn("type-ui-body-medium text-foreground", "type-ui-body")).toBe(
    "text-foreground type-ui-body",
  );
  expect(cn("type-ui-label", "type-ui-caption")).toBe("type-ui-caption");
  expect(cn("type-ui-body md:type-ui-body-medium", "md:type-ui-caption")).toBe(
    "type-ui-body md:type-ui-caption",
  );
});
