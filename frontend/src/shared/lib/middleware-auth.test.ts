import {
	buildUnauthenticatedRedirect,
	isPublicPath,
	resolveAuthenticatedPublicRedirect,
} from "./middleware-auth";

const origin = "https://app.llp-test.com";

describe("isPublicPath", () => {
	it("treats /login as public", () => {
		expect(isPublicPath("/login")).toBe(true);
	});

	it("treats /login/ subpaths as public", () => {
		expect(isPublicPath("/login/callback")).toBe(true);
	});

	it("treats app routes as protected", () => {
		expect(isPublicPath("/dashboard")).toBe(false);
		expect(isPublicPath("/listening/abc")).toBe(false);
	});
});

describe("buildUnauthenticatedRedirect", () => {
	it("redirects to /login with next for protected paths", () => {
		const url = buildUnauthenticatedRedirect("/listening/abc", origin);
		expect(url.pathname).toBe("/login");
		expect(url.searchParams.get("next")).toBe("/listening/abc");
	});

	it("redirects to /login without next for /", () => {
		const url = buildUnauthenticatedRedirect("/", origin);
		expect(url.pathname).toBe("/login");
		expect(url.searchParams.has("next")).toBe(false);
	});
});

describe("resolveAuthenticatedPublicRedirect", () => {
	it("redirects authenticated public visitors to /dashboard", () => {
		const url = resolveAuthenticatedPublicRedirect(origin);
		expect(url.pathname).toBe("/dashboard");
	});
});
