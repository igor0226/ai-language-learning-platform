import { randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { User } from "../models";
import type { UpsertGoogleUserInput, UserRecord } from "./types";
import { isInvalidUuidError } from "./utils/postgres-errors";
import { normalizeUserRecord } from "./utils/user-record";

@Injectable()
export class UserRepositoryService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) {}

	async getById(userId: string): Promise<UserRecord | null> {
		try {
			const record = await this.userRepository.findOne({
				where: { id: userId },
			});
			return record ? normalizeUserRecord(record) : null;
		} catch (error) {
			if (isInvalidUuidError(error)) {
				return null;
			}
			throw error;
		}
	}

	async upsertGoogleUser(input: UpsertGoogleUserInput): Promise<UserRecord> {
		const existing = await this.userRepository.findOne({
			where: { googleSub: input.googleSub },
		});
		const nowIso = new Date().toISOString();

		if (existing) {
			existing.email = input.email;
			existing.name = input.name;
			existing.pictureUrl = input.pictureUrl;
			existing.updatedAt = nowIso;
			await this.userRepository.save(existing);
			return normalizeUserRecord(existing);
		}

		const record: UserRecord = {
			id: randomUUID(),
			googleSub: input.googleSub,
			email: input.email,
			name: input.name,
			pictureUrl: input.pictureUrl,
			createdAt: nowIso,
			updatedAt: nowIso,
		};
		await this.userRepository.save(record);
		return record;
	}
}
