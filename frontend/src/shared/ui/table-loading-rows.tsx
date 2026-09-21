import { cn } from "@/shared/lib";
import { TableCell, TableRow } from "./table";

type TableLoadingRowsProps = {
	colSpan: number;
	rowCount?: number;
	cellClassName?: string;
};

export function TableLoadingRows({
	colSpan,
	rowCount = 5,
	cellClassName,
}: TableLoadingRowsProps) {
	return (
		<>
			{Array.from({ length: rowCount }, (_, index) => (
				<TableRow key={`loading-${index}`}>
					<TableCell colSpan={colSpan} className={cellClassName}>
						<div
							className={cn(
								"h-4 w-full animate-pulse rounded-sm bg-muted",
								index % 2 === 0 ? "max-w-[85%]" : "max-w-[70%]",
							)}
						/>
					</TableCell>
				</TableRow>
			))}
		</>
	);
}
