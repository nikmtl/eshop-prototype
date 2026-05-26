<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { cart } from '$lib/stores/cart.svelte';
	import { fly, fade } from 'svelte/transition';
	import type { ActionData } from './$types';

	const { form }: { form: ActionData } = $props();

	const FREE_SHIPPING_THRESHOLD = 100;
	const FLAT_SHIPPING = 4.99;

	let shipping = $derived(cart.subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING);
	let total = $derived(cart.subtotal + shipping);
	let submitting = $state(false);
	let showExpressModal = $state(false);
	let expressEmail = $state('');
	let expressSubmitting = $state(false);

	type ExpressMethod = 'shop_pay' | 'paypal' | 'apple_pay' | 'google_pay';
	let selectedExpressMethod = $state<ExpressMethod>('apple_pay');

	const EXPRESS_CONFIG: Record<ExpressMethod, { label: string; iconBg: string; submitBg: string }> = {
		shop_pay:   { label: 'Shop Pay',    iconBg: 'bg-[#5A31F4]', submitBg: 'bg-[#5A31F4] hover:opacity-90' },
		paypal:     { label: 'PayPal',      iconBg: 'bg-[#FFC439]', submitBg: 'bg-[#0070BA] hover:opacity-90' },
		apple_pay:  { label: 'Apple Pay',   iconBg: 'bg-black',     submitBg: 'bg-black hover:opacity-90' },
		google_pay: { label: 'Google Pay',  iconBg: 'bg-white border border-gray-200', submitBg: 'bg-white border border-gray-300 !text-gray-900 hover:bg-gray-50' },
	};

	function openExpressModal(method: ExpressMethod) {
		selectedExpressMethod = method;
		showExpressModal = true;
	}

	// ── Payment state ───────────────────────────────────────────────────────────
	type PaymentMethod = 'card' | 'apple_pay' | 'invoice';
	let paymentMethod = $state<PaymentMethod>('card');

	const PAYMENT_METHODS: { id: PaymentMethod; icon: string; label: string }[] = [
		{ id: 'card', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', label: 'Card' },
		{ id: 'apple_pay', icon: 'M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 3a7 7 0 110 14A7 7 0 0112 5z', label: 'Apple Pay' },
		{ id: 'invoice', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', label: 'Invoice' }
	];

	let cardHolder = $state('');
	let cardNumber = $state('');
	let cardExpiry = $state('');
	let cardCvv = $state('');
	let cvvVisible = $state(false);

	function onCardNumberInput(e: Event) {
		const raw = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 16);
		cardNumber = raw.replace(/(.{4})/g, '$1 ').trim();
	}

	function onExpiryInput(e: Event) {
		const raw = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4);
		cardExpiry = raw.length > 2 ? raw.slice(0, 2) + '/' + raw.slice(2) : raw;
	}

	type CardBrand = 'visa' | 'mastercard' | 'amex' | null;
	let cardBrand = $derived.by<CardBrand>(() => {
		const n = cardNumber.replace(/\s/g, '');
		if (/^4/.test(n)) return 'visa';
		if (/^5[1-5]|^2[2-7]/.test(n)) return 'mastercard';
		if (/^3[47]/.test(n)) return 'amex';
		return null;
	});

	let maskedNumber = $derived.by(() => {
		const raw = cardNumber.replace(/\s/g, '');
		if (!raw) return '•••• •••• •••• ••••';
		const padded = raw.padEnd(16, '•');
		return padded.replace(/(.{4})/g, '$1 ').trim();
	});

	let submitLabel = $derived(
		submitting ? 'Placing order…' :
		paymentMethod === 'apple_pay' ? `Pay €${total.toFixed(2)} with Apple Pay` :
		paymentMethod === 'invoice' ? 'Place order — invoice to follow' :
		`Pay €${total.toFixed(2)}`
	);

	// Serialise cart for the hidden input on each render
	let cartJson = $derived(
		JSON.stringify(
			cart.items.map((i) => ({
				product_id: i.product.id,
				name: i.product.name,
				size: i.size,
				price: i.product.price,
				quantity: i.quantity
			}))
		)
	);
</script>

<svelte:head>
	<title>Checkout — FORM.</title>
</svelte:head>

{#if form?.success}
	<!-- No-JS fallback: JS would have navigated to /order/[id] already -->
	<div class="mx-auto max-w-lg px-6 py-24 text-center">
		<h1 class="text-2xl font-semibold text-gray-900">Order placed!</h1>
		<p class="mt-3 text-sm text-gray-600">
			<a href="/order/{(form as { orderId?: number }).orderId}" class="font-medium underline">
				View your order confirmation →
			</a>
		</p>
	</div>
{:else}
	<div class="mx-auto max-w-6xl px-6 py-12">
		<h1 class="mb-8 text-2xl font-semibold text-gray-900">Checkout</h1>

		{#if cart.items.length === 0}
			<div class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
				Your cart is empty.
				<a href="/" class="font-medium underline">Browse products</a>
			</div>
		{:else}
			<form
				method="POST"
				action="?/checkout"
				use:enhance={() => {
					submitting = true;
					return async ({ result, update }) => {
						if (result.type === 'success') {
							const orderId = (result.data as { orderId?: number })?.orderId;
							cart.clear();
							if (orderId) {
								goto(`/order/${orderId}`);
								return;
							}
						}
						await update();
						submitting = false;
					};
				}}
			>
				<!-- Hidden cart payload -->
				<input type="hidden" name="items" value={cartJson} />
				<input type="hidden" name="total" value={total} />

				<div class="grid grid-cols-1 gap-10 lg:grid-cols-3">
					<!-- Left: form -->
					<div class="space-y-8 lg:col-span-2">
						<!-- Express checkout -->
						<div data-demo="demo-express">
							<p class="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Express checkout</p>
							<div class="grid grid-cols-4 gap-2">
								<!-- Shop Pay -->
								<button type="button" onclick={() => openExpressModal('shop_pay')}
									class="flex items-center justify-center rounded-lg bg-[#5A31F4] py-3 transition-opacity hover:opacity-90"
									aria-label="Shop Pay">
									<span class="text-sm font-bold tracking-tight text-white">shop</span>
								</button>
								<!-- PayPal -->
								<button type="button" onclick={() => openExpressModal('paypal')}
									class="flex items-center justify-center rounded-lg bg-[#FFC439] py-3 transition-opacity hover:opacity-90"
									aria-label="PayPal">
									<span class="text-sm font-bold text-[#003087]">Pay<span class="text-[#009cde]">Pal</span></span>
								</button>
								<!-- Apple Pay -->
								<button type="button" onclick={() => openExpressModal('apple_pay')}
									class="flex items-center justify-center gap-1.5 rounded-lg bg-black py-3 transition-opacity hover:opacity-90"
									aria-label="Apple Pay">
									<svg class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
										<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
									</svg>
									<span class="text-xs font-semibold text-white">Pay</span>
								</button>
								<!-- Google Pay -->
								<button type="button" onclick={() => openExpressModal('google_pay')}
									class="flex items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white py-3 transition-colors hover:bg-gray-50"
									aria-label="Google Pay">
									<span class="text-sm font-semibold leading-none">
										<span class="text-[#4285F4]">G</span><span class="text-[#EA4335]">o</span><span class="text-[#FBBC05]">o</span><span class="text-[#4285F4]">g</span><span class="text-[#34A853]">l</span><span class="text-[#EA4335]">e</span>
									</span>
									<span class="text-xs font-semibold text-gray-800">Pay</span>
								</button>
							</div>
						</div>

						<!-- OR divider -->
						<div class="flex items-center gap-3">
							<div class="flex-1 border-t border-gray-200"></div>
							<span class="text-xs font-medium text-gray-400">OR</span>
							<div class="flex-1 border-t border-gray-200"></div>
						</div>

						<!-- Error banner -->
						{#if form?.error}
							<div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
								{form.error}
							</div>
						{/if}

						<!-- Contact -->
						<fieldset class="space-y-4">
							<legend class="text-sm font-semibold uppercase tracking-wider text-gray-500">
								Contact
							</legend>
							<div>
								<label for="email" class="block text-sm font-medium text-gray-700">
									Email address <span class="text-red-400">*</span>
								</label>
								<input
									id="email"
									name="email"
									type="email"
									autocomplete="email"
									required
									class="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-400 focus:ring-0"
									placeholder="you@example.com"
								/>
								<p class="mt-1 text-xs text-gray-400">
									Order confirmation will be sent here. No account required.
								</p>
							</div>
						</fieldset>

						<!-- Shipping address -->
						<fieldset class="space-y-4">
							<legend class="text-sm font-semibold uppercase tracking-wider text-gray-500">
								Shipping address
							</legend>
							<div>
								<label for="name" class="block text-sm font-medium text-gray-700">
									Full name <span class="text-red-400">*</span>
								</label>
								<input
									id="name"
									name="name"
									type="text"
									autocomplete="name"
									required
									class="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-400"
								/>
							</div>
							<div>
								<label for="address" class="block text-sm font-medium text-gray-700">
									Address <span class="text-red-400">*</span>
								</label>
								<input
									id="address"
									name="address"
									type="text"
									autocomplete="street-address"
									required
									class="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-400"
									placeholder="Street address, apartment, etc."
								/>
							</div>
							<div class="grid grid-cols-2 gap-4">
								<div>
									<label for="city" class="block text-sm font-medium text-gray-700">
										City <span class="text-red-400">*</span>
									</label>
									<input
										id="city"
										name="city"
										type="text"
										autocomplete="address-level2"
										required
										class="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-400"
									/>
								</div>
								<div>
									<label for="postcode" class="block text-sm font-medium text-gray-700">
										Postcode <span class="text-red-400">*</span>
									</label>
									<input
										id="postcode"
										name="postcode"
										type="text"
										autocomplete="postal-code"
										required
										class="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-400"
									/>
								</div>
							</div>
							<div>
								<label for="country" class="block text-sm font-medium text-gray-700">
									Country <span class="text-red-400">*</span>
								</label>
								<select
									id="country"
									name="country"
									autocomplete="country"
									required
									class="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-400"
								>
									<option value="">Select country</option>
									<option value="GB" selected>United Kingdom</option>
									<option value="IE">Ireland</option>
									<option value="DE">Germany</option>
									<option value="FR">France</option>
									<option value="NL">Netherlands</option>
									<option value="SE">Sweden</option>
									<option value="NO">Norway</option>
									<option value="DK">Denmark</option>
									<option value="US">United States</option>
								</select>
							</div>
						</fieldset>

						<!-- Payment -->
						<fieldset data-demo="demo-security">
							<legend class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
								Payment
							</legend>

							<!-- Method selector -->
							<input type="hidden" name="paymentMethod" value={paymentMethod} />
							<div class="grid grid-cols-3 gap-2">
								{#each PAYMENT_METHODS as { id, icon, label }}
									<button
										type="button"
										onclick={() => paymentMethod = id}
										class="flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-xs font-medium transition-all
										{paymentMethod === id
											? 'border-gray-900 bg-gray-900 text-white'
											: 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
									>
										<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d={icon} />
										</svg>
										{label}
									</button>
								{/each}
							</div>

							<!-- ── Card panel ─────────────────────────────────────────── -->
							{#if paymentMethod === 'card'}
								<div class="mt-4 space-y-4">
									<!-- Card preview -->
									<div
										class="relative h-44 w-full overflow-hidden rounded-2xl bg-linear-to-br from-gray-800 via-gray-900 to-black p-5 text-white shadow-xl select-none"
									>
										<!-- Shine overlay -->
										<div class="absolute inset-0 bg-linear-to-tr from-white/0 via-white/5 to-white/0"></div>

										<!-- Top row -->
										<div class="flex items-start justify-between">
											<span class="text-sm font-semibold tracking-[0.2em]">FORM.</span>
											<!-- Chip -->
											<div class="flex h-7 w-9 flex-col justify-between overflow-hidden rounded bg-linear-to-br from-yellow-300 to-yellow-500 p-0.5">
												<div class="h-1.5 w-full rounded-sm bg-yellow-700/40"></div>
												<div class="h-1.5 w-full rounded-sm bg-yellow-700/30"></div>
												<div class="h-1.5 w-full rounded-sm bg-yellow-700/40"></div>
											</div>
										</div>

										<!-- Card number -->
										<p class="mt-4 font-mono text-lg tracking-widest text-white/90">
											{maskedNumber}
										</p>

										<!-- Bottom row -->
										<div class="mt-4 flex items-end justify-between">
											<div>
												<p class="text-[9px] uppercase tracking-widest text-white/40">Cardholder</p>
												<p class="mt-0.5 text-sm font-medium tracking-wide text-white/90 uppercase">
													{cardHolder || 'YOUR NAME'}
												</p>
											</div>
											<div class="text-right">
												<p class="text-[9px] uppercase tracking-widest text-white/40">Expires</p>
												<p class="mt-0.5 font-mono text-sm text-white/90">{cardExpiry || 'MM/YY'}</p>
											</div>
											<!-- Brand badge -->
											<div class="absolute bottom-5 right-5">
												{#if cardBrand === 'visa'}
													<span class="font-serif text-lg font-bold italic text-white/80">VISA</span>
												{:else if cardBrand === 'mastercard'}
													<div class="flex -space-x-2">
														<div class="h-7 w-7 rounded-full bg-red-500/80"></div>
														<div class="h-7 w-7 rounded-full bg-amber-400/80"></div>
													</div>
												{:else if cardBrand === 'amex'}
													<span class="rounded bg-blue-500/70 px-1.5 py-0.5 text-[11px] font-bold text-white">AMEX</span>
												{:else}
													<div class="flex -space-x-2 opacity-30">
														<div class="h-7 w-7 rounded-full bg-white/60"></div>
														<div class="h-7 w-7 rounded-full bg-white/40"></div>
													</div>
												{/if}
											</div>
										</div>
									</div>

									<!-- Fields -->
									<div>
										<label for="cardHolder" class="block text-sm font-medium text-gray-700">
											Cardholder name
										</label>
										<input
											id="cardHolder"
											type="text"
											bind:value={cardHolder}
											autocomplete="cc-name"
											placeholder="As it appears on your card"
											class="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-400"
										/>
									</div>

									<div>
										<label for="cardNumber" class="block text-sm font-medium text-gray-700">
											Card number
										</label>
										<div class="relative mt-1">
											<input
												id="cardNumber"
												type="text"
												inputmode="numeric"
												value={cardNumber}
												oninput={onCardNumberInput}
												autocomplete="cc-number"
												placeholder="0000 0000 0000 0000"
												class="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-mono outline-none transition focus:border-gray-400"
											/>
											{#if cardBrand === 'visa'}
												<span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-serif text-sm font-bold italic text-blue-700">VISA</span>
											{:else if cardBrand === 'mastercard'}
												<div class="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 -space-x-1.5">
													<div class="h-5 w-5 rounded-full bg-red-500/80"></div>
													<div class="h-5 w-5 rounded-full bg-amber-400/80"></div>
												</div>
											{:else if cardBrand === 'amex'}
												<span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">AMEX</span>
											{/if}
										</div>
									</div>

									<div class="grid grid-cols-2 gap-4">
										<div>
											<label for="cardExpiry" class="block text-sm font-medium text-gray-700">
												Expiry date
											</label>
											<input
												id="cardExpiry"
												type="text"
												inputmode="numeric"
												value={cardExpiry}
												oninput={onExpiryInput}
												autocomplete="cc-exp"
												placeholder="MM/YY"
												class="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-mono outline-none transition focus:border-gray-400"
											/>
										</div>
										<div>
											<label for="cardCvv" class="block text-sm font-medium text-gray-700">
												CVV
											</label>
											<div class="relative mt-1">
												<input
													id="cardCvv"
													type={cvvVisible ? 'text' : 'password'}
													bind:value={cardCvv}
													inputmode="numeric"
													maxlength={cardBrand === 'amex' ? 4 : 3}
													autocomplete="cc-csc"
													placeholder={cardBrand === 'amex' ? '••••' : '•••'}
													class="block w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-9 text-sm font-mono outline-none transition focus:border-gray-400"
												/>
												<button
													type="button"
													onclick={() => cvvVisible = !cvvVisible}
													class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600"
													tabindex="-1"
												>
													<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														{#if cvvVisible}
															<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
														{:else}
															<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
															<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
														{/if}
													</svg>
												</button>
											</div>
										</div>
									</div>

									<div class="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
										<svg class="h-4 w-4 shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
										</svg>
										<p class="text-xs text-gray-500">Your card details are encrypted end-to-end and never stored.</p>
									</div>
								</div>

							<!-- ── Apple Pay panel ────────────────────────────────────── -->
							{:else if paymentMethod === 'apple_pay'}
								<div class="mt-4 space-y-4">
									<div class="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-8">
										<div class="flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg">
											<svg class="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
												<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
											</svg>
										</div>
										<p class="text-sm font-semibold text-gray-900">Apple Pay</p>
										<p class="max-w-xs text-center text-xs leading-relaxed text-gray-500">
											Use Face ID or Touch ID to pay instantly. No card details needed — your payment is secured by Apple.
										</p>
									</div>

									<p class="text-center text-[11px] text-gray-400">
										Prototype only — this button places the order without actual Apple Pay.
									</p>
								</div>

							<!-- ── Invoice panel ──────────────────────────────────────── -->
							{:else if paymentMethod === 'invoice'}
								<div class="mt-4 space-y-4">
									<div class="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
										<svg class="mt-0.5 h-4 w-4 shrink-0 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
										</svg>
										<p class="text-xs leading-relaxed text-blue-700">
											<span class="font-semibold">30-day invoice terms.</span> Available for verified business accounts. An invoice will be emailed to you after your order is confirmed.
										</p>
									</div>

									<div>
										<label for="companyName" class="block text-sm font-medium text-gray-700">
											Company name <span class="text-red-400">*</span>
										</label>
										<input
											id="companyName"
											name="companyName"
											type="text"
											autocomplete="organization"
											required={paymentMethod === 'invoice'}
											class="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-400"
											placeholder="Acme Ltd."
										/>
									</div>

									<div>
										<label for="vatNumber" class="block text-sm font-medium text-gray-700">
											VAT number
											<span class="ml-1 font-normal text-gray-400">(optional)</span>
										</label>
										<input
											id="vatNumber"
											name="vatNumber"
											type="text"
											class="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-400"
											placeholder="GB 123 4567 89"
										/>
									</div>

									<div>
										<label for="poReference" class="block text-sm font-medium text-gray-700">
											Purchase order reference
											<span class="ml-1 font-normal text-gray-400">(optional)</span>
										</label>
										<input
											id="poReference"
											name="poReference"
											type="text"
											class="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-400"
											placeholder="PO-2026-0042"
										/>
									</div>

									<div class="flex items-start gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
										<svg class="mt-0.5 h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
										</svg>
										<p class="text-xs text-gray-500">Invoice will be sent to your email address. Payment due within 30 days of invoice date.</p>
									</div>
								</div>
							{/if}
						</fieldset>

						<button
							type="submit"
							disabled={submitting}
							class="w-full rounded-xl py-4 text-sm font-medium text-white transition-all
							{paymentMethod === 'apple_pay'
								? 'bg-black hover:bg-gray-900'
								: 'bg-gray-900 hover:bg-gray-700'}
							disabled:bg-gray-300 disabled:text-gray-400"
						>
							{submitLabel}
						</button>
					</div>

					<!-- Right: sticky order summary -->
					<div class="lg:sticky lg:top-24 h-fit" data-demo="demo-order-summary">
						<div class="rounded-2xl border border-gray-100 bg-gray-50 p-6">
							<h2 class="text-sm font-semibold uppercase tracking-wider text-gray-500">
								Order summary
							</h2>

							<ul class="mt-4 divide-y divide-gray-100">
								{#each cart.items as { product, size, quantity }}
									<li class="flex items-start gap-3 py-3">
										<div class="h-12 w-10 shrink-0 overflow-hidden rounded-md bg-gray-100">
											<img
												src={product.image_url}
												alt={product.name}
												class="h-full w-full object-cover"
											/>
										</div>
										<div class="flex flex-1 justify-between gap-2 text-sm">
											<div>
												<p class="font-medium text-gray-900 leading-snug">{product.name}</p>
												<p class="text-gray-400">{size ? `${size} · ` : ''}× {quantity}</p>
											</div>
											<p class="shrink-0 font-medium text-gray-900">
												€{(product.price * quantity).toFixed(2)}
											</p>
										</div>
									</li>
								{/each}
							</ul>

							<dl class="mt-4 space-y-2 border-t border-gray-200 pt-4">
								<div class="flex justify-between text-sm">
									<dt class="text-gray-600">Subtotal</dt>
									<dd class="font-medium text-gray-900">€{cart.subtotal.toFixed(2)}</dd>
								</div>
								<div class="flex justify-between text-sm">
									<dt class="text-gray-600">Shipping</dt>
									<dd class="font-medium text-gray-900">
										{shipping === 0 ? 'Free' : `€${shipping.toFixed(2)}`}
									</dd>
								</div>
								<div
									class="flex justify-between border-t border-gray-200 pt-3 text-base font-semibold text-gray-900"
								>
									<dt>Total</dt>
									<dd>€{total.toFixed(2)}</dd>
								</div>
							</dl>
							<p class="mt-3 text-xs text-gray-400">
								No hidden costs. Price shown is price paid.
							</p>
						</div>
					</div>
				</div>
			</form>
		{/if}
	</div>
{/if}

<!-- ── Express checkout modal ──────────────────────────────────────────── -->
{#if showExpressModal}
	<div
		transition:fade={{ duration: 180 }}
		class="fixed inset-0 z-70 bg-black/40 backdrop-blur-sm"
		onclick={() => (showExpressModal = false)}
		aria-hidden="true"
	></div>

	<div
		transition:fly={{ y: 32, duration: 250, opacity: 0 }}
		class="fixed inset-x-4 top-1/2 z-70 -translate-y-1/2 rounded-2xl bg-white shadow-2xl sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2"
		role="dialog"
		aria-modal="true"
		aria-label="Express checkout"
	>
		<!-- Header -->
		<div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
			<p class="text-sm font-semibold tracking-[0.15em] text-gray-900">FORM.</p>
			<button
				onclick={() => (showExpressModal = false)}
				class="text-gray-400 transition-colors hover:text-gray-700"
				aria-label="Close"
			>
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/>
				</svg>
			</button>
		</div>

		<div class="px-6 py-6">
			<!-- Selected method badge + total -->
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2.5">
					<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full {EXPRESS_CONFIG[selectedExpressMethod].iconBg}">
						{#if selectedExpressMethod === 'apple_pay'}
							<svg class="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
								<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
							</svg>
						{:else if selectedExpressMethod === 'shop_pay'}
							<span class="text-xs font-bold text-white">shop</span>
						{:else if selectedExpressMethod === 'paypal'}
							<span class="text-xs font-bold text-[#003087]">P<span class="text-[#009cde]">P</span></span>
						{:else}
							<span class="text-sm font-bold leading-none">
								<span class="text-[#4285F4]">G</span><span class="text-[#EA4335]">o</span><span class="text-[#FBBC05]">o</span><span class="text-[#4285F4]">g</span>
							</span>
						{/if}
					</div>
					<div>
						<p class="text-sm font-semibold text-gray-900">{EXPRESS_CONFIG[selectedExpressMethod].label}</p>
						<p class="text-xs text-gray-400">{cart.count} item{cart.count !== 1 ? 's' : ''}</p>
					</div>
				</div>
				<p class="text-xl font-semibold text-gray-900">€{total.toFixed(2)}</p>
			</div>

			<!-- Order items (condensed) -->
			<ul class="mt-5 divide-y divide-gray-100 rounded-xl border border-gray-100">
				{#each cart.items as { product, size, quantity }}
					<li class="flex items-center gap-3 px-4 py-3">
						<div class="h-9 w-8 shrink-0 overflow-hidden rounded-md bg-gray-100">
							<img src={product.image_url} alt={product.name} class="h-full w-full object-cover"/>
						</div>
						<div class="flex flex-1 justify-between gap-2 text-xs">
							<span class="text-gray-700">{product.name}{size ? ` · ${size}` : ''} × {quantity}</span>
							<span class="font-medium text-gray-900">€{(product.price * quantity).toFixed(2)}</span>
						</div>
					</li>
				{/each}
			</ul>

			<!-- Express form -->
			<form
				method="POST"
				action="?/express"
				class="mt-5"
				use:enhance={() => {
					expressSubmitting = true;
					return async ({ result, update }) => {
						if (result.type === 'success') {
							const orderId = (result.data as { orderId?: number })?.orderId;
							cart.clear();
							showExpressModal = false;
							if (orderId) { goto(`/order/${orderId}`); return; }
						}
						await update();
						expressSubmitting = false;
					};
				}}
			>
				<input type="hidden" name="items" value={cartJson} />
				<input type="hidden" name="total" value={total} />

				{#if form?.expressError}
					<p class="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{form.expressError}</p>
				{/if}

				<label for="express-email" class="block text-xs font-medium text-gray-700">
					Email address <span class="text-red-400">*</span>
				</label>
				<input
					id="express-email"
					name="email"
					type="email"
					autocomplete="email"
					required
					bind:value={expressEmail}
					placeholder="you@example.com"
					class="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900"
				/>
				<p class="mt-1 text-[11px] text-gray-400">Order confirmation will be sent here.</p>

				<button
					type="submit"
					disabled={expressSubmitting}
					class="mt-5 w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50 {EXPRESS_CONFIG[selectedExpressMethod].submitBg}"
				>
					{expressSubmitting ? 'Placing order…' : `Pay €${total.toFixed(2)} with ${EXPRESS_CONFIG[selectedExpressMethod].label}`}
				</button>

				<button
					type="button"
					onclick={() => (showExpressModal = false)}
					class="mt-3 block w-full text-center text-xs text-gray-400 hover:text-gray-700"
				>
					Cancel — fill in details manually
				</button>
			</form>
		</div>
	</div>
{/if}
