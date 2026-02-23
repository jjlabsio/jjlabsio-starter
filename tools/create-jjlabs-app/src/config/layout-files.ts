import {
  COMPONENTS_DIR,
  SIDEBAR_GROUP_DIR,
  STANDARD_GROUP_DIR,
  type LayoutChoice,
} from "./constants.js";

interface LayoutFileMap {
  readonly routeGroupDir: string;
  readonly components: readonly string[];
}

const SIDEBAR_FILES: LayoutFileMap = {
  routeGroupDir: SIDEBAR_GROUP_DIR,
  components: [
    `${COMPONENTS_DIR}/app-sidebar.tsx`,
    `${COMPONENTS_DIR}/nav-main.tsx`,
    `${COMPONENTS_DIR}/nav-secondary.tsx`,
    `${COMPONENTS_DIR}/nav-user.tsx`,
    `${COMPONENTS_DIR}/nav-documents.tsx`,
    `${COMPONENTS_DIR}/site-header.tsx`,
    `${COMPONENTS_DIR}/page-container.tsx`,
    `${COMPONENTS_DIR}/section-cards.tsx`,
    `${COMPONENTS_DIR}/chart-area-interactive.tsx`,
  ],
};

const STANDARD_FILES: LayoutFileMap = {
  routeGroupDir: STANDARD_GROUP_DIR,
  components: [
    `${COMPONENTS_DIR}/app-header.tsx`,
    `${COMPONENTS_DIR}/app-footer.tsx`,
    `${COMPONENTS_DIR}/mobile-nav.tsx`,
    `${COMPONENTS_DIR}/user-menu.tsx`,
  ],
};

const FILE_MAP: Record<LayoutChoice, LayoutFileMap> = {
  sidebar: STANDARD_FILES,
  standard: SIDEBAR_FILES,
};

export function getFilesToRemove(layout: LayoutChoice): LayoutFileMap {
  return FILE_MAP[layout];
}

export function getSelectedLayoutDir(layout: LayoutChoice): string {
  return layout === "sidebar" ? SIDEBAR_GROUP_DIR : STANDARD_GROUP_DIR;
}
