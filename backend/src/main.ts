import { NestFactory } from "@nestjs/core";
import { Logger } from "nestjs-pino";

import { AppModule } from "./app.module";
import { configureHttpApp } from "./auth/utils/configure-http-app";

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		bufferLogs: true,
		rawBody: true,
	});
	app.useLogger(app.get(Logger));

	configureHttpApp(app);

	const port = Number(process.env.PORT ?? 3001);
	await app.listen(port);
	app.get(Logger).log(`listening on http://localhost:${port}`);
}

void bootstrap();
