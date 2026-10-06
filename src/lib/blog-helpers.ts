export function getPostCategory(slug: string = "", title: string = ""): string {
	const s = slug.toLowerCase();
	const t = title.toLowerCase();

	if (s.includes("litigation-finance") || t.includes("litigation finance") || s.includes("funding-guide")) {
		return "Litigation Finance";
	}
	if (s.includes("claim-fundable") || s.includes("readiness") || s.includes("case-readiness")) {
		return "Case Readiness";
	}
	if (s.includes("collectability") || s.includes("enforcement") || s.includes("asset-recovery")) {
		return "Asset Recovery";
	}
	if (s.includes("fraud") || s.includes("scammer") || s.includes("crime") || t.includes("fraud") || t.includes("scammer")) {
		return "Financial Crime";
	}
	if (s.includes("structuring") || s.includes("institutional-capital") || t.includes("institutional capital")) {
		return "Institutional Capital";
	}
	return "Market Intelligence";
}

export function estimateReadTime(content: any, excerpt?: string): string {
	let text = excerpt || "";
	if (Array.isArray(content)) {
		for (const block of content) {
			if (block?.children && Array.isArray(block.children)) {
				for (const child of block.children) {
					if (typeof child?.text === "string") {
						text += " " + child.text;
					}
				}
			}
		}
	} else if (typeof content === "string") {
		text += " " + content;
	}

	const words = text.trim().split(/\s+/).filter(Boolean).length;
	const minutes = Math.max(2, Math.ceil(words / 180));
	return `${minutes} min read`;
}

export function formatPostDate(rawDate?: Date | string | null): string {
	if (!rawDate) return "Recent";
	try {
		return new Date(rawDate).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	} catch {
		return "Recent";
	}
}

export function sanitizePortableText(blocks: any[]): any[] {
	if (!Array.isArray(blocks)) return blocks;
	return blocks.map((block) => {
		if (block && Array.isArray(block.children)) {
			return {
				...block,
				children: block.children.map((child: any) => {
					if (child && typeof child.text === "string") {
						return {
							...child,
							text: child.text.replace(/^<p>/i, "").replace(/<\/p>$/i, ""),
						};
					}
					return child;
				}),
			};
		}
		return block;
	});
}
