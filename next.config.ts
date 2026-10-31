import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Aşama 3'te Supabase Storage alan adı buraya eklenecek.
    remotePatterns: [],
  },
};

export default nextConfig;
