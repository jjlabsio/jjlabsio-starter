import {
  SIDEBAR_GROUP_DIR,
  STANDARD_GROUP_DIR,
  STANDARD_DOMAIN_DIR,
  SIDEBAR_DOMAIN_DIR,
  type LayoutChoice,
} from "./constants.js";

interface LayoutDirs {
  readonly routeGroupDir: string;
  readonly domainDir: string;
}

const SIDEBAR_DIRS: LayoutDirs = {
  routeGroupDir: SIDEBAR_GROUP_DIR,
  domainDir: SIDEBAR_DOMAIN_DIR,
};

const STANDARD_DIRS: LayoutDirs = {
  routeGroupDir: STANDARD_GROUP_DIR,
  domainDir: STANDARD_DOMAIN_DIR,
};

const DIR_MAP: Record<LayoutChoice, LayoutDirs> = {
  sidebar: STANDARD_DIRS, // sidebar 선택 시 → standard 삭제
  standard: SIDEBAR_DIRS, // standard 선택 시 → sidebar 삭제
};

export function getDirsToRemove(layout: LayoutChoice): LayoutDirs {
  return DIR_MAP[layout];
}

export function getSelectedLayoutDir(layout: LayoutChoice): string {
  return layout === "sidebar" ? SIDEBAR_GROUP_DIR : STANDARD_GROUP_DIR;
}
