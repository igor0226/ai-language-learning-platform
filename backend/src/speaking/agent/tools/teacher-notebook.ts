import type { TeacherInstructionInput } from "../../type/teacher-instruction";

export type TeacherNotebook = {
	instructionInput: TeacherInstructionInput;
	pendingTerms: Set<string>;
	settledTerms: Set<string>;
};

export function createTeacherNotebook(
	instructionInput: TeacherInstructionInput,
): TeacherNotebook {
	return {
		instructionInput,
		pendingTerms: new Set(),
		settledTerms: new Set(),
	};
}
