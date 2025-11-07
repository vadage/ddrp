<script lang="ts">
	import { EyeIcon, EyeOffIcon, Lock } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';

	let { key = $bindable<string>(null) }: { key: string } = $props();

	let password = $state('');
	let showPassword = $state(false);

	function decrypt(event: SubmitEvent) {
		event.preventDefault();
		key = password;
	}
</script>

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

	<Button type="submit" disabled={!password} class="w-full">Decrypt Message</Button>
</form>
