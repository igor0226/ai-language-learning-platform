import { ServerOptions, cli } from "@livekit/agents";
import { fileURLToPath } from "node:url";

cli.runApp(
	new ServerOptions({
		agent: fileURLToPath(new URL("./teacher-agent.ts", import.meta.url)),
		agentName: process.env.SPEAKING_AGENT_NAME?.trim() || "teacher-agent",
	}),
);
