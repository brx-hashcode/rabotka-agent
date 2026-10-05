import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server for the Docker image: .next/standalone/server.js
  // plus only the traced node_modules it needs.
  output: "standalone",
  poweredByHeader: false,
};

export default nextConfig;
