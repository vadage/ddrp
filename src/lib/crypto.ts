import { ivLength, saltLength } from '$lib/shared';
import { init, derive_key } from '$lib/crypto-wasm';

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
	if (typeof init === 'function') {
		await init();
	}
	const derivedKey = derive_key(password, salt);
	return await crypto.subtle.importKey('raw', derivedKey, { name: 'AES-GCM' }, false, [usage]);
}
