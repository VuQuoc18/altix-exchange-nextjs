import type { APIRoute } from "astro";
import { ulid } from "ulidx";
import { hashPassword } from "../crypto.js";

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
		let body: { email?: string; password?: string; name?: string; secret?: string };
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
		const name = body.name ? body.name.toString().trim() : null;
		const secret = body.secret ? body.secret.toString().trim() : null;

		if (!email || !password) {
			return new Response(
				JSON.stringify({ success: false, message: "Email and password are required" }),
				{ status: 400, headers: { "Content-Type": "application/json" } },
			);
		}

		if (password.length < 6) {
			return new Response(
				JSON.stringify({ success: false, message: "Password must be at least 6 characters" }),
				{ status: 400, headers: { "Content-Type": "application/json" } },
			);
		}

		// Security check:
		// 1. Check if caller has matching secret token from env
		const configuredSecret =
			(typeof process !== "undefined" && process.env?.AUTH_SETUP_SECRET) ||
			(typeof process !== "undefined" && process.env?.EMDASH_AUTH_SECRET) ||
			"";

		const hasValidSecret = Boolean(configuredSecret && secret && secret === configuredSecret);

		// 2. Check if logged-in session user is an Admin
		let isAdminSession = false;
		if (session) {
			const sessionUser = await session.get("user");
			if (sessionUser?.id) {
				const u = await emdash.db
					.selectFrom("users")
					.select("role")
					.where("id", "=", sessionUser.id)
					.executeTakeFirst();
				if (u && Number(u.role) >= 50) {
					isAdminSession = true;
				}
			}
		}

		// 3. Check if no passwords exist yet (first-time bootstrap)
		const countRow = await emdash.db
			.selectFrom("_plugin_storage")
			.select((eb) => eb.fn.countAll<number>().as("cnt"))
			.where("plugin_id", "=", "auth:password")
			.where("collection", "=", "passwords")
			.executeTakeFirst();
		const isInitialBootstrap = Number(countRow?.cnt || 0) === 0;

		const isDev = import.meta.env.DEV;

		if (!hasValidSecret && !isAdminSession && !isInitialBootstrap && !isDev) {
			return new Response(
				JSON.stringify({
					success: false,
					message: "Forbidden: You do not have permission to set passwords.",
				}),
				{ status: 403, headers: { "Content-Type": "application/json" } },
			);
		}

		// Look up or create user
		let user = await emdash.db
			.selectFrom("users")
			.selectAll()
			.where("email", "=", email)
			.executeTakeFirst();

		const now = new Date().toISOString();

		if (!user) {
			const newId = ulid();
			const displayName = name || email.split("@")[0] || "Admin";

			await emdash.db
				.insertInto("users")
				.values({
					id: newId,
					email,
					name: displayName,
					role: 50, // ADMIN
					email_verified: 1,
					avatar_url: null,
					data: null,
					disabled: 0,
					created_at: now,
					updated_at: now,
				})
				.execute();

			user = await emdash.db
				.selectFrom("users")
				.selectAll()
				.where("id", "=", newId)
				.executeTakeFirst();
		}

		if (!user) {
			return new Response(
				JSON.stringify({ success: false, message: "Failed to locate or create user" }),
				{ status: 500, headers: { "Content-Type": "application/json" } },
			);
		}

		// Hash and store password
		const { hash, salt } = await hashPassword(password);
		const payload = JSON.stringify({
			email: user.email,
			hash,
			salt,
			updatedAt: now,
		});

		await emdash.db
			.insertInto("_plugin_storage")
			.values({
				plugin_id: "auth:password",
				collection: "passwords",
				id: user.id,
				data: payload,
				created_at: now,
				updated_at: now,
			})
			.onConflict((oc) =>
				oc.columns(["plugin_id", "collection", "id"]).doUpdateSet({
					data: payload,
					updated_at: now,
				}),
			)
			.execute();

		// Ensure setup_complete is set so user can directly access /_emdash/admin
		try {
			await emdash.db
				.insertInto("options")
				.values({
					name: "emdash:setup_complete",
					value: JSON.stringify(true),
				})
				.onConflict((oc) =>
					oc.column("name").doUpdateSet({
						value: JSON.stringify(true),
					}),
				)
				.execute();
		} catch (e) {
			// Ignore if options table is busy or already set
		}

		return new Response(
			JSON.stringify({
				success: true,
				message: `Password set successfully for ${user.email}`,
				user: {
					id: user.id,
					email: user.email,
					name: user.name,
				},
			}),
			{ status: 200, headers: { "Content-Type": "application/json" } },
		);
	} catch (error: any) {
		console.error("[auth-password] Set password error:", error);
		return new Response(
			JSON.stringify({ success: false, message: error?.message || "Internal server error" }),
			{ status: 500, headers: { "Content-Type": "application/json" } },
		);
	}
};
