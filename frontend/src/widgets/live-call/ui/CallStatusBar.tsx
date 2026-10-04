import { formatTime } from "@/shared/lib";

type CallStatusBarProps = {
	topicTitle: string;
	sessionSeconds: number;
};

export function CallStatusBar({
	topicTitle,
	sessionSeconds,
}: CallStatusBarProps) {
	return (
		<header className="callStatusBar">
			<div className="flex min-w-0 items-center gap-2 sm:gap-4">
				<div className="flex shrink-0 items-center gap-2">
					<span className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand-400" />
					<span className="font-mono text-xs font-semibold tracking-wider text-brand-300">
						LIVE CALL
					</span>
				</div>
				<span className="truncate text-sm text-muted-foreground">
					{topicTitle}
				</span>
			</div>
			<div className="flex items-center gap-3">
				<div className="rounded-md border border-border bg-card px-3 py-1 font-mono text-xs">
					{formatTime(sessionSeconds)}
				</div>
			</div>
		</header>
	);
}
