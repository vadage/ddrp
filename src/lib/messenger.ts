import { createMessage, type Message } from '$lib/message.remote';
import { ivLength, saltLength } from '$lib/shared';
import { default as load_crypto_wasm, derive_key } from 'crypto_wasm';

export async function generateLink(message: string, password: string, ttl: string) {
	const enc = new TextEncoder();
	const salt = crypto.getRandomValues(new Uint8Array(saltLength));
	const iv = crypto.getRandomValues(new Uint8Array(ivLength));

	const passwordExists = !!password;
	if (!passwordExists) {
		password = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
	}

	const key = await createKey(password, salt, 'encrypt');
	const ciphertext = new Uint8Array(
		await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(message))
	);

	const shareable = await createMessage({
		ttl: parseInt(ttl),
		message: {
			cipher: Array.from(ciphertext),
			iv: Array.from(iv),
			salt: Array.from(salt)
		}
	});

	if (!passwordExists) {
		shareable.link += '#key=' + password;
	}
	return shareable;
}

export async function decryptMessage(message: Message, password: string) {
	const dec = new TextDecoder();
	const { salt, iv, cipher } = message;

	const key = await createKey(password, new Uint8Array(salt), 'decrypt');

	const decrypted = await crypto.subtle.decrypt(
		{
			name: 'AES-GCM',
			iv: new Uint8Array(iv)
		},
		key,
		new Uint8Array(cipher)
	);
	return dec.decode(decrypted);
}

async function createKey(password: string, salt: Uint8Array, usage: KeyUsage) {
	await load_crypto_wasm();
	const derivedKey = derive_key(password, salt);
	return await crypto.subtle.importKey('raw', derivedKey, { name: 'AES-GCM' }, false, [usage]);
}
