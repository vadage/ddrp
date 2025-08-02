import { createMessage, type Message } from '$lib/message.remote';

export async function generateLink(message: string, password: string, ttl: string) {
	const enc = new TextEncoder();
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const iv = crypto.getRandomValues(new Uint8Array(12));

	const passwordExists = !!password;
	if (!passwordExists) {
		password = encodeBytes(crypto.getRandomValues(new Uint8Array(16)));
	}

	const keyMaterial = await createKeyMaterial(password);
	const key = await createKey(keyMaterial, salt, 'encrypt');
	const ciphertext = new Uint8Array(
		await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(message))
	);

	const shareable = await createMessage({
		ttl: parseInt(ttl),
		message: {
			blob: encodeBytes(ciphertext),
			iv: Array.from(iv),
			salt: Array.from(salt),
			pw: passwordExists
		}
	});

	if (!passwordExists) {
		shareable.link += '#key=' + password;
	}
	return shareable;
}

export async function decryptMessage(message: Message, password: string) {
	const dec = new TextDecoder();
	const { salt, iv, blob } = message;

	const keyMaterial = await createKeyMaterial(password);
	const key = await createKey(keyMaterial, new Uint8Array(salt), 'decrypt');

	const decrypted = await crypto.subtle.decrypt(
		{
			name: 'AES-GCM',
			iv: new Uint8Array(iv)
		},
		key,
		decodeBytes(blob)
	);
	return dec.decode(decrypted);
}

async function createKeyMaterial(password: string) {
	const enc = new TextEncoder();
	return await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
}

async function createKey(keyMaterial: CryptoKey, salt: Uint8Array, usage: KeyUsage) {
	return await crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt,
			iterations: 250000,
			hash: 'SHA-256'
		},
		keyMaterial,
		{ name: 'AES-GCM', length: 256 },
		false,
		[usage]
	);
}

function encodeBytes(data: Uint8Array) {
	return btoa(String.fromCharCode(...data));
}

function decodeBytes(data: string) {
	return Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
}
