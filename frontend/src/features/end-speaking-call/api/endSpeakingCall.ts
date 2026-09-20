import { authFetch } from "@/shared/api/auth-fetch";

export async function endSpeakingCall(callId: string): Promise<void> {
	const response = await authFetch(`/api/speaking/calls/${callId}/end`, {
		method: "POST",
	});
	if (!response.ok) {
		throw new Error(`Failed to end call (${response.status})`);
	}
}
