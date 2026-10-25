import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	transpilePackages: ["@llp/contracts"],
	// Next 14 keeps this setting under experimental. Include workspace dependencies.
	experimental: {
		outputFileTracingRoot: fileURLToPath(new URL("../", import.meta.url)),
	},
	allowedDevOrigins: ["app.llp-test.com"],
};

export default nextConfig;
