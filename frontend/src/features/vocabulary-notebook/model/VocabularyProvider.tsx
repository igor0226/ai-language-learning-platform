"use client";

import type {
	CreateVocabularyPhraseBody,
	UpdateVocabularyPhraseBody,
	VocabularyPhrase,
} from "@llp/contracts";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";

import { useAuthSession } from "@/entities/session";
import {
	createVocabularyPhrase,
	deleteVocabularyPhrase,
	fetchVocabularyPhrases,
	updateVocabularyPhrase,
} from "../api/vocabulary-phrases";
import { copyTextToClipboard } from "../lib/copy-text";

export function vocabularyPhrasesQueryKey(userId: string | undefined) {
	return ["vocabulary-phrases", userId] as const;
}

type VocabularyContextValue = {
	savedPhrases: VocabularyPhrase[];
	isPhrasesLoading: boolean;
	phrasesErrorMessage: string | null;
	isDrawerOpen: boolean;
	openDrawer: () => void;
	closeDrawer: () => void;
	toggleDrawer: () => void;
	addPhrase: (body: CreateVocabularyPhraseBody) => Promise<VocabularyPhrase>;
	updatePhrase: (id: string, body: UpdateVocabularyPhraseBody) => Promise<void>;
	deletePhrase: (id: string) => Promise<void>;
	copyPhrase: (text: string) => Promise<boolean>;
};

const VocabularyContext = createContext<VocabularyContextValue | undefined>(
	undefined,
);

export function VocabularyProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const { data: user } = useAuthSession();
	const queryClient = useQueryClient();
	const queryKey = vocabularyPhrasesQueryKey(user?.id);

	const phrasesQuery = useQuery({
		queryKey,
		queryFn: fetchVocabularyPhrases,
		enabled: Boolean(user?.id),
	});

	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
	const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
	const toggleDrawer = useCallback(
		() => setIsDrawerOpen((previous) => !previous),
		[],
	);

	const invalidatePhrases = useCallback(async () => {
		await queryClient.invalidateQueries({ queryKey });
	}, [queryClient, queryKey]);

	const addPhrase = useCallback(
		async (body: CreateVocabularyPhraseBody) => {
			const created = await createVocabularyPhrase(body);
			await invalidatePhrases();
			return created;
		},
		[invalidatePhrases],
	);

	const updatePhrase = useCallback(
		async (id: string, body: UpdateVocabularyPhraseBody) => {
			await updateVocabularyPhrase(id, body);
			await invalidatePhrases();
		},
		[invalidatePhrases],
	);

	const deletePhrase = useCallback(
		async (id: string) => {
			await deleteVocabularyPhrase(id);
			await invalidatePhrases();
		},
		[invalidatePhrases],
	);

	const copyPhrase = useCallback(
		(text: string) => copyTextToClipboard(text),
		[],
	);

	const savedPhrases = phrasesQuery.data ?? [];
	const phrasesErrorMessage =
		phrasesQuery.error instanceof Error ? phrasesQuery.error.message : null;

	const value = useMemo(
		() => ({
			savedPhrases,
			isPhrasesLoading: Boolean(user?.id) && phrasesQuery.isPending,
			phrasesErrorMessage,
			isDrawerOpen,
			openDrawer,
			closeDrawer,
			toggleDrawer,
			addPhrase,
			updatePhrase,
			deletePhrase,
			copyPhrase,
		}),
		[
			savedPhrases,
			user?.id,
			phrasesQuery.isPending,
			phrasesErrorMessage,
			isDrawerOpen,
			openDrawer,
			closeDrawer,
			toggleDrawer,
			addPhrase,
			updatePhrase,
			deletePhrase,
			copyPhrase,
		],
	);

	return (
		<VocabularyContext.Provider value={value}>
			{children}
		</VocabularyContext.Provider>
	);
}

export function useVocabulary(): VocabularyContextValue {
	const context = useContext(VocabularyContext);
	if (!context) {
		throw new Error("useVocabulary must be used within a VocabularyProvider");
	}
	return context;
}
