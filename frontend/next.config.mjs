/** @type {import('next').NextConfig} */
const nextConfig = {
	transpilePackages: ["@llp/contracts"],
	allowedDevOrigins: ["app.llp-test.com"],
};

export default nextConfig;
