import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { fetchVideos } from "@/entities/video";
import ListeningLibraryPage from "@/pages/listening/library";
import { serverAuthFetch } from "@/shared/api/server-auth-fetch";
import { createQueryClient } from "@/shared/lib/create-query-client";

export default async function ListeningPage() {
	const queryClient = createQueryClient();

	await queryClient.query({
		queryKey: ["videos"],
		queryFn: () => fetchVideos(serverAuthFetch),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ListeningLibraryPage />
		</HydrationBoundary>
	);
}
