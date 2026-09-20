import { UnauthorizedException } from "@nestjs/common";

import type { AuthenticatedRequest } from "../type/express-request";
import type { UserRecord } from "@/storage/type";

export function getAuthenticatedUser(
	request: AuthenticatedRequest,
): UserRecord {
	if (!request.user) {
		throw new UnauthorizedException();
	}
	return request.user;
}
