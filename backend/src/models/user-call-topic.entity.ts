import { Column, Entity, Index, PrimaryColumn } from "typeorm";

import type { UserCallTopicKind, UserCallTopicRecord } from "../storage/type";
import { isoDateTransformer } from "./utils/iso-date.transformer";

@Entity({ name: "user_call_topics" })
@Index("IDX_user_call_topics_userId_kind_createdAt", [
	"userId",
	"kind",
	"createdAt",
])
export class UserCallTopic implements UserCallTopicRecord {
	@PrimaryColumn("uuid")
	userId!: string;

	@PrimaryColumn({ type: "varchar" })
	topicId!: string;

	@Column({ type: "varchar" })
	kind!: UserCallTopicKind;

	@Column({ type: "varchar", nullable: true })
	title!: string | null;

	@Column({ type: "varchar", nullable: true })
	level!: string | null;

	@Column({ type: "text", nullable: true })
	description!: string | null;

	@Column({ type: "int", nullable: true })
	suggestedDurationMins!: number | null;

	@Column({ type: "timestamptz", transformer: isoDateTransformer })
	createdAt!: string;

	@Column({ type: "timestamptz", transformer: isoDateTransformer })
	updatedAt!: string;
}
