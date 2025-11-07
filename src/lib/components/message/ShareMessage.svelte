<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { revokeMessage, type ShareableMessage } from '$lib/message.remote';
	import { toast } from 'svelte-sonner';

	let {
		shareableMessage = $bindable<ShareableMessage>(null)
	}: { shareableMessage: ShareableMessage } = $props();

	async function copyLink() {
		await navigator.clipboard.writeText(shareableMessage.link);
		toast.success('Link has been copied to clipboard');
	}

	async function revoke() {
		await revokeMessage({ id: shareableMessage.id, signature: shareableMessage.signature });
		toast.success('Message has been revoked');
		reset();
	}

	function reset() {
		shareableMessage = null;
	}
</script>

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
