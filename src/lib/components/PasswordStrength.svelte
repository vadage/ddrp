<script lang="ts">
	import { passwordStrength } from 'check-password-strength';
	import { cn } from '$lib/utils';

	let { password }: { password: string } = $props();

	type Strength = {
		label: string;
		color: string;
		textColor: string;
	};

	const options: Strength[] = [
		{
			id: 0,
			value: {
				label: 'Too weak',
				color: 'bg-red-500',
				textColor: 'text-red-600'
			},
			minDiversity: 0,
			minLength: 0
		},
		{
			id: 1,
			value: {
				label: 'Weak',
				color: 'bg-orange-500',
				textColor: 'text-orange-600'
			},
			minDiversity: 2,
			minLength: 8
		},
		{
			id: 2,
			value: {
				label: 'Medium',
				color: 'bg-yellow-500',
				textColor: 'text-yellow-600'
			},
			minDiversity: 4,
			minLength: 10
		},
		{
			id: 3,
			value: {
				label: 'Strong',
				color: 'bg-emerald-500',
				textColor: 'text-emerald-600'
			},
			minDiversity: 4,
			minLength: 12
		}
	];

	const strength = $derived(passwordStrength<Strength>(password, options));
</script>

<div class="space-y-2">
	<div class="flex items-center justify-between">
		<span class="text-sm font-medium">Password strength</span>
		<span class={cn('text-sm font-medium', strength.value.textColor)}>
			{strength.value.label}
		</span>
	</div>

	<div class="flex gap-1">
		{#each options as option (option.id)}
			<div
				class={cn(
					'h-2 flex-1 rounded-full transition-colors duration-200',
					option.id <= strength.id ? strength.value.color : 'bg-muted'
				)}
				role="progressbar"
				aria-valuenow={strength.id + 1}
				aria-valuemin="1"
				aria-valuemax="4"
				aria-label="Password strength indicator segment {option.id + 1}"
			></div>
		{/each}
	</div>
</div>
