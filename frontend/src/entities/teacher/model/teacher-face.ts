import type { EmotionIntensity, TeacherEmotion } from "@llp/contracts";

export type TeacherFaceEmotion = TeacherEmotion;
export type TeacherFaceIntensity = EmotionIntensity;
export type TeacherFaceSpeech = "silent" | "quiet" | "normal" | "loud";

export const DEFAULT_TEACHER_FACE_EMOTION: TeacherFaceEmotion = "neutral";
export const DEFAULT_TEACHER_FACE_INTENSITY: TeacherFaceIntensity = 1;
export const DEFAULT_TEACHER_FACE_SPEECH: TeacherFaceSpeech = "silent";
