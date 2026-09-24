import type { LanguageLevel } from "@llp/contracts";

export type CallTopic = {
	id: string;
	title: string;
	level: string;
	description: string;
	suggestedDurationMins: number;
	isCustom?: boolean;
	createdAt?: string;
};

export type SpeakingCallStatus =
	| "connecting"
	| "in_progress"
	| "completed"
	| "failed"
	| "cancelled";

export type SpeakingCall = {
	id: string;
	callId: string;
	date: string;
	duration: string;
	durationSeconds: number;
	status: SpeakingCallStatus;
	languageLevel: LanguageLevel;
	sourceLanguage: string;
	explanationLanguage: string | null;
};

export type CallHistoryItem = {
	id: string;
	status: "active" | "ended" | "failed";
	sourceLanguage: string;
	languageLevel: LanguageLevel;
	explanationLanguage: string | null;
	createdAt: string;
	endedAt: string | null;
	durationSeconds: number | null;
};

export type TranscriptSegment = {
	id: string;
	speaker: "teacher" | "user";
	speakerName: string;
	text: string;
	timestamp: string;
	highlightedTerms?: string[];
};

export type SavedPhrase = {
	id: string;
	term: string;
	phonetic: string;
	cefr: LanguageLevel;
	definition: string;
	exampleSentence?: string;
	savedAt: string;
};

export type CallControlState = {
	isMuted: boolean;
	isPanelOpen: boolean;
};

export type ConnectionStep =
	| "permissions"
	| "ice_negotiation"
	| "model_warmup"
	| "ready";

export type CreateCallRequest = {
	sourceLanguage: string;
	languageLevel: LanguageLevel;
	explanationLanguage?: string;
	topic?: string;
};

export type CreateCallResponse = {
	callId: string;
	roomName: string;
	token: string;
	livekitUrl: string;
};
