import type {
	CreateCallTopicBody,
	CallTopic,
	UpdateCallTopicBody,
} from "@llp/contracts";
import { Injectable, NotFoundException } from "@nestjs/common";

import { CallTopicRepositoryService } from "@/storage/call-topic-repository.service";

import {
	DEFAULT_CALL_TOPIC_CATALOG,
	findDefaultCatalogTopic,
} from "./default-call-topics";
import {
	catalogEntryToCallTopic,
	customRowToCallTopic,
	mergeCallTopicLibrary,
	overrideRowToCallTopic,
	resolveTopicForUser as resolveTopicFromOverlay,
	topicContentEqualsCatalog,
} from "./utils/merge-call-topic-library";

@Injectable()
export class CallTopicsService {
	constructor(
		private readonly callTopicRepository: CallTopicRepositoryService,
	) {}

	async listTopics(input: { userId: string }): Promise<CallTopic[]> {
		const rows = await this.callTopicRepository.listForUser(input.userId);
		return mergeCallTopicLibrary({
			catalog: DEFAULT_CALL_TOPIC_CATALOG,
			rows,
		});
	}

	async createTopic(input: {
		userId: string;
		body: CreateCallTopicBody;
	}): Promise<CallTopic> {
		const record = await this.callTopicRepository.createCustom({
			userId: input.userId,
			title: input.body.title,
			level: input.body.level,
			description: input.body.description,
			suggestedDurationMins: input.body.suggestedDurationMins ?? 15,
		});
		return customRowToCallTopic(record);
	}

	async updateTopic(input: {
		userId: string;
		topicId: string;
		body: UpdateCallTopicBody;
	}): Promise<CallTopic> {
		const current = await this.resolveTopicForUser({
			userId: input.userId,
			topicId: input.topicId,
		});
		if (!current) {
			throw new NotFoundException("Call topic not found");
		}

		const nextContent = {
			title: input.body.title?.trim() ?? current.title,
			level: input.body.level ?? current.level,
			description: input.body.description?.trim() ?? current.description,
			suggestedDurationMins:
				input.body.suggestedDurationMins ?? current.suggestedDurationMins,
		};

		if (current.isCustom) {
			const updated = await this.callTopicRepository.updateCustom({
				userId: input.userId,
				topicId: input.topicId,
				patch: nextContent,
			});
			if (!updated) {
				throw new NotFoundException("Call topic not found");
			}
			return customRowToCallTopic(updated);
		}

		const catalogEntry = findDefaultCatalogTopic(input.topicId);
		if (!catalogEntry) {
			throw new NotFoundException("Call topic not found");
		}

		if (topicContentEqualsCatalog(catalogEntry, nextContent)) {
			await this.callTopicRepository.deleteRow({
				userId: input.userId,
				topicId: input.topicId,
			});
			return catalogEntryToCallTopic(catalogEntry);
		}

		const overrideRecord = await this.callTopicRepository.upsertOverride({
			userId: input.userId,
			topicId: input.topicId,
			...nextContent,
		});
		return overrideRowToCallTopic(overrideRecord, catalogEntry.createdAt);
	}

	async deleteTopic(input: { userId: string; topicId: string }): Promise<void> {
		const current = await this.resolveTopicForUser({
			userId: input.userId,
			topicId: input.topicId,
		});
		if (!current) {
			throw new NotFoundException("Call topic not found");
		}

		if (current.isCustom) {
			const deleted = await this.callTopicRepository.deleteRow({
				userId: input.userId,
				topicId: input.topicId,
			});
			if (!deleted) {
				throw new NotFoundException("Call topic not found");
			}
			return;
		}

		await this.callTopicRepository.upsertHidden({
			userId: input.userId,
			topicId: input.topicId,
		});
	}

	private async resolveTopicForUser(input: {
		userId: string;
		topicId: string;
	}): Promise<CallTopic | undefined> {
		const row = await this.callTopicRepository.getRow({
			userId: input.userId,
			topicId: input.topicId,
		});
		return resolveTopicFromOverlay({
			catalog: DEFAULT_CALL_TOPIC_CATALOG,
			topicId: input.topicId,
			row,
		});
	}
}
