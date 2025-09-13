import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for future itch.io packaging
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
