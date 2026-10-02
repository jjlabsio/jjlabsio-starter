// Menu, listbox and calendar presets share visuals, not interaction semantics.
export const menuLabelClassName =
  "px-2 py-1 type-ui-caption text-subtle-foreground";

export const menuSurfaceClassName =
  "max-h-(--available-height) max-w-[calc(100vw-2rem)] rounded-(--menu-radius) bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10";

export const menuRowClassName =
  "relative flex min-h-(--menu-row-height) cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 type-ui-body outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50";
