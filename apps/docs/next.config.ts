import { createMDX } from 'fumadocs-mdx/next';
import type { NextConfig } from "next";

const withMDX = createMDX();

const config: NextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  output: "standalone",
  transpilePackages: ["@inflow/core", "@inflow/db", "@inflow/types", "@inflow/logger", "@inflow/cache"],
  serverExternalPackages: ["@takumi-rs/image-response", "pino", "pino-pretty"],
};

export default withMDX(config);
