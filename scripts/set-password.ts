#!/usr/bin/env tsx
/**
 * CLI script to set or update an admin password
 *
 * Usage:
 *   npx tsx scripts/set-password.ts <email> <password> [name]
 *
 * Example:
 *   npx tsx scripts/set-password.ts dev@emdash.local MySecurePass123
 */

import { hashPassword } from "../src/plugins/auth-password/crypto.js";

async function main() {
	const args = process.argv.slice(2);
	const email = args[0];
	const password = args[1];
	const name = args[2] || undefined;

	if (!email || !password) {
		console.error("❌ Usage: npx tsx scripts/set-password.ts <email> <password> [name]");
		process.exit(1);
	}

	if (password.length < 6) {
		console.error("❌ Password must be at least 6 characters long.");
		process.exit(1);
	}

	const serverUrl = process.env.SITE_URL || "http://localhost:4321";
	const endpoint = `${serverUrl}/_emdash/api/auth/password/set`;

	console.log(`🔐 Setting password for: ${email}...`);

	// 1. Try setting via the running HTTP server
	try {
		const res = await fetch(endpoint, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email,
				password,
				name,
				secret: process.env.AUTH_SETUP_SECRET || process.env.EMDASH_AUTH_SECRET || "",
			}),
		});

		if (res.ok) {
			const data = (await res.json()) as any;
			console.log(`✅ Success: ${data.message || "Password updated successfully!"}`);
			console.log(`👉 You can now log in at ${serverUrl}/_emdash/admin/login with:`);
			console.log(`   Email:    ${email}`);
			console.log(`   Password: ${password}`);
			return;
		}

		const errData = (await res.json().catch(() => ({}))) as any;
		console.warn(`⚠️ HTTP set failed (${res.status}): ${errData.message || res.statusText}`);
	} catch (err: any) {
		console.log(`ℹ️ Server not reachable at ${serverUrl} (${err?.message || "connection refused"}).`);
	}

	// 2. Fallback: Hash password locally and print instructions or SQLite update
	const { hash, salt } = await hashPassword(password);
	console.log("\n💡 Generated Password Hash:");
	console.log(`   Hash: ${hash}`);
	console.log(`   Salt: ${salt}`);
	console.log(
		`\n👉 Tip: Make sure your dev server is running ('pnpm dev') and re-run this script to sync directly to the database.`,
	);
}

main().catch((err) => {
	console.error("Error:", err);
	process.exit(1);
});
