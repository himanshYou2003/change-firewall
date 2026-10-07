/** @type {import('next').NextConfig} */
const gatewayUrl = process.env.NEXT_PUBLIC_PLAYGROUND_GATEWAY_URL?.trim();
const websiteRoot = import.meta.dirname;

function isPublicHttpsUrl(value) {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  } catch {
    return false;
  }
}

const isProductionDeployment = process.env.VERCEL_ENV === 'production';
const publicGatewayUrl = !isProductionDeployment || isPublicHttpsUrl(gatewayUrl) ? gatewayUrl || '' : '';

if (isProductionDeployment && gatewayUrl && !publicGatewayUrl) {
  console.warn(
    'Ignoring invalid production NEXT_PUBLIC_PLAYGROUND_GATEWAY_URL. The website will deploy with the live playground disabled until a public HTTPS gateway URL is configured.',
  );
}

const nextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // Pin the validated value so Next never inlines a production loopback URL
  // into the browser bundle. An empty value is handled as fail-closed by the UI.
  env: {
    NEXT_PUBLIC_PLAYGROUND_GATEWAY_URL: publicGatewayUrl,
  },
  turbopack: {
    root: websiteRoot,
  },
};

export default nextConfig;
