import type { ExplanationClipManifestEntry } from "../../generating-clips/type/explanation-clip";

export type PlaybackPhrase = {
	index: number;
	phrase: string;
	explanation: string;
	startSeconds: number;
	endSeconds: number;
};

export type CompositionPart =
	| {
			kind: "source";
			startSeconds: number;
			endSeconds: number;
	  }
	| {
			kind: "clip";
			clip: ExplanationClipManifestEntry;
	  };
