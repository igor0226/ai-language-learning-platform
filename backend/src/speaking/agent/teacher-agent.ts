import { type JobContext, defineAgent, voice } from "@livekit/agents";
import * as openai from "@livekit/agents-plugin-openai";
import type { VocabularyPhrase } from "@llp/contracts";

import {
	buildGreetingInstructions,
	buildTeacherInstructions,
} from "../utils/teacher-instructions";
import {
	buildTeacherTurnHandling,
	buildTeacherVad,
	resolveSttModel,
} from "../utils/teacher-turn-config";

import { ReactionController } from "./reaction-controller";
import { createAddVocabularyTool } from "./tools/add-vocabulary";
import type { TeacherNotebook } from "./tools/teacher-notebook";
import { createSetEmotionTool } from "./tools/set-emotion";
import { parseTeacherJobMetadata } from "./utils/parse-job-metadata";
import { requireEmotionPublisher } from "./utils/publish-emotion";
import { fetchCallVocabulary } from "./utils/speaking-api-client";

export default defineAgent({
	entry: async (ctx: JobContext) => {
		const metadata = parseTeacherJobMetadata(ctx.job.metadata);
		let vocabularyPhrases: VocabularyPhrase[] = [];
		try {
			vocabularyPhrases = await fetchCallVocabulary({
				callId: metadata.callId,
			});
		} catch {
			vocabularyPhrases = [];
		}

		const instructionInput = {
			...metadata,
			vocabularyPhrases,
		};
		const instructions = buildTeacherInstructions(instructionInput);
		await ctx.connect();
		const publisher = requireEmotionPublisher(ctx.room.localParticipant);
		const reactions = new ReactionController(publisher);

		const notebook: TeacherNotebook = {
			instructionInput,
			agentRef: { current: null },
		};

		const setEmotion = createSetEmotionTool(publisher);
		const addVocabulary = createAddVocabularyTool({
			publisher,
			callId: metadata.callId,
			notebook,
		});

		const agent = new voice.Agent({
			instructions,
			tools: { set_emotion: setEmotion, add_vocabulary: addVocabulary },
		});
		notebook.agentRef.current = agent;

		const vad = buildTeacherVad();
		const session = new voice.AgentSession({
			vad,
			stt: new openai.STT({
				model: resolveSttModel(),
				vad,
				turnDetection: null,
			}),
			llm: new openai.realtime.RealtimeModel({
				model: process.env.SPEAKING_TEACHER_MODEL?.trim() || "gpt-realtime",
				voice: process.env.SPEAKING_TEACHER_VOICE?.trim() || "coral",
				turnDetection: null,
				inputAudioTranscription: null,
			}),
			turnHandling: buildTeacherTurnHandling(),
		});

		session.on(voice.AgentSessionEventTypes.UserInputTranscribed, (event) => {
			reactions.onTranscript({
				transcript: event.transcript,
				isFinal: event.isFinal,
			});
		});
		session.on(voice.AgentSessionEventTypes.UserStateChanged, (event) => {
			if (event.newState === "speaking") {
				void reactions.onUserStartedSpeaking();
				return;
			}
			if (event.newState === "listening" || event.newState === "away") {
				reactions.onUserStoppedSpeaking();
			}
		});

		await session.start({ agent, room: ctx.room });
		await session.generateReply({
			instructions: buildGreetingInstructions(instructionInput),
		});
	},
});
