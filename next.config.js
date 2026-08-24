/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // firebase-admin pulls in jwks-rsa -> jose, which ships ESM-only. Letting
  // Next/Turbopack bundle it into the serverless function produces
  // "ERR_REQUIRE_ESM" on platforms like Netlify at runtime. Marking it
  // external tells Next to leave the require()/import calls alone and let
  // Node's own module resolution (which handles this fine) do it instead.
  serverExternalPackages: ["firebase-admin"],
};

module.exports = nextConfig;