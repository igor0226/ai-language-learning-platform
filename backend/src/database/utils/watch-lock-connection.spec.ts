import { EventEmitter } from "node:events";
import { afterEach, describe, expect, it, vi } from "vitest";
import { watchLockConnection } from "./watch-lock-connection";

afterEach(() => vi.restoreAllMocks());
describe("lock connection loss", () => {
	it("fails closed if an active lock connection ends", () => {
		const client = new EventEmitter();
		const exit = vi.spyOn(process, "exit").mockImplementation(() => {
			throw new Error("exit");
		});
		vi.spyOn(process.stderr, "write").mockReturnValue(true);
		watchLockConnection(client as never);
		expect(() => client.emit("end")).toThrow("exit");
		expect(exit).toHaveBeenCalledWith(1);
	});
	it("does not terminate after work has finished", () => {
		const client = new EventEmitter();
		const exit = vi.spyOn(process, "exit");
		const stop = watchLockConnection(client as never);
		stop();
		client.emit("end");
		expect(exit).not.toHaveBeenCalled();
	});
});
