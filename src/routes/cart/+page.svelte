<script lang="ts">
	import { cart } from '$lib/stores/cart.svelte';

	const FREE_SHIPPING_THRESHOLD = 100;
	const FLAT_SHIPPING = 4.99;

	let shipping = $derived(cart.subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING);
	let total = $derived(cart.subtotal + shipping);
	let toFreeShipping = $derived(
		cart.subtotal < FREE_SHIPPING_THRESHOLD
			? FREE_SHIPPING_THRESHOLD - cart.subtotal
			: 0
	);
</script>

<svelte:head>
	<title>Cart — FORM.</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-6 py-16">
	<h1 class="text-2xl font-semibold text-gray-900">
		Your cart
		{#if cart.count > 0}
			<span class="text-lg font-normal text-gray-400">({cart.count} item{cart.count !== 1 ? 's' : ''})</span>
		{/if}
	</h1>

	{#if cart.items.length === 0}
		<div class="mt-20 text-center">
			<svg
				class="mx-auto h-12 w-12 text-gray-200"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1"
					d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
				/>
			</svg>
			<p class="mt-4 text-gray-500">Your cart is empty.</p>
			<a href="/" class="mt-3 inline-block text-sm font-medium text-gray-900 underline">
				Browse products
			</a>
		</div>
	{:else}
		<!-- Free shipping progress -->
		{#if toFreeShipping > 0}
			<div class="mt-6 rounded-xl bg-gray-50 p-4" data-demo="demo-free-shipping">
				<p class="text-sm text-gray-600">
					Add <span class="font-semibold">€{toFreeShipping.toFixed(2)}</span> more for free shipping.
				</p>
				<div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
					<div
						class="h-full rounded-full bg-gray-900 transition-all"
						style="width: {Math.min((cart.subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%"
					></div>
				</div>
			</div>
		{/if}

		<!-- Items -->
		<div class="mt-6 divide-y divide-gray-100">
			{#each cart.items as { product, size, quantity }}
				<div class="flex gap-4 py-5">
					<a
						href="/products/{product.id}"
						class="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-50"
					>
						<img src={product.image_url} alt={product.name} class="h-full w-full object-cover" />
					</a>

					<div class="flex flex-1 flex-col justify-between">
						<div class="flex items-start justify-between gap-4">
							<div>
								<p class="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
									{product.category}
								</p>
								<a
									href="/products/{product.id}"
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
							<div
								class="flex items-center divide-x divide-gray-200 rounded-lg border border-gray-200"
							>
								<button
									onclick={() => cart.updateQuantity(product.id, size, quantity - 1)}
									class="flex h-8 w-8 items-center justify-center text-gray-400 transition-colors hover:text-gray-900"
									aria-label="Decrease quantity"
								>
									−
								</button>
								<span class="flex h-8 w-8 items-center justify-center text-sm">{quantity}</span>
								<button
									onclick={() => cart.updateQuantity(product.id, size, quantity + 1)}
									class="flex h-8 w-8 items-center justify-center text-gray-400 transition-colors hover:text-gray-900"
									aria-label="Increase quantity"
								>
									+
								</button>
							</div>
							<button
								onclick={() => cart.remove(product.id, size)}
								class="text-xs text-gray-400 transition-colors hover:text-red-500"
							>
								Remove
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Order summary -->
		<div class="mt-8 rounded-2xl border border-gray-100 bg-gray-50 p-6">
			<h2 class="text-sm font-semibold uppercase tracking-wider text-gray-500">Order summary</h2>
			<dl class="mt-4 space-y-3">
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
				Price shown is price paid — VAT included, no surprise fees.
			</p>
			<a
				href="/checkout"
				class="mt-4 block w-full rounded-xl bg-gray-900 py-3.5 text-center text-sm font-medium text-white transition-colors hover:bg-gray-700"
			>
				Continue to checkout →
			</a>
			<a href="/" class="mt-3 block text-center text-xs text-gray-400 hover:text-gray-600">
				← Continue shopping
			</a>
		</div>
	{/if}
</div>
