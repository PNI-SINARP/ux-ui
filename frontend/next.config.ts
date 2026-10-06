import type { NextConfig } from "next";
import path from "path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const isGithubActions = Boolean(process.env.GITHUB_ACTIONS);
const repoName = process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split("/")[1]}` : "/ux-ui";
const basePath = isGithubActions ? repoName : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: isGithubActions ? "export" : "standalone",
  basePath: basePath,
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  turbopack: {
    root: process.cwd(),
  },
  images: {
    unoptimized: isGithubActions ? true : false,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
    ],
  },
  ...(isGithubActions
    ? {}
    : {
      async headers() {
        return [
          {
            source: "/(.*)",
            headers: [
              {
                key: "Content-Security-Policy",
                value:
                  "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.cdnfonts.com; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.cdnfonts.com; frame-src 'self' https://www.youtube.com https://youtube.com; connect-src 'self' https:;",
              },
              {
                key: "Strict-Transport-Security",
                value: "max-age=31536000; includeSubDomains",
              },
              {
                key: "X-Frame-Options",
                value: "SAMEORIGIN",
              },
              {
                key: "X-Content-Type-Options",
                value: "nosniff",
              },
              {
                key: "Referrer-Policy",
                value: "strict-origin-when-cross-origin",
              },
              {
                key: "Permissions-Policy",
                value: "camera=(), microphone=(), geolocation=()",
              },
            ],
          },
        ];
      },
    }),
};

export default withNextIntl(nextConfig);
