import type { APIRoute } from "astro";
import { verifyPassword } from "../crypto.js";

export const prerender = false;

export const POST: APIRoute = async (context) => {
	const { request, locals, session } = context;
	const { emdash } = locals;

	if (!emdash?.db) {
		return new Response(
			JSON.stringify({ success: false, message: "EmDash database is not ready" }),
			{ status: 500, headers: { "Content-Type": "application/json" } },
		);
	}

	try {
		let body: { email?: string; password?: string };
		try {
			body = await request.json();
		} catch {
			return new Response(
				JSON.stringify({ success: false, message: "Invalid JSON request body" }),
				{ status: 400, headers: { "Content-Type": "application/json" } },
			);
		}

		const email = (body.email || "").toString().trim().toLowerCase();
		const password = (body.password || "").toString();

		if (!email || !password) {
			return new Response(
				JSON.stringify({ success: false, message: "Email and password are required" }),
				{ status: 400, headers: { "Content-Type": "application/json" } },
			);
		}

		// 1. Look up user by email
		const user = await emdash.db
			.selectFrom("users")
			.selectAll()
			.where("email", "=", email)
			.executeTakeFirst();

		if (!user) {
			return new Response(
				JSON.stringify({ success: false, message: "Invalid email or password" }),
				{ status: 401, headers: { "Content-Type": "application/json" } },
			);
		}

		if (user.disabled) {
			return new Response(
				JSON.stringify({ success: false, message: "This account has been disabled" }),
				{ status: 403, headers: { "Content-Type": "application/json" } },
			);
		}

		// 2. Fetch password credentials from _plugin_storage
		const credentialRow = await emdash.db
			.selectFrom("_plugin_storage")
			.select("data")
			.where("plugin_id", "=", "auth:password")
			.where("collection", "=", "passwords")
			.where("id", "=", user.id)
			.executeTakeFirst();

		if (!credentialRow) {
			return new Response(
				JSON.stringify({
					success: false,
					message: "No password configured for this account. Please set a password first.",
				}),
				{ status: 401, headers: { "Content-Type": "application/json" } },
			);
		}

		let credential: { hash: string; salt: string };
		try {
			credential = JSON.parse(credentialRow.data);
		} catch {
			return new Response(
				JSON.stringify({ success: false, message: "Corrupted password credential record" }),
				{ status: 500, headers: { "Content-Type": "application/json" } },
			);
		}

		// 3. Verify password
		const isValid = await verifyPassword(password, credential.hash, credential.salt);
		if (!isValid) {
			return new Response(
				JSON.stringify({ success: false, message: "Invalid email or password" }),
				{ status: 401, headers: { "Content-Type": "application/json" } },
			);
		}

		// 4. Establish user session
		if (session) {
			session.set("user", { id: user.id });
		}

		return new Response(
			JSON.stringify({
				success: true,
				redirect: "/_emdash/admin",
				user: {
					id: user.id,
					email: user.email,
					name: user.name,
					role: user.role,
				},
			}),
			{ status: 200, headers: { "Content-Type": "application/json" } },
		);
	} catch (error: any) {
		console.error("[auth-password] Login error:", error);
		return new Response(
			JSON.stringify({ success: false, message: error?.message || "Internal server error" }),
			{ status: 500, headers: { "Content-Type": "application/json" } },
		);
	}
};
