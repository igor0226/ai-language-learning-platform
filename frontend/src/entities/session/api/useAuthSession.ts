"use client";

import { useQuery } from "@tanstack/react-query";

import { AuthRequiredError, fetchAuthMe } from "./fetchAuthMe";

export function useAuthSession() {
	return useQuery({
		queryKey: ["auth", "me"],
		queryFn: fetchAuthMe,
		retry: (_, error) => !(error instanceof AuthRequiredError),
		staleTime: 60_000,
	});
}
