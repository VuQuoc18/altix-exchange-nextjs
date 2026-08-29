import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { d1, r2 } from "@emdash-cms/cloudflare";
import icon from "astro-iconset";
import { defineConfig, fontProviders } from "astro/config";
import emdash from "emdash/astro";

export default defineConfig({
	output: "server",
	adapter: cloudflare(),
	redirects: {
		"/en-us": { destination: "/", status: 301 },
		"/en-us/": { destination: "/", status: 301 },
		"/about-us": { destination: "/about", status: 301 },
		"/how-altix-works": { destination: "/how-it-works", status: 301 },
		"/how-altix-works-for-claimants": { destination: "/claimants-and-businesses", status: 301 },
		"/how-altix-works-for-lawyers": { destination: "/law-firms", status: 301 },
		"/how-altix-works-for-investors": { destination: "/funding-participants", status: 301 },
		"/become-a-partner": { destination: "/expert-network", status: 301 },
		"/expert-panel": { destination: "/expert-network", status: 301 },
		"/contact-us": { destination: "/", status: 301 },
		"/contact": { destination: "/", status: 301 },
		"/privacy-policy": { destination: "/privacy", status: 301 },
		"/terms-of-service": { destination: "/terms", status: 301 },
		"/newsroom": { destination: "/insights", status: 301 },
	},
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	vite: {
		plugins: [tailwindcss()],
		ssr: {
			optimizeDeps: {
				// Pre-bundle so it isn't discovered mid-render, which would trigger
				// a Vite dep re-optimization and break in-flight worker imports
				// under the Cloudflare dev runner (workerd).
				include: ["astro-iconset/components"],
			},
		},
	},
	integrations: [
		react(),
		icon({
			// Only ship the Phosphor icons actually referenced in templates,
			// not the full @iconify-json/ph set (which adds megabytes to the
			// deployed worker bundle).
			include: {
				ph: [
					"chart-bar",
					"check-circle",
					"clock",
					"cloud",
					"code",
					"currency-dollar",
					"envelope",
					"globe",
					"heart",
					"lifebuoy",
					"lightning",
					"lock",
					"shield-check",
					"sparkle",
					"star",
					"users-three",
				],
			},
		}),
		emdash({
			database: d1({ binding: "DB", session: "auto" }),
			storage: r2({ binding: "MEDIA" }),
			plugins: [
				{
					id: "marketing-blocks",
					version: "0.1.0",
					// Absolute file:// URL so the virtual emdash/plugins module
					// can resolve this at build time (relative paths fail because
					// the virtual module has no on-disk location to anchor them).
					entrypoint: new URL("./src/plugins/marketing-blocks/index.ts", import.meta.url).href,
				},
			],
		}),
	],
	fonts: [
		{
			provider: fontProviders.google(),
			name: "Inter",
			cssVariable: "--font-body",
			weights: [400, 500, 600, 700, 800],
			fallbacks: ["sans-serif"],
		},
	],
	devToolbar: { enabled: false },
});
