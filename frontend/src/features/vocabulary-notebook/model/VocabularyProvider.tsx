"use client";

import type { SavedPhrase } from "@/entities/speaking-session";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

import { buildPhraseEntry, type PhraseInput } from "../lib/build-phrase-entry";
import { copyTextToClipboard } from "../lib/copy-text";
import {
	loadSavedPhrases,
	persistSavedPhrases,
} from "../lib/vocabulary-storage";

type VocabularyContextValue = {
	savedPhrases: SavedPhrase[];
	isDrawerOpen: boolean;
	openDrawer: () => void;
	closeDrawer: () => void;
	toggleDrawer: () => void;
	addPhrase: (phrase: PhraseInput) => SavedPhrase;
	updatePhrase: (id: string, updates: Partial<Omit<SavedPhrase, "id">>) => void;
	deletePhrase: (id: string) => void;
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
	const [savedPhrases, setSavedPhrases] = useState<SavedPhrase[]>(() =>
		loadSavedPhrases(),
	);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	useEffect(() => {
		persistSavedPhrases(savedPhrases);
	}, [savedPhrases]);

	const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
	const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
	const toggleDrawer = useCallback(
		() => setIsDrawerOpen((previous) => !previous),
		[],
	);

	const addPhrase = useCallback((phrase: PhraseInput) => {
		const entry = buildPhraseEntry(phrase);
		setSavedPhrases((previous) => [entry, ...previous]);
		return entry;
	}, []);

	const updatePhrase = useCallback(
		(id: string, updates: Partial<Omit<SavedPhrase, "id">>) => {
			setSavedPhrases((previous) =>
				previous.map((item) =>
					item.id === id ? { ...item, ...updates } : item,
				),
			);
		},
		[],
	);

	const deletePhrase = useCallback((id: string) => {
		setSavedPhrases((previous) => previous.filter((item) => item.id !== id));
	}, []);

	const copyPhrase = useCallback(
		(text: string) => copyTextToClipboard(text),
		[],
	);

	const value = useMemo(
		() => ({
			savedPhrases,
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
