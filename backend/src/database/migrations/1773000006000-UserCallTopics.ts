import type { MigrationInterface, QueryRunner } from "typeorm";

export class UserCallTopics1773000006000 implements MigrationInterface {
	name = "UserCallTopics1773000006000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			CREATE TABLE "user_call_topics" (
				"userId" uuid NOT NULL,
				"topicId" character varying NOT NULL,
				"kind" character varying NOT NULL,
				"title" character varying,
				"level" character varying,
				"description" text,
				"suggestedDurationMins" integer,
				"createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
				"updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
				CONSTRAINT "PK_user_call_topics_userId_topicId" PRIMARY KEY ("userId", "topicId")
			)
		`);
		await queryRunner.query(`
			CREATE INDEX "IDX_user_call_topics_userId_kind_createdAt"
			ON "user_call_topics" ("userId", "kind", "createdAt")
		`);
		await queryRunner.query(`
			ALTER TABLE "user_call_topics"
			ADD CONSTRAINT "FK_user_call_topics_userId"
			FOREIGN KEY ("userId") REFERENCES "users"("id")
			ON DELETE CASCADE
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE IF EXISTS "user_call_topics"`);
	}
}
