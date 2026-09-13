import type { NextConfig } from "next";

// GitHub Pages: статический экспорт, репо переименовано в hvanox.github.io,
// поэтому сайт живёт в корне и basePath не нужен.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
