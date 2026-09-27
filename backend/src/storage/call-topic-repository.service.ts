import { randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { UserCallTopic } from "../models";
import type {
	CreateUserCallTopicCustomInput,
	UpdateCallTopicContentPatch,
	UpsertUserCallTopicOverrideInput,
	UserCallTopicRecord,
} from "./type";
import { isInvalidUuidError } from "./utils/postgres-errors";
import { normalizeUserCallTopicRecord } from "./utils/user-call-topic-record";

@Injectable()
export class CallTopicRepositoryService {
	constructor(
		@InjectRepository(UserCallTopic)
		private readonly topicRepository: Repository<UserCallTopic>,
	) {}

	async listForUser(userId: string): Promise<UserCallTopicRecord[]> {
		const records = await this.topicRepository.find({
			where: { userId },
		});
		return records.map(normalizeUserCallTopicRecord);
	}

	async getRow(input: {
		userId: string;
		topicId: string;
	}): Promise<UserCallTopicRecord | null> {
		try {
			const record = await this.topicRepository.findOne({
				where: { userId: input.userId, topicId: input.topicId },
			});
			return record ? normalizeUserCallTopicRecord(record) : null;
		} catch (error) {
			if (isInvalidUuidError(error)) {
				return null;
			}
			throw error;
		}
	}

	async createCustom(
		input: CreateUserCallTopicCustomInput,
	): Promise<UserCallTopicRecord> {
		const nowIso = new Date().toISOString();
		const topicId = randomUUID();
		const record: UserCallTopicRecord = {
			userId: input.userId,
			topicId,
			kind: "custom",
			title: input.title.trim(),
			level: input.level.trim(),
			description: input.description.trim(),
			suggestedDurationMins: input.suggestedDurationMins,
			createdAt: nowIso,
			updatedAt: nowIso,
		};
		await this.topicRepository.save(record);
		return record;
	}

	async upsertOverride(
		input: UpsertUserCallTopicOverrideInput,
	): Promise<UserCallTopicRecord> {
		const nowIso = new Date().toISOString();
		const existing = await this.getRow({
			userId: input.userId,
			topicId: input.topicId,
		});
		const record: UserCallTopicRecord = {
			userId: input.userId,
			topicId: input.topicId,
			kind: "override",
			title: input.title.trim(),
			level: input.level.trim(),
			description: input.description.trim(),
			suggestedDurationMins: input.suggestedDurationMins,
			createdAt: existing?.createdAt ?? nowIso,
			updatedAt: nowIso,
		};
		await this.topicRepository.save(record);
		return record;
	}

	async upsertHidden(input: {
		userId: string;
		topicId: string;
	}): Promise<UserCallTopicRecord> {
		const nowIso = new Date().toISOString();
		const existing = await this.getRow({
			userId: input.userId,
			topicId: input.topicId,
		});
		const record: UserCallTopicRecord = {
			userId: input.userId,
			topicId: input.topicId,
			kind: "hidden",
			title: null,
			level: null,
			description: null,
			suggestedDurationMins: null,
			createdAt: existing?.createdAt ?? nowIso,
			updatedAt: nowIso,
		};
		await this.topicRepository.save(record);
		return record;
	}

	async updateCustom(input: {
		userId: string;
		topicId: string;
		patch: UpdateCallTopicContentPatch;
	}): Promise<UserCallTopicRecord | null> {
		const existing = await this.getRow({
			userId: input.userId,
			topicId: input.topicId,
		});
		if (existing?.kind !== "custom") {
			return null;
		}

		const updated: UserCallTopicRecord = {
			...existing,
			title: input.patch.title?.trim() ?? existing.title,
			level: input.patch.level?.trim() ?? existing.level,
			description: input.patch.description?.trim() ?? existing.description,
			suggestedDurationMins:
				input.patch.suggestedDurationMins ?? existing.suggestedDurationMins,
			updatedAt: new Date().toISOString(),
		};
		await this.topicRepository.save(updated);
		return updated;
	}

	async deleteRow(input: {
		userId: string;
		topicId: string;
	}): Promise<boolean> {
		const result = await this.topicRepository.delete({
			userId: input.userId,
			topicId: input.topicId,
		});
		return (result.affected ?? 0) > 0;
	}
}
