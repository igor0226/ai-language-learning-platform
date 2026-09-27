import { Column, Entity, Index, PrimaryColumn } from "typeorm";

import type { LanguageLevel, VocabularyPhraseRecord } from "../storage/type";
import { isoDateTransformer } from "./utils/iso-date.transformer";

@Entity({ name: "user_vocabulary_phrases" })
@Index("IDX_user_vocabulary_phrases_userId_savedAt", ["userId", "savedAt"])
export class UserVocabularyPhrase implements VocabularyPhraseRecord {
	@PrimaryColumn("uuid")
	id!: string;

	@Column({ type: "uuid" })
	userId!: string;

	@Column({ type: "varchar" })
	term!: string;

	@Column({ type: "varchar" })
	cefr!: LanguageLevel;

	@Column({ type: "text" })
	definition!: string;

	@Column({ type: "text", nullable: true })
	exampleSentence!: string | null;

	@Column({ type: "timestamptz", transformer: isoDateTransformer })
	savedAt!: string;

	@Column({ type: "timestamptz", transformer: isoDateTransformer })
	updatedAt!: string;
}
