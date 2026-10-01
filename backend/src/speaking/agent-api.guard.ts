import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";

import { verifyAgentApiBearer } from "./utils/verify-agent-api-secret";

@Injectable()
export class AgentApiGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context
			.switchToHttp()
			.getRequest<{ headers: { authorization?: string } }>();
		const authorization = request.headers.authorization;
		if (!verifyAgentApiBearer(authorization)) {
			throw new UnauthorizedException();
		}
		return true;
	}
}
