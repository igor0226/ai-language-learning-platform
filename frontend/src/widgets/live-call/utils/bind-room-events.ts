import type {
	TeacherEmotionMessage,
	TeacherVocabularyMessage,
} from "@llp/contracts";

import {
	type RemoteParticipant,
	type RemoteTrack,
	type RemoteTrackPublication,
	type Room,
	RoomEvent,
	Track,
} from "livekit-client";

import { attachRemoteAudio, detachRemoteAudio } from "./attach-remote-audio";
import {
	dispatchTeacherEmotion,
	resolveDataTopic,
} from "./dispatch-teacher-emotion";
import { dispatchTeacherVocabulary } from "./dispatch-teacher-vocabulary";
import { resolveTeacherAudioStream } from "./resolve-teacher-audio-stream";

export type RoomEventHandlers = {
	onTeacherAudio: (stream: MediaStream | null) => void;
	onTeacherEmotion: (message: TeacherEmotionMessage) => void;
	onTeacherVocabulary: (message: TeacherVocabularyMessage) => void;
};

export function bindRoomEvents(
	room: Room,
	handlers: RoomEventHandlers,
): () => void {
	const onSubscribed = (
		track: RemoteTrack,
		_publication: RemoteTrackPublication,
		_participant: RemoteParticipant,
	) => {
		if (!attachRemoteAudio(track)) {
			return;
		}
		void room.startAudio();
		handlers.onTeacherAudio(resolveTeacherAudioStream(track));
	};
	const onUnsubscribed = (track: RemoteTrack) => {
		detachRemoteAudio(track);
		if (track.kind === Track.Kind.Audio) {
			handlers.onTeacherAudio(null);
		}
	};
	const onData = (
		payload: Uint8Array,
		_p?: RemoteParticipant,
		kindOrTopic?: unknown,
		topic?: string,
	) => {
		const resolvedTopic = resolveDataTopic(kindOrTopic, topic);
		dispatchTeacherEmotion(payload, resolvedTopic, handlers.onTeacherEmotion);
		dispatchTeacherVocabulary(
			payload,
			resolvedTopic,
			handlers.onTeacherVocabulary,
		);
	};
	const onPlayback = () => {
		if (!room.canPlaybackAudio) {
			void room.startAudio();
		}
	};

	room.on(RoomEvent.TrackSubscribed, onSubscribed);
	room.on(RoomEvent.TrackUnsubscribed, onUnsubscribed);
	room.on(RoomEvent.DataReceived, onData);
	room.on(RoomEvent.AudioPlaybackStatusChanged, onPlayback);

	return () => {
		room.off(RoomEvent.TrackSubscribed, onSubscribed);
		room.off(RoomEvent.TrackUnsubscribed, onUnsubscribed);
		room.off(RoomEvent.DataReceived, onData);
		room.off(RoomEvent.AudioPlaybackStatusChanged, onPlayback);
	};
}

export function attachExistingRemoteAudio(
	room: Room,
	onTeacherAudio: (stream: MediaStream | null) => void,
): void {
	for (const participant of room.remoteParticipants.values()) {
		for (const publication of participant.trackPublications.values()) {
			if (!publication.track || !attachRemoteAudio(publication.track)) {
				continue;
			}
			void room.startAudio();
			onTeacherAudio(resolveTeacherAudioStream(publication.track));
		}
	}
}
