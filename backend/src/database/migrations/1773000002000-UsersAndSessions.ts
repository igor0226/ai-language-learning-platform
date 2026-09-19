import type { MigrationInterface, QueryRunner } from "typeorm";

export class UsersAndSessions1773000002000 implements MigrationInterface {
	name = "UsersAndSessions1773000002000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			CREATE TABLE "users" (
				"id" uuid NOT NULL,
				"googleSub" character varying NOT NULL,
				"email" character varying NOT NULL,
				"name" character varying NOT NULL,
				"pictureUrl" character varying,
				"createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
				"updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
				CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
				CONSTRAINT "UQ_users_googleSub" UNIQUE ("googleSub")
			)
		`);
		await queryRunner.query(`
			CREATE INDEX "IDX_users_email" ON "users" ("email")
		`);
		await queryRunner.query(`
			CREATE TABLE "session" (
				"sid" character varying NOT NULL,
				"sess" json NOT NULL,
				"expire" TIMESTAMP(6) NOT NULL,
				CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
			)
		`);
		await queryRunner.query(`
			CREATE INDEX "IDX_session_expire" ON "session" ("expire")
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP INDEX "IDX_session_expire"`);
		await queryRunner.query(`DROP TABLE "session"`);
		await queryRunner.query(`DROP INDEX "IDX_users_email"`);
		await queryRunner.query(`DROP TABLE "users"`);
	}
}
