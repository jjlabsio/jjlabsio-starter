import type { NextConfig } from "next";
const config: NextConfig = {
  transpilePackages: ["@repo/ui", "@repo/database", "@repo/auth"],
};
export default config;
