"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { VocabularyProvider } from "@/features/vocabulary-notebook";
import { createQueryClient } from "@/shared/lib/create-query-client";
import { Toaster } from "@/shared/ui/sonner";
import { TooltipProvider } from "@/shared/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(() => createQueryClient());

	return (
		<QueryClientProvider client={queryClient}>
			<VocabularyProvider>
				<TooltipProvider delayDuration={150}>
					{children}
					<Toaster />
				</TooltipProvider>
			</VocabularyProvider>
		</QueryClientProvider>
	);
}
