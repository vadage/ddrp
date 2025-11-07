<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import * as Alert from '$lib/components/ui/alert';
	import {
		Lock,
		Clock,
		EyeIcon,
		EyeOffIcon,
		LoaderCircleIcon,
		CircleAlertIcon
	} from '@lucide/svelte';
	import { generateLink } from '$lib/messenger';
	import PasswordStrength from '$lib/components/PasswordStrength.svelte';
	import { maxMessageLength } from '$lib/shared';
	import type { ShareableMessage } from '$lib/message.remote';

	let { shareableMessage = $bindable(null) }: { shareableMessage: ShareableMessage } = $props();

	let message = $state('');
	let ttl = $state('86400');
	let password = $state('');
	let showPassword = $state(false);
	let linkGeneration = $state<Promise<ShareableMessage>>(null);

	const maxCharacters = maxMessageLength;

	const ttlOptions = [
		{ value: '900', label: '15 minutes' },
		{ value: '3600', label: '1 hour' },
		{ value: '43200', label: '12 hours' },
		{ value: '86400', label: '1 day' },
		{ value: '259200', label: '3 days' },
		{ value: '604800', label: '7 days' }
	];

	$effect(async () => {
		try {
			shareableMessage = await linkGeneration;
		} finally {
			linkGeneration = null;
		}
	});

	const charactersRemaining = $derived(maxCharacters - message.length);
	const isMessageValid = $derived(message.length > 0 && message.length <= maxCharacters);
	const isFormValid = $derived(isMessageValid);

	const ttlContent = $derived(
		ttlOptions.find((o) => o.value === ttl)?.label ?? 'Select expiration time'
	);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (isFormValid) {
			linkGeneration = generateLink(message, password, ttl);
		}
	}
</script>

<form onsubmit={handleSubmit} class="space-y-4">
	{#await linkGeneration catch}
		<Alert.Root variant="destructive">
			<CircleAlertIcon class="size-4" />
			<Alert.Title>Error</Alert.Title>
			<Alert.Description>Failed to create dead drop. Please try again later.</Alert.Description>
		</Alert.Root>
	{/await}

	<div class="space-y-2">
		<Label for="message" class="text-sm font-medium">Message</Label>
		<div class="relative">
			<Textarea
				id="message"
				bind:value={message}
				placeholder="Enter your message here..."
				class="min-h-[100px] resize-none pr-12"
				maxlength={maxCharacters}
				autofocus
			/>
			<div class="absolute right-2 bottom-2">
				<Badge variant={charactersRemaining < 50 ? 'destructive' : 'secondary'} class="text-xs">
					{charactersRemaining}
				</Badge>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-x-2 gap-y-4 md:grid-cols-3">
		<div class="space-y-2">
			<Label for="ttl" class="flex items-center gap-2 text-sm font-medium">
				<Clock class="h-3 w-3" />
				Expiration
			</Label>
			<Select.Root type="single" bind:value={ttl}>
				<Select.Trigger id="ttl" class="w-full">{ttlContent}</Select.Trigger>
				<Select.Content>
					{#each ttlOptions as option (option.value)}
						<Select.Item value={option.value} label={option.label}>
							{option.label}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
		<div class="col-span-2 space-y-2">
			<Label for="password" class="flex items-center gap-2 text-sm font-medium">
				<Lock class="h-3 w-3" />
				Password (Optional)
			</Label>
			<div class="relative">
				<Input
					id="password"
					type={showPassword ? 'text' : 'password'}
					bind:value={password}
					placeholder="Enter optional password"
					class="w-full pr-10"
					name="password"
					autocomplete="off"
				/>
				<button
					type="button"
					onclick={() => (showPassword = !showPassword)}
					class="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
					aria-label={showPassword ? 'Hide Password' : 'Show Password'}
					aria-pressed={showPassword}
				>
					{#if showPassword}
						<EyeOffIcon class="h-4 w-4" />
					{:else}
						<EyeIcon class="h-4 w-4" />
					{/if}
				</button>
			</div>
			{#if password}
				<PasswordStrength {password} />
			{/if}
		</div>
	</div>

	<Button type="submit" disabled={!isFormValid || linkGeneration} class="w-full">
		{#if linkGeneration}
			<LoaderCircleIcon class="animate-spin" />
		{/if}
		Generate Link
	</Button>
</form>
