import type { NextConfig } from "next";

// The APK bundles plain files into the app, so it needs a static export;
// Railway keeps running the normal server build.
const isApk = process.env.BUILD_TARGET === "apk";

const nextConfig: NextConfig = {
  output: isApk ? "export" : undefined,
  // Builds straight into out/, so an APK build works while `npm run dev` holds .next.
  distDir: isApk ? "out" : undefined,
  // Partial prerendering needs a server, so static export refuses both.
  cacheComponents: !isApk,
  partialPrefetching: !isApk,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
