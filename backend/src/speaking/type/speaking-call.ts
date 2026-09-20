import type { CreateTeacherCallInput } from "@/storage/type";

export type CreateCallInput = CreateTeacherCallInput & {
	topic?: string;
};

export type CreateCallResult = {
	callId: string;
	roomName: string;
	token: string;
	livekitUrl: string;
};

export type EndCallInput = {
	callId: string;
	userId: string;
};

export type GetCallInput = {
	callId: string;
	userId: string;
};
