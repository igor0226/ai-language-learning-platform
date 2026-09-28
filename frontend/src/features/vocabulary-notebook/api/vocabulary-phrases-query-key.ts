export function vocabularyPhrasesQueryKey(userId: string | undefined) {
	return ["vocabulary-phrases", userId] as const;
}
