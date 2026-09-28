import type { MigrationInterface, QueryRunner } from "typeorm";

export class UserVocabularyPhrases1773000005000 implements MigrationInterface {
	name = "UserVocabularyPhrases1773000005000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			CREATE TABLE "user_vocabulary_phrases" (
				"id" uuid NOT NULL,
				"userId" uuid NOT NULL,
				"term" character varying NOT NULL,
				"cefr" character varying NOT NULL,
				"definition" text NOT NULL,
				"exampleSentence" text,
				"savedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
				"updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
				CONSTRAINT "PK_user_vocabulary_phrases_id" PRIMARY KEY ("id")
			)
		`);
		await queryRunner.query(`
			CREATE INDEX "IDX_user_vocabulary_phrases_userId_savedAt"
			ON "user_vocabulary_phrases" ("userId", "savedAt")
		`);
		await queryRunner.query(`
			ALTER TABLE "user_vocabulary_phrases"
			ADD CONSTRAINT "FK_user_vocabulary_phrases_userId"
			FOREIGN KEY ("userId") REFERENCES "users"("id")
			ON DELETE CASCADE
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE IF EXISTS "user_vocabulary_phrases"`);
	}
}
