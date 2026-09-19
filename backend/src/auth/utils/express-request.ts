import type { Request } from "express";

import type { UserRecord } from "../../storage/types";

export type AuthenticatedRequest = Request & {
	user?: UserRecord;
};
