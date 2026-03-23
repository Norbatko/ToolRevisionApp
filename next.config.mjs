/** @type {import('next').NextConfig} */
const nextConfig = {
  // All pages use Firebase (client-side only) — disable static prerendering
  output: "standalone",
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
