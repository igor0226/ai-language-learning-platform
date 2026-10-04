"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as React from "react";

import { useMdUp } from "@/shared/lib/use-md-up";
import { cn } from "@/shared/lib/utils";
import { radixSurfaceEnterExit } from "./radix-content-motion";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetTitle,
	SheetTrigger,
} from "./sheet";

type MenuMode = "dropdown" | "sheet";

const MenuModeContext = React.createContext<MenuMode>("dropdown");

function useMenuMode(): MenuMode {
	return React.useContext(MenuModeContext);
}

type DropdownMenuProps = {
	children?: React.ReactNode;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
};

function DropdownMenu({ children, ...props }: DropdownMenuProps) {
	const isMdUp = useMdUp();
	const mode: MenuMode = isMdUp ? "dropdown" : "sheet";

	if (mode === "dropdown") {
		return (
			<MenuModeContext.Provider value="dropdown">
				<DropdownMenuPrimitive.Root {...props}>
					{children}
				</DropdownMenuPrimitive.Root>
			</MenuModeContext.Provider>
		);
	}

	return (
		<MenuModeContext.Provider value="sheet">
			<Sheet {...props}>{children}</Sheet>
		</MenuModeContext.Provider>
	);
}

const DropdownMenuTrigger = React.forwardRef<
	HTMLButtonElement,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>
>((props, ref) => {
	const mode = useMenuMode();
	if (mode === "sheet") {
		return <SheetTrigger ref={ref} {...props} />;
	}
	return <DropdownMenuPrimitive.Trigger ref={ref} {...props} />;
});
DropdownMenuTrigger.displayName = DropdownMenuPrimitive.Trigger.displayName;

type DropdownMenuContentProps = React.ComponentPropsWithoutRef<
	typeof DropdownMenuPrimitive.Content
> & {
	title?: string;
};

const DropdownMenuContent = React.forwardRef<
	HTMLDivElement,
	DropdownMenuContentProps
>(
	(
		{
			className,
			children,
			align = "end",
			sideOffset = 4,
			title = "Menu",
			...props
		},
		ref,
	) => {
		const mode = useMenuMode();
		if (mode === "sheet") {
			return (
				<SheetContent
					ref={ref}
					side="bottom"
					className={cn(
						"studioOverlaySurface safe-bottom max-h-[85dvh] overflow-y-auto rounded-t-2xl border-x-0 border-b-0 p-3 pt-2",
						className,
						"w-full",
					)}
				>
					<SheetTitle className="sr-only">{title}</SheetTitle>
					<div
						className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted"
						aria-hidden
					/>
					<div className="flex flex-col gap-1">{children}</div>
				</SheetContent>
			);
		}

		return (
			<DropdownMenuPrimitive.Portal>
				<DropdownMenuPrimitive.Content
					ref={ref}
					align={align}
					sideOffset={sideOffset}
					className={cn(
						"z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md origin-[--radix-dropdown-menu-content-transform-origin]",
						radixSurfaceEnterExit,
						className,
					)}
					{...props}
				>
					{children}
				</DropdownMenuPrimitive.Content>
			</DropdownMenuPrimitive.Portal>
		);
	},
);
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

type DropdownMenuItemProps = React.ComponentPropsWithoutRef<
	typeof DropdownMenuPrimitive.Item
> & {
	inset?: boolean;
};

const itemClassName = (inset: boolean | undefined, className?: string) =>
	cn(
		"relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
		inset && "pl-8",
		className,
	);

const DropdownMenuItem = React.forwardRef<
	HTMLDivElement,
	DropdownMenuItemProps
>(({ className, inset, onClick, disabled, children, ...props }, ref) => {
	const mode = useMenuMode();
	if (mode === "sheet") {
		return (
			<SheetClose asChild>
				<button
					type="button"
					disabled={disabled}
					className={cn(itemClassName(inset, className), "px-3 py-3")}
					onClick={(event) => {
						onClick?.(event as unknown as React.MouseEvent<HTMLDivElement>);
					}}
				>
					{children}
				</button>
			</SheetClose>
		);
	}

	return (
		<DropdownMenuPrimitive.Item
			ref={ref}
			className={itemClassName(inset, className)}
			onClick={onClick}
			disabled={disabled}
			{...props}
		>
			{children}
		</DropdownMenuPrimitive.Item>
	);
});
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuLabel = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & {
		inset?: boolean;
	}
>(({ className, inset, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			"px-2 py-1.5 text-sm font-semibold",
			inset && "pl-8",
			className,
		)}
		{...props}
	/>
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

const DropdownMenuSeparator = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("-mx-1 my-1 h-px bg-muted", className)}
		{...props}
	/>
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
};
