<script lang="ts">
	import './layout.css';
	import { cart } from '$lib/stores/cart.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import ChatWidget from '$lib/components/ChatWidget.svelte';
	import CartSlideover from '$lib/components/CartSlideover.svelte';
	import DemoOverlay from '$lib/components/DemoOverlay.svelte';

	const { children } = $props();

	const CATEGORIES = ['Shirts', 'Hoodies', 'Bottoms', 'Jackets'];

	let showDisclaimer = $state(false);

	onMount(() => {
		if (!localStorage.getItem('form_disclaimer_seen')) {
			showDisclaimer = true;
		}
	});

	function dismissDisclaimer() {
		localStorage.setItem('form_disclaimer_seen', '1');
		showDisclaimer = false;
	}
</script>

<div class="flex min-h-screen flex-col bg-white text-gray-900 overflow-x-hidden">
	<header class="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm print:hidden">
		<div class="mx-auto max-w-6xl px-4 sm:px-6">
			<!-- Row 1: Logo · Search · Cart -->
			<div class="flex items-center gap-2 sm:gap-4 py-3.5 sm:py-4">
				<a href="/" class="shrink-0 text-sm sm:text-base font-semibold tracking-[0.2em] text-gray-900">
					FORM.
				</a>
				<div class="flex min-w-0 flex-1 justify-center px-1 sm:px-2">
					<div class="w-full max-w-sm" data-demo="demo-search">
						<SearchBar />
					</div>
				</div>
				<button
					onclick={() => cart.toggle()}
					class="relative shrink-0 text-gray-500 transition-colors hover:text-gray-900"
					aria-label="Cart{cart.count > 0 ? ` (${cart.count} items)` : ''}"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
							d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
					</svg>
					{#if cart.count > 0}
						<span
							class="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white"
						>
							{cart.count}
						</span>
					{/if}
				</button>
			</div>

			<!-- Row 2: Category nav — hidden on flow pages -->
			{#if !$page.url.pathname.startsWith('/returns') && !$page.url.pathname.startsWith('/order') && $page.url.pathname !== '/checkout' && $page.url.pathname !== '/cart'}
				<nav
					class="flex items-center gap-1 overflow-x-auto border-t border-gray-100 py-2 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
					aria-label="Product categories"
					data-demo="demo-categories"
				>
					<a
						href="/"
						class="shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors
						{$page.url.pathname === '/' && !$page.url.searchParams.get('category')
							? 'bg-gray-900 text-white'
							: 'text-gray-500 hover:text-gray-900'}"
					>
						Home
					</a>
					{#each CATEGORIES as cat}
						<a
							href="/?category={cat}"
							class="shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors
							{$page.url.searchParams.get('category') === cat
								? 'bg-gray-900 text-white'
								: 'text-gray-500 hover:text-gray-900'}"
						>
							{cat}
						</a>
					{/each}
				</nav>
			{/if}
		</div>
	</header>

	<main class="flex-1">
		{@render children()}
	</main>

	<footer class="mt-24 border-t border-gray-100 print:hidden">
		<div class="mx-auto max-w-6xl px-4 sm:px-6">
			<!-- Main footer grid -->
			<div class="grid grid-cols-2 gap-10 py-12 sm:grid-cols-4">
				<!-- Brand -->
				<div class="col-span-2 sm:col-span-1">
					<a href="/" class="text-sm font-semibold tracking-[0.2em] text-gray-900">FORM.</a>
					<p class="mt-3 text-xs leading-relaxed text-gray-400">
						Minimal fashion, transparent pricing. All prices include VAT — no hidden fees.
					</p>
				</div>

				<!-- Help -->
				<div>
					<p class="text-xs font-semibold uppercase tracking-widest text-gray-400">Help</p>
					<ul class="mt-4 space-y-2.5">
						<li><a href="/faq" class="text-xs text-gray-500 transition-colors hover:text-gray-900">All FAQs</a></li>
						<li><a href="/faq#shipping" class="text-xs text-gray-500 transition-colors hover:text-gray-900">Shipping</a></li>
						<li><a href="/faq#returns" class="text-xs text-gray-500 transition-colors hover:text-gray-900">Returns</a></li>
						<li><a href="/faq#payment" class="text-xs text-gray-500 transition-colors hover:text-gray-900">Payment</a></li>
					</ul>
				</div>

				<!-- Legal -->
				<div>
					<p class="text-xs font-semibold uppercase tracking-widest text-gray-400">Legal</p>
					<ul class="mt-4 space-y-2.5">
						<li><span class="text-xs text-gray-400">Privacy policy</span></li>
						<li><span class="text-xs text-gray-400">Terms of service</span></li>
						<li><span class="text-xs text-gray-400">Cookie settings</span></li>
					</ul>
				</div>

				<!-- Contact -->
				<div>
					<p class="text-xs font-semibold uppercase tracking-widest text-gray-400">Contact</p>
					<ul class="mt-4 space-y-2.5">
						<li><span class="text-xs text-gray-400">hello@form.store</span></li>
						<li><span class="text-xs text-gray-400">Mon–Fri, 9am–6pm CET</span></li>
					</ul>
				</div>
			</div>

			<!-- Payment methods + copyright -->
			<div class="flex flex-col items-center gap-5 border-t border-gray-100 py-8 sm:flex-row sm:justify-between">
				<!-- Accepted payments -->
				<div class="flex flex-wrap items-center gap-2">
					<!-- Visa -->
					<span class="flex h-7 items-center rounded border border-gray-200 bg-white px-2.5 font-serif text-xs font-bold italic text-blue-700 shadow-sm">
						VISA
					</span>
					<!-- Mastercard -->
					<span class="flex h-7 w-11 items-center justify-center rounded border border-gray-200 bg-white shadow-sm">
						<svg viewBox="0 0 38 24" class="h-4" aria-label="Mastercard">
							<circle cx="13" cy="12" r="9" fill="#EB001B"/>
							<circle cx="25" cy="12" r="9" fill="#F79E1B"/>
							<path d="M19 5.27A9 9 0 0119 18.73 9 9 0 0119 5.27z" fill="#FF5F00"/>
						</svg>
					</span>
					<!-- Amex -->
					<span class="flex h-7 items-center rounded border border-gray-200 bg-[#016FD0] px-2 text-[10px] font-bold tracking-wider text-white shadow-sm">
						AMEX
					</span>
					<!-- Apple Pay -->
					<span class="flex h-7 items-center gap-1 rounded border border-gray-200 bg-black px-2.5 shadow-sm">
						<svg class="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-label="Apple">
							<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83"/>
							<path d="M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
						</svg>
						<span class="text-[10px] font-semibold text-white">Pay</span>
					</span>
					<!-- Invoice -->
					<span class="flex h-7 items-center gap-1 rounded border border-gray-200 bg-white px-2.5 shadow-sm">
						<svg class="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
						</svg>
						<span class="text-[10px] text-gray-500">Invoice</span>
					</span>
				</div>

				<!-- Copyright -->
				<p class="text-xs text-gray-400 text-center sm:text-right wrap-break-word">
					© 2026 FORM. · University prototype · Not a real shop ·
					Images: <a href="https://straight-outta-cotton.com" target="_blank" rel="noopener noreferrer" class="underline underline-offset-2 hover:text-gray-600 transition-colors">straight-outta-cotton.com</a>
				</p>
			</div>
		</div>
	</footer>
</div>

<ChatWidget />
<CartSlideover />
<DemoOverlay />

{#if showDisclaimer}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-100 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm print:hidden"
		onclick={dismissDisclaimer}
	>
		<div
			class="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
			aria-label="University research disclaimer"
		>
			<!-- Colour band -->
			<div class="h-1.5 w-full bg-gray-900"></div>

			<div class="px-8 py-7">
				<!-- Badge -->
				<span class="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-blue-600">
					<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422A12.083 12.083 0 0121 12c0 6.627-4.03 12-9 12S3 18.627 3 12c0-.538.034-1.068.099-1.588L9 10.586 12 14z"/>
					</svg>
					University Research Project
				</span>

				<h2 class="mt-4 text-xl font-semibold text-gray-900">Welcome to FORM.</h2>
				<p class="mt-3 text-sm leading-relaxed text-gray-600">
					This is a <strong class="font-semibold text-gray-900">prototype shop</strong> built as part of a university research project studying e-commerce customer satisfaction. It is <strong class="font-semibold text-gray-900">not a real store</strong> — no purchases can be made and no data is collected for commercial purposes.
				</p>

				<ul class="mt-4 space-y-2">
					{#each [
						'No real payments — checkout is fully simulated',
						'No products will be shipped',
						'Any data you enter is used for research only',
					] as item}
						<li class="flex items-start gap-2 text-sm text-gray-500">
							<svg class="mt-0.5 h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
							</svg>
							{item}
						</li>
					{/each}
				</ul>

				<button
					onclick={dismissDisclaimer}
					class="mt-7 w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
				>
					Got it — explore the shop
				</button>

				<p class="mt-3 text-center text-[11px] text-gray-400">
					This notice won't appear again on this device.
				</p>
			</div>
		</div>
	</div>
{/if}
