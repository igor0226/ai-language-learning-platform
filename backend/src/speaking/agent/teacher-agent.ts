import { type JobContext, defineAgent, llm, voice } from "@livekit/agents";
import * as openai from "@livekit/agents-plugin-openai";
import { z } from "zod";

import {
	buildGreetingInstructions,
	buildTeacherInstructions,
} from "../utils/teacher-instructions";
import {
	buildTeacherTurnHandling,
	buildTeacherVad,
	resolveSttModel,
} from "../utils/teacher-turn-config";
import { emotionIntensitySchema, teacherEmotionSchema } from "@llp/contracts";

import { publishEmotion, requireEmotionPublisher } from "./emotion";
import { parseTeacherJobMetadata } from "./parse-job-metadata";
import { ReactionController } from "./reaction-controller";

const emotionToolSchema = z.object({
	emotion: teacherEmotionSchema,
	intensity: emotionIntensitySchema.optional(),
});

export default defineAgent({
	entry: async (ctx: JobContext) => {
		const metadata = parseTeacherJobMetadata(ctx.job.metadata);
		const instructions = buildTeacherInstructions(metadata);
		await ctx.connect();
		const publisher = requireEmotionPublisher(ctx.room.localParticipant);
		const reactions = new ReactionController(publisher);

		const setEmotion = llm.tool({
			description:
				"Silently update the teacher's on-screen facial emotion before speaking. Never mention this tool, the emotion name, or your face in spoken audio.",
			parameters: emotionToolSchema,
			execute: async ({ emotion, intensity }) => {
				await publishEmotion({
					publisher,
					message: { emotion, intensity, source: "reply" },
				});
				return "ok";
			},
		});

		const agent = new voice.Agent({
			instructions,
			tools: { set_emotion: setEmotion },
		});

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
			instructions: buildGreetingInstructions(metadata),
		});
	},
});
