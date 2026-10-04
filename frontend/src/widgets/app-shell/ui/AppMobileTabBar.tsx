"use client";

import { BookMarked } from "lucide-react";
import Link from "next/link";

import {
	useVocabularyDrawer,
	useVocabularyPhrases,
} from "@/features/vocabulary-notebook";
import { cn } from "@/shared/lib";
import { APP_NAV_ITEMS, isNavItemActive } from "./nav-items";

type AppMobileTabBarProps = {
	pathname: string;
};

export function AppMobileTabBar({ pathname }: AppMobileTabBarProps) {
	const { openDrawer } = useVocabularyDrawer();
	const { phrases } = useVocabularyPhrases();

	return (
		<nav aria-label="Mobile navigation" className="appShellMobileTabBar">
			{APP_NAV_ITEMS.map((item) => {
				const Icon = item.icon;
				const isActive = isNavItemActive(pathname, item.href);
				return (
					<Link
						key={item.href}
						href={item.href}
						className={cn(
							"appShellMobileTab",
							isActive && "appShellMobileTabActive",
						)}
						aria-current={isActive ? "page" : undefined}
					>
						<Icon
							className={cn(
								"appShellMobileTabIcon",
								isActive && "text-brand-700",
							)}
							aria-hidden
						/>
						<span className="truncate">{item.label}</span>
					</Link>
				);
			})}
			<button
				type="button"
				className="appShellMobileTab"
				onClick={openDrawer}
				title="Open vocabulary drawer"
			>
				<span className="relative">
					<BookMarked className="appShellMobileTabIcon" aria-hidden />
					{phrases.length > 0 ? (
						<span className="appShellMobileTabBadge">{phrases.length}</span>
					) : null}
				</span>
				<span className="truncate">Vocab</span>
			</button>
		</nav>
	);
}
