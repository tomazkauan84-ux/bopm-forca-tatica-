import type { NextConfig } from 'next';
import dotenv from 'dotenv';

// Load .env into process.env (dotenv.populate is used internally to inject)
dotenv.config({ path: '.env', override: true });

const nextConfig: NextConfig = {
  reactStrictMode: false,
  turbopack: {},
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    PROJECT_ID: process.env.HAPPYSEEDS_PROJECT_ID ?? '',
    REACTUS_BASE_URL: process.env.REACTUS_BASE_URL ?? '',
    BTY_LLM_SERVER_BASE_URL: process.env.BTY_LLM_SERVER_BASE_URL ?? '',
    BTY_LLM_SERVER_API_KEY: process.env.BTY_LLM_SERVER_API_KEY ?? '',
    HAPPYSEEDS_KEY: process.env.HAPPYSEEDS_KEY ?? '',
  },
  serverExternalPackages: [],
  allowedDevOrigins: [
    "**.*.*",
  ],
};

export default nextConfig;

