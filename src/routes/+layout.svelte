<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { Button } from '$lib/components/ui/button';

	let { children } = $props();
</script>

<ModeWatcher />
<Toaster />

<svelte:head>
	<meta
		name="description"
		content="Share your private messages as burner links with no accounts, no tracking and no stored metadata. Fully open-source and zero-knowledge."
	/>
</svelte:head>

<div class="flex min-h-screen flex-col">
	<main class="mt-5 mb-20 grow">
		{@render children()}
	</main>

	<footer class="bg-secondary py-12 text-secondary-foreground">
		<div class="container mx-auto px-6 lg:px-12">
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
				<div>
					<h2 class="mb-4 text-lg font-semibold">About</h2>
					<p class="text-sm">
						Create secure burner links without accounts, tracking or stored metadata. Fully
						open-source and selfhostable.
					</p>
				</div>

				<div>
					<h2 class="mb-4 text-lg font-semibold">Under the Hood</h2>
					<ul class="space-y-2 text-sm">
						<li>Key derivation: <span class="font-mono">Argon2id</span></li>
						<li>Encryption: <span class="font-mono">AES-GCM</span></li>
						<li>Zero-Knowledge: We can't read your messages</li>
					</ul>
				</div>

				<div>
					<h2 class="mb-4 text-lg font-semibold">External Links</h2>
					<ul class="space-y-2 text-sm">
						<li>
							<Button
								variant="link"
								href="https://github.com/vadage/ddrp"
								target="_blank"
								rel="noopener noreferrer"
								class="p-0"
							>
								GitHub Repository
							</Button>
						</li>
					</ul>
				</div>

				<div>
					<h2 class="mb-4 text-lg font-semibold">Actions</h2>
					<Button href="/">Create Dead Drop</Button>
				</div>
			</div>

			<div class="my-8 h-px bg-secondary-foreground/10"></div>

			<div class="text-center text-sm">
				&copy; {new Date().getFullYear()} ddrp.fyi. All rights reserved.
			</div>
		</div>
	</footer>
</div>
