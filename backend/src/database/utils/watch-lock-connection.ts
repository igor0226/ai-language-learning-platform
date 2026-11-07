import type { PoolClient } from "pg";

// Work may write to S3 outside the locking session. Fail closed if that session
// disappears, rather than continuing after another worker acquires its lock.
export function watchLockConnection(client: PoolClient): () => void {
	const lost = () => {
		process.stderr.write(
			"Worker database lock connection lost; terminating to prevent concurrent work.\n",
		);
		process.exit(1);
	};
	client.once("error", lost);
	client.once("end", lost);
	return () => {
		client.removeListener("error", lost);
		client.removeListener("end", lost);
	};
}
