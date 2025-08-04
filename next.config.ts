import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(
  nextConfig,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    org: "vibhavs-test-org-bbfb18",
    project: "javascript-nextjs",

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  }
);
