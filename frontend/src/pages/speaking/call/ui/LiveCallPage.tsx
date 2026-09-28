"use client";

import type { CallTopic } from "@llp/contracts";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import {
	formatSpeakingTopicText,
	parseCefrLevel,
} from "@/entities/speaking-session";
import { useSpeakingTopics } from "@/features/manage-speaking-topics";
import {
	CallConnectedView,
	CallConnectingView,
	useLiveCallConnection,
} from "@/widgets/live-call";

type LiveCallSessionProps = {
	callId: string;
	topic: CallTopic;
};

function LiveCallSession({ callId, topic }: LiveCallSessionProps) {
	const router = useRouter();
	const {
		step,
		phase,
		errorType,
		retry,
		endCall,
		toggleMic,
		teacherEmotion,
		teacherAudioStream,
	} = useLiveCallConnection({
		sourceLanguage: "English",
		explanationLanguage: "English",
		languageLevel: parseCefrLevel(topic.level),
		topic: formatSpeakingTopicText(topic),
	});

	const leaveSpeaking = () => {
		void endCall().finally(() => router.push("/speaking"));
	};

	if (phase === "connected") {
		return (
			<CallConnectedView
				topicTitle={topic.title}
				emotion={teacherEmotion.emotion}
				intensity={teacherEmotion.intensity}
				teacherAudioStream={teacherAudioStream}
				onEndCall={leaveSpeaking}
				onToggleMute={() => {
					void toggleMic();
				}}
			/>
		);
	}

	return (
		<CallConnectingView
			topicTitle={`${topic.title} · ${callId}`}
			step={step}
			phase={phase}
			errorType={errorType}
			onRetry={retry}
			onCancel={leaveSpeaking}
		/>
	);
}

function LiveCallContent() {
	const params = useParams<{ callId: string }>();
	const searchParams = useSearchParams();
	const router = useRouter();
	const { resolveTopic, isLoading, errorMessage } = useSpeakingTopics();
	const topicId = searchParams?.get("topic") ?? "";
	const callId = params?.callId ?? "";
	const topic = resolveTopic(topicId);

	const leaveSpeaking = () => {
		router.push("/speaking");
	};

	if (isLoading) {
		return (
			<CallConnectingView
				topicTitle={`Loading scenario · ${callId}`}
				step="permissions"
				phase="connecting"
				errorType="network_timeout"
				onRetry={() => {}}
				onCancel={leaveSpeaking}
			/>
		);
	}

	if (errorMessage || !topic) {
		return (
			<CallConnectingView
				topicTitle={`Scenario unavailable · ${callId}`}
				step="permissions"
				phase="error"
				errorType="network_timeout"
				onRetry={leaveSpeaking}
				onCancel={leaveSpeaking}
			/>
		);
	}

	return <LiveCallSession callId={callId} topic={topic} />;
}

export default function LiveCallPage() {
	return (
		<Suspense>
			<LiveCallContent />
		</Suspense>
	);
}
