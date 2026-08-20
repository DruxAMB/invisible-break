import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Allow the Devin browser preview proxy (127.0.0.1:PORT) and
    // localhost variants to submit Server Actions. The proxy forwards
    // from 127.0.0.1:PORT to localhost:3000, which triggers Next.js's
    // CSRF host check. Wildcard covers the dynamic preview port.
    serverActions: {
      allowedOrigins: ["127.0.0.1:*", "localhost:3000"],
    },
  },
};

export default nextConfig;
