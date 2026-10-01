import type { voice } from "@livekit/agents";

import type { TeacherInstructionInput } from "../../type/teacher-instruction";

export type TeacherNotebook = {
	instructionInput: TeacherInstructionInput;
	agentRef: { current: voice.Agent | null };
};
