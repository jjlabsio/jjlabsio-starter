export function isAllowedAdmin(
  email: string,
  verified: boolean,
  allowed = process.env.ADMIN_EMAIL ?? "",
) {
  return (
    verified &&
    !!allowed.trim() &&
    email.trim().toLowerCase() === allowed.trim().toLowerCase()
  );
}

export const ADMIN_DEV_EMAIL = "dev-admin@example.test";
export function isLocalAdminDev(
  environment: string | undefined,
  authUrl: string,
  allowed = process.env.ADMIN_EMAIL ?? "",
) {
  return (
    environment === "development" &&
    !!allowed.trim() &&
    ["localhost", "127.0.0.1"].includes(new URL(authUrl).hostname)
  );
}
export function isAdminIdentity(
  email: string,
  verified: boolean,
  localDev: boolean,
) {
  return (
    isAllowedAdmin(email, verified) || (localDev && email === ADMIN_DEV_EMAIL)
  );
}
