/**
 * Web Crypto PBKDF2 Password Hashing & Verification
 *
 * Compatible with Node.js, Cloudflare Workers, and standard Web Crypto.
 */

const ITERATIONS = 100_000;
const KEY_LENGTH = 32; // 256 bits (32 bytes)
const HASH_ALGO = "SHA-256";

function bufferToHex(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let hex = "";
	for (let i = 0; i < bytes.length; i++) {
		hex += bytes[i].toString(16).padStart(2, "0");
	}
	return hex;
}

function hexToBuffer(hex: string): Uint8Array {
	const bytes = new Uint8Array(hex.length / 2);
	for (let i = 0; i < bytes.length; i++) {
		bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
	}
	return bytes;
}

/**
 * Hashes a password with a fresh random 16-byte salt using PBKDF2-HMAC-SHA256.
 */
export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
	const saltBytes = crypto.getRandomValues(new Uint8Array(16));
	const salt = bufferToHex(saltBytes.buffer);

	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(password),
		{ name: "PBKDF2" },
		false,
		["deriveBits"],
	);

	const derivedBits = await crypto.subtle.deriveBits(
		{
			name: "PBKDF2",
			salt: saltBytes,
			iterations: ITERATIONS,
			hash: HASH_ALGO,
		},
		keyMaterial,
		KEY_LENGTH * 8,
	);

	const hash = bufferToHex(derivedBits);
	return { hash, salt };
}

/**
 * Verifies a plaintext password against a stored hash and salt in constant time.
 */
export async function verifyPassword(
	password: string,
	expectedHash: string,
	salt: string,
): Promise<boolean> {
	if (!password || !expectedHash || !salt) return false;

	const saltBytes = hexToBuffer(salt);
	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(password),
		{ name: "PBKDF2" },
		false,
		["deriveBits"],
	);

	const derivedBits = await crypto.subtle.deriveBits(
		{
			name: "PBKDF2",
			salt: saltBytes as unknown as BufferSource,
			iterations: ITERATIONS,
			hash: HASH_ALGO,
		},
		keyMaterial,
		KEY_LENGTH * 8,
	);

	const actualHash = bufferToHex(derivedBits);

	if (actualHash.length !== expectedHash.length) {
		return false;
	}

	// Constant-time comparison
	let mismatch = 0;
	for (let i = 0; i < actualHash.length; i++) {
		mismatch |= actualHash.charCodeAt(i) ^ expectedHash.charCodeAt(i);
	}

	return mismatch === 0;
}
