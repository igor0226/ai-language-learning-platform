"use client";

import type { VocabularyPhrase } from "@llp/contracts";

import { BookMarked, Plus, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
	copyTextToClipboard,
	filterSavedPhrases,
	useCreateVocabularyPhrase,
	useDeleteVocabularyPhrase,
	useUpdateVocabularyPhrase,
	useVocabularyDrawer,
	useVocabularyPhrases,
	VOCABULARY_CEFR_LEVELS,
} from "@/features/vocabulary-notebook";
import { cn } from "@/shared/lib";
import { useMdUp } from "@/shared/lib/use-md-up";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { ScrollArea } from "@/shared/ui/scroll-area";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/shared/ui/sheet";
import {
	type PhraseFormValues,
	VocabularyPhraseForm,
} from "./VocabularyPhraseForm";
import { VocabularyPhraseRow } from "./VocabularyPhraseRow";

const emptyAddForm = (): PhraseFormValues => ({
	term: "",
	cefr: "B2",
	definition: "",
	example: "",
});

function phraseToForm(phrase: VocabularyPhrase): PhraseFormValues {
	return {
		term: phrase.term,
		cefr: phrase.cefr,
		definition: phrase.definition,
		example: phrase.exampleSentence ?? "",
	};
}

export function VocabularyDrawer() {
	const { isDrawerOpen, closeDrawer } = useVocabularyDrawer();
	const {
		phrases: savedPhrases,
		isLoading: isPhrasesLoading,
		errorMessage: phrasesErrorMessage,
	} = useVocabularyPhrases();
	const { createPhrase } = useCreateVocabularyPhrase();
	const { updatePhrase } = useUpdateVocabularyPhrase();
	const { deletePhrase } = useDeleteVocabularyPhrase();

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedLevel, setSelectedLevel] = useState("all");
	const [isAddFormOpen, setIsAddFormOpen] = useState(false);
	const [addForm, setAddForm] = useState(emptyAddForm);
	const [addFormError, setAddFormError] = useState("");
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editForm, setEditForm] = useState(emptyAddForm);
	const [editFormError, setEditFormError] = useState("");
	const [copiedId, setCopiedId] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const isMdUp = useMdUp();

	const filteredPhrases = useMemo(
		() => filterSavedPhrases(savedPhrases, searchQuery, selectedLevel),
		[savedPhrases, searchQuery, selectedLevel],
	);

	useEffect(() => {
		if (!isDrawerOpen) {
			setIsAddFormOpen(false);
			setEditingId(null);
			setDeletingId(null);
			setAddFormError("");
			setEditFormError("");
		}
	}, [isDrawerOpen]);

	const handleCopyTerm = async (id: string, text: string) => {
		const success = await copyTextToClipboard(text);
		if (success) {
			setCopiedId(id);
			window.setTimeout(() => setCopiedId(null), 2000);
		}
	};

	const submitAdd = () => {
		if (!addForm.term.trim()) {
			setAddFormError("Please enter a word or phrase.");
			return;
		}
		if (!addForm.definition.trim()) {
			setAddFormError("Please enter a definition.");
			return;
		}
		void createPhrase({
			term: addForm.term,
			cefr: addForm.cefr,
			definition: addForm.definition,
			exampleSentence: addForm.example || undefined,
		})
			.then(() => {
				setAddForm(emptyAddForm());
				setAddFormError("");
				setIsAddFormOpen(false);
				toast.success("Word saved to notebook");
			})
			.catch(() => {
				toast.error("Could not save word. Try again.");
			});
	};

	const submitEdit = (id: string) => {
		if (!editForm.term.trim()) {
			setEditFormError("Word or phrase cannot be empty.");
			return;
		}
		if (!editForm.definition.trim()) {
			setEditFormError("Definition cannot be empty.");
			return;
		}
		const example = editForm.example.trim();
		void updatePhrase(id, {
			term: editForm.term.trim(),
			cefr: editForm.cefr,
			definition: editForm.definition.trim(),
			exampleSentence: example.length > 0 ? example : null,
		})
			.then(() => {
				setEditingId(null);
				setEditFormError("");
				toast.success("Entry updated");
			})
			.catch(() => {
				toast.error("Could not update entry. Try again.");
			});
	};

	const confirmDelete = (id: string) => {
		void deletePhrase(id)
			.then(() => {
				setDeletingId(null);
				toast.success("Entry removed");
			})
			.catch(() => {
				toast.error("Could not delete entry. Try again.");
			});
	};

	return (
		<Sheet open={isDrawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
			<SheetContent
				side={isMdUp ? "right" : "bottom"}
				className={cn(
					"studioOverlaySurface flex flex-col gap-0 p-0",
					isMdUp
						? "h-full w-full border-l sm:max-w-lg"
						: "safe-bottom max-h-[90dvh] w-full rounded-t-2xl border-x-0 border-b-0",
				)}
			>
				{isMdUp ? null : (
					<div
						className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-muted"
						aria-hidden
					/>
				)}
				<SheetHeader className="space-y-0 border-b border-border px-5 py-4 text-left">
					<div className="flex items-start justify-between gap-3 pr-8">
						<div className="flex items-center gap-3">
							<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
								<BookMarked className="h-5 w-5" />
							</div>
							<div>
								<div className="flex items-center gap-2">
									<SheetTitle className="text-base">
										Vocabulary Notebook
									</SheetTitle>
									<span className="rounded-full border border-border bg-muted px-2 py-0.5 font-mono text-xs font-semibold">
										{savedPhrases.length}
									</span>
								</div>
								<SheetDescription className="text-xs">
									Manage saved words, definitions, and idioms
								</SheetDescription>
							</div>
						</div>
						<Button
							type="button"
							size="sm"
							variant={isAddFormOpen ? "secondary" : "default"}
							onClick={() => {
								setIsAddFormOpen((open) => !open);
								if (editingId) {
									setEditingId(null);
								}
							}}
						>
							<Plus className="mr-1 h-3.5 w-3.5" />
							{isAddFormOpen ? "Cancel" : "Add word"}
						</Button>
					</div>
				</SheetHeader>

				{isAddFormOpen ? (
					<VocabularyPhraseForm
						title="New word or phrase"
						values={addForm}
						error={addFormError}
						submitLabel="Save to notebook"
						onChange={(patch) =>
							setAddForm((current) => ({ ...current, ...patch }))
						}
						onSubmit={submitAdd}
						onCancel={() => setIsAddFormOpen(false)}
					/>
				) : null}

				<div className="space-y-3 border-b border-border p-4">
					<div className="relative">
						<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							value={searchQuery}
							onChange={(event) => setSearchQuery(event.target.value)}
							className="pl-9 pr-8"
							placeholder="Search words, definitions, examples..."
						/>
						{searchQuery ? (
							<button
								type="button"
								className="absolute right-2.5 top-2.5 text-muted-foreground"
								onClick={() => setSearchQuery("")}
								aria-label="Clear search"
							>
								<X className="h-4 w-4" />
							</button>
						) : null}
					</div>
					<div className="flex flex-wrap items-center justify-between gap-2">
						<div className="flex flex-wrap items-center gap-1">
							<span className="mr-1 text-[11px] text-muted-foreground">
								Level:
							</span>
							<LevelPill
								label="All"
								active={selectedLevel === "all"}
								onClick={() => setSelectedLevel("all")}
							/>
							{VOCABULARY_CEFR_LEVELS.map((level) => (
								<LevelPill
									key={level}
									label={level}
									active={selectedLevel === level}
									onClick={() => setSelectedLevel(level)}
								/>
							))}
						</div>
					</div>
				</div>

				<ScrollArea className="min-h-0 flex-1">
					<div className="space-y-3 p-4">
						{isPhrasesLoading ? (
							<p className="py-12 text-center text-xs text-muted-foreground">
								Loading your vocabulary…
							</p>
						) : phrasesErrorMessage ? (
							<p className="py-12 text-center text-xs text-destructive">
								{phrasesErrorMessage}
							</p>
						) : filteredPhrases.length === 0 ? (
							<EmptyState
								hasFilters={Boolean(searchQuery) || selectedLevel !== "all"}
								onClearFilters={() => {
									setSearchQuery("");
									setSelectedLevel("all");
								}}
								onAdd={() => setIsAddFormOpen(true)}
							/>
						) : (
							filteredPhrases.map((phrase) => {
								if (editingId === phrase.id) {
									return (
										<VocabularyPhraseForm
											key={phrase.id}
											title="Edit vocabulary entry"
											values={editForm}
											error={editFormError}
											submitLabel="Save changes"
											onChange={(patch) =>
												setEditForm((current) => ({ ...current, ...patch }))
											}
											onSubmit={() => submitEdit(phrase.id)}
											onCancel={() => setEditingId(null)}
										/>
									);
								}
								return (
									<VocabularyPhraseRow
										key={phrase.id}
										phrase={phrase}
										isCopied={copiedId === phrase.id}
										isDeleting={deletingId === phrase.id}
										onCopy={() => void handleCopyTerm(phrase.id, phrase.term)}
										onEdit={() => {
											setEditingId(phrase.id);
											setEditForm(phraseToForm(phrase));
											setEditFormError("");
										}}
										onRequestDelete={() => setDeletingId(phrase.id)}
										onCancelDelete={() => setDeletingId(null)}
										onConfirmDelete={() => confirmDelete(phrase.id)}
									/>
								);
							})
						)}
					</div>
				</ScrollArea>

				<div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
					Showing {filteredPhrases.length} of {savedPhrases.length} words
				</div>
			</SheetContent>
		</Sheet>
	);
}

function LevelPill({
	label,
	active,
	onClick,
}: {
	label: string;
	active: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors ${
				active
					? "bg-primary text-primary-foreground"
					: "bg-muted text-muted-foreground hover:bg-muted/80"
			}`}
		>
			{label}
		</button>
	);
}

function EmptyState({
	hasFilters,
	onClearFilters,
	onAdd,
}: {
	hasFilters: boolean;
	onClearFilters: () => void;
	onAdd: () => void;
}) {
	return (
		<div className="space-y-3 py-12 text-center">
			<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
				<BookMarked className="h-6 w-6" />
			</div>
			<div>
				<h4 className="text-sm font-semibold">
					{hasFilters
						? "No matching vocabulary items"
						: "No vocabulary items saved yet"}
				</h4>
				<p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">
					{hasFilters
						? "Try a different keyword or reset the CEFR filter."
						: "Save words from speaking calls or add your own terms anytime."}
				</p>
			</div>
			{hasFilters ? (
				<Button type="button" variant="link" size="sm" onClick={onClearFilters}>
					Clear filters
				</Button>
			) : (
				<Button type="button" size="sm" onClick={onAdd}>
					<Plus className="mr-1 h-3.5 w-3.5" />
					Add first word
				</Button>
			)}
		</div>
	);
}
