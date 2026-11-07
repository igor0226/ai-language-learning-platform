import { Global, Module } from "@nestjs/common";
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
import { AdvisoryLockService } from "./advisory-lock.service";
import { getPostgresConfig } from "./utils/postgres-config";

@Global()
@Module({
	providers: [AdvisoryLockService],
	exports: [AdvisoryLockService],
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
				extra: { connectionTimeoutMillis: 5000, query_timeout: 30000, max: 10 },
				autoLoadEntities: false,
			}),
		}),
	],
})
export class DatabaseModule {}
