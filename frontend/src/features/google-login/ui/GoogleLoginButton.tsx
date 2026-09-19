"use client";

import { apiUrl } from "@/shared/api";
import { Button } from "@/shared/ui/button";

export function GoogleLoginButton() {
	return (
		<Button asChild className="w-full">
			<a href={apiUrl("/api/auth/google")}>Continue with Google</a>
		</Button>
	);
}
