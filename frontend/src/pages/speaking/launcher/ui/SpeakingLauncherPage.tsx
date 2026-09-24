"use client";

import { toast } from "sonner";

import { useSpeakingCalls } from "@/entities/speaking-session";
import { useSpeakingTopics } from "@/features/manage-speaking-topics";
import { useStartCall } from "@/features/start-call";
import { CallHistoryList, StartCallCard } from "@/widgets/call-launcher";
import { AppPageHeader } from "@/widgets/page-header";

export default function SpeakingLauncherPage() {
	const startCall = useStartCall();
	const {
		topics,
		selectedTopicId,
		selectedTopic,
		setSelectedTopicId,
		createTopic,
		updateTopic,
		deleteTopic,
	} = useSpeakingTopics();
	const { calls, isLoading, errorMessage } = useSpeakingCalls();

	if (!selectedTopic) {
		return null;
	}

	return (
		<main className="speakingPage">
			<AppPageHeader
				title="Speaking Practice"
				breadcrumbs={[
					{ label: "Home", href: "/dashboard" },
					{ label: "Speaking" },
				]}
			/>
			<StartCallCard
				topics={topics}
				selectedTopic={selectedTopic}
				selectedTopicId={selectedTopicId}
				onTopicSelect={setSelectedTopicId}
				onCreateTopic={(form) => {
					const created = createTopic(form);
					toast.success(`Topic "${created.title}" created and selected`);
				}}
				onUpdateTopic={updateTopic}
				onDeleteTopic={deleteTopic}
				onStartCall={() => startCall(selectedTopicId)}
			/>
			<CallHistoryList
				calls={calls}
				isLoading={isLoading}
				errorMessage={errorMessage}
			/>
		</main>
	);
}
