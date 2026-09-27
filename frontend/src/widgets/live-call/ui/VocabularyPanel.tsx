import type { VocabularyPhrase } from "@llp/contracts";

import { formatVocabularySavedAt } from "@/features/vocabulary-notebook";
import { Badge } from "@/shared/ui/badge";
import { ScrollArea } from "@/shared/ui/scroll-area";

type VocabularyPanelProps = {
	phrases: VocabularyPhrase[];
	isLoading?: boolean;
};

export function VocabularyPanel({
	phrases,
	isLoading = false,
}: VocabularyPanelProps) {
	return (
		<div className="flex flex-1 flex-col">
			<ScrollArea className="flex-1">
				<div className="space-y-3 p-4">
					{isLoading ? (
						<p className="text-xs text-muted-foreground">
							Loading saved phrases…
						</p>
					) : phrases.length === 0 ? (
						<p className="text-xs text-muted-foreground">
							No saved phrases in your notebook yet. Add words from the
							vocabulary sheet on other pages.
						</p>
					) : (
						phrases.map((phrase) => (
							<div
								key={phrase.id}
								className="space-y-1.5 rounded-xl border border-border bg-muted p-3"
							>
								<div className="flex items-center justify-between">
									<div className="text-xs font-bold">{phrase.term}</div>
									<Badge variant="secondary">{phrase.cefr}</Badge>
								</div>
								<div className="text-[11px] text-muted-foreground">
									Saved {formatVocabularySavedAt(phrase.savedAt)}
								</div>
								<p className="text-xs leading-normal">{phrase.definition}</p>
							</div>
						))
					)}
				</div>
			</ScrollArea>
		</div>
	);
}
