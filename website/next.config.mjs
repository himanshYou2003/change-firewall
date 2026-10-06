/** @type {import('next').NextConfig} */
const gatewayUrl = process.env.NEXT_PUBLIC_PLAYGROUND_GATEWAY_URL?.trim();
const websiteRoot = import.meta.dirname;

if (process.env.VERCEL_ENV === 'production') {
  if (!gatewayUrl) {
    throw new Error('Production requires NEXT_PUBLIC_PLAYGROUND_GATEWAY_URL to point to the deployed HTTPS playground gateway.');
  }
  const parsedGatewayUrl = new URL(gatewayUrl);
  if (parsedGatewayUrl.protocol !== 'https:' || ['localhost', '127.0.0.1', '::1'].includes(parsedGatewayUrl.hostname)) {
    throw new Error('Production NEXT_PUBLIC_PLAYGROUND_GATEWAY_URL must be a public HTTPS URL, not a loopback address.');
  }
}

const nextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_DIST_DIR || '.next',
  turbopack: {
    root: websiteRoot,
  },
};

export default nextConfig;
