import { Injectable, type OnApplicationShutdown } from "@nestjs/common";

@Injectable()
export class SessionStoreLifecycleService implements OnApplicationShutdown {
	private closeStore: (() => unknown) | undefined;

	register(close: () => unknown): void {
		this.closeStore = close;
	}

	async onApplicationShutdown(): Promise<void> {
		await this.closeStore?.();
	}
}
