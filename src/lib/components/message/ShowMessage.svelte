<script lang="ts">
	import { Label } from '$lib/components/ui/label/index.ts';
	import { Textarea } from '$lib/components/ui/textarea/index.ts';
	import { Button } from '$lib/components/ui/button/index.ts';

	let { decrypted }: { decrypted: string } = $props();
</script>

<div class="space-y-4">
	<div class="space-y-2">
		<Label for="message" class="text-sm font-medium">Message</Label>
		<Textarea readonly value={decrypted} id="message" />
	</div>
	<Button href="/" class="w-full">Reply</Button>
</div>
