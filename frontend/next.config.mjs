/** @type {import('next').NextConfig} */
const nextConfig = {
	transpilePackages: ["@llp/contracts"],
	allowedDevOrigins: ["app.llp.test"],
};

export default nextConfig;
