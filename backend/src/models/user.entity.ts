import { Column, Entity, Index, PrimaryColumn } from "typeorm";

import type { UserRecord } from "../storage/types";
import { isoDateTransformer } from "./utils/iso-date.transformer";

@Entity({ name: "users" })
@Index("IDX_users_email", ["email"])
export class User implements UserRecord {
	@PrimaryColumn("uuid")
	id!: string;

	@Column({ type: "varchar", unique: true })
	googleSub!: string;

	@Column({ type: "varchar" })
	email!: string;

	@Column({ type: "varchar" })
	name!: string;

	@Column({ type: "varchar", nullable: true })
	pictureUrl!: string | null;

	@Column({ type: "timestamptz", transformer: isoDateTransformer })
	createdAt!: string;

	@Column({ type: "timestamptz", transformer: isoDateTransformer })
	updatedAt!: string;
}
