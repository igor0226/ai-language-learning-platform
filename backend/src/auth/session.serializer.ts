import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";

import type { UserRecord } from "../storage/types";
import { AuthService } from "./auth.service";

@Injectable()
export class SessionSerializer extends PassportSerializer {
	constructor(private readonly authService: AuthService) {
		super();
	}

	serializeUser(
		user: UserRecord,
		done: (error: Error | null, id?: string) => void,
	) {
		done(null, user.id);
	}

	async deserializeUser(
		userId: string,
		done: (error: Error | null, user?: UserRecord | false | null) => void,
	) {
		try {
			const user = await this.authService.getUserById(userId);
			done(null, user ?? false);
		} catch (error) {
			done(error instanceof Error ? error : new Error(String(error)));
		}
	}
}
