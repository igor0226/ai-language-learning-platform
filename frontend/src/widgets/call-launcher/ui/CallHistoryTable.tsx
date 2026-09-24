import {
	formatSpeakingCallStatus,
	type SpeakingCall,
} from "@/entities/speaking-session";
import { Badge } from "@/shared/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/ui/table";
import { TableLoadError } from "@/shared/ui/table-load-error";
import { TableLoadingRows } from "@/shared/ui/table-loading-rows";

const COLUMN_COUNT = 6;

type CallHistoryTableProps = {
	calls: SpeakingCall[];
	isLoading?: boolean;
	isError?: boolean;
	emptyLabel?: string;
};

export function CallHistoryTable({
	calls,
	isLoading = false,
	isError = false,
	emptyLabel = "No speaking sessions recorded yet. Start your first call above.",
}: CallHistoryTableProps) {
	return (
		<div className="overflow-hidden rounded-lg border border-border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="pl-4 text-left">Status</TableHead>
						<TableHead>Level</TableHead>
						<TableHead>Source</TableHead>
						<TableHead>Explanation</TableHead>
						<TableHead>Date</TableHead>
						<TableHead>Duration</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{renderCallHistoryTableBody({
						calls,
						isLoading,
						isError,
						emptyLabel,
					})}
				</TableBody>
			</Table>
		</div>
	);
}

const EMPTY_CELL_CLASS = "p-8 text-center text-muted-foreground";

type RenderCallHistoryTableBodyInput = {
	calls: SpeakingCall[];
	isLoading: boolean;
	isError: boolean;
	emptyLabel: string;
};

function renderCallHistoryTableBody(input: RenderCallHistoryTableBodyInput) {
	if (input.isLoading && input.calls.length === 0) {
		return (
			<TableLoadingRows
				colSpan={COLUMN_COUNT}
				cellClassName={EMPTY_CELL_CLASS}
			/>
		);
	}

	if (input.isError && input.calls.length === 0) {
		return (
			<TableLoadError colSpan={COLUMN_COUNT} className={EMPTY_CELL_CLASS} />
		);
	}

	if (input.calls.length === 0) {
		return (
			<TableRow>
				<TableCell colSpan={COLUMN_COUNT} className={EMPTY_CELL_CLASS}>
					{input.emptyLabel}
				</TableCell>
			</TableRow>
		);
	}

	return input.calls.map((call) => (
		<TableRow key={call.id}>
			<TableCell className="text-left">
				<Badge variant={call.status === "failed" ? "destructive" : "secondary"}>
					{formatSpeakingCallStatus(call.status)}
				</Badge>
			</TableCell>
			<TableCell>
				<span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[11px]">
					{call.languageLevel}
				</span>
			</TableCell>
			<TableCell>{call.sourceLanguage}</TableCell>
			<TableCell className="text-muted-foreground">
				{call.explanationLanguage ?? "—"}
			</TableCell>
			<TableCell className="text-muted-foreground">{call.date}</TableCell>
			<TableCell className="font-mono">{call.duration}</TableCell>
		</TableRow>
	));
}
