import { TEACHER_EMOTION_TOPIC } from "@llp/contracts";
import { describe, expect, it, vi } from "vitest";

import type { EmotionPublisher } from "../utils/publish-emotion";
import { createSetEmotionTool } from "./set-emotion";

describe("set emotion tool", () => {
	it("returns ok before the emotion publish finishes", async () => {
		let resolvePublish: () => void = () => undefined;
		const publisher: EmotionPublisher = {
			publishData: vi.fn(
				() =>
					new Promise<void>((resolve) => {
						resolvePublish = resolve;
					}),
			),
		};
		const tool = createSetEmotionTool(publisher);

		const result = await tool.execute(
			{ emotion: "smile", intensity: 2 },
			{
				ctx: {} as never,
				toolCallId: "tool-call",
				abortSignal: new AbortController().signal,
			},
		);

		expect(result).toEqual({ ok: true });
		expect(publisher.publishData).toHaveBeenCalledTimes(1);
		resolvePublish();
		await vi.waitFor(() => {
			expect(publisher.publishData).toHaveBeenCalledTimes(1);
		});
		const [bytes, options] = vi.mocked(publisher.publishData).mock.calls[0];
		expect(options).toMatchObject({
			reliable: true,
			topic: TEACHER_EMOTION_TOPIC,
		});
		expect(JSON.parse(new TextDecoder().decode(bytes))).toMatchObject({
			emotion: "smile",
			intensity: 2,
			source: "reply",
		});
	});

	it("returns ok when the emotion publish fails", async () => {
		const publisher: EmotionPublisher = {
			publishData: vi.fn(async () => {
				throw new Error("publish failed");
			}),
		};
		const tool = createSetEmotionTool(publisher);

		await expect(
			tool.execute(
				{ emotion: "smile", intensity: 2 },
				{
					ctx: {} as never,
					toolCallId: "tool-call",
					abortSignal: new AbortController().signal,
				},
			),
		).resolves.toEqual({ ok: true });
		await vi.waitFor(() => {
			expect(publisher.publishData).toHaveBeenCalledTimes(1);
		});
	});
});
