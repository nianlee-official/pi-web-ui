import type { ReactNode } from "react";

export function HubLink({ href, children }: { href: string; children: ReactNode }) {
	return (
		<a className="dc-button" href={href} target="_blank" rel="noopener noreferrer">
			{children}
		</a>
	);
}
