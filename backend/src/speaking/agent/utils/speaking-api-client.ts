import {
	agentAddVocabularyResultSchema,
	type AgentAddVocabularyBody,
	type AgentAddVocabularyResult,
	vocabularyPhraseListSchema,
	type VocabularyPhrase,
} from "@llp/contracts";

export function resolveSpeakingApiUrl(): string {
	const raw = process.env.SPEAKING_API_URL?.trim() || "http://localhost:3001";
	return raw.replace(/\/+$/, "");
}

export function resolveAgentApiAuthorization(): string {
	const secret = process.env.SPEAKING_INTERNAL_API_SECRET?.trim();
	if (!secret) {
		throw new Error("SPEAKING_INTERNAL_API_SECRET is not configured");
	}
	return `Bearer ${secret}`;
}

export async function fetchCallVocabulary(input: {
	callId: string;
}): Promise<VocabularyPhrase[]> {
	const response = await fetch(
		`${resolveSpeakingApiUrl()}/api/agent/speaking/calls/${encodeURIComponent(input.callId)}/vocabulary`,
		{
			headers: { Authorization: resolveAgentApiAuthorization() },
		},
	);
	if (!response.ok) {
		throw new Error(`Failed to load vocabulary (${response.status})`);
	}
	const json: unknown = await response.json();
	return vocabularyPhraseListSchema.parse(json).phrases;
}

export async function addCallVocabulary(input: {
	callId: string;
	body: AgentAddVocabularyBody;
}): Promise<AgentAddVocabularyResult> {
	const response = await fetch(
		`${resolveSpeakingApiUrl()}/api/agent/speaking/calls/${encodeURIComponent(input.callId)}/vocabulary`,
		{
			method: "POST",
			headers: {
				Authorization: resolveAgentApiAuthorization(),
				"Content-Type": "application/json",
			},
			body: JSON.stringify(input.body),
		},
	);
	if (!response.ok) {
		throw new Error(`Failed to add vocabulary (${response.status})`);
	}
	const json: unknown = await response.json();
	return agentAddVocabularyResultSchema.parse(json);
}
