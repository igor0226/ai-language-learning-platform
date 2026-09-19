import type { LearningMode } from "../type";

export function parseLearningMode(value: string | null): LearningMode {
	if (value === "speaking" || value === "listening") {
		return value;
	}
	return "listening";
}
