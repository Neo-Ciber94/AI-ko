import { env } from "./src/lib/env.mjs/index.js";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: env.PUBLIC_APP_AWS_CLOUDFRONT_DOMAIN,
      },
    ],
  },
};

export default nextConfig;
