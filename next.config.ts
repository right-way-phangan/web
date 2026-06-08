import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Leaflet maps initialize against a DOM container by id. StrictMode's dev
  // double-mount re-inits a map on a container mid-teardown, which corrupts
  // react-leaflet's own map.remove() lifecycle and throws "Map container is
  // being reused by another instance" when navigating away from a map page.
  // Keeping StrictMode off lets react-leaflet manage one clean mount/unmount.
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "drive.google.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
    ],
  },
  typedRoutes: true,
};

export default nextConfig;
