import { createMessage, type Message } from '$lib/message.remote';
import { decrypt, encrypt } from '$lib/crypto';

export async function generateLink(message: string, password: string, ttl: string) {
	const enc = new TextEncoder();

	const passwordExists = !!password;
	if (!passwordExists) {
		password = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
	}

	const encrypted = await encrypt(enc.encode(message), password);

	const shareable = await createMessage({
		ttl: parseInt(ttl),
		message: encrypted
	});

	if (!passwordExists) {
		shareable.link += '#key=' + password;
	}
	return shareable;
}

export async function decryptMessage(message: Message, password: string) {
	const dec = new TextDecoder();
	const decrypted = await decrypt(message, password);
	return dec.decode(decrypted);
}
