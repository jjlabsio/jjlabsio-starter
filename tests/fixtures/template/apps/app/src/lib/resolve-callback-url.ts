const DEFAULT_CALLBACK_URL = "/";

export function resolveCallbackUrl(next?: string | null): string {
  if (!next) return DEFAULT_CALLBACK_URL;
  if (next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return DEFAULT_CALLBACK_URL;
}
