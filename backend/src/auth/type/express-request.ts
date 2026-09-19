import type { Request } from "express";

import type { UserRecord } from "@/storage/type";

export type AuthenticatedRequest = Request & {
	user?: UserRecord;
};
