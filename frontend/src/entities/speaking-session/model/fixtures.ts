import type { ConnectionStep, TranscriptSegment } from "../type";

export const CONNECTION_STEPS: Array<{
	id: ConnectionStep;
	label: string;
}> = [
	{ id: "permissions", label: "Verifying microphone & audio devices..." },
	{
		id: "ice_negotiation",
		label: "Connecting to AI Teacher conversational server...",
	},
	{ id: "model_warmup", label: "Preparing B2 CEFR vocabulary context..." },
	{ id: "ready", label: "Connection established. Launching session..." },
];

export const CONNECTION_ERRORS = {
	mic_denied:
		"Microphone access was denied. Please allow microphone permissions in your browser to continue.",
	network_timeout:
		"Unable to connect to speaking server after 15 seconds. Please check your internet connection.",
} as const;

export const TRANSCRIPT_FIXTURE: TranscriptSegment[] = [
	{
		id: "seg-1",
		speaker: "teacher",
		speakerName: "Elena",
		text: "Hello! Welcome back to our technical discussion session. Today we are exploring systems architecture and trade-off rationalization.",
		timestamp: "00:04",
		highlightedTerms: ["systems architecture", "trade-off"],
	},
	{
		id: "seg-2",
		speaker: "user",
		speakerName: "You",
		text: "Thank you Elena. I'm excited to practice explaining asynchronous messaging architectures.",
		timestamp: "00:18",
	},
	{
		id: "seg-3",
		speaker: "teacher",
		speakerName: "Elena",
		text: "Splendid! Could you describe how you managed consistency versus latency in your most recent cloud pipeline?",
		timestamp: "00:32",
		highlightedTerms: ["consistency", "latency"],
	},
];
