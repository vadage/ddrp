<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { CircleAlertIcon, MessageSquareIcon } from '@lucide/svelte';
	import * as Alert from '$lib/components/ui/alert';
	import { page } from '$app/state';
	import { type Message } from '$lib/message.remote';
	import { decryptMessage } from '$lib/messenger';
	import OpenMessage from '$lib/components/message/OpenMessage.svelte';
	import ShowMessage from '$lib/components/message/ShowMessage.svelte';
	import { onMount } from 'svelte';
	import DecryptMessage from '$lib/components/message/DecryptMessage.svelte';

	let id = $state(null);
	let signature = $state(null);
	let key = $state(null);

	let passwordRequired = $state(false);
	let message = $state<Message | null>(null);
	let decryption = $state<Promise<string>>(null);

	onMount(() => {
		const searchParams = page.url.searchParams;
		id = searchParams.get('id');
		signature = searchParams.get('sig');

		const hash = new URLSearchParams(page.url.hash.slice(1));
		key = hash.get('key');
		passwordRequired = key === null;
	});

	$effect(() => {
		if (message && key) {
			decryption = decryptMessage(message, key);
		}
	});
</script>

<svelte:head>
	<title>Open Dead Drop</title>
</svelte:head>

<div class="mx-auto max-w-2xl p-4 pt-8">
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2 text-lg">
				<MessageSquareIcon class="h-4 w-4" />
				Open Dead Drop
			</Card.Title>
			<Card.Description>
				The message will be fully decrypted in your browser. After opening the dead drop, this link
				will become invalid for any further use.
			</Card.Description>
		</Card.Header>

		<Card.Content>
			<div class="space-y-4">
				{#if decryption}
					{#await decryption then decrypted}
						<ShowMessage {decrypted} />
					{:catch}
						<Alert.Root variant="destructive">
							<CircleAlertIcon class="size-4" />
							<Alert.Title>Error</Alert.Title>
							<Alert.Description>
								Failed to decrypt the message. Check if the password is correct.
							</Alert.Description>
						</Alert.Root>

						{#if passwordRequired}
							<DecryptMessage bind:key />
						{/if}
					{/await}
				{:else if message}
					{#if passwordRequired}
						<DecryptMessage bind:key />
					{/if}
				{:else}
					<OpenMessage bind:message {id} {signature} />
				{/if}
			</div>
		</Card.Content>
	</Card.Root>
</div>
