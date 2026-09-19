"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { UserAccountMenu } from "@/widgets/user-menu";
import { AppNavLinks } from "./AppNavLinks";
import "./AppShell.css";

type AppShellProps = {
	children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
	const pathname = usePathname() ?? "";
	const isImmersive =
		pathname.startsWith("/speaking/call/") || pathname === "/login";

	if (isImmersive) {
		return <div className="callPage">{children}</div>;
	}

	return (
		<div className="studioPage appShell">
			<header className="appShellHeader">
				<div className="appShellHeaderInner">
					<div className="flex items-center gap-8">
						<Link href="/dashboard" className="appShellBrand">
							<span className="appShellMark">LS</span>
							<span className="appShellBrandText">
								<span className="appShellBrandName">Language Studio</span>
								<span className="appShellBrandMeta">v2.4 · B2 Fluency</span>
							</span>
						</Link>
						<AppNavLinks pathname={pathname} className="appShellNav" />
					</div>
					<UserAccountMenu />
				</div>
				<AppNavLinks pathname={pathname} className="appShellMobileNav" />
			</header>
			<div className="appShellMain">{children}</div>
		</div>
	);
}
