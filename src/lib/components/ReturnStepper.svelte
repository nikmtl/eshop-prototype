<script lang="ts">
	const { step }: { step: 1 | 2 | 3 | 4 } = $props();

	const steps: { label: string; n: number }[] = [
		{ label: 'Select', n: 1 },
		{ label: 'Reason', n: 2 },
		{ label: 'Review', n: 3 },
		{ label: 'Label', n: 4 }
	];
</script>

<nav class="mb-10" aria-label="Return progress">
	<div class="flex items-start">
		{#each steps as s, i}
			{@const done = step > s.n}
			{@const active = step === s.n}

			<div class="flex flex-col items-center">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all
					{done ? 'border-gray-900 bg-gray-900 text-white' : ''}
					{active ? 'border-gray-900 bg-gray-900 text-white ring-4 ring-gray-900/10' : ''}
					{!done && !active ? 'border-gray-200 bg-white text-gray-300' : ''}"
				>
					{#if done}
						<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
						</svg>
					{:else}
						{s.n}
					{/if}
				</div>
				<p class="mt-2 whitespace-nowrap text-xs font-medium {done || active ? 'text-gray-900' : 'text-gray-400'}">
					{s.label}
				</p>
			</div>

			{#if i < steps.length - 1}
				<div class="mt-4 h-0.5 flex-1 transition-colors {done ? 'bg-gray-900' : 'bg-gray-200'}"></div>
			{/if}
		{/each}
	</div>
</nav>
