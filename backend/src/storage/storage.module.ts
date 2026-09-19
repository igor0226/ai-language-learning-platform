import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import {
	ProcessingHistory,
	ProcessingLock,
	TeacherCall,
	User,
	Video,
} from "../models";
import { BlobStorageService } from "./blob-storage.service";
import { CallRepositoryService } from "./call-repository.service";
import { ProcessingHistoryService } from "./processing-history.service";
import { ProcessingLockService } from "./processing-lock.service";
import {
	createS3Client,
	createS3ConfigProvider,
	S3_CLIENT,
	S3_CONFIG,
} from "./s3-client.provider";
import { UserRepositoryService } from "./user-repository.service";
import { VideoRepositoryService } from "./video-repository.service";

@Global()
@Module({
	imports: [
		TypeOrmModule.forFeature([
			Video,
			ProcessingHistory,
			ProcessingLock,
			TeacherCall,
			User,
		]),
	],
	providers: [
		{
			provide: S3_CLIENT,
			useFactory: createS3Client,
		},
		{
			provide: S3_CONFIG,
			useFactory: createS3ConfigProvider,
		},
		BlobStorageService,
		ProcessingHistoryService,
		ProcessingLockService,
		VideoRepositoryService,
		CallRepositoryService,
		UserRepositoryService,
	],
	exports: [
		BlobStorageService,
		ProcessingHistoryService,
		ProcessingLockService,
		VideoRepositoryService,
		CallRepositoryService,
		UserRepositoryService,
	],
})
export class StorageModule {}
