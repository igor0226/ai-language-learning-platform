import { ServerOptions, cli } from "@livekit/agents";
import { fileURLToPath } from "node:url";

cli.runApp(
	new ServerOptions({
		agent: fileURLToPath(new URL("./teacher-agent.ts", import.meta.url)),
		agentName: process.env.SPEAKING_AGENT_NAME?.trim() || "teacher-agent",
		// Keep the shared dev node's warm process pool small.
		numIdleProcesses: process.env.NODE_ENV === "production" ? 1 : undefined,
	}),
);
