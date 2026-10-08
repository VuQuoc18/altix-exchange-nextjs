import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { d1 } from "@emdash-cms/cloudflare";
import icon from "astro-iconset";
import { defineConfig, fontProviders } from "astro/config";
import emdash, { s3 } from "emdash/astro";
import { loadEnv } from "vite";
import { passwordAuth } from "./src/plugins/auth-password/index.ts";

const env = {
	...process.env,
	...loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), ""),
};

export default defineConfig({
	site: "https://altix.exchange",
	output: "server",
	adapter: cloudflare(),
	redirects: {
		"/en-us": { destination: "/", status: 301 },
		"/about-us": { destination: "/about", status: 301 },
		"/how-altix-works": { destination: "/how-it-works", status: 301 },
		"/how-altix-works-for-claimants": { destination: "/claimants-and-businesses", status: 301 },
		"/how-altix-works-for-lawyers": { destination: "/law-firms", status: 301 },
		"/how-altix-works-for-investors": { destination: "/funding-participants", status: 301 },
		"/become-a-partner": { destination: "/expert-network", status: 301 },
		"/expert-panel": { destination: "/expert-network", status: 301 },
		"/contact-us": { destination: "/contact", status: 301 },
		"/privacy-policy": { destination: "/privacy", status: 301 },
		"/terms-of-service": { destination: "/terms", status: 301 },
		"/posts": { destination: "/insights", status: 301 },
	},
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	vite: {
		plugins: [
			tailwindcss(),
			{
				name: "aws-sdk-browser-runtime",
				enforce: "pre",
				resolveId(id, importer) {
					if (id === "./runtimeConfig" && importer && importer.includes("@aws-sdk/client-s3")) {
						return this.resolve("./runtimeConfig.browser", importer, { skipSelf: true });
					}
				},
			},
			{
				name: "smithy-workerd-compat",
				enforce: "pre",
				transform(code, id) {
					let modified = false;
					let newCode = code;
					if (id.includes("stream-type-check")) {
						newCode = newCode
							.replace(
								/export const isBlob = \(blob\) => \{/,
								`export const isBlob = (blob) => { if (typeof blob?.arrayBuffer === "function" && typeof blob?.slice === "function") return true;`,
							)
							.replace(
								/export const isReadableStream = \(stream\) =>/,
								`export const isReadableStream = (stream) => (typeof stream?.getReader === "function") ||`,
							);
						modified = true;
					}
					if (id.includes("stream-collector.browser")) {
						newCode = newCode.replace(
							/export const streamCollector = async \(stream\) => \{/,
							`export const streamCollector = async (stream) => {
								if (!stream) return new Uint8Array();
								if (stream instanceof Uint8Array) return stream;
								if (typeof stream.arrayBuffer === "function") return collectBlob(stream);
								if (typeof stream.getReader === "function") return collectReadableStream(stream);
								return new Uint8Array();`,
						);
						modified = true;
					}
					if (id.includes("sdk-stream-mixin.browser")) {
						newCode = newCode.replace(
							/const isBlobInstance = \(stream\) => typeof Blob === "function" && stream instanceof Blob;/,
							`const isBlobInstance = (stream) => (typeof Blob === "function" && stream instanceof Blob) || (typeof stream?.arrayBuffer === "function" && typeof stream?.slice === "function");`,
						);
						modified = true;
					}
					return modified ? newCode : null;
				},
			},
		],
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
			storage: s3({
				bucket: env.AWS_S3_BUCKET || env.S3_BUCKET || "altix",
				region: env.AWS_REGION || env.S3_REGION || "ap-southeast-1",
				endpoint: env.AWS_S3_ENDPOINT || env.S3_ENDPOINT || "https://s3.ap-southeast-1.amazonaws.com",
				accessKeyId: env.AWS_ACCESS_KEY_ID || env.S3_ACCESS_KEY_ID || "",
				secretAccessKey: env.AWS_SECRET_ACCESS_KEY || env.S3_SECRET_ACCESS_KEY || "",
			}),
			authProviders: [passwordAuth()],
			plugins: [
				{
					id: "marketing-blocks",
					version: "0.2.0",
					// Absolute file:// URL so the virtual emdash/plugins module
					// can resolve this at build time (relative paths fail because
					// the virtual module has no on-disk location to anchor them).
					entrypoint: new URL("./src/plugins/marketing-blocks/index.ts", import.meta.url).href,
				},
				{
					id: "emdash-resend",
					version: "0.1.0",
					entrypoint: new URL("./src/plugins/resend/index.ts", import.meta.url).href,
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
