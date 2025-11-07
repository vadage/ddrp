<script lang="ts">
	import * as Alert from '$lib/components/ui/alert';
	import { CircleAlertIcon, LoaderCircleIcon } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { type Message, retrieveMessage } from '$lib/message.remote';

	let {
		message = $bindable<Message>(null),
		id,
		signature
	}: { message: Message; id: string; signature: string } = $props();

	let retrieval = $state<Promise<Message>>(null);

	$effect(async () => (message = await retrieval));

	function open() {
		retrieval = retrieveMessage({ id, signature });
	}
</script>

<div class="space-y-4">
	{#await retrieval catch}
		<Alert.Root variant="destructive">
			<CircleAlertIcon class="size-4" />
			<Alert.Title>Error</Alert.Title>
			<Alert.Description>
				Failed to open dead drop. It might have been opened already or it has expired.
			</Alert.Description>
		</Alert.Root>
	{/await}

	<Button onclick={open} disabled={retrieval} class="w-full">
		{#if retrieval}
			<LoaderCircleIcon class="animate-spin" />
		{/if}
		Continue
	</Button>
</div>
