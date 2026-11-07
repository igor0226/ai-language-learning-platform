import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";

import { SessionStoreLifecycleService } from "./session-store-lifecycle.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { GoogleStrategy } from "./google.strategy";
import { SessionSerializer } from "./session.serializer";

@Module({
	imports: [PassportModule.register({ session: true })],
	controllers: [AuthController],
	providers: [
		AuthService,
		GoogleStrategy,
		SessionSerializer,
		SessionStoreLifecycleService,
	],
})
export class AuthModule {}
