import { definePlugin } from "emdash";
import type { PluginDefinition } from "emdash";

export const RESEND_PLUGIN_ID = "emdash-resend";

const definition: PluginDefinition = {
	id: RESEND_PLUGIN_ID,
	version: "0.1.0",
	name: "Resend Email Provider",
	description: "Delivers emails via Resend API",

	hooks: {
		"email:deliver": {
			exclusive: true,
			handler: async ({ message, source }) => {
				// Priority: 1. Process/Env var, 2. Global runtime env
				const apiKey = 
					process.env.RESEND_API_KEY || 
					(globalThis as any).RESEND_API_KEY || 
					(globalThis as any).process?.env?.RESEND_API_KEY;

				if (!apiKey) {
					console.error("[resend] RESEND_API_KEY is not configured.");
					throw new Error("RESEND_API_KEY is not configured.");
				}

				const fromEmail = 
					process.env.RESEND_FROM_EMAIL || 
					(globalThis as any).RESEND_FROM_EMAIL || 
					"ALTIX <onboarding@resend.dev>";

				const payload: Record<string, unknown> = {
					from: fromEmail,
					to: message.to,
					subject: message.subject,
					text: message.text,
				};

				if (message.html) {
					payload.html = message.html;
				}

				const res = await fetch("https://api.resend.com/emails", {
					method: "POST",
					headers: {
						Authorization: `Bearer ${apiKey}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(payload),
				});

				if (!res.ok) {
					const errorText = await res.text();
					console.error("[resend] Delivery failed:", res.status, errorText);
					throw new Error(`Resend email delivery failed (${res.status}): ${errorText}`);
				}

				const result = await res.json();
				console.log("[resend] Email sent successfully:", result);
			},
		},
	},
};

export function createPlugin() {
	return definePlugin(definition);
}

export default createPlugin;
