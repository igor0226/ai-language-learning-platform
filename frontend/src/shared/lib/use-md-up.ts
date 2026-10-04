"use client";

import { useSyncExternalStore } from "react";

const MD_UP_QUERY = "(min-width: 768px)";

function subscribe(onChange: () => void): () => void {
	const media = window.matchMedia(MD_UP_QUERY);
	media.addEventListener("change", onChange);
	return () => media.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
	return window.matchMedia(MD_UP_QUERY).matches;
}

function getServerSnapshot(): boolean {
	return true;
}

/** True at the Tailwind `md` breakpoint and above. */
export function useMdUp(): boolean {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
