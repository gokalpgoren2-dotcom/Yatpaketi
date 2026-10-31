import type { NextConfig } from "next";

// Supabase Storage alan adı, ortam değişkeninden alınır (fotoğraflar next/image ile gösterilir).
const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : null;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/**" }]
      : [],
  },
};

export default nextConfig;
