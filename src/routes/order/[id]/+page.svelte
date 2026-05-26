<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	const { data, form }: { data: PageData; form: ActionData } = $props();

	// ── Types ──────────────────────────────────────────────────────────────────
	type OrderItem = { product_id: number; name: string; price: number; quantity: number };

	// ── Order data ─────────────────────────────────────────────────────────────
	function fmt(d: Date, opts?: Intl.DateTimeFormatOptions) {
		return d.toLocaleDateString('en-GB', opts ?? { day: 'numeric', month: 'long', year: 'numeric' });
	}

	function addBusinessDays(date: Date, n: number): Date {
		const d = new Date(date);
		let added = 0;
		while (added < n) {
			d.setDate(d.getDate() + 1);
			if (d.getDay() !== 0 && d.getDay() !== 6) added++;
		}
		return d;
	}

	const statusIndex: Record<string, number> = { pending: 0, processing: 1, shipped: 2, delivered: 3 };

	let items = $derived(data.order.items as OrderItem[]);
	let subtotal = $derived(items.reduce((s, i) => s + i.price * i.quantity, 0));
	let shipping = $derived(Math.round((data.order.total - subtotal) * 100) / 100);
	let orderDate = $derived(new Date(data.order.created_at));
	let estimatedShip = $derived(addBusinessDays(orderDate, 2));
	let estimatedDelivery = $derived(addBusinessDays(orderDate, 5));
	let isCancelled = $derived(data.order.status === 'cancelled');
	let currentIdx = $derived(statusIndex[data.order.status] ?? 0);

	// ── Delivery timeline ──────────────────────────────────────────────────────
	let stages = $derived([
		{
			key: 'pending',
			label: 'Confirmed',
			date: fmt(orderDate, { weekday: 'short', day: 'numeric', month: 'short' }),
			heading: 'Order confirmed',
			body: "We've received your order and verified payment. Your items will be picked from stock the same or next business day.",
			icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>`
		},
		{
			key: 'processing',
			label: 'Processing',
			date: fmt(addBusinessDays(orderDate, 1), { weekday: 'short', day: 'numeric', month: 'short' }),
			heading: 'Picking & packing',
			body: 'Our team carefully picks each item, checks it for quality, and packs it securely. Estimated 1–2 business days.',
			icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>`
		},
		{
			key: 'shipped',
			label: 'Shipped',
			date: fmt(estimatedShip, { weekday: 'short', day: 'numeric', month: 'short' }),
			heading: 'On its way',
			body: "Your parcel has left our warehouse. We'll send a tracking email with your shipment details and live tracking link.",
			icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/>`
		},
		{
			key: 'delivered',
			label: 'Delivered',
			date: fmt(estimatedDelivery, { weekday: 'short', day: 'numeric', month: 'short' }),
			heading: 'Delivered',
			body: 'Your order has arrived. Not quite right? Free returns are open for 30 days — no forms, no hassle.',
			icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>`
		}
	]);

	// ── Survey state ───────────────────────────────────────────────────────────
	let hovered = $state(0);
	let selected = $state(0);
	let surveySubmitting = $state(false);

	let surveyDone = $derived(
		data.survey !== null ||
			!!(form && 'surveySuccess' in form && (form as { surveySuccess?: boolean }).surveySuccess)
	);
	let surveyError = $derived(
		form && 'surveyError' in form ? (form as { surveyError: string }).surveyError : null
	);
	let displayRating = $derived(surveyDone ? (data.survey?.rating ?? selected) : (hovered || selected));
</script>

<svelte:head>
	<title>Order #{data.order.id} confirmed — FORM.</title>
</svelte:head>

<!-- Print-only header (replaces sticky nav in print) -->
<div class="hidden print:block mb-6 pb-4 border-b border-gray-200">
	<p class="text-base font-semibold tracking-widest">FORM.</p>
	<p class="text-xs text-gray-500 mt-0.5">Order receipt</p>
</div>

<div class="mx-auto max-w-4xl px-6 py-10">

	<!-- ── 1. Confirmation banner ────────────────────────────────────────────── -->
	{#if isCancelled}
		<div class="rounded-2xl bg-red-50 border border-red-200 px-8 py-6 mb-8">
			<p class="text-sm font-semibold uppercase tracking-wider text-red-500">Cancelled</p>
			<h1 class="mt-1 text-2xl font-semibold text-gray-900">Order #{data.order.id} was cancelled</h1>
			<p class="mt-1 text-sm text-gray-600">
				If you were charged, a refund will appear within 5–7 business days.
				<a href="mailto:hello@form.com" class="underline">Contact us</a> if you have questions.
			</p>
		</div>
	{:else}
		<div class="rounded-2xl bg-green-50 border border-green-200 px-8 py-6 mb-8">
			<div class="flex items-center gap-3">
				<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
					</svg>
				</div>
				<p class="text-sm font-semibold text-green-700">Order confirmed</p>
			</div>
			<h1 class="mt-3 text-2xl font-semibold text-gray-900">Thank you — your order is on its way.</h1>
			<div class="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
				<span>Order <span class="font-medium text-gray-900">#{data.order.id}</span></span>
				<span>Placed {fmt(orderDate)}</span>
				<span>Confirmation sent to <span class="font-medium text-gray-900">{data.order.email}</span></span>
			</div>
		</div>
	{/if}

	<!-- ── 2. Delivery timeline ──────────────────────────────────────────────── -->
	{#if !isCancelled}
		<section class="mb-10" data-demo="demo-timeline">
			<h2 class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-6">Delivery progress</h2>

			<!-- Step indicators -->
			<div class="relative flex items-start">
				<!-- Connecting line -->
				<div class="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 -z-0">
					<div
						class="h-full bg-gray-900 transition-all duration-500"
						style="width: {(currentIdx / (stages.length - 1)) * 100}%"
					></div>
				</div>

				{#each stages as stage, i}
					{@const done = i < currentIdx}
					{@const active = i === currentIdx}
					<div class="relative z-10 flex flex-1 flex-col items-center text-center">
						<!-- Circle -->
						<div
							class="flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors
							{done ? 'border-gray-900 bg-gray-900 text-white' : ''}
							{active ? 'border-gray-900 bg-gray-900 text-white ring-4 ring-gray-900/10' : ''}
							{!done && !active ? 'border-gray-200 bg-white text-gray-300' : ''}"
						>
							{#if done}
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
								</svg>
							{:else if active}
								<div class="h-2.5 w-2.5 rounded-full bg-white"></div>
							{:else}
								<div class="h-2.5 w-2.5 rounded-full bg-gray-200"></div>
							{/if}
						</div>
						<!-- Label -->
						<p class="mt-2 text-xs font-semibold {done || active ? 'text-gray-900' : 'text-gray-400'}">
							{stage.label}
						</p>
						<p class="mt-0.5 text-[10px] {done || active ? 'text-gray-500' : 'text-gray-300'}">
							{i === 0 ? stage.date : (i === currentIdx ? stage.date : `Est. ${stage.date}`)}
						</p>
					</div>
				{/each}
			</div>
		</section>

		<!-- ── 3. What happens next ──────────────────────────────────────────── -->
		<section class="mb-10 print:hidden">
			<h2 class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">What happens next</h2>
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
				{#each stages as stage, i}
					{@const done = i < currentIdx}
					{@const active = i === currentIdx}
					{@const next = i === currentIdx + 1}
					<div
						class="rounded-xl border p-4 transition-colors
						{active ? 'border-gray-900 bg-gray-50' : ''}
						{next ? 'border-gray-200 bg-white' : ''}
						{done ? 'border-gray-100 bg-gray-50/50 opacity-60' : ''}
						{!done && !active && !next ? 'border-gray-100 bg-white opacity-40' : ''}"
					>
						<div class="flex items-start justify-between gap-2">
							<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg
								{done ? 'bg-gray-100 text-gray-400' : active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}">
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									{@html stage.icon}
								</svg>
							</div>
							{#if active}
								<span class="rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-semibold text-white">Now</span>
							{:else if next}
								<span class="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">Next</span>
							{:else if done}
								<svg class="h-4 w-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
								</svg>
							{/if}
						</div>
						<p class="mt-3 text-sm font-semibold text-gray-900">{stage.heading}</p>
						<p class="mt-1 text-xs leading-relaxed text-gray-500">{stage.body}</p>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- ── 4. Receipt + sidebar ──────────────────────────────────────────────── -->
	<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">

		<!-- Receipt -->
		<div class="lg:col-span-2">
			<h2 class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Order receipt</h2>
			<div class="rounded-2xl border border-gray-100 overflow-hidden">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-gray-100 bg-gray-50">
							<th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Item</th>
							<th class="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Qty</th>
							<th class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Price</th>
							<th class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Subtotal</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-50">
						{#each items as item}
							<tr>
								<td class="px-5 py-4 text-gray-900">{item.name}</td>
								<td class="px-3 py-4 text-right text-gray-500">{item.quantity}</td>
								<td class="px-5 py-4 text-right text-gray-500">€{item.price.toFixed(2)}</td>
								<td class="px-5 py-4 text-right font-medium text-gray-900">
									€{(item.price * item.quantity).toFixed(2)}
								</td>
							</tr>
						{/each}
					</tbody>
					<tfoot class="border-t border-gray-100 bg-gray-50">
						<tr>
							<td colspan="3" class="px-5 py-3 text-right text-sm text-gray-500">Subtotal</td>
							<td class="px-5 py-3 text-right font-medium text-gray-900">€{subtotal.toFixed(2)}</td>
						</tr>
						<tr>
							<td colspan="3" class="px-5 py-3 text-right text-sm text-gray-500">
								Shipping
								{#if shipping === 0}
									<span class="ml-1 text-xs text-green-600">(free on orders over €100)</span>
								{/if}
							</td>
							<td class="px-5 py-3 text-right font-medium text-gray-900">
								{shipping === 0 ? 'Free' : `€${shipping.toFixed(2)}`}
							</td>
						</tr>
						<tr class="border-t border-gray-200">
							<td colspan="3" class="px-5 py-4 text-right font-semibold text-gray-900">Total paid</td>
							<td class="px-5 py-4 text-right text-lg font-bold text-gray-900">
								€{data.order.total.toFixed(2)}
							</td>
						</tr>
					</tfoot>
				</table>
			</div>
			<p class="mt-3 text-xs text-gray-400">
				All prices include VAT. No additional charges will be applied.
			</p>
		</div>

		<!-- Sidebar -->
		<div class="flex flex-col gap-4" data-demo="demo-order-sidebar">

			<!-- Estimated delivery -->
			{#if !isCancelled}
				<div class="rounded-2xl border border-gray-100 p-5">
					<div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
						<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
						</svg>
						Estimated delivery
					</div>
					<p class="mt-3 text-xl font-semibold text-gray-900">{fmt(estimatedDelivery, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
					<p class="mt-1 text-xs text-gray-500">Dispatches by {fmt(estimatedShip, { weekday: 'long', day: 'numeric', month: 'long' })} · 2–3 day delivery</p>
					<p class="mt-3 text-xs text-gray-400 border-t border-gray-100 pt-3">
						Estimates based on standard business days. A tracking link will be emailed when your order ships.
					</p>
				</div>
			{/if}

			<!-- Returns policy -->
			<div class="rounded-2xl border border-gray-100 p-5">
				<div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
					<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"/>
					</svg>
					Free returns
				</div>
				<p class="mt-3 text-sm font-semibold text-gray-900">30-day free returns</p>
				<p class="mt-1 text-xs leading-relaxed text-gray-500">
					Changed your mind? Return any item within 30 days of delivery for a full refund. Free collection from your door.
				</p>
				{#if !isCancelled}
					<a
						href="/returns/{data.order.id}/select"
						class="mt-4 flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 print:hidden"
					>
						<svg class="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"/>
						</svg>
						Return items →
					</a>
				{/if}
			</div>

			<!-- Need help -->
			<div class="rounded-2xl border border-gray-100 p-5 print:hidden">
				<div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
					<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
					</svg>
					Need help?
				</div>
				<p class="mt-3 text-xs leading-relaxed text-gray-500">
					Questions about your order? Our team is here to help.
				</p>
				<a
					href="mailto:hello@form.com?subject=Order #{data.order.id}"
					class="mt-3 block text-xs font-medium text-gray-900 underline underline-offset-2"
				>
					hello@form.com
				</a>
				<p class="mt-1 text-xs text-gray-400">We reply within 1 business day.</p>
			</div>
		</div>
	</div>

	<!-- ── 5. Save receipt ───────────────────────────────────────────────────── -->
	<div class="mt-8 flex items-center justify-between print:hidden">
		<a href="/" class="text-sm text-gray-500 hover:text-gray-900">← Continue shopping</a>
		<button
			onclick={() => window.print()}
			class="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
			</svg>
			Save / Print receipt
		</button>
	</div>

	<!-- ── 6. Satisfaction survey ────────────────────────────────────────────── -->
	<section class="mt-16 print:hidden" data-demo="demo-survey">
		<div class="border-t border-gray-100 pt-12">
			<div class="mx-auto max-w-lg text-center">
				{#if surveyDone}
					<!-- Thank you state -->
					<div class="rounded-2xl bg-gray-50 border border-gray-100 px-8 py-10">
						<div class="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
							</svg>
						</div>
						<h3 class="text-base font-semibold text-gray-900">Thank you for your feedback</h3>
						<p class="mt-2 text-sm text-gray-500">
							Your response helps us make the shopping experience better for everyone.
						</p>
						<!-- Show their rating -->
						<div class="mt-5 flex justify-center gap-1">
							{#each { length: 5 } as _, i}
								<svg
									class="h-6 w-6 {i < (data.survey?.rating ?? selected) ? 'text-amber-400' : 'text-gray-200'}"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
								</svg>
							{/each}
						</div>
						{#if data.survey?.comment}
							<p class="mt-4 text-sm italic text-gray-600">"{data.survey.comment}"</p>
						{/if}
					</div>
				{:else}
					<!-- Survey form -->
					<h3 class="text-lg font-semibold text-gray-900">How was your checkout experience?</h3>
					<p class="mt-1 text-sm text-gray-500">Takes 30 seconds · helps us improve</p>

					<form
						method="POST"
						action="?/survey"
						use:enhance={() => {
							surveySubmitting = true;
							return async ({ update }) => {
								await update({ reset: false });
								surveySubmitting = false;
							};
						}}
						class="mt-6"
					>
						<input type="hidden" name="rating" value={selected} />

						<!-- Star selector -->
						<div
							class="flex justify-center gap-2"
							onmouseleave={() => { hovered = 0; }}
							role="group"
							aria-label="Rating"
						>
							{#each { length: 5 } as _, i}
								{@const filled = i < displayRating}
								<button
									type="button"
									onmouseenter={() => { hovered = i + 1; }}
									onclick={() => { selected = i + 1; }}
									class="transition-transform hover:scale-110 focus:outline-none"
									aria-label="Rate {i + 1} out of 5"
								>
									<svg
										class="h-10 w-10 transition-colors {filled ? 'text-amber-400' : 'text-gray-200'}"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
									</svg>
								</button>
							{/each}
						</div>

						{#if selected > 0}
							<p class="mt-2 text-sm font-medium text-gray-700">
								{['', 'Poor', 'Below average', 'Average', 'Good', 'Excellent'][selected]}
							</p>
						{:else}
							<p class="mt-2 text-sm text-gray-400">Select a rating</p>
						{/if}

						<!-- Optional comment -->
						<div class="mt-5 text-left">
							<label for="survey-comment" class="block text-sm font-medium text-gray-700">
								Anything to add? <span class="font-normal text-gray-400">(optional)</span>
							</label>
							<textarea
								id="survey-comment"
								name="comment"
								rows="3"
								class="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition placeholder:text-gray-300 focus:border-gray-400"
								placeholder="What went well? What could be better?"
							></textarea>
						</div>

						{#if surveyError}
							<p class="mt-3 text-sm text-red-600">{surveyError}</p>
						{/if}

						<button
							type="submit"
							disabled={selected === 0 || surveySubmitting}
							class="mt-4 w-full rounded-xl bg-gray-900 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
						>
							{surveySubmitting ? 'Submitting…' : 'Submit feedback'}
						</button>
					</form>
				{/if}
			</div>
		</div>
	</section>

</div>

<style>
	@media print {
		:global(header),
		:global(footer) {
			display: none !important;
		}
	}
</style>
