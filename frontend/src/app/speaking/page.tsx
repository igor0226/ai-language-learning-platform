import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import {
	fetchSpeakingCalls,
	speakingCallsQueryKey,
} from "@/entities/speaking-session";
import { fetchSpeakingTopics } from "@/features/manage-speaking-topics/api/speaking-topics";
import { speakingTopicsQueryKey } from "@/features/manage-speaking-topics/api/speaking-topics-query-key";
import SpeakingLauncherPage from "@/pages/speaking/launcher";
import { serverAuthFetch } from "@/shared/api/server-auth-fetch";
import { createQueryClient } from "@/shared/lib/create-query-client";

export default async function SpeakingPage() {
	const queryClient = createQueryClient();

	await Promise.all([
		queryClient.query({
			queryKey: speakingTopicsQueryKey(),
			queryFn: () => fetchSpeakingTopics(serverAuthFetch),
		}),
		queryClient.query({
			queryKey: speakingCallsQueryKey(),
			queryFn: () => fetchSpeakingCalls(serverAuthFetch),
		}),
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<SpeakingLauncherPage />
		</HydrationBoundary>
	);
}
