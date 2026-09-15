import { LANGUAGE_LEVELS, type LanguageLevel } from "@llp/contracts";

const CEFR_PATTERN = new RegExp(`\\b(${LANGUAGE_LEVELS.join("|")})\\b`, "i");
const DEFAULT_LEVEL: LanguageLevel = "B1";

export function parseCefrLevel(value: string): LanguageLevel {
	const match = value.match(CEFR_PATTERN);
	if (!match?.[1]) {
		return DEFAULT_LEVEL;
	}
	const level = match[1].toUpperCase() as LanguageLevel;
	return LANGUAGE_LEVELS.includes(level) ? level : DEFAULT_LEVEL;
}
