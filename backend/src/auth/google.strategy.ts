import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, type Profile } from "passport-google-oauth20";

import type { UserRecord } from "../storage/type";
import { AuthService } from "./auth.service";
import { toGoogleUserInput } from "./utils/google-profile";
import { resolveAuthConfig } from "./utils/resolve-auth-config";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
	constructor(private readonly authService: AuthService) {
		const config = resolveAuthConfig();
		super({
			clientID: config.googleClientId,
			clientSecret: config.googleClientSecret,
			callbackURL: config.googleRedirectUri,
			scope: ["openid", "email", "profile"],
		});
	}

	async validate(
		_accessToken: string,
		_refreshToken: string,
		profile: Profile,
	): Promise<UserRecord> {
		return this.authService.upsertGoogleUser(toGoogleUserInput(profile));
	}
}
