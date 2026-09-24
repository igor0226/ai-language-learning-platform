import type { SavedPhrase } from "@/entities/speaking-session";

import { SAVED_PHRASES } from "@/entities/speaking-session";

export const VOCABULARY_STORAGE_KEY = "language_studio_vocabulary_v1";

export function loadSavedPhrases(): SavedPhrase[] {
	if (typeof window === "undefined") {
		return SAVED_PHRASES;
	}
	try {
		const stored = localStorage.getItem(VOCABULARY_STORAGE_KEY);
		if (!stored) {
			return SAVED_PHRASES;
		}
		const parsed: unknown = JSON.parse(stored);
		if (Array.isArray(parsed) && parsed.length > 0) {
			return parsed as SavedPhrase[];
		}
	} catch {
		return SAVED_PHRASES;
	}
	return SAVED_PHRASES;
}

export function persistSavedPhrases(phrases: SavedPhrase[]): void {
	if (typeof window === "undefined") {
		return;
	}
	try {
		localStorage.setItem(VOCABULARY_STORAGE_KEY, JSON.stringify(phrases));
	} catch {
		// ignore quota / private mode
	}
}
