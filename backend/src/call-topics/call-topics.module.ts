import { Module } from "@nestjs/common";

import { CallTopicsController } from "./call-topics.controller";
import { CallTopicsService } from "./call-topics.service";

@Module({
	controllers: [CallTopicsController],
	providers: [CallTopicsService],
})
export class CallTopicsModule {}
