import { llm } from "@livekit/agents";
import {
	type AgentAddVocabularyBody,
	type AgentAddVocabularyResult,
	languageLevelInputSchema,
} from "@llp/contracts";
import { z } from "zod";

import { normalizeVocabularyTerm } from "../../utils/normalize-vocabulary-term";
import { buildTeacherInstructions } from "../../utils/teacher-instructions";
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
			"Save a word or phrase to the learner's vocabulary deck. Call only when correcting a mistake or when the learner explicitly asks to save a term. Do not call it for a term the learner already used correctly. Skip terms already in the deck context.",
		parameters: addVocabularyToolSchema,
		execute: async ({ term, cefr, definition, exampleSentence }, { ctx }) => {
			const existing = findDeckTerm(input.notebook, term);
			if (existing) {
				return { status: "already_in_deck" as const, term: existing };
			}
			const result = await savePhrase({
				callId: input.callId,
				body: { term, cefr, definition, exampleSentence },
			});
			await ctx.update(result);
			if (result.status === "added") {
				await rememberSavedPhrase({
					publisher: input.publisher,
					notebook: input.notebook,
					phrase: result.phrase,
				});
			}
			return undefined;
		},
	});
}

function findDeckTerm(
	notebook: TeacherNotebook,
	term: string,
): string | undefined {
	const normalized = normalizeVocabularyTerm(term);
	return notebook.instructionInput.vocabularyPhrases?.find(
		(phrase) => normalizeVocabularyTerm(phrase.term) === normalized,
	)?.term;
}

async function savePhrase(input: {
	callId: string;
	body: AgentAddVocabularyBody;
}): Promise<AgentAddVocabularyResult | { status: "not_saved"; term: string }> {
	try {
		return await addCallVocabulary(input);
	} catch (error) {
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
	const agent = input.notebook.agentRef.current;
	if (!agent) {
		return;
	}
	await agent.updateInstructions(
		buildTeacherInstructions(input.notebook.instructionInput),
	);
}
