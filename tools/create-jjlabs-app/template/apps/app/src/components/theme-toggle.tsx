"use client";

import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";

import { Button } from "@repo/ui/components/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      <IconSun className="size-4 scale-100 dark:scale-0" />
      <IconMoon className="absolute size-4 scale-0 dark:scale-100" />
    </Button>
  );
}
