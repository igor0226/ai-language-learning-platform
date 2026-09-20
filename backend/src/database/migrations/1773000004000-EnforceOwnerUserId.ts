import type { MigrationInterface, QueryRunner } from "typeorm";

export class EnforceOwnerUserId1773000004000 implements MigrationInterface {
	name = "EnforceOwnerUserId1773000004000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			DELETE FROM "videos"
			WHERE "userId" IS NULL
				OR "userId" NOT IN (SELECT "id" FROM "users")
		`);
		await queryRunner.query(`
			DELETE FROM "teacher_calls"
			WHERE "userId" !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
				OR "userId"::uuid NOT IN (SELECT "id" FROM "users")
		`);
		await queryRunner.query(`
			ALTER TABLE "videos"
			ALTER COLUMN "userId" SET NOT NULL
		`);
		await queryRunner.query(`
			ALTER TABLE "teacher_calls"
			ALTER COLUMN "userId" TYPE uuid USING "userId"::uuid
		`);
		await queryRunner.query(`
			ALTER TABLE "teacher_calls"
			ADD CONSTRAINT "FK_teacher_calls_userId"
			FOREIGN KEY ("userId") REFERENCES "users"("id")
			ON DELETE RESTRICT
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			ALTER TABLE "teacher_calls" DROP CONSTRAINT "FK_teacher_calls_userId"
		`);
		await queryRunner.query(`
			ALTER TABLE "teacher_calls"
			ALTER COLUMN "userId" TYPE character varying USING "userId"::text
		`);
		await queryRunner.query(`
			ALTER TABLE "videos"
			ALTER COLUMN "userId" DROP NOT NULL
		`);
	}
}
