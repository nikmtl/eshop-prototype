<script lang="ts">
	import { goto, afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';
	import { tick, untrack, onMount } from 'svelte';
	import { demo, DEMO_STEPS } from '$lib/stores/demo.svelte';
	import { supabase } from '$lib/supabase';

	// Remembered order ID for dynamic-route steps (captured when user visits an order page)
	let lastOrderId = $state<string | null>(null);
	// First available product ID — fetched once on mount so product demo steps always work
	let firstProductId = $state<string | null>(null);

	onMount(async () => {
		const { data } = await supabase.from('products').select('id').order('id').limit(1).single();
		if (data) firstProductId = String(data.id);
	});

	afterNavigate(({ to }) => {
		if (!to) return;
		const path = to.url.pathname;
		const m = path.match(/^\/order\/([^/]+)/);
		if (m) lastOrderId = m[1];
		if (demo.active) applyHighlight();
	});

	let activeEl: Element | null = null;

	function clearHighlight() {
		activeEl?.removeAttribute('data-demo-active');
		activeEl = null;
	}

	async function applyHighlight() {
		clearHighlight();
		if (!demo.active) return;
		await tick();
		const el = document.querySelector(`[data-demo="${demo.step.selector}"]`);
		if (el) {
			el.setAttribute('data-demo-active', '');
			activeEl = el;
			el.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}

	function resolveRoute(): string | null {
		const step = demo.step;
		if (step.route !== null) return step.route;
		if (step.buildRoute) return step.buildRoute({ orderId: lastOrderId, productId: firstProductId });
		return null;
	}

	$effect(() => {
		const isActive = demo.active;
		const idx = demo.currentIndex; // eslint-disable-line @typescript-eslint/no-unused-vars
		if (!isActive) {
			clearHighlight();
			return;
		}
		const step = DEMO_STEPS[idx];
		untrack(() => {
			const currentPath = get(page).url.pathname;
			if (!step.matchesPath(currentPath)) {
				const target = resolveRoute();
				if (target) goto(target);
				// afterNavigate will call applyHighlight
			} else {
				applyHighlight();
			}
		});
	});

	// Keyboard nav: arrow keys + Escape
	function onKeydown(e: KeyboardEvent) {
		if (!demo.active) return;
		if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
			e.preventDefault();
			demo.next();
		} else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
			e.preventDefault();
			demo.prev();
		} else if (e.key === 'Escape') {
			demo.close();
		}
	}

	let onCorrectPage = $derived(demo.step.matchesPath(get(page).url.pathname));
	let needsOrder = $derived(!!demo.step.needsOrderId && !lastOrderId);
</script>

<svelte:window onkeydown={onKeydown} />

<!-- Floating toggle button (always visible) -->
{#if !demo.active}
	<button
		onclick={() => demo.open()}
		class="fixed bottom-6 left-6 z-90 flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition-all hover:bg-gray-700 hover:shadow-xl print:hidden"
		aria-label="Open demo guide"
	>
		<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
				d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
		</svg>
		Demo Guide
	</button>
{/if}

<!-- Demo panel -->
{#if demo.active}
	<div
		class="fixed bottom-6 left-6 z-90 w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl print:hidden"
		role="dialog"
		aria-label="Demo guide"
	>
		<!-- Progress bar -->
		<div class="h-1 w-full bg-gray-100">
			<div
				class="h-full bg-gray-900 transition-all duration-300"
				style="width: {((demo.currentIndex + 1) / demo.total) * 100}%"
			></div>
		</div>

		<!-- Header -->
		<div class="flex items-center justify-between px-4 pt-3 pb-1">
			<span class="rounded-full px-2.5 py-0.5 text-[11px] font-semibold {demo.step.color}">
				{demo.step.aspect}
			</span>
			<div class="flex items-center gap-2">
				<span class="text-[11px] font-medium text-gray-400">{demo.currentIndex + 1} / {demo.total}</span>
				<button
					onclick={() => demo.close()}
					class="rounded-md p-0.5 text-gray-300 transition-colors hover:text-gray-600"
					aria-label="Close demo guide"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
					</svg>
				</button>
			</div>
		</div>

		<!-- Body -->
		<div class="px-4 pb-4 pt-2">
			<h3 class="text-sm font-semibold text-gray-900">{demo.step.title}</h3>
			<p class="mt-1.5 text-xs leading-relaxed text-gray-500">{demo.step.description}</p>

			{#if needsOrder}
				<div class="mt-3 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5">
					<svg class="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
					</svg>
					<p class="text-[11px] leading-relaxed text-amber-700">
						Complete a checkout first to demo this step — the order confirmation page will appear automatically.
					</p>
				</div>
			{:else if !onCorrectPage && demo.step.route === null}
				<div class="mt-3 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5">
					<svg class="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
					</svg>
					<p class="text-[11px] leading-relaxed text-blue-700">
						Navigating to your order page…
					</p>
				</div>
			{/if}
		</div>

		<!-- Step dots + nav -->
		<div class="flex items-center justify-between border-t border-gray-100 px-4 py-3">
			<!-- Prev -->
			<button
				onclick={() => demo.prev()}
				disabled={demo.currentIndex === 0}
				class="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors
				{demo.currentIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}"
			>
				<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
				</svg>
				Prev
			</button>

			<!-- Dots -->
			<div class="flex items-center gap-1">
				{#each DEMO_STEPS as _, i}
					<button
						onclick={() => { demo.currentIndex = i; }}
						class="rounded-full transition-all {i === demo.currentIndex ? 'h-2 w-2 bg-gray-900' : 'h-1.5 w-1.5 bg-gray-300 hover:bg-gray-500'}"
						aria-label="Go to step {i + 1}"
					></button>
				{/each}
			</div>

			<!-- Next -->
			{#if demo.currentIndex < demo.total - 1}
				<button
					onclick={() => demo.next()}
					class="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
				>
					Next
					<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
					</svg>
				</button>
			{:else}
				<button
					onclick={() => demo.close()}
					class="flex items-center gap-1 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-700"
				>
					Done
					<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
					</svg>
				</button>
			{/if}
		</div>
	</div>
{/if}
