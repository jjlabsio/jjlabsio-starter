const DEFAULT_CALLBACK_URL = "/dashboard";

/**
 * Resolves a safe internal callback URL from the `next` query parameter.
 *
 * Prevents open redirect by only allowing paths that start with a single '/'.
 * Any external URL (absolute, protocol-relative) falls back to the default.
 */
export function resolveCallbackUrl(next?: string | null): string {
  if (!next) return DEFAULT_CALLBACK_URL;

  // Only allow paths starting with a single '/' — blocks external URLs and
  // protocol-relative URLs like //evil.com
  if (next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }

  return DEFAULT_CALLBACK_URL;
}
