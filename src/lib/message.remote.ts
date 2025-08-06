import * as v from 'valibot';
import { command, getRequestEvent, query } from '$app/server';
import { nanoid } from 'nanoid';
import { createHmac } from 'node:crypto';
import { error } from '@sveltejs/kit';
import { ivLength, maxMessageLength, saltLength } from '$lib/shared';

export type Message = {
	blob: string;
	iv: number[];
	salt: number[];
};

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
	message: v.object({
		cipher: v.pipe(v.array(v.number()), v.maxLength(maxMessageLength + 16)),
		iv: v.pipe(v.array(v.number()), v.length(ivLength)),
		salt: v.pipe(v.array(v.number()), v.length(saltLength))
	}),
	ttl: v.pipe(v.number(), v.maxValue(7 * 24 * 60 * 60))
});

const SharedMessageValidator = v.object({
	id: v.string(),
	signature: v.string()
});

export const createMessage = command(MessagePayloadValidator, async (data: MessagePayload) => {
	const { platform } = getRequestEvent();
	if (!platform) {
		error(500, 'Platform not supported');
	}

	const id = nanoid(36);
	const signature = signId(id, platform);
	const link = `${platform?.env.APP_URL}/open?id=${id}&sig=${signature}`;

	await platform?.env.MESSAGES.put(id, JSON.stringify(data.message), {
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

	const { id, signature } = data;
	if (signature !== signId(id, platform)) {
		error(400, 'Invalid signature');
	}

	const message = await platform.env.MESSAGES.get(id);
	if (!message) {
		error(404, 'Not Found');
	}

	await platform.env.MESSAGES.delete(id);
	return JSON.parse(message) as Message;
});

export const revokeMessage = command(SharedMessageValidator, async (data: SharedMessage) => {
	const event = getRequestEvent();
	const { platform } = event;
	if (!platform) {
		error(503, 'Platform not supported');
	}

	const { id, signature } = data;
	if (signature !== signId(id, platform)) {
		error(400, 'Invalid signature');
	}

	await platform.env.MESSAGES.delete(id);
	return { success: true };
});

function signId(id: string, platform: App.Platform): string {
	return createHmac('sha256', platform.env.HMAC_SECRET).update(id).digest('hex');
}
