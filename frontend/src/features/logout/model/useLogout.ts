"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { logout } from "../api/logout";

export function useLogout() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: logout,
		onSuccess: async () => {
			await queryClient.resetQueries({ queryKey: ["auth", "me"] });
			router.push("/login");
			router.refresh();
		},
	});
}
