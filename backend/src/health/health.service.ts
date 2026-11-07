import { Injectable, type OnModuleDestroy } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { DataSource } from "typeorm";

@Injectable()
export class HealthService implements OnModuleDestroy {
	private draining = false;

	constructor(
		private readonly database: DataSource,
		private readonly adapter: HttpAdapterHost,
	) {}

	async ready(): Promise<boolean> {
		if (this.draining || !this.database.isInitialized) return false;
		try {
			await this.database.query("SELECT 1");
			return !this.draining;
		} catch {
			return false;
		}
	}

	async onModuleDestroy(): Promise<void> {
		this.draining = true;
		const server = this.adapter.httpAdapter?.getHttpServer();
		if (!server?.listening) return;
		await new Promise<void>((resolve, reject) => {
			server.close((error?: Error) => (error ? reject(error) : resolve()));
		});
	}
}
