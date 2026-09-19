import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";

import type { AuthenticatedRequest } from "./utils/express-request";

@Injectable()
export class AuthenticatedGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
		if (!request.user) {
			throw new UnauthorizedException();
		}
		return true;
	}
}
