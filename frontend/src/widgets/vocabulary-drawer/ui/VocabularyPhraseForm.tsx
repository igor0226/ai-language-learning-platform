import type { LanguageLevel } from "@llp/contracts";

import { VOCABULARY_CEFR_LEVELS } from "@/features/vocabulary-notebook/lib/filter-phrases";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";

export type PhraseFormValues = {
	term: string;
	phonetic: string;
	cefr: LanguageLevel;
	definition: string;
	example: string;
};

type VocabularyPhraseFormProps = {
	title: string;
	values: PhraseFormValues;
	error: string;
	submitLabel: string;
	onChange: (patch: Partial<PhraseFormValues>) => void;
	onSubmit: () => void;
	onCancel: () => void;
};

export function VocabularyPhraseForm({
	title,
	values,
	error,
	submitLabel,
	onChange,
	onSubmit,
	onCancel,
}: VocabularyPhraseFormProps) {
	return (
		<div className="space-y-3 border-b border-border bg-muted/40 p-4">
			<div className="flex items-center justify-between">
				<h3 className="text-xs font-bold uppercase tracking-wider">{title}</h3>
			</div>
			{error ? (
				<p className="text-xs text-destructive" role="alert">
					{error}
				</p>
			) : null}
			<form
				className="space-y-3"
				onSubmit={(event) => {
					event.preventDefault();
					onSubmit();
				}}
			>
				<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
					<div className="space-y-1">
						<Label className="text-[11px]">Word or phrase *</Label>
						<Input
							value={values.term}
							onChange={(event) => onChange({ term: event.target.value })}
							placeholder="e.g. Paradigm shift"
						/>
					</div>
					<div className="space-y-1">
						<Label className="text-[11px]">Phonetic</Label>
						<Input
							value={values.phonetic}
							onChange={(event) => onChange({ phonetic: event.target.value })}
							className="font-mono text-xs"
							placeholder="/ˈpær.ə.daɪm/"
						/>
					</div>
				</div>
				<div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
					<div className="space-y-1">
						<Label className="text-[11px]">CEFR</Label>
						<Select
							value={values.cefr}
							onValueChange={(value) =>
								onChange({ cefr: value as LanguageLevel })
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{VOCABULARY_CEFR_LEVELS.map((level) => (
									<SelectItem key={level} value={level}>
										{level}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-1 sm:col-span-2">
						<Label className="text-[11px]">Definition *</Label>
						<Input
							value={values.definition}
							onChange={(event) => onChange({ definition: event.target.value })}
							placeholder="Meaning or translation"
						/>
					</div>
				</div>
				<div className="space-y-1">
					<Label className="text-[11px]">Example (optional)</Label>
					<Textarea
						value={values.example}
						onChange={(event) => onChange({ example: event.target.value })}
						rows={2}
						className="min-h-0 text-xs"
					/>
				</div>
				<div className="flex justify-end gap-2">
					<Button type="button" variant="ghost" size="sm" onClick={onCancel}>
						Cancel
					</Button>
					<Button type="submit" size="sm">
						{submitLabel}
					</Button>
				</div>
			</form>
		</div>
	);
}
