<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ReturnStepper from '$lib/components/ReturnStepper.svelte';
	import { returnFlow } from '$lib/stores/return-flow.svelte';

	const REASONS = [
		{ value: 'wrong_size', label: 'Wrong size' },
		{ value: 'defective', label: 'Defective or damaged' },
		{ value: 'not_as_described', label: 'Not as described' },
		{ value: 'changed_mind', label: 'Changed my mind' },
		{ value: 'wrong_item', label: 'Wrong item received' }
	];

	$effect(() => {
		if (browser && (!returnFlow.orderId || !returnFlow.hasSelection)) {
			goto(`/returns/${$page.params.order_id}/select`);
		}
	});

	function back() {
		goto(`/returns/${$page.params.order_id}/select`);
	}

	function proceed() {
		goto(`/returns/${$page.params.order_id}/confirm`);
	}
</script>

<svelte:head>
	<title>Reason for return — FORM.</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-6 py-12">
	<ReturnStepper step={2} />

	<div class="mb-8">
		<h1 class="text-2xl font-semibold text-gray-900">Why are you returning?</h1>
		<p class="mt-1 text-sm text-gray-500">Tell us what went wrong — this helps us improve.</p>
	</div>

	<div class="space-y-5">
		{#each returnFlow.selected as item}
			{@const exchangeSizes = item.available_sizes.filter((s) => s !== item.size)}
			<div class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
				<!-- Item header -->
				<div class="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-5 py-4">
					{#if item.image_url}
						<div class="h-10 w-8 shrink-0 overflow-hidden rounded-md bg-gray-100">
							<img src={item.image_url} alt={item.name} class="h-full w-full object-cover" />
						</div>
					{/if}
					<div>
						<p class="text-sm font-medium text-gray-900">{item.name}</p>
						<p class="text-xs text-gray-400">
							{#if item.size && item.size !== 'One Size'}Size: {item.size} · {/if}€{item.price.toFixed(2)}
						</p>
					</div>
				</div>

				<!-- Reason selector -->
				<div class="px-5 py-5">
					<label for="reason-{item.product_id}-{item.size}" class="block text-sm font-medium text-gray-700">
						Reason for return
					</label>
					<div class="relative mt-2">
						<select
							id="reason-{item.product_id}-{item.size}"
							value={item.reason}
							onchange={(e) => returnFlow.update(item.product_id, item.size, {
								reason: (e.target as HTMLSelectElement).value,
								wants_exchange: false,
								exchange_size: ''
							})}
							class="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm outline-none transition focus:border-gray-400
							{item.reason ? 'text-gray-900' : 'text-gray-400'}"
						>
							<option value="" disabled selected={!item.reason}>Select a reason…</option>
							{#each REASONS as r}
								<option value={r.value}>{r.label}</option>
							{/each}
						</select>
						<div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
							<svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
							</svg>
						</div>
					</div>

					<!-- Exchange option — only for wrong_size when other sizes exist -->
					{#if item.reason === 'wrong_size' && exchangeSizes.length > 0}
						<div class="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
							<label class="flex cursor-pointer items-start gap-3">
								<div class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors
									{item.wants_exchange ? 'border-gray-900 bg-gray-900' : 'border-gray-300'}">
									{#if item.wants_exchange}
										<svg class="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
										</svg>
									{/if}
								</div>
								<input
									type="checkbox"
									class="sr-only"
									checked={item.wants_exchange}
									onchange={(e) => returnFlow.update(item.product_id, item.size, {
										wants_exchange: (e.target as HTMLInputElement).checked,
										exchange_size: ''
									})}
								/>
								<div>
									<p class="text-sm font-medium text-gray-900">Exchange for a different size</p>
									<p class="mt-0.5 text-xs text-gray-500">Receive a replacement instead of a refund</p>
								</div>
							</label>

							{#if item.wants_exchange}
								<div class="mt-4">
									<p class="mb-2 text-xs font-medium text-gray-500">Select new size</p>
									<div class="flex flex-wrap gap-2">
										{#each exchangeSizes as size}
											<button
												onclick={() => returnFlow.update(item.product_id, item.size, { exchange_size: size })}
												class="h-9 min-w-9 rounded-lg border px-3 text-sm font-medium transition-colors
												{item.exchange_size === size
													? 'border-gray-900 bg-gray-900 text-white'
													: 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'}"
											>
												{size}
											</button>
										{/each}
									</div>
									{#if item.wants_exchange && !item.exchange_size}
										<p class="mt-2 text-xs text-amber-600">Please select a replacement size.</p>
									{/if}
								</div>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<div class="mt-8 flex items-center justify-between">
		<button onclick={back} class="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700">
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			Back
		</button>
		<button
			onclick={proceed}
			disabled={!returnFlow.reasonsComplete ||
				returnFlow.selected.some((i) => i.wants_exchange && !i.exchange_size)}
			class="rounded-xl bg-gray-900 px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
		>
			Next: Review →
		</button>
	</div>
</div>
