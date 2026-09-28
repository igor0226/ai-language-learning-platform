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
		isLoading: isTopicsLoading,
		errorMessage: topicsErrorMessage,
	} = useSpeakingTopics();
	const { calls, isLoading, errorMessage } = useSpeakingCalls();

	return (
		<main className="speakingPage">
			<AppPageHeader
				title="Speaking Practice"
				breadcrumbs={[
					{ label: "Home", href: "/dashboard" },
					{ label: "Speaking" },
				]}
			/>
			{isTopicsLoading ? (
				<p className="text-sm text-muted-foreground">Loading topics…</p>
			) : null}
			{topicsErrorMessage ? (
				<p className="text-sm text-destructive">Couldn&apos;t load topics.</p>
			) : null}
			{!isTopicsLoading && !topicsErrorMessage ? (
				<StartCallCard
					topics={topics}
					selectedTopic={selectedTopic}
					selectedTopicId={selectedTopicId}
					onTopicSelect={setSelectedTopicId}
					onCreateTopic={async (form) => {
						const created = await createTopic(form);
						toast.success(`Topic "${created.title}" created and selected`);
					}}
					onUpdateTopic={updateTopic}
					onDeleteTopic={deleteTopic}
					onStartCall={() => {
						if (!selectedTopicId) {
							return;
						}
						startCall(selectedTopicId);
					}}
				/>
			) : null}
			<CallHistoryList
				calls={calls}
				isLoading={isLoading}
				errorMessage={errorMessage}
			/>
		</main>
	);
}
