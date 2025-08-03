<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import {
		Lock,
		MessageSquareIcon,
		Clock,
		EyeIcon,
		EyeOffIcon,
		LoaderCircleIcon,
		CircleAlertIcon
	} from '@lucide/svelte';
	import { generateLink } from '$lib/messenger';
	import { revokeMessage, type ShareableMessage } from '$lib/message.remote';
	import { toast } from 'svelte-sonner';

	let message = $state('');
	let ttl = $state('86400');
	let password = $state('');
	let showPassword = $state(false);
	let shareableMessage: ShareableMessage | null = $state(null);

	let isProcessing = $state(false);
	let failed = $state(false);

	function reset() {
		message = '';
		ttl = '86400';
		password = '';
		showPassword = false;
		shareableMessage = null;
		isProcessing = false;
		failed = false;
	}

	const maxCharacters = 1000;

	const ttlOptions = [
		{ value: '900', label: '15 minutes' },
		{ value: '3600', label: '1 hour' },
		{ value: '43200', label: '12 hours' },
		{ value: '86400', label: '1 day' },
		{ value: '259200', label: '3 days' },
		{ value: '604800', label: '7 days' }
	];

	const charactersRemaining = $derived(maxCharacters - message.length);
	const isMessageValid = $derived(message.length > 0 && message.length <= maxCharacters);
	const isFormValid = $derived(isMessageValid);

	const ttlContent = $derived(
		ttlOptions.find((o) => o.value === ttl)?.label ?? 'Select expiration time'
	);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!isFormValid || isProcessing) return;

		failed = false;
		isProcessing = true;

		try {
			shareableMessage = await generateLink(message, password, ttl);
		} catch (e) {
			failed = true;
			throw e;
		} finally {
			isProcessing = false;
		}
	}

	async function copyLink() {
		if (!shareableMessage) {
			return;
		}
		await navigator.clipboard.writeText(shareableMessage.link);
		toast.success('Link has been copied to clipboard');
	}

	async function revoke() {
		if (!shareableMessage) {
			return;
		}

		await revokeMessage({ id: shareableMessage.id, signature: shareableMessage.signature });
		toast.success('Message has been revoked');
		reset();
	}
</script>

<svelte:head>
	<title>Create Dead Drop</title>
</svelte:head>

<div class="min-h-screen bg-background p-4">
	<div class="mx-auto max-w-2xl pt-8">
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-lg">
					<MessageSquareIcon class="h-4 w-4" />
					Create Dead Drop
				</Card.Title>
				<Card.Description>
					<p>
						Your message is fully encrypted in your browser. The server never sees the contents or
						the password. A secure link is created, usable only once or until it expires. After
						that, it's gone for good.
					</p>
				</Card.Description>
			</Card.Header>

			<Card.Content>
				{#if shareableMessage}
					<div class="space-y-4">
						<div class="space-y-2">
							<Label for="link" class="text-sm font-medium">Secure Link</Label>
							<Input readonly value={shareableMessage.link} id="link" onfocus={copyLink} />
						</div>
						<Button class="w-full" onclick={copyLink}>Copy To Clipboard</Button>
						<div class="grid grid-cols-2 gap-x-2">
							<Button class="w-full" variant="destructive" onclick={revoke}>Revoke</Button>
							<Button class="w-full" variant="secondary" onclick={reset}>New Dead Drop</Button>
						</div>
					</div>
				{:else}
					<form onsubmit={handleSubmit} class="space-y-4">
						<div class="space-y-2">
							<Label for="message" class="text-sm font-medium">Message</Label>
							<div class="relative">
								<Textarea
									id="message"
									bind:value={message}
									placeholder="Enter your message here..."
									class="min-h-[100px] resize-none pr-12"
									maxlength={maxCharacters}
								/>
								<div class="absolute right-2 bottom-2">
									<Badge
										variant={charactersRemaining < 50 ? 'destructive' : 'secondary'}
										class="text-xs"
									>
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
									>
										{#if showPassword}
											<EyeOffIcon class="h-4 w-4" />
										{:else}
											<EyeIcon class="h-4 w-4" />
										{/if}
									</button>
								</div>
							</div>
						</div>

						{#if failed}
							<Alert.Root variant="destructive">
								<CircleAlertIcon class="size-4" />
								<Alert.Title>Error</Alert.Title>
								<Alert.Description>
									Failed to create dead drop. Please try again later.
								</Alert.Description>
							</Alert.Root>
						{/if}

						<Button type="submit" disabled={!isFormValid || isProcessing} class="w-full">
							{#if isProcessing}
								<LoaderCircleIcon class="animate-spin" />
							{/if}
							Generate Link
						</Button>
					</form>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>
