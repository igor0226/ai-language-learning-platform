import { UnauthorizedException } from "@nestjs/common";

import type { AuthenticatedRequest } from "./express-request";

export async function loginAndSaveSession(
	request: AuthenticatedRequest,
): Promise<void> {
	const user = request.user;
	if (!user) {
		return Promise.reject(new UnauthorizedException());
	}

	return new Promise((resolve, reject) => {
		request.login(user, (loginError) => {
			if (loginError) {
				reject(loginError);
				return;
			}

			if (!request.session) {
				resolve();
				return;
			}

			request.session.save((saveError) => {
				if (saveError) {
					reject(saveError);
					return;
				}
				resolve();
			});
		});
	});
}
