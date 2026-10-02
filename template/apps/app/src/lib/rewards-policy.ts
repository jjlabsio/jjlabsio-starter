export const REWARDS_CONSENT_VERSION = "2026-10-02-v2";
export class RewardsInputError extends Error {}
export const PARTICIPATION_CONSENT =
  "I confirm this is my original public post based on real usage, disclose that I may receive a reward, and agree to the participation guidelines.";
export const MARKETING_CONSENT =
  "I allow Acme to use this post, my public name, and images on its website and organic social channels.";

export function normalizePostUrl(value: FormDataEntryValue | null): string {
  if (typeof value !== "string" || value.length > 2048)
    throw new RewardsInputError("Enter a valid public post URL.");
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new RewardsInputError("Enter a valid public post URL.");
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    !url.hostname.includes(".")
  )
    throw new RewardsInputError("Use a public HTTPS post URL.");
  url.hash = "";
  return url.href;
}

export const rewardStatusLabels: Record<string, string> = {
  PENDING: "Pending review",
  CHANGES_REQUESTED: "Changes requested",
  APPROVED: "Approved",
  REJECTED: "Not approved",
};
