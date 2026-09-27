"use client";

import { create } from "zustand";

type VocabularyDrawerState = {
	isDrawerOpen: boolean;
	openDrawer: () => void;
	closeDrawer: () => void;
	toggleDrawer: () => void;
};

export const useVocabularyDrawerStore = create<VocabularyDrawerState>()(
	(set) => ({
		isDrawerOpen: false,
		openDrawer: () => set({ isDrawerOpen: true }),
		closeDrawer: () => set({ isDrawerOpen: false }),
		toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
	}),
);

export function useVocabularyDrawer() {
	return useVocabularyDrawerStore();
}
