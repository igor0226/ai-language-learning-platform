"use client";

import type { TeacherVocabularyMessage } from "@llp/contracts";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";

import { useAuthSession } from "@/entities/session";
import { vocabularyPhrasesQueryKey } from "./vocabulary-phrases-query-key";

export function useTeacherVocabularyNotification() {
	const queryClient = useQueryClient();
	const { data: user } = useAuthSession();

	return useCallback(
		(message: TeacherVocabularyMessage) => {
			toast.success(`Added to your deck: ${message.term}`, {
				description: message.definition,
			});
			void queryClient.invalidateQueries({
				queryKey: vocabularyPhrasesQueryKey(user?.id),
			});
		},
		[queryClient, user?.id],
	);
}
