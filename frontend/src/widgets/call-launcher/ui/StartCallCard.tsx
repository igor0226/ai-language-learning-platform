"use client";

import type { CallTopic } from "@/entities/speaking-session";
import type { TopicFormState } from "@/features/manage-speaking-topics";

import { useState } from "react";
import { toast } from "sonner";

import { TopicFormDialog } from "@/features/manage-speaking-topics";
import { Card, CardContent } from "@/shared/ui/card";
import { DeviceReadiness } from "./DeviceReadiness";
import { LaunchPreview } from "./LaunchPreview";
import { TopicGrid } from "./TopicGrid";

type StartCallCardProps = {
	topics: CallTopic[];
	selectedTopic: CallTopic;
	selectedTopicId: string;
	onTopicSelect: (id: string) => void;
	onCreateTopic: (form: TopicFormState) => void;
	onUpdateTopic: (id: string, form: TopicFormState) => void;
	onDeleteTopic: (id: string) => void;
	onStartCall: () => void;
};

export function StartCallCard({
	topics,
	selectedTopic,
	selectedTopicId,
	onTopicSelect,
	onCreateTopic,
	onUpdateTopic,
	onDeleteTopic,
	onStartCall,
}: StartCallCardProps) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingTopic, setEditingTopic] = useState<CallTopic | null>(null);

	const openCreateDialog = () => {
		setEditingTopic(null);
		setDialogOpen(true);
	};

	const openEditDialog = (topic: CallTopic) => {
		setEditingTopic(topic);
		setDialogOpen(true);
	};

	const handleSaveTopic = (form: TopicFormState, editingId: string | null) => {
		if (editingId) {
			onUpdateTopic(editingId, form);
			toast.success("Topic updated");
			return;
		}
		onCreateTopic(form);
	};

	const handleDeleteTopic = (id: string) => {
		onDeleteTopic(id);
		toast.success("Topic deleted");
	};

	return (
		<div className="speakingLauncher">
			<Card className="lg:col-span-8">
				<CardContent className="space-y-6 p-6">
					<div>
						<h2 className="text-base font-bold">
							Configure Interactive Conversation
						</h2>
						<p className="mt-1 text-xs text-muted-foreground">
							Select a contextual scenario or create your own discussion topic
							for natural dialogue with the AI instructor.
						</p>
					</div>
					<TopicGrid
						topics={topics}
						selectedTopicId={selectedTopicId}
						onTopicSelect={onTopicSelect}
						onAddTopic={openCreateDialog}
						onEditTopic={openEditDialog}
						onDeleteTopic={handleDeleteTopic}
					/>
					<DeviceReadiness />
				</CardContent>
			</Card>
			<LaunchPreview topic={selectedTopic} onStartCall={onStartCall} />
			<TopicFormDialog
				open={dialogOpen}
				editingTopic={editingTopic}
				onOpenChange={setDialogOpen}
				onSave={handleSaveTopic}
			/>
		</div>
	);
}
