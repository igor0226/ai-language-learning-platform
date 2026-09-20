export type WhisperWord = {
	word: string;
	start: number;
	end: number;
};

export type WhisperSegment = {
	id?: number;
	seek?: number;
	start: number;
	end: number;
	text: string;
};

export type WhisperTranscript = {
	language: string;
	duration: number;
	text: string;
	words: WhisperWord[];
	segments?: WhisperSegment[];
};
