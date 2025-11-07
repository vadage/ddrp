<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { MessageSquareIcon } from '@lucide/svelte';
	import { type ShareableMessage } from '$lib/message.remote';
	import CreateMessage from '$lib/components/message/CreateMessage.svelte';
	import ShareMessage from '$lib/components/message/ShareMessage.svelte';

	let shareableMessage: ShareableMessage | null = $state(null);
</script>

<svelte:head>
	<title>Create Dead Drop</title>
</svelte:head>

<div class="mx-auto max-w-2xl p-4 pt-8">
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2 text-lg">
				<MessageSquareIcon class="h-4 w-4" />
				Create Dead Drop
			</Card.Title>
			<Card.Description>
				Your message is fully encrypted in your browser. The server never sees the contents or the
				password. A secure link is created, usable only once or until it expires. After that, it's
				gone for good.
			</Card.Description>
		</Card.Header>

		<Card.Content>
			{#if shareableMessage}
				<ShareMessage bind:shareableMessage />
			{:else}
				<CreateMessage bind:shareableMessage />
			{/if}
		</Card.Content>
	</Card.Root>
</div>
