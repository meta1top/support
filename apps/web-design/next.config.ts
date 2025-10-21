import type { NextConfig } from "next";

export default {
  transpilePackages: ["@meta-1/design"],
  eslint: {
    ignoreDuringBuilds: true,
  },
} as NextConfig;
