import { llm } from "@livekit/agents";
import { languageLevelInputSchema } from "@llp/contracts";
import { z } from "zod";

import { buildTeacherInstructions } from "../../utils/teacher-instructions";
import { publishVocabulary } from "../utils/publish-vocabulary";
import type { EmotionPublisher } from "../utils/publish-emotion";
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
			"Save a new word or phrase to the learner's vocabulary deck. Call before saying you added it. Skip if the term is already in the deck context.",
		parameters: addVocabularyToolSchema,
		execute: async ({ term, cefr, definition, exampleSentence }) => {
			const result = await addCallVocabulary({
				callId: input.callId,
				body: { term, cefr, definition, exampleSentence },
			});
			if (result.status === "already_in_deck") {
				return result;
			}
			const phrases = [
				...(input.notebook.instructionInput.vocabularyPhrases ?? []),
				result.phrase,
			];
			input.notebook.instructionInput.vocabularyPhrases = phrases;
			await publishVocabulary({
				publisher: input.publisher,
				message: {
					term: result.phrase.term,
					cefr: result.phrase.cefr,
					definition: result.phrase.definition,
					exampleSentence: result.phrase.exampleSentence,
				},
			});
			const agent = input.notebook.agentRef.current;
			if (agent) {
				await agent.updateInstructions(
					buildTeacherInstructions(input.notebook.instructionInput),
				);
			}
			return result;
		},
	});
}
