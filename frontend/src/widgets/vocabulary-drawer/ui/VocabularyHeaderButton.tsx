"use client";

import { BookMarked } from "lucide-react";

import {
	useVocabularyDrawer,
	useVocabularyPhrases,
} from "@/features/vocabulary-notebook";
import { Button } from "@/shared/ui/button";

export function VocabularyHeaderButton() {
	const { openDrawer } = useVocabularyDrawer();
	const { phrases } = useVocabularyPhrases();

	return (
		<Button
			type="button"
			variant="outline"
			size="sm"
			className="hidden gap-1.5 sm:inline-flex"
			onClick={openDrawer}
		>
			<BookMarked className="h-3.5 w-3.5" />
			Vocabulary
			<span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px]">
				{phrases.length}
			</span>
		</Button>
	);
}
