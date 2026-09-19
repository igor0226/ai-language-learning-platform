import type { User } from "../../models";
import type { UserRecord } from "../types";

export function normalizeUserRecord(user: User): UserRecord {
	return {
		id: user.id,
		googleSub: user.googleSub,
		email: user.email,
		name: user.name,
		pictureUrl: user.pictureUrl,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};
}
