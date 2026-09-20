import type { MigrationInterface, QueryRunner } from "typeorm";

export class VideoUserId1773000003000 implements MigrationInterface {
	name = "VideoUserId1773000003000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			ALTER TABLE "videos"
			ADD COLUMN "userId" uuid
		`);
		await queryRunner.query(`
			CREATE INDEX "IDX_videos_userId" ON "videos" ("userId")
		`);
		await queryRunner.query(`
			ALTER TABLE "videos"
			ADD CONSTRAINT "FK_videos_userId"
			FOREIGN KEY ("userId") REFERENCES "users"("id")
			ON DELETE RESTRICT
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			ALTER TABLE "videos" DROP CONSTRAINT "FK_videos_userId"
		`);
		await queryRunner.query(`DROP INDEX "IDX_videos_userId"`);
		await queryRunner.query(`ALTER TABLE "videos" DROP COLUMN "userId"`);
	}
}
