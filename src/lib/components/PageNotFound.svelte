<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
</script>

<div class="mx-auto max-w-2xl p-4 pt-8">
	<div class="flex justify-center text-center">
		<div class="space-y-6">
			<div class="space-y-2">
				<h1 class="text-8xl font-bold text-muted-foreground/40 md:text-9xl">404</h1>
				<h2 class="text-2xl font-semibold text-foreground md:text-3xl">Page Not Found</h2>
			</div>

			<p class="max-w-md leading-relaxed text-muted-foreground">
				Sorry, we couldn't find the page you're looking for. The page might have been moved,
				deleted, or you entered the wrong URL.
			</p>

			<div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
				<Button href="/">Create Dead Drop</Button>
			</div>
		</div>
	</div>
</div>
