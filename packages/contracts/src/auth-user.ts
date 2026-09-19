import { z } from "zod";

export const authUserSchema = z.object({
	id: z.string().uuid(),
	email: z.string().email(),
	name: z.string().min(1),
	pictureUrl: z.string().url().nullable(),
});

export type AuthUser = z.infer<typeof authUserSchema>;
