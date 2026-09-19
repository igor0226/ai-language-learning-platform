import { authUserSchema, type AuthUser } from "@llp/contracts";

import type { UserRecord } from "../../storage/type";

export function toAuthUser(user: UserRecord): AuthUser {
	return authUserSchema.parse({
		id: user.id,
		email: user.email,
		name: user.name,
		pictureUrl: user.pictureUrl,
	});
}
