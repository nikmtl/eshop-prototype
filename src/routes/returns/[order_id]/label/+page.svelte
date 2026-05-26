<script lang="ts">
	import type { PageData } from './$types';
	import ReturnStepper from '$lib/components/ReturnStepper.svelte';

	const { data }: { data: PageData } = $props();

	function fmt(d: Date) {
		return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
	}

	let returnDate = $derived(new Date(data.ret.created_at));
	let ref = $derived(`RET-${String(data.ret.id).padStart(5, '0')}`);
	let barcodeNumber = $derived(
		`${String(data.order.id).padStart(4, '0')} ${String(data.ret.id).padStart(4, '0')} ${String(Math.abs(data.ret.id * 17 + data.order.id * 31) % 10000).padStart(4, '0')}`
	);

	function barcodeRects(seed: number): Array<{ x: number; w: number }> {
		const rects: Array<{ x: number; w: number }> = [];
		let x = 0;
		let s = Math.abs(seed) || 42;
		while (x < 200) {
			s = ((s * 1664525 + 1013904223) & 0x7fffffff);
			const barW = 1 + (s & 1);
			rects.push({ x, w: barW });
			x += barW;
			s = ((s * 1664525 + 1013904223) & 0x7fffffff);
			x += 1 + (s % 3);
		}
		return rects;
	}

	let bars = $derived(barcodeRects(data.ret.id));

	const REASON_LABELS: Record<string, string> = {
		wrong_size: 'Wrong size',
		defective: 'Defective or damaged',
		not_as_described: 'Not as described',
		changed_mind: 'Changed my mind',
		wrong_item: 'Wrong item received'
	};
</script>

<svelte:head>
	<title>Return label {ref} — FORM.</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-6 py-12 no-print">
	<ReturnStepper step={4} />

	<!-- Success banner -->
	<div class="mb-8 flex items-start gap-4 rounded-2xl bg-green-50 border border-green-200 px-6 py-5">
		<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
			</svg>
		</div>
		<div>
			<p class="font-semibold text-green-800">Return confirmed — {ref}</p>
			<p class="mt-0.5 text-sm text-green-700">
				Print the label below and attach it to your parcel.
				{#if data.ret.wants_exchange}
					Your replacement will ship once we receive and inspect the items.
				{:else}
					Your refund will be processed within 5 business days of receipt.
				{/if}
			</p>
		</div>
	</div>

	<p class="mb-4 text-sm font-medium text-gray-700">Your return label</p>
</div>

<!-- ── Return label (visible on screen and in print) ───────────────────── -->
<div class="label-wrap mx-auto max-w-2xl px-6 pb-10">
	<div class="print-label overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-lg">

		<!-- Label header -->
		<div class="flex items-center justify-between border-b-2 border-gray-200 bg-gray-900 px-6 py-4">
			<div>
				<p class="text-xs font-semibold uppercase tracking-widest text-gray-400">Return Label</p>
				<p class="mt-0.5 text-xl font-semibold tracking-[0.25em] text-white">FORM.</p>
			</div>
			<div class="text-right">
				<p class="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Reference</p>
				<p class="mt-0.5 font-mono text-lg font-bold text-white">{ref}</p>
			</div>
		</div>

		<!-- Addresses -->
		<div class="grid grid-cols-2 divide-x divide-gray-200">
			<!-- From -->
			<div class="px-6 py-5">
				<p class="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">From</p>
				<p class="text-sm font-medium text-gray-900 break-all">{data.order.email}</p>
				<p class="mt-2 text-xs text-gray-500">Order #{data.order.id}</p>
				<p class="mt-0.5 text-xs text-gray-400">{fmt(returnDate)}</p>
				<div class="mt-4 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-2">
					<p class="text-[10px] text-gray-400">Attach label to outside of parcel</p>
				</div>
			</div>

			<!-- To -->
			<div class="bg-gray-50 px-6 py-5">
				<p class="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Return To</p>
				<p class="text-sm font-semibold text-gray-900">FORM. Returns Centre</p>
				<p class="mt-1 text-xs text-gray-600">Unit 4, Textile Park</p>
				<p class="text-xs text-gray-600">Piccadilly, Manchester</p>
				<p class="text-xs text-gray-600">M1 2AB</p>
				<p class="mt-0.5 text-xs text-gray-600">United Kingdom</p>
				<div class="mt-3 rounded-lg border border-gray-200 bg-white px-3 py-2">
					<p class="text-[10px] font-medium text-gray-500">Royal Mail Tracked Returns</p>
					<p class="mt-0.5 text-[10px] text-gray-400">Drop off at any RM Tracked point</p>
				</div>
			</div>
		</div>

		<!-- Barcode -->
		<div class="flex items-center gap-6 border-t border-gray-200 bg-white px-6 py-5">
			<div class="shrink-0">
				<svg width="200" height="48" viewBox="0 0 200 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
					{#each bars as bar}
						<rect x={bar.x} y="0" width={bar.w} height="48" fill="#111111" />
					{/each}
				</svg>
				<p class="mt-1 text-center font-mono text-[10px] tracking-widest text-gray-500">{barcodeNumber}</p>
			</div>
			<div>
				<p class="text-xs font-medium text-gray-700">Scan at drop-off point</p>
				<p class="mt-1 text-[10px] leading-relaxed text-gray-400">
					This label is valid for 30 days from {fmt(returnDate)}.
					Keep your proof of postage receipt.
				</p>
			</div>
		</div>

		<!-- Items summary -->
		<div class="border-t border-gray-200 bg-gray-50 px-6 py-4">
			<p class="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Returning</p>
			<div class="space-y-1">
				{#each data.items as item}
					<div class="flex items-baseline justify-between gap-4">
						<p class="text-xs text-gray-700">
							{item.name}
							{#if item.size && item.size !== 'One Size'} — {item.size}{/if}
							× {item.quantity}
						</p>
						<p class="shrink-0 text-[10px] text-gray-400">
							{REASON_LABELS[item.return_reason] ?? item.return_reason}
						</p>
					</div>
				{/each}
			</div>
		</div>

	</div>
</div>

<!-- Actions -->
<div class="mx-auto max-w-2xl px-6 pb-16 no-print">
	<div class="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
		<a
			href="/order/{data.order.id}"
			class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			Back to order
		</a>
		<button
			onclick={() => window.print()}
			class="flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-gray-700"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
			</svg>
			Download / Print label
		</button>
	</div>

	<div class="mt-8 rounded-2xl border border-gray-100 bg-gray-50 p-5">
		<p class="text-xs font-semibold uppercase tracking-wider text-gray-400">What's next</p>
		<div class="mt-3 space-y-2">
			{#each [
				'Print the label and attach it securely to your parcel.',
				'Drop it off at any Royal Mail drop-off point — no collection needed.',
				'We\'ll email you once we\'ve received and processed your return.'
			] as tip, i}
				<div class="flex items-start gap-3">
					<div class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[10px] font-semibold text-gray-600">
						{i + 1}
					</div>
					<p class="text-xs text-gray-600">{tip}</p>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	@media print {
		:global(header),
		:global(footer),
		.no-print {
			display: none !important;
		}

		.label-wrap {
			padding: 0 !important;
			max-width: 100% !important;
		}

		.print-label {
			border-radius: 0 !important;
			border-width: 0 !important;
			box-shadow: none !important;
		}
	}
</style>
