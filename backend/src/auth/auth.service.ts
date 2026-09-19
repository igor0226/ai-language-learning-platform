import { Injectable } from "@nestjs/common";

import { UserRepositoryService } from "../storage/user-repository.service";
import type { UpsertGoogleUserInput, UserRecord } from "../storage/types";
import { resolveAuthConfig } from "./utils/resolve-auth-config";

@Injectable()
export class AuthService {
	constructor(private readonly users: UserRepositoryService) {}

	upsertGoogleUser(input: UpsertGoogleUserInput): Promise<UserRecord> {
		return this.users.upsertGoogleUser(input);
	}

	getUserById(userId: string): Promise<UserRecord | null> {
		return this.users.getById(userId);
	}

	getSuccessRedirectUrl(): string {
		return resolveAuthConfig().successRedirectUrl;
	}

	getFailureRedirectUrl(): string {
		return resolveAuthConfig().failureRedirectUrl;
	}

	getSessionCookieName(): string {
		return resolveAuthConfig().sessionCookieName;
	}
}
