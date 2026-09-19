import type { TeacherCallRecord } from "@/storage/type";
import type { TeacherCallHistoryItem } from "../type/teacher-call-history-item";

export function toCallHistoryItem(
	record: TeacherCallRecord,
): TeacherCallHistoryItem {
	return {
		id: record.id,
		status: record.status,
		sourceLanguage: record.sourceLanguage,
		languageLevel: record.languageLevel,
		explanationLanguage: record.explanationLanguage,
		createdAt: record.createdAt,
		endedAt: record.endedAt,
		durationSeconds: durationSecondsFromRange(record),
	};
}

function durationSecondsFromRange(record: TeacherCallRecord): number | null {
	if (!record.endedAt) {
		return null;
	}
	const startMs = Date.parse(record.createdAt);
	const endMs = Date.parse(record.endedAt);
	if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
		return null;
	}
	return Math.max(0, Math.floor((endMs - startMs) / 1000));
}
