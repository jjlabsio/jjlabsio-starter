import "server-only";
import { Polar } from "@polar-sh/sdk";
import { env } from "./keys";

export const polar = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
});
