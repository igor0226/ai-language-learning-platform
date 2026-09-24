import { toast } from "sonner";

type NotifyClientErrorInput = {
	error: unknown;
	id?: string;
};

export function notifyClientError({ error, id }: NotifyClientErrorInput): void {
	if (error instanceof Error && error.name === "AuthRequiredError") {
		return;
	}

	const message =
		error instanceof Error && error.message.trim().length > 0
			? error.message
			: "Request failed";

	toast.error(message, id ? { id } : undefined);
}
