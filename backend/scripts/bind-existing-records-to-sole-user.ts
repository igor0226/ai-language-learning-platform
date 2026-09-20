import { createAppDataSource } from "../src/database/data-source";

async function bindExistingRecordsToSoleUser(): Promise<void> {
	const dataSource = createAppDataSource();
	await dataSource.initialize();

	try {
		const users = (await dataSource.query(
			`SELECT "id" FROM "users"`,
		)) as Array<{ id: string }>;

		if (users.length === 0) {
			throw new Error("No users found; sign in with Google first.");
		}
		if (users.length > 1) {
			throw new Error(
				`Expected exactly one user, found ${users.length}. Refusing to rebind.`,
			);
		}

		const userId = users[0].id;
		const videoResult = (await dataSource.query(
			`UPDATE "videos" SET "userId" = $1 WHERE "userId" IS NULL`,
			[userId],
		)) as [unknown, number];
		const callResult = (await dataSource.query(
			`UPDATE "teacher_calls" SET "userId" = $1`,
			[userId],
		)) as [unknown, number];

		process.stdout.write(
			`Rebound ${videoResult[1]} video(s) and ${callResult[1]} teacher call(s) to user ${userId}\n`,
		);
	} finally {
		await dataSource.destroy();
	}
}

void bindExistingRecordsToSoleUser().catch((error) => {
	process.stderr.write(`${String(error)}\n`);
	process.exit(1);
});
