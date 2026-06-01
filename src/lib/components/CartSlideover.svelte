<script lang="ts">
	import { cart } from '$lib/stores/cart.svelte';
	import { fly, fade } from 'svelte/transition';

	const FREE_SHIPPING_THRESHOLD = 100;
	const FLAT_SHIPPING = 4.99;

	let shipping = $derived(cart.subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING);
	let total = $derived(cart.subtotal + shipping);
	let toFreeShipping = $derived(
		cart.subtotal < FREE_SHIPPING_THRESHOLD ? FREE_SHIPPING_THRESHOLD - cart.subtotal : 0
	);
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && cart.close()} />

{#if cart.isOpen}
	<div
		transition:fade={{ duration: 200 }}
		class="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm"
		onclick={() => cart.close()}
		aria-hidden="true"
	></div>

	<div
		transition:fly={{ x: 384, duration: 300, opacity: 1 }}
		class="fixed inset-y-0 right-0 z-[60] flex w-full sm:max-w-sm flex-col bg-white shadow-2xl"
		role="dialog"
		aria-label="Shopping cart"
		aria-modal="true"
	>
		<!-- Header -->
		<div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
			<h2 class="text-base font-semibold text-gray-900">
				Your cart
				{#if cart.count > 0}
					<span class="text-sm font-normal text-gray-400">({cart.count})</span>
				{/if}
			</h2>
			<button
				onclick={() => cart.close()}
				class="text-gray-400 transition-colors hover:text-gray-900"
				aria-label="Close cart"
			>
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		{#if cart.items.length === 0}
			<div class="flex flex-1 flex-col items-center justify-center gap-3 px-6">
				<svg class="h-12 w-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
				</svg>
				<p class="text-sm text-gray-500">Your cart is empty.</p>
				<button onclick={() => cart.close()} class="text-sm font-medium text-gray-900 underline">
					Continue shopping
				</button>
			</div>
		{:else}
			<!-- Free shipping progress -->
			{#if toFreeShipping > 0}
				<div class="border-b border-gray-100 px-6 py-3">
					<p class="text-xs text-gray-600">
						Add <span class="font-semibold">€{toFreeShipping.toFixed(2)}</span> more for free shipping.
					</p>
					<div class="mt-2 h-1 w-full overflow-hidden rounded-full bg-gray-200">
						<div
							class="h-full rounded-full bg-gray-900 transition-all"
							style="width: {Math.min((cart.subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%"
						></div>
					</div>
				</div>
			{/if}

			<!-- Items -->
			<div class="flex-1 overflow-y-auto px-6">
				<div class="divide-y divide-gray-100">
					{#each cart.items as { product, size, quantity }}
						<div class="flex gap-4 py-4">
							<a
								href="/products/{product.id}"
								onclick={() => cart.close()}
								class="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-50"
							>
								<img src={product.image_url} alt={product.name} class="h-full w-full object-cover" />
							</a>

							<div class="flex flex-1 flex-col justify-between">
								<div class="flex items-start justify-between gap-2">
									<div>
										<p class="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
											{product.category}
										</p>
										<a
											href="/products/{product.id}"
											onclick={() => cart.close()}
											class="text-sm font-medium text-gray-900 hover:underline"
										>
											{product.name}
										</a>
										{#if size}
											<p class="mt-0.5 text-xs text-gray-400">Size: {size}</p>
										{/if}
									</div>
									<p class="shrink-0 text-sm font-semibold text-gray-900">
										€{(product.price * quantity).toFixed(2)}
									</p>
								</div>

								<div class="flex items-center justify-between">
									<div class="flex items-center divide-x divide-gray-200 rounded-lg border border-gray-200">
										<button
											onclick={() => cart.updateQuantity(product.id, size, quantity - 1)}
											class="flex h-7 w-7 items-center justify-center text-gray-400 transition-colors hover:text-gray-900"
											aria-label="Decrease quantity"
										>−</button>
										<span class="flex h-7 w-7 items-center justify-center text-sm">{quantity}</span>
										<button
											onclick={() => cart.updateQuantity(product.id, size, quantity + 1)}
											class="flex h-7 w-7 items-center justify-center text-gray-400 transition-colors hover:text-gray-900"
											aria-label="Increase quantity"
										>+</button>
									</div>
									<button
										onclick={() => cart.remove(product.id, size)}
										class="text-xs text-gray-400 transition-colors hover:text-red-500"
									>Remove</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Footer summary -->
			<div class="border-t border-gray-100 px-6 py-5">
				<dl class="space-y-2">
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
					<div class="flex justify-between border-t border-gray-200 pt-2 text-base font-semibold text-gray-900">
						<dt>Total</dt>
						<dd>€{total.toFixed(2)}</dd>
					</div>
				</dl>
				<a
					href="/checkout"
					onclick={() => cart.close()}
					class="mt-4 block w-full rounded-xl bg-gray-900 py-3.5 text-center text-sm font-medium text-white transition-colors hover:bg-gray-700"
				>
					Continue to checkout →
				</a>
				<button
					onclick={() => cart.close()}
					class="mt-3 block w-full text-center text-xs text-gray-400 hover:text-gray-600"
				>
					← Continue shopping
				</button>
			</div>
		{/if}
	</div>
{/if}
