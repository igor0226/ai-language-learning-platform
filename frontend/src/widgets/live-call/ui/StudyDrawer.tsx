import type { VocabularyPhrase } from "@llp/contracts";

import { VocabularyPanel } from "./VocabularyPanel";

type StudyDrawerProps = {
	phrases: VocabularyPhrase[];
	isLoading?: boolean;
};

export function StudyDrawer({ phrases, isLoading }: StudyDrawerProps) {
	return (
		<aside className="callDrawer" aria-label="Saved phrases">
			<div className="flex h-full min-h-0 flex-col">
				<div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
					<h2 className="text-sm font-semibold">Saved Phrases</h2>
					<span className="font-mono text-[10px] text-muted-foreground">
						{phrases.length}
					</span>
				</div>
				<VocabularyPanel phrases={phrases} isLoading={isLoading} />
			</div>
		</aside>
	);
}
