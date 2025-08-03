<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import {
		CircleAlertIcon,
		EyeIcon,
		EyeOffIcon,
		LoaderCircleIcon,
		Lock,
		MessageSquareIcon
	} from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Alert from '$lib/components/ui/alert';
	import { page } from '$app/state';
	import { type Message, retrieveMessage } from '$lib/message.remote';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { decryptMessage } from '$lib/messenger';
	import { Textarea } from '$lib/components/ui/textarea';

	let message = $state<Message | null>(null);
	let failed = $state(false);
	let isOpening = $state(false);
	let showPassword = $state(false);
	let password = $state('');
	let decryptFailed = $state(false);
	let decrypted = $state('');
	let passwordRequired = $state(false);

	async function open() {
		const id = page.url.searchParams.get('id');
		const signature = page.url.searchParams.get('sig');
		if (!id || !signature) {
			return;
		}

		isOpening = true;
		try {
			message = await retrieveMessage({ id, signature });
			failed = false;

			const hash = new URLSearchParams(page.url.hash.slice(1));
			const key = hash.get('key');
			if (!key) {
				passwordRequired = true;
				return;
			}

			await decryptWithPassphrase(key);
		} catch (e) {
			failed = true;
			throw e;
		} finally {
			isOpening = false;
		}
	}

	async function decrypt(event: SubmitEvent) {
		event.preventDefault();
		await decryptWithPassphrase(password);
	}

	async function decryptWithPassphrase(password: string) {
		if (!message) {
			return;
		}

		decryptFailed = false;
		try {
			decrypted = await decryptMessage(message, password);
		} catch (e) {
			decryptFailed = true;
			throw e;
		}
	}
</script>

<svelte:head>
	<title>Open Dead Drop</title>
</svelte:head>

<div class="min-h-screen bg-background p-4">
	<div class="mx-auto max-w-2xl pt-8">
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-lg">
					<MessageSquareIcon class="h-4 w-4" />
					Open Dead Drop
				</Card.Title>
				<Card.Description>
					<p>
						The message will be fully decrypted in your browser. After opening the dead drop, this
						link will become invalid for any further use.
					</p>
				</Card.Description>
			</Card.Header>

			<Card.Content>
				{#if decrypted}
					<div class="space-y-4">
						<div class="space-y-2">
							<Label for="message" class="text-sm font-medium">Message</Label>
							<Textarea readonly value={decrypted} id="message" />
						</div>
						<Button href="/" class="w-full">Reply</Button>
					</div>
				{:else if message}
					{#if passwordRequired}
						<form onsubmit={decrypt} class="space-y-4">
							<div class="space-y-2">
								<Label for="password" class="flex items-center gap-2 text-sm font-medium">
									<Lock class="h-3 w-3" />
									Password
								</Label>
								<div class="relative">
									<Input
										id="password"
										type={showPassword ? 'text' : 'password'}
										bind:value={password}
										placeholder="Enter password"
										class="w-full pr-10"
										name="password"
										autocomplete="off"
										autofocus
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
							</div>

							{#if decryptFailed}
								<Alert.Root variant="destructive">
									<CircleAlertIcon class="size-4" />
									<Alert.Title>Error</Alert.Title>
									<Alert.Description>
										Failed to decrypt the message. Check if the password is correct.
									</Alert.Description>
								</Alert.Root>
							{/if}

							<Button type="submit" disabled={!password} class="w-full">Decrypt Message</Button>
						</form>
					{/if}
				{:else}
					<div class="space-y-4">
						{#if failed}
							<Alert.Root variant="destructive">
								<CircleAlertIcon class="size-4" />
								<Alert.Title>Error</Alert.Title>
								<Alert.Description>
									Failed to open dead drop. It might have been opened already or it has expired.
								</Alert.Description>
							</Alert.Root>
						{/if}

						<Button onclick={open} disabled={isOpening} class="w-full">
							{#if isOpening}
								<LoaderCircleIcon class="animate-spin" />
							{/if}
							Continue
						</Button>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>
