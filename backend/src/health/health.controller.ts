import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { HealthService } from "./health.service";

@Controller("health")
export class HealthController {
	constructor(private readonly health: HealthService) {}

	@Get("ready")
	async ready(): Promise<{ status: string }> {
		if (!(await this.health.ready())) throw new ServiceUnavailableException();
		return { status: "ready" };
	}
}
