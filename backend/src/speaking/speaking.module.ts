import { Module } from "@nestjs/common";

import { VocabularyModule } from "@/vocabulary/vocabulary.module";

import { AgentApiGuard } from "./agent-api.guard";
import { AgentSpeakingController } from "./agent-speaking.controller";
import { AgentSpeakingVocabularyService } from "./agent-speaking-vocabulary.service";
import { AgentDispatchService } from "./agent-dispatch.service";
import { LivekitRoomService } from "./livekit-room.service";
import { LivekitTokenService } from "./livekit-token.service";
import { LivekitWebhookService } from "./livekit-webhook.service";
import { SpeakingController } from "./speaking.controller";
import { SpeakingService } from "./speaking.service";
import { StaleCallCleanupService } from "./stale-call-cleanup.service";
import { StaleCallWorkerService } from "./stale-call-worker.service";

@Module({
	imports: [VocabularyModule],
	controllers: [SpeakingController, AgentSpeakingController],
	providers: [
		AgentApiGuard,
		AgentSpeakingVocabularyService,
		SpeakingService,
		LivekitTokenService,
		LivekitRoomService,
		AgentDispatchService,
		LivekitWebhookService,
		StaleCallCleanupService,
		StaleCallWorkerService,
	],
})
export class SpeakingModule {}
