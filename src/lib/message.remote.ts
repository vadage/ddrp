import * as v from 'valibot';
import { command, getRequestEvent, query } from '$app/server';
import { nanoid } from 'nanoid';
import { createHmac } from 'node:crypto';
import { error } from '@sveltejs/kit';
import { ivLength, maxMessageLength, saltLength } from '$lib/shared';
import { env } from '$env/dynamic/private';
import { decrypt, encrypt } from '$lib/crypto';

export type Message = Uint8Array;

type MessagePayload = {
	message: Message;
	ttl: number;
};

export type ShareableMessage = SharedMessage & {
	link: string;
};

type SharedMessage = {
	id: string;
	signature: string;
};

const MessagePayloadValidator = v.object({
	message: v.pipe(
		v.custom<Uint8Array>((input) => input instanceof Uint8Array),
		v.minLength(saltLength + ivLength + 1 + 16),
		v.maxLength(saltLength + ivLength + maxMessageLength + 16)
	),
	ttl: v.pipe(v.number(), v.maxValue(7 * 24 * 60 * 60))
});

const SharedMessageValidator = v.pipe(
	v.object({
		id: v.string(),
		signature: v.string()
	}),
	v.forward(
		v.check(({ id, signature }) => signature === signId(id)),
		['signature']
	)
);

export const createMessage = command(MessagePayloadValidator, async (data: MessagePayload) => {
	const { platform } = getRequestEvent();
	if (!platform) {
		error(500, 'Platform not supported');
	}

	const id = nanoid(36);
	const signature = signId(id);
	const link = `${platform.env.APP_URL}/open?id=${id}&sig=${signature}`;

	const encrypted = await encrypt(data.message, env.KEY_DERIVATION_SECRET);
	await platform.env.MESSAGES.put(id, encrypted.buffer, {
		expirationTtl: data.ttl
	});

	return { link, id, signature } as ShareableMessage;
});

export const retrieveMessage = query(SharedMessageValidator, async (data: SharedMessage) => {
	const event = getRequestEvent();
	const { platform } = event;
	if (!platform) {
		error(503, 'Platform not supported');
	}

	const { id } = data;
	const message = await platform.env.MESSAGES.get(id, 'arrayBuffer');
	if (!message) {
		error(404, 'Not Found');
	}

	await platform.env.MESSAGES.delete(id);

	return (await decrypt(new Uint8Array(message), env.KEY_DERIVATION_SECRET)) as Message;
});

export const revokeMessage = command(SharedMessageValidator, async (data: SharedMessage) => {
	const event = getRequestEvent();
	const { platform } = event;
	if (!platform) {
		error(503, 'Platform not supported');
	}

	const { id } = data;
	await platform.env.MESSAGES.delete(id);
	return { success: true };
});

function signId(id: string): string {
	return createHmac('sha256', env.HMAC_SECRET).update(id).digest('hex');
}
