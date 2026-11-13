import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Yerel modüller ve CLI başlatan SDK paketlenmez, Node tarafından doğrudan yüklenir.
  serverExternalPackages: ["better-sqlite3", "@anthropic-ai/claude-agent-sdk"],
  outputFileTracingRoot: path.resolve(process.cwd()),
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
