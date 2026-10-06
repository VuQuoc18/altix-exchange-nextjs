import { fileURLToPath } from "node:url";
import type { AuthProviderDescriptor } from "emdash";

/**
 * Email & Password Auth Provider for EmDash CMS
 *
 * Adds traditional email and password login capability to EmDash Admin
 * alongside the built-in passkey option.
 */
export function passwordAuth(): AuthProviderDescriptor {
	return {
		id: "password",
		label: "Email & Password",
		adminEntry: fileURLToPath(new URL("./admin.tsx", import.meta.url)),
		routes: [
			{
				pattern: "/_emdash/api/auth/password/login",
				entrypoint: fileURLToPath(new URL("./routes/login.ts", import.meta.url)),
			},
			{
				pattern: "/_emdash/api/auth/password/set",
				entrypoint: fileURLToPath(new URL("./routes/set.ts", import.meta.url)),
			},
		],
		publicRoutes: [
			"/_emdash/api/auth/password/login",
			"/_emdash/api/auth/password/set",
		],
		storage: {
			passwords: {
				indexes: [],
			},
		},
	};
}

export default passwordAuth;
