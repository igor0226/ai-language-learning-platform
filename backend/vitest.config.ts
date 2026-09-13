import path from "node:path";

import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve("src"),
		},
	},
	test: {
		environment: "node",
		include: ["src/**/*.spec.ts"],
		setupFiles: ["./test/setup.ts"],
		globalSetup: ["./test/global-setup.ts"],
		hookTimeout: 120_000,
		root: "./",
	},
	plugins: [
		swc.vite({
			module: { type: "es6" },
		}),
	],
});
