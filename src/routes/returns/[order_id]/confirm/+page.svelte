<script lang="ts">
	import { enhance } from '$app/forms';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ReturnStepper from '$lib/components/ReturnStepper.svelte';
	import { returnFlow } from '$lib/stores/return-flow.svelte';
	import type { ActionData } from './$types';

	const { form }: { form: ActionData } = $props();

	$effect(() => {
		if (browser && (!returnFlow.orderId || !returnFlow.hasSelection)) {
			goto(`/returns/${$page.params.order_id}/select`);
		}
	});

	let confirming = $state(false);

	const REASON_LABELS: Record<string, string> = {
		wrong_size: 'Wrong size',
		defective: 'Defective or damaged',
		not_as_described: 'Not as described',
		changed_mind: 'Changed my mind',
		wrong_item: 'Wrong item received'
	};

	let hasExchange = $derived(returnFlow.selected.some((i) => i.wants_exchange && i.exchange_size));

	let payload = $derived(
		JSON.stringify({ items: returnFlow.selected.map((i) => ({
			product_id: i.product_id,
			name: i.name,
			size: i.size,
			quantity: i.quantity,
			price: i.price,
			reason: i.reason,
			wants_exchange: i.wants_exchange,
			exchange_size: i.exchange_size
		})) })
	);
</script>

<svelte:head>
	<title>Confirm return — FORM.</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-6 py-12">
	<ReturnStepper step={3} />

	<div class="mb-8">
		<h1 class="text-2xl font-semibold text-gray-900">Review your return</h1>
		<p class="mt-1 text-sm text-gray-500">Check everything looks right before we process your return.</p>
	</div>

	<!-- Return summary -->
	<div class="overflow-hidden rounded-2xl border border-gray-100">
		<div class="border-b border-gray-100 bg-gray-50 px-5 py-3">
			<p class="text-xs font-semibold uppercase tracking-wider text-gray-400">
				{returnFlow.selected.length} item{returnFlow.selected.length !== 1 ? 's' : ''} to return
			</p>
		</div>

		<div class="divide-y divide-gray-100">
			{#each returnFlow.selected as item}
				<div class="flex items-start gap-4 px-5 py-4">
					{#if item.image_url}
						<div class="h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-gray-50">
							<img src={item.image_url} alt={item.name} class="h-full w-full object-cover" />
						</div>
					{/if}
					<div class="flex-1">
						<p class="text-sm font-medium text-gray-900">{item.name}</p>
						<p class="mt-0.5 text-xs text-gray-400">
							{#if item.size && item.size !== 'One Size'}Size: {item.size} · {/if}Qty: {item.quantity} · €{item.price.toFixed(2)}
						</p>
						<div class="mt-2 flex flex-wrap gap-2">
							<span class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
								{REASON_LABELS[item.reason] ?? item.reason}
							</span>
							{#if item.wants_exchange && item.exchange_size}
								<span class="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
									<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
									</svg>
									Exchange → {item.exchange_size}
								</span>
							{/if}
						</div>
					</div>
					<p class="shrink-0 text-sm font-semibold text-gray-900">€{item.price.toFixed(2)}</p>
				</div>
			{/each}
		</div>
	</div>

	<!-- What happens next -->
	<div class="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-5">
		<p class="text-xs font-semibold uppercase tracking-wider text-gray-400">What happens next</p>
		<div class="mt-4 space-y-3">
			{#each [
				'Download your return label and attach it to your parcel.',
				'Drop it off at any Royal Mail Tracked Returns point.',
				hasExchange
					? 'Your replacement item will ship once we receive and inspect the return.'
					: 'Your refund will be processed within 5 business days of us receiving the parcel.'
			] as step, i}
				<div class="flex items-start gap-3">
					<div class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[10px] font-semibold text-gray-600">
						{i + 1}
					</div>
					<p class="text-sm text-gray-600">{step}</p>
				</div>
			{/each}
		</div>

		<div class="mt-4 flex items-start gap-2 rounded-xl border border-green-100 bg-green-50 p-3">
			<svg class="mt-0.5 h-4 w-4 shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
			</svg>
			<p class="text-xs font-medium text-green-700">
				{#if hasExchange}
					Your replacement will ship as soon as we confirm the return.
				{:else}
					Refund guaranteed within 5 business days — no questions asked.
				{/if}
			</p>
		</div>
	</div>

	{#if form && 'error' in form}
		<div class="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
			{(form as { error: string }).error}
		</div>
	{/if}

	<!-- Form -->
	<form
		method="POST"
		use:enhance={() => {
			confirming = true;
			return async ({ result, update }) => {
				if (result.type === 'success') {
					const returnId = (result.data as { returnId?: number })?.returnId;
					if (returnId) {
						returnFlow.returnId = returnId;
						goto(`/returns/${$page.params.order_id}/label?rid=${returnId}`);
						return;
					}
				}
				await update();
				confirming = false;
			};
		}}
		class="mt-8"
	>
		<input type="hidden" name="payload" value={payload} />

		<div class="flex items-center justify-between">
			<button
				type="button"
				onclick={() => goto(`/returns/${$page.params.order_id}/reason`)}
				class="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
				Back
			</button>
			<button
				type="submit"
				disabled={confirming}
				class="rounded-xl bg-gray-900 px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:bg-gray-400"
			>
				{confirming ? 'Confirming…' : 'Confirm return'}
			</button>
		</div>
	</form>
</div>
