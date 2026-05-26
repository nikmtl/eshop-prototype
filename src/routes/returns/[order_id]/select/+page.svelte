<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import ReturnStepper from '$lib/components/ReturnStepper.svelte';
	import { returnFlow } from '$lib/stores/return-flow.svelte';

	const { data }: { data: PageData } = $props();

	$effect(() => {
		returnFlow.init(String(data.order.id), data.order.email, data.items);
	});

	function proceed() {
		goto(`/returns/${data.order.id}/reason`);
	}
</script>

<svelte:head>
	<title>Start a return — Order #{data.order.id} — FORM.</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-6 py-12" data-demo="demo-returns">
	<ReturnStepper step={1} />

	<!-- Header -->
	<div class="mb-8">
		<a href="/order/{data.order.id}" class="mb-4 flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700">
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			Order #{data.order.id}
		</a>
		<h1 class="text-2xl font-semibold text-gray-900">Select items to return</h1>
		<p class="mt-1 text-sm text-gray-500">Choose which items from your order you'd like to return.</p>
	</div>

	<!-- Item cards -->
	<div class="space-y-3">
		{#each returnFlow.items as item}
			{@const sel = item.isSelected}
			<button
				onclick={() => returnFlow.toggle(item.product_id, item.size)}
				class="group flex w-full items-start gap-4 rounded-2xl border-2 p-4 text-left transition-all
				{sel ? 'border-gray-900 bg-gray-50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'}"
			>
				<!-- Checkbox -->
				<div
					class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors
					{sel ? 'border-gray-900 bg-gray-900' : 'border-gray-300 group-hover:border-gray-400'}"
				>
					{#if sel}
						<svg class="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
						</svg>
					{/if}
				</div>

				<!-- Image -->
				{#if item.image_url}
					<div class="h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
						<img src={item.image_url} alt={item.name} class="h-full w-full object-cover" />
					</div>
				{/if}

				<!-- Info -->
				<div class="flex flex-1 items-start justify-between gap-4">
					<div>
						<p class="text-sm font-medium text-gray-900">{item.name}</p>
						<p class="mt-0.5 text-xs text-gray-400">
							{#if item.size && item.size !== 'One Size'}Size: {item.size} · {/if}Qty: {item.quantity}
						</p>
					</div>
					<p class="shrink-0 text-sm font-semibold text-gray-900">€{item.price.toFixed(2)}</p>
				</div>
			</button>
		{/each}
	</div>

	<!-- Policy note -->
	<div class="mt-6 flex items-start gap-2 rounded-xl bg-gray-50 px-4 py-3">
		<svg class="mt-0.5 h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
		<p class="text-xs text-gray-500">Free returns within 30 days of delivery. Items must be unworn and in original packaging.</p>
	</div>

	<!-- CTA -->
	<div class="mt-8 flex items-center justify-between">
		<a href="/order/{data.order.id}" class="text-sm text-gray-400 hover:text-gray-700">Cancel</a>
		<button
			onclick={proceed}
			disabled={!returnFlow.hasSelection}
			class="rounded-xl bg-gray-900 px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
		>
			Next: Choose reasons →
		</button>
	</div>
</div>
