import {
	Controller,
	Get,
	Post,
	Req,
	Res,
	UnauthorizedException,
	UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { Response } from "express";

import { AuthService } from "./auth.service";
import { AuthenticatedGuard } from "./authenticated.guard";
import type { AuthenticatedRequest } from "./type/express-request";
import { loginAndSaveSession } from "./utils/login-and-save-session";
import { toAuthUser } from "./utils/to-auth-user";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Get("google")
	@UseGuards(AuthGuard("google"))
	googleAuth(): void {
		// Passport redirects to Google.
	}

	@Get("google/callback")
	@UseGuards(AuthGuard("google"))
	async googleCallback(
		@Req() request: AuthenticatedRequest,
		@Res() response: Response,
	): Promise<void> {
		await loginAndSaveSession(request);
		response.redirect(this.authService.getSuccessRedirectUrl());
	}

	@Get("me")
	@UseGuards(AuthenticatedGuard)
	getMe(@Req() request: AuthenticatedRequest) {
		if (!request.user) {
			throw new UnauthorizedException();
		}
		return toAuthUser(request.user);
	}

	@Post("logout")
	logout(
		@Req() request: AuthenticatedRequest,
		@Res() response: Response,
	): void {
		const cookieName = this.authService.getSessionCookieName();
		const finish = () => {
			response.clearCookie(cookieName);
			response.status(204).send();
		};

		request.logout((logoutError) => {
			if (logoutError) {
				response.status(500).json({ message: "Failed to log out" });
				return;
			}

			if (!request.session) {
				finish();
				return;
			}

			request.session.destroy((destroyError) => {
				if (destroyError) {
					response.status(500).json({ message: "Failed to destroy session" });
					return;
				}
				finish();
			});
		});
	}
}
