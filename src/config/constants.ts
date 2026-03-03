export const APP_DIR = "apps/app";
export const SRC_DIR = `${APP_DIR}/src`;
export const COMPONENTS_DIR = `${SRC_DIR}/components`;
export const AUTHENTICATED_DIR = `${SRC_DIR}/app/(authenticated)`;
export const SIDEBAR_GROUP_DIR = `${AUTHENTICATED_DIR}/(sidebar)`;
export const STANDARD_GROUP_DIR = `${AUTHENTICATED_DIR}/(standard)`;

export const DOMAINS_DIR = `${SRC_DIR}/domains`;
export const STANDARD_DOMAIN_DIR = `${DOMAINS_DIR}/standard`;
export const SIDEBAR_DOMAIN_DIR = `${DOMAINS_DIR}/sidebar`;

export const ROOT_PAGE = `${SRC_DIR}/app/page.tsx`;
export const RESOLVE_CALLBACK_URL = `${SRC_DIR}/lib/resolve-callback-url.ts`;
export const CHECKOUT_ROUTE = `${SRC_DIR}/app/api/billing/checkout/route.ts`;

export type LayoutChoice = "sidebar" | "standard";
