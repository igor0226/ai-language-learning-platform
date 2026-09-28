export function speakingTopicsQueryKey(userId: string | undefined) {
	return ["speaking-topics", userId] as const;
}
