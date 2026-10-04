import { llm, log } from "@livekit/agents";
import {
	type AgentAddVocabularyBody,
	type AgentAddVocabularyResult,
	languageLevelInputSchema,
} from "@llp/contracts";
import { z } from "zod";

import { normalizeVocabularyTerm } from "../../utils/normalize-vocabulary-term";
import type { EmotionPublisher } from "../utils/publish-emotion";
import { publishVocabulary } from "../utils/publish-vocabulary";
import { addCallVocabulary } from "../utils/speaking-api-client";
import type { TeacherNotebook } from "./teacher-notebook";

const addVocabularyToolSchema = z.object({
	term: z.string().trim().min(1),
	cefr: languageLevelInputSchema,
	definition: z.string().trim().min(1),
	exampleSentence: z.string().trim().min(1).optional(),
});

export function createAddVocabularyTool(input: {
	publisher: EmotionPublisher;
	callId: string;
	notebook: TeacherNotebook;
}) {
	return llm.tool({
		description:
			"Save a word or phrase to the learner's vocabulary deck. Calling this function is the save. Call it before speaking when correcting a mistake or when the learner explicitly asks to save a term. Do not call it for a term the learner already used correctly. Skip terms already in the deck context. Say 'I'm adding it to your deck now.' only when this function returns status adding. Do not say that line for any other status.",
		parameters: addVocabularyToolSchema,
		execute: async ({ term, cefr, definition, exampleSentence }) => {
			const existing = findDeckTerm(input.notebook, term);
			if (existing) {
				return { status: "already_in_deck" as const, term: existing };
			}
			const normalized = normalizeVocabularyTerm(term);
			input.notebook.pendingTerms.add(normalized);
			void persistPhrase({
				callId: input.callId,
				publisher: input.publisher,
				notebook: input.notebook,
				normalized,
				body: { term, cefr, definition, exampleSentence },
			});
			return { status: "adding" as const, term: term.trim() };
		},
	});
}

function findDeckTerm(
	notebook: TeacherNotebook,
	term: string,
): string | undefined {
	const normalized = normalizeVocabularyTerm(term);
	if (
		notebook.pendingTerms.has(normalized) ||
		notebook.settledTerms.has(normalized)
	) {
		return term.trim();
	}
	return notebook.instructionInput.vocabularyPhrases?.find(
		(phrase) => normalizeVocabularyTerm(phrase.term) === normalized,
	)?.term;
}

async function persistPhrase(input: {
	callId: string;
	publisher: EmotionPublisher;
	notebook: TeacherNotebook;
	normalized: string;
	body: AgentAddVocabularyBody;
}): Promise<void> {
	try {
		const result = await savePhrase({
			callId: input.callId,
			body: input.body,
		});
		if (result.status === "added") {
			await rememberSavedPhrase({
				publisher: input.publisher,
				notebook: input.notebook,
				phrase: result.phrase,
			});
			return;
		}
		if (result.status === "already_in_deck") {
			input.notebook.settledTerms.add(input.normalized);
			return;
		}
		reportSaveFailure({ term: result.term, status: result.status });
	} catch (error) {
		reportSaveFailure({ term: input.body.term, error });
	} finally {
		input.notebook.pendingTerms.delete(input.normalized);
	}
}

async function savePhrase(input: {
	callId: string;
	body: AgentAddVocabularyBody;
}): Promise<AgentAddVocabularyResult | { status: "not_saved"; term: string }> {
	try {
		return await addCallVocabulary(input);
	} catch {
		return { status: "not_saved", term: input.body.term.trim() };
	}
}

async function rememberSavedPhrase(input: {
	publisher: EmotionPublisher;
	notebook: TeacherNotebook;
	phrase: Extract<AgentAddVocabularyResult, { status: "added" }>["phrase"];
}): Promise<void> {
	input.notebook.instructionInput.vocabularyPhrases = [
		...(input.notebook.instructionInput.vocabularyPhrases ?? []),
		input.phrase,
	];
	await publishVocabulary({
		publisher: input.publisher,
		message: {
			term: input.phrase.term,
			cefr: input.phrase.cefr,
			definition: input.phrase.definition,
			exampleSentence: input.phrase.exampleSentence,
		},
	});
}

function reportSaveFailure(input: {
	term: string;
	status?: string;
	error?: unknown;
}): void {
	try {
		log().error(input, "vocabulary save failed");
	} catch {
		// The agent CLI initializes the logger. A missing logger must not fail the save.
	}
}
