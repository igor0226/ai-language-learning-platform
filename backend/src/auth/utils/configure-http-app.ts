import type { INestApplication } from "@nestjs/common";
import passport from "passport";

import { applySessionMiddleware } from "./apply-session-middleware";

export function configureHttpApp(app: INestApplication): void {
	const expressApp = app.getHttpAdapter().getInstance();
	expressApp.set("trust proxy", 1);

	const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3000";
	app.enableCors({
		origin: corsOrigin,
		credentials: true,
	});

	applySessionMiddleware(app);
	app.use(passport.initialize());
	app.use(passport.session());
	app.setGlobalPrefix("api");
}
