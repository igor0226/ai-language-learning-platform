import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { watchLockConnection } from "./utils/watch-lock-connection";

@Injectable()
export class AdvisoryLockService {
	constructor(private readonly database: DataSource) {}

	async runExclusive(key: string, work: () => Promise<void>): Promise<boolean> {
		const connection = this.database.createQueryRunner();
		let acquired = false;
		let stopWatching: (() => void) | undefined;
		try {
			const client = await connection.connect();
			const [result] = await connection.query(
				"SELECT pg_try_advisory_lock(hashtextextended($1, 0)) AS acquired",
				[key],
			);
			acquired = result.acquired;
			if (!acquired) return false;
			stopWatching = watchLockConnection(client);
			await work();
			return true;
		} finally {
			stopWatching?.();
			try {
				if (acquired) {
					await connection.query(
						"SELECT pg_advisory_unlock(hashtextextended($1, 0))",
						[key],
					);
				}
			} finally {
				await connection.release();
			}
		}
	}
}
