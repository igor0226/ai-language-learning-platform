import type { SavedPhrase } from "@/entities/speaking-session";

import { Check, Copy, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

type VocabularyPhraseRowProps = {
	phrase: SavedPhrase;
	isCopied: boolean;
	isDeleting: boolean;
	onCopy: () => void;
	onEdit: () => void;
	onConfirmDelete: () => void;
	onCancelDelete: () => void;
	onRequestDelete: () => void;
};

export function VocabularyPhraseRow({
	phrase,
	isCopied,
	isDeleting,
	onCopy,
	onEdit,
	onConfirmDelete,
	onCancelDelete,
	onRequestDelete,
}: VocabularyPhraseRowProps) {
	return (
		<div className="rounded-xl border border-border bg-card p-3">
			{isDeleting ? (
				<div className="flex items-center justify-between gap-2 text-xs">
					<span>Delete this entry?</span>
					<div className="flex gap-1">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={onCancelDelete}
						>
							Cancel
						</Button>
						<Button
							type="button"
							variant="destructive"
							size="sm"
							onClick={onConfirmDelete}
						>
							Delete
						</Button>
					</div>
				</div>
			) : (
				<>
					<div className="flex items-start justify-between gap-2">
						<div>
							<div className="flex flex-wrap items-center gap-2">
								<span className="text-sm font-bold">{phrase.term}</span>
								<Badge variant="secondary">{phrase.cefr}</Badge>
							</div>
							<p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
								{phrase.phonetic} · Saved at {phrase.savedAt}
							</p>
						</div>
						<div className="flex shrink-0 gap-0.5">
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={onCopy}
								aria-label={`Copy ${phrase.term}`}
							>
								{isCopied ? (
									<Check className="h-3.5 w-3.5 text-emerald-600" />
								) : (
									<Copy className="h-3.5 w-3.5" />
								)}
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={onEdit}
								aria-label={`Edit ${phrase.term}`}
							>
								<Pencil className="h-3.5 w-3.5" />
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="h-8 w-8 text-muted-foreground hover:text-destructive"
								onClick={onRequestDelete}
								aria-label={`Delete ${phrase.term}`}
							>
								<Trash2 className="h-3.5 w-3.5" />
							</Button>
						</div>
					</div>
					<p className="mt-2 text-xs leading-relaxed">{phrase.definition}</p>
					{phrase.exampleSentence ? (
						<p className="mt-1.5 text-xs italic text-muted-foreground">
							&ldquo;{phrase.exampleSentence}&rdquo;
						</p>
					) : null}
				</>
			)}
		</div>
	);
}
