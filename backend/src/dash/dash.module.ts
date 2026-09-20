import { Module } from "@nestjs/common";

import { VideosModule } from "../videos/videos.module";
import { DashController } from "./dash.controller";
import { DashService } from "./dash.service";

@Module({
	imports: [VideosModule],
	controllers: [DashController],
	providers: [DashService],
})
export class DashModule {}
