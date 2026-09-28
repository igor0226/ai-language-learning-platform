import { TableCell, TableRow } from "./table";

type TableLoadErrorProps = {
	colSpan: number;
	className?: string;
};

export function TableLoadError({ colSpan, className }: TableLoadErrorProps) {
	return (
		<TableRow>
			<TableCell colSpan={colSpan} className={className}>
				Couldn&apos;t load data.
			</TableCell>
		</TableRow>
	);
}
