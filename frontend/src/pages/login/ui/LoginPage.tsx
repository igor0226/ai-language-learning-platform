"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { GoogleLoginButton } from "@/features/google-login";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import "./LoginPage.css";

function LoginContent() {
	const searchParams = useSearchParams();
	const oauthError = searchParams?.get("error") === "oauth";

	return (
		<main className="loginPage">
			<Card className="loginCard">
				<CardHeader className="text-center">
					<CardTitle>Sign in to Language Studio</CardTitle>
					<p className="text-sm text-muted-foreground">
						Use your Google account to access your learning dashboard.
					</p>
				</CardHeader>
				<CardContent className="space-y-4">
					{oauthError ? (
						<Alert variant="destructive">
							<AlertTitle>Sign-in failed</AlertTitle>
							<AlertDescription>
								Google sign-in did not complete. Please try again.
							</AlertDescription>
						</Alert>
					) : null}
					<GoogleLoginButton />
				</CardContent>
			</Card>
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
