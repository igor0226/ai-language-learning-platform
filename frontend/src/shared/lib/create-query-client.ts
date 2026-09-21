import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import { notifyClientError } from "./notify-client-error";

export function createQueryClient(): QueryClient {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 1000,
				refetchOnWindowFocus: false,
			},
		},
		queryCache: new QueryCache({
			onError: (error, query) => {
				notifyClientError({ error, id: query.queryHash });
			},
		}),
		mutationCache: new MutationCache({
			onError: (error, _variables, _context, mutation) => {
				const mutationKey = mutation.options.mutationKey;
				const id =
					mutationKey !== undefined
						? JSON.stringify(mutationKey)
						: String(mutation.mutationId);

				notifyClientError({ error, id });
			},
		}),
	});
}
