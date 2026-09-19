import type { Profile } from "passport-google-oauth20";

import type { UpsertGoogleUserInput } from "../../storage/type";

export function toGoogleUserInput(profile: Profile): UpsertGoogleUserInput {
	const email = profile.emails?.[0]?.value?.trim();
	if (!email) {
		throw new Error("Google profile is missing an email address");
	}

	const name =
		profile.displayName?.trim() ||
		profile.name?.givenName?.trim() ||
		email.split("@")[0] ||
		"User";

	return {
		googleSub: profile.id,
		email,
		name,
		pictureUrl: profile.photos?.[0]?.value?.trim() ?? null,
	};
}
