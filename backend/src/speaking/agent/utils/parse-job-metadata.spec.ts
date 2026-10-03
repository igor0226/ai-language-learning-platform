import { describe, expect, it } from "vitest";

import {
	InvalidTeacherJobMetadataError,
	parseTeacherJobMetadata,
} from "./parse-job-metadata";

describe("parseTeacherJobMetadata", () => {
	it("parses topic from job metadata", () => {
		expect(
			parseTeacherJobMetadata(
				JSON.stringify({
					callId: "call-1",
					sourceLanguage: "English",
					languageLevel: "B2",
					explanationLanguage: null,
					topic: "Travel check-in",
				}),
			),
		).toMatchObject({
			callId: "call-1",
			languageLevel: "B2",
			topic: "Travel check-in",
		});
	});

	it("throws when metadata is missing", () => {
		expect(() => parseTeacherJobMetadata(undefined)).toThrow(
			InvalidTeacherJobMetadataError,
		);
		expect(() => parseTeacherJobMetadata("   ")).toThrow(/missing/);
	});

	it("throws when metadata is not valid JSON", () => {
		expect(() => parseTeacherJobMetadata("{")).toThrow(
			InvalidTeacherJobMetadataError,
		);
	});

	it("throws when metadata fails validation", () => {
		expect(() =>
			parseTeacherJobMetadata(JSON.stringify({ callId: "call-1" })),
		).toThrow(/validation/);
	});
});
