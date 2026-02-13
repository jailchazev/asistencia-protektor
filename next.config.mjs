import path from "path";
import nextPWA from "next-pwa";

const withPWA = nextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    // ✅ Alias para que '@/...' funcione en Render/Linux
    config.resolve.alias["@"] = path.resolve(process.cwd(), "src");
    return config;
  },
});

export default nextConfig;
