import * as React from "react";

function LockIcon({ className = "w-4 h-4" }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
			<path d="m7 11V7a5 5 0 0 1 10 0v4" />
		</svg>
	);
}

/**
 * Login button shown on the main login screen
 */
export function LoginButton({ inviteToken }: { inviteToken?: string } = {}) {
	return (
		<button
			type="button"
			className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors shadow-sm text-sm font-medium cursor-pointer"
		>
			<LockIcon className="w-4 h-4 text-indigo-500" />
			<span>Email & Password</span>
		</button>
	);
}

/**
 * Login form rendered when "Email & Password" provider is selected
 */
export function LoginForm() {
	const [email, setEmail] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email.trim() || !password) {
			setError("Please enter both email and password.");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const res = await fetch("/_emdash/api/auth/password/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			const data = (await res.json()) as {
				success?: boolean;
				redirect?: string;
				message?: string;
			};

			if (res.ok && data.success) {
				const params = new URLSearchParams(window.location.search);
				const redirectUrl = params.get("redirect") || data.redirect || "/_emdash/admin";
				window.location.href = redirectUrl;
			} else {
				setError(data.message || "Invalid email or password");
			}
		} catch (err: any) {
			setError(err?.message || "Login request failed. Please check your connection.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4 text-left">
			{error && (
				<div className="p-3 text-sm rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300">
					{error}
				</div>
			)}

			<div className="space-y-1.5">
				<label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
					Email
				</label>
				<input
					type="email"
					required
					autoComplete="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="admin@altix.exchange"
					className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
				/>
			</div>

			<div className="space-y-1.5">
				<label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
					Password
				</label>
				<input
					type="password"
					required
					autoComplete="current-password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="••••••••"
					className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
				/>
			</div>

			<button
				type="submit"
				disabled={loading}
				className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
			>
				{loading ? (
					<>
						<span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
						<span>Signing in...</span>
					</>
				) : (
					<span>Sign in with Password</span>
				)}
			</button>
		</form>
	);
}

/**
 * Setup step for initial admin creation in setup wizard
 */
export function SetupStep({ onComplete }: { onComplete: () => void }) {
	const [name, setName] = React.useState("");
	const [email, setEmail] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	const handleSetup = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email.trim() || !password) {
			setError("Email and password are required.");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const res = await fetch("/_emdash/api/auth/password/set", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email, password }),
			});

			const data = (await res.json()) as { success?: boolean; message?: string };

			if (res.ok && data.success) {
				// Login after setup
				const loginRes = await fetch("/_emdash/api/auth/password/login", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email, password }),
				});

				if (loginRes.ok) {
					onComplete();
				} else {
					setError("Account created, please proceed to login.");
				}
			} else {
				setError(data.message || "Failed to set up account.");
			}
		} catch (err: any) {
			setError(err?.message || "Setup failed.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSetup} className="space-y-4 text-left">
			{error && (
				<div className="p-3 text-sm rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300">
					{error}
				</div>
			)}

			<div className="space-y-1.5">
				<label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
					Name
				</label>
				<input
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Admin Name"
					className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
				/>
			</div>

			<div className="space-y-1.5">
				<label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
					Email
				</label>
				<input
					type="email"
					required
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="admin@altix.exchange"
					className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
				/>
			</div>

			<div className="space-y-1.5">
				<label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
					Password (min 6 chars)
				</label>
				<input
					type="password"
					required
					minLength={6}
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="••••••••"
					className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
				/>
			</div>

			<button
				type="submit"
				disabled={loading}
				className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
			>
				{loading ? "Creating..." : "Create Admin Account"}
			</button>
		</form>
	);
}
