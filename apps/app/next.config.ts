/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui", "@repo/database", "@repo/auth"],
};

export default nextConfig;
