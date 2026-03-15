/** @type {import('next').NextConfig} */
const nextConfig = {
  // All pages use Firebase (client-side only) — disable static prerendering
  output: "standalone",
  experimental: {
    // Ensure pages with Firebase are not statically generated
  },
};

export default nextConfig;
