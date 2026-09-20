"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { GoogleLoginButton } from "@/features/google-login";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Card } from "@/shared/ui/card";
import "./LoginPage.css";

function ShieldIcon() {
	return (
		<svg
			className="h-3.5 w-3.5 text-primary"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			strokeWidth={2}
			aria-hidden="true"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
			/>
		</svg>
	);
}

function LoginContent() {
	const searchParams = useSearchParams();
	const oauthError = searchParams?.get("error") === "oauth";

	return (
		<main className="loginPage">
			<div className="loginPageInner">
				<Card className="loginCard">
					<div className="loginCardContent">
						<div className="loginBrand">
							<div className="loginMark" aria-hidden="true">
								LS
							</div>
							<div className="pt-1">
								<span className="loginSsoBadge">
									<ShieldIcon />
									Google Single Sign-On (SSO)
								</span>
							</div>
						</div>

						{oauthError ? (
							<Alert variant="destructive">
								<AlertTitle>Sign-in failed</AlertTitle>
								<AlertDescription>
									Google sign-in did not complete. Please try again.
								</AlertDescription>
							</Alert>
						) : null}

						<GoogleLoginButton />
					</div>
				</Card>

				<p className="loginFooter">
					Sign in with Google to access your learning dashboard. We receive your
					name, email address, and profile photo from Google.
				</p>
			</div>
		</main>
	);
}

export function LoginPage() {
	return (
		<Suspense fallback={<main className="loginPage" />}>
			<LoginContent />
		</Suspense>
	);
}
