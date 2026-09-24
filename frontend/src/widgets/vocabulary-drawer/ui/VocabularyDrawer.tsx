"use client";

import type { SavedPhrase } from "@/entities/speaking-session";

import { BookMarked, Plus, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
	filterSavedPhrases,
	useVocabulary,
	VOCABULARY_CEFR_LEVELS,
} from "@/features/vocabulary-notebook";
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
	phonetic: "",
	cefr: "B2",
	definition: "",
	example: "",
});

function phraseToForm(phrase: SavedPhrase): PhraseFormValues {
	return {
		term: phrase.term,
		phonetic: phrase.phonetic,
		cefr: phrase.cefr,
		definition: phrase.definition,
		example: phrase.exampleSentence ?? "",
	};
}

export function VocabularyDrawer() {
	const {
		savedPhrases,
		isDrawerOpen,
		closeDrawer,
		addPhrase,
		updatePhrase,
		deletePhrase,
		copyPhrase,
	} = useVocabulary();

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
		const success = await copyPhrase(text);
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
		addPhrase({
			term: addForm.term,
			phonetic: addForm.phonetic || "/.../",
			cefr: addForm.cefr,
			definition: addForm.definition,
			exampleSentence: addForm.example || undefined,
		});
		setAddForm(emptyAddForm());
		setAddFormError("");
		setIsAddFormOpen(false);
		toast.success("Word saved to notebook");
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
		updatePhrase(id, {
			term: editForm.term.trim(),
			phonetic: editForm.phonetic.trim() || "/.../",
			cefr: editForm.cefr,
			definition: editForm.definition.trim(),
			exampleSentence: editForm.example.trim() || undefined,
		});
		setEditingId(null);
		setEditFormError("");
		toast.success("Entry updated");
	};

	return (
		<Sheet open={isDrawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
			<SheetContent
				side="right"
				className="studioOverlaySurface flex w-full flex-col gap-0 border-l p-0 sm:max-w-lg"
			>
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

				<ScrollArea className="flex-1">
					<div className="space-y-3 p-4">
						{filteredPhrases.length === 0 ? (
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
										onConfirmDelete={() => {
											deletePhrase(phrase.id);
											setDeletingId(null);
											toast.success("Entry removed");
										}}
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
