"use client";

import type { CallTopic } from "@/entities/speaking-session";

import { useEffect, useState } from "react";

import { Button } from "@/shared/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import {
	emptyTopicForm,
	resolveTopicLevelOptions,
	type TopicFormState,
	topicToFormState,
	validateTopicForm,
} from "../lib/topic-form";

type TopicFormDialogProps = {
	open: boolean;
	editingTopic: CallTopic | null;
	onOpenChange: (open: boolean) => void;
	onSave: (form: TopicFormState, editingId: string | null) => void;
};

export function TopicFormDialog({
	open,
	editingTopic,
	onOpenChange,
	onSave,
}: TopicFormDialogProps) {
	const [form, setForm] = useState<TopicFormState>(emptyTopicForm());
	const [formError, setFormError] = useState("");

	useEffect(() => {
		if (!open) {
			return;
		}
		if (editingTopic) {
			setForm(topicToFormState(editingTopic));
		} else {
			setForm(emptyTopicForm());
		}
		setFormError("");
	}, [open, editingTopic]);

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		const error = validateTopicForm(form);
		if (error) {
			setFormError(error);
			return;
		}
		onSave(form, editingTopic?.id ?? null);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="studioOverlaySurface max-h-[90vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{editingTopic ? "Edit discussion topic" : "Add discussion topic"}
					</DialogTitle>
					<DialogDescription>
						{editingTopic
							? "Update the scenario the AI instructor will use."
							: "Create a custom scenario or start from a preset."}
					</DialogDescription>
				</DialogHeader>

				<form className="space-y-3" onSubmit={handleSubmit}>
					{formError ? (
						<p className="text-xs text-destructive" role="alert">
							{formError}
						</p>
					) : null}
					<div className="space-y-1">
						<Label htmlFor="topic-title">Title *</Label>
						<Input
							id="topic-title"
							value={form.title}
							onChange={(event) =>
								setForm((current) => ({
									...current,
									title: event.target.value,
								}))
							}
						/>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1">
							<Label htmlFor="topic-level">CEFR level</Label>
							<Select
								value={form.level}
								onValueChange={(value) =>
									setForm((current) => ({ ...current, level: value }))
								}
							>
								<SelectTrigger id="topic-level">
									<SelectValue placeholder="Select level" />
								</SelectTrigger>
								<SelectContent>
									{resolveTopicLevelOptions(form.level).map((level) => (
										<SelectItem key={level} value={level}>
											{level}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1">
							<Label htmlFor="topic-duration">Duration (minutes)</Label>
							<Input
								id="topic-duration"
								type="number"
								min={5}
								max={60}
								value={form.duration}
								onChange={(event) =>
									setForm((current) => ({
										...current,
										duration: Number(event.target.value),
									}))
								}
							/>
						</div>
					</div>
					<div className="space-y-1">
						<Label htmlFor="topic-description">Scenario description *</Label>
						<Textarea
							id="topic-description"
							rows={4}
							value={form.description}
							onChange={(event) =>
								setForm((current) => ({
									...current,
									description: event.target.value,
								}))
							}
						/>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="ghost"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit">
							{editingTopic ? "Save changes" : "Create & select topic"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
