import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import {
	ProcessingHistory,
	ProcessingLock,
	TeacherCall,
	User,
	UserCallTopic,
	UserVocabularyPhrase,
	Video,
} from "../models";
import { getPostgresConfig } from "./utils/postgres-config";

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			useFactory: () => ({
				type: "postgres" as const,
				...getPostgresConfig(),
				entities: [
					Video,
					ProcessingHistory,
					ProcessingLock,
					TeacherCall,
					User,
					UserCallTopic,
					UserVocabularyPhrase,
				],
				synchronize: false,
				autoLoadEntities: false,
			}),
		}),
	],
})
export class DatabaseModule {}
