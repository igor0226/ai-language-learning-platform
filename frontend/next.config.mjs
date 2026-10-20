/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	transpilePackages: ["@llp/contracts"],
	allowedDevOrigins: ["app.llp-test.com"],
};

export default nextConfig;
