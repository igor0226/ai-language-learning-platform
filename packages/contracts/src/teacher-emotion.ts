import { z } from "zod";

export const TEACHER_EMOTIONS = [
	"neutral",
	"smile",
	"laugh",
	"upset",
	"surprised",
	"angry",
	"thoughtful",
] as const;

export const teacherEmotionSchema = z.enum(TEACHER_EMOTIONS);

export type TeacherEmotion = z.infer<typeof teacherEmotionSchema>;

export const EmotionIntensity = {
	Low: 1,
	Medium: 2,
	High: 3,
} as const;

export const emotionIntensitySchema = z.union([
	z.literal(EmotionIntensity.Low),
	z.literal(EmotionIntensity.Medium),
	z.literal(EmotionIntensity.High),
]);

export type EmotionIntensity = z.infer<typeof emotionIntensitySchema>;

export const emotionSourceSchema = z.enum(["reply", "reaction"]);

export type EmotionSource = z.infer<typeof emotionSourceSchema>;

export const teacherEmotionMessageSchema = z.object({
	emotion: teacherEmotionSchema,
	intensity: emotionIntensitySchema.optional(),
	source: emotionSourceSchema,
});

export type TeacherEmotionMessage = z.infer<typeof teacherEmotionMessageSchema>;

export const TEACHER_EMOTION_TOPIC = "teacher-emotion";

export function formatAllowedEmotions(): string {
	return TEACHER_EMOTIONS.join(", ");
}

export function isTeacherEmotion(value: unknown): value is TeacherEmotion {
	return teacherEmotionSchema.safeParse(value).success;
}
