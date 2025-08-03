import { createMessage, type Message } from '$lib/message.remote';
import argon2 from 'argon2-browser/dist/argon2-bundled.min.js';

export async function generateLink(message: string, password: string, ttl: string) {
	const enc = new TextEncoder();
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const iv = crypto.getRandomValues(new Uint8Array(12));

	const passwordExists = !!password;
	if (!passwordExists) {
		password = encodeBytes(crypto.getRandomValues(new Uint8Array(16)));
	}

	const key = await createKey(password, salt, 'encrypt');
	const ciphertext = new Uint8Array(
		await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(message))
	);

	const shareable = await createMessage({
		ttl: parseInt(ttl),
		message: {
			blob: encodeBytes(ciphertext),
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
	const { salt, iv, blob } = message;

	const key = await createKey(password, new Uint8Array(salt), 'decrypt');

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

async function createKey(password: string, salt: Uint8Array, usage: KeyUsage) {
	const pass = new TextEncoder().encode(password);

	const { hash: derivedKey } = await argon2.hash({
		pass,
		salt,
		type: argon2.ArgonType.Argon2id,
		hashLen: 32,
		time: 3,
		mem: 65536,
		parallelism: 1
	});

	return await crypto.subtle.importKey('raw', derivedKey, { name: 'AES-GCM' }, false, [usage]);
}

function encodeBytes(data: Uint8Array) {
	return btoa(String.fromCharCode(...data));
}

function decodeBytes(data: string) {
	return Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
}
