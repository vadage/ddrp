import { ivLength, saltLength } from '$lib/shared';

export async function encrypt(message: Uint8Array, password: string) {
	const salt = crypto.getRandomValues(new Uint8Array(saltLength));
	const iv = crypto.getRandomValues(new Uint8Array(ivLength));
	const key = await createKey(password, salt, 'encrypt');

	const ciphertext = new Uint8Array(
		await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, message)
	);

	const data = new Uint8Array(saltLength + ivLength + ciphertext.length);
	data.set(salt, 0);
	data.set(iv, saltLength);
	data.set(ciphertext, saltLength + ivLength);

	return data;
}

export async function decrypt(data: Uint8Array, password: string) {
	const salt = data.slice(0, saltLength);
	const iv = data.slice(saltLength, saltLength + ivLength);
	const ciphertext = data.slice(saltLength + ivLength);

	const key = await createKey(password, salt, 'decrypt');
	const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);

	return new Uint8Array(plaintext);
}

async function createKey(password: string, salt: Uint8Array, usage: KeyUsage) {
	const enc = new TextEncoder();
	const derivedKey = await crypto.subtle.importKey(
		'raw',
		enc.encode(password),
		{ name: 'PBKDF2' },
		false,
		['deriveKey']
	);
	return await crypto.subtle.deriveKey(
		{ name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
		derivedKey,
		{ name: 'AES-GCM', length: 256 },
		false,
		[usage]
	);
}
