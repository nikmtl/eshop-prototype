<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import StarRating from '$lib/components/StarRating.svelte';
	import { cart } from '$lib/stores/cart.svelte';
	import { enhance } from '$app/forms';

	const { data, form }: { data: PageData; form: ActionData } = $props();

	let reviewRating = $state(0);
	let hoverRating = $state(0);

	let activeImage = $state(data.product.image_url);
	let quantity = $state(1);
	let added = $state(false);
	// Auto-select when there's only one option (e.g. "One Size")
	let selectedSize = $state(data.product.sizes.length === 1 ? data.product.sizes[0] : '');
	let sizeError = $state(false);
	let showSizeGuide = $state(false);

	let needsSizeSelection = $derived(
		data.product.sizes.length > 1 || (data.product.sizes.length === 1 && data.product.sizes[0] !== 'One Size')
	);

	// Determines which size guide table to show
	let sizeGuideType = $derived(
		data.product.sizes.length === 0 || data.product.sizes[0] === 'One Size'
			? (null as null)
			: data.product.sizes[0].startsWith('UK')
				? ('shoes' as const)
				: data.product.sizes[0].startsWith('W')
					? ('waist' as const)
					: ('clothing' as const)
	);

	function addToCart() {
		if (!selectedSize && data.product.sizes.length > 0) {
			sizeError = true;
			return;
		}
		sizeError = false;
		cart.add(data.product, selectedSize, quantity);
		added = true;
		setTimeout(() => (added = false), 2000);
	}
</script>

<svelte:head>
	<title>{data.product.name} — FORM.</title>
</svelte:head>

<div class="mx-auto max-w-6xl px-6 py-12">
	<!-- Breadcrumb -->
	<nav class="mb-8 flex items-center gap-2 text-xs text-gray-400">
		<a href="/" class="hover:text-gray-700">Shop</a>
		<span>/</span>
		<a href="/?category={data.product.category}" class="hover:text-gray-700">{data.product.category}</a>
		<span>/</span>
		<span class="text-gray-600">{data.product.name}</span>
	</nav>

	<!-- Product -->
	<div class="grid grid-cols-1 gap-12 lg:grid-cols-5">
		<!-- Images -->
		<div class="lg:col-span-3">
			<div class="aspect-3/4 overflow-hidden rounded-2xl bg-gray-50">
				<img
					src={activeImage}
					alt={data.product.name}
					class="h-full w-full object-cover transition-opacity duration-200"
				/>
			</div>
			{#if data.images.length > 1}
				<div class="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
					{#each data.images as img}
						<button
							onclick={() => (activeImage = img)}
							class="shrink-0 aspect-square w-20 overflow-hidden rounded-lg border-2 transition-all
								{activeImage === img ? 'border-gray-900' : 'border-transparent hover:border-gray-300'}"
						>
							<img src={img} alt={data.product.name} class="h-full w-full object-cover" />
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Info -->
		<div class="flex flex-col gap-5 lg:col-span-2 lg:py-2" data-demo="demo-product-info">
			<div>
				<p class="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{data.product.category}</p>
				<h1 class="mt-1.5 text-2xl font-semibold text-gray-900">{data.product.name}</h1>
			</div>

			{#if data.reviews.length > 0}
				<a href="#reviews" class="w-fit">
					<StarRating rating={data.avgRating} count={data.reviews.length} />
				</a>
			{/if}

			<p class="text-3xl font-light text-gray-900">€{data.product.price.toFixed(2)}</p>

			<p class="text-sm leading-relaxed text-gray-600">{data.product.description}</p>

			<!-- Size selector -->
			{#if data.product.sizes.length > 0}
				<div>
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium text-gray-900">
							Size
							{#if !needsSizeSelection}
								<span class="ml-1.5 text-gray-400">— One Size</span>
							{/if}
						</span>
						{#if sizeGuideType}
							<button
								onclick={() => (showSizeGuide = true)}
								class="text-xs text-gray-400 underline underline-offset-2 transition-colors hover:text-gray-700"
							>
								Size guide
							</button>
						{/if}
					</div>

					{#if needsSizeSelection}
						<div class="mt-2.5 flex flex-wrap gap-2">
							{#each data.product.sizes as size}
								<button
									onclick={() => { selectedSize = size; sizeError = false; }}
									class="h-9 min-w-9 rounded-lg border px-3 text-sm font-medium transition-colors
									{selectedSize === size
										? 'border-gray-900 bg-gray-900 text-white'
										: 'border-gray-200 text-gray-700 hover:border-gray-400'}"
								>
									{size}
								</button>
							{/each}
						</div>
						{#if sizeError}
							<p class="mt-2 text-xs text-red-500">Please select a size before adding to cart.</p>
						{/if}
					{/if}
				</div>
			{/if}

			<!-- Stock -->
			{#if data.product.stock > 10}
				<p class="flex items-center gap-1.5 text-sm text-green-600">
					<span class="h-2 w-2 rounded-full bg-green-400"></span> In stock
				</p>
			{:else if data.product.stock > 0}
				<p class="flex items-center gap-1.5 text-sm text-amber-600">
					<span class="h-2 w-2 rounded-full bg-amber-400"></span> Only {data.product.stock} left
				</p>
			{:else}
				<p class="flex items-center gap-1.5 text-sm text-red-500">
					<span class="h-2 w-2 rounded-full bg-red-400"></span> Out of stock
				</p>
			{/if}

			<!-- Quantity + CTA -->
			<div class="space-y-3">
				<div class="flex items-center gap-3">
					<span class="text-sm text-gray-600">Qty</span>
					<div class="flex items-center divide-x divide-gray-200 rounded-lg border border-gray-200">
						<button
							onclick={() => { if (quantity > 1) quantity--; }}
							class="flex h-9 w-9 items-center justify-center text-lg text-gray-500 transition-colors hover:text-gray-900"
							aria-label="Decrease quantity"
						>−</button>
						<span class="flex h-9 w-10 items-center justify-center text-sm font-medium">{quantity}</span>
						<button
							onclick={() => { if (quantity < data.product.stock) quantity++; }}
							class="flex h-9 w-9 items-center justify-center text-lg text-gray-500 transition-colors hover:text-gray-900"
							aria-label="Increase quantity"
						>+</button>
					</div>
				</div>

				<button
					onclick={addToCart}
					disabled={data.product.stock === 0}
					class="w-full rounded-xl py-3.5 text-sm font-medium transition-all
						{added ? 'bg-green-600 text-white' : 'bg-gray-900 text-white hover:bg-gray-700'}
						disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
				>
					{#if added}
						✓ Added to cart
					{:else if data.product.stock === 0}
						Out of stock
					{:else if needsSizeSelection && !selectedSize}
						Select a size
					{:else}
						Add to cart
					{/if}
				</button>
			</div>

			<!-- Trust signals -->
			<div class="rounded-xl border border-gray-100 bg-gray-50 p-4" data-demo="demo-price">
				{#each [
					'Price shown is price paid — no hidden costs',
					'Free returns within 30 days, no questions asked',
					'Free shipping on orders over €100'
				] as signal}
					<p class="flex items-start gap-2 py-1.5 text-sm text-gray-600">
						<svg class="mt-0.5 h-4 w-4 shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
						</svg>
						{signal}
					</p>
				{/each}
			</div>
		</div>
	</div>

	<!-- Reviews -->
	<section id="reviews" class="mt-20 scroll-mt-24" data-demo="demo-reviews">
		<h2 class="text-xl font-semibold text-gray-900">
			Customer reviews
			{#if data.reviews.length > 0}
				<span class="ml-2 text-base font-normal text-gray-400">({data.reviews.length})</span>
			{/if}
		</h2>

		{#if data.reviews.length === 0}
			<p class="mt-4 text-sm text-gray-400">No reviews yet — be the first.</p>
		{:else}
			<div class="mt-4 flex items-center gap-4">
				<p class="text-4xl font-light text-gray-900">{data.avgRating.toFixed(1)}</p>
				<div>
					<StarRating rating={data.avgRating} />
					<p class="mt-1 text-xs text-gray-400">{data.reviews.length} review{data.reviews.length !== 1 ? 's' : ''}</p>
				</div>
			</div>

			<div class="mt-8 divide-y divide-gray-100">
				{#each data.reviews as review}
					<div class="py-6">
						<div class="flex items-start justify-between gap-4">
							<div class="space-y-1">
								<p class="text-sm font-medium text-gray-900">{review.author}</p>
								<StarRating rating={review.rating} />
							</div>
							<time class="shrink-0 text-xs text-gray-400">
								{new Date(review.created_at).toLocaleDateString('en-GB', {
									day: 'numeric', month: 'long', year: 'numeric'
								})}
							</time>
						</div>
						<p class="mt-3 text-sm leading-relaxed text-gray-600">{review.comment}</p>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Write a review -->
		<div class="mt-12 rounded-2xl border border-gray-100 p-6">
			<h3 class="text-base font-semibold text-gray-900">Write a review</h3>

			{#if form?.success}
				<div class="mt-4 flex items-center gap-2 text-sm text-green-700">
					<svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
					</svg>
					Thanks for your review! It will appear above shortly.
				</div>
			{:else}
				{#if form?.errors?.form}
					<p class="mt-3 text-sm text-red-600">{form.errors.form}</p>
				{/if}

				<form method="POST" action="?/review" use:enhance={() => {
					return ({ update }) => { reviewRating = 0; update(); };
				}} class="mt-5 space-y-5">
					<!-- Star picker -->
					<div>
						<label class="block text-xs font-medium text-gray-700">Your rating</label>
						<div
							class="mt-2 flex gap-1"
							role="group"
							aria-label="Star rating"
							onmouseleave={() => (hoverRating = 0)}
						>
							{#each { length: 5 } as _, i}
								<button
									type="button"
									onmouseenter={() => (hoverRating = i + 1)}
									onclick={() => (reviewRating = i + 1)}
									aria-label="{i + 1} star{i + 1 !== 1 ? 's' : ''}"
									class="transition-transform hover:scale-110"
								>
									<svg
										class="h-7 w-7 {(hoverRating || reviewRating) > i ? 'text-amber-400' : 'text-gray-200'} transition-colors"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
									</svg>
								</button>
							{/each}
						</div>
						<input type="hidden" name="rating" value={reviewRating} />
						{#if form?.errors?.rating}
							<p class="mt-1 text-xs text-red-600">{form.errors.rating}</p>
						{/if}
					</div>

					<!-- Name -->
					<div>
						<label for="review-author" class="block text-xs font-medium text-gray-700">Your name</label>
						<input
							id="review-author"
							name="author"
							type="text"
							placeholder="e.g. Alex M."
							value={form?.values?.author ?? ''}
							class="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-gray-900 {form?.errors?.author ? 'border-red-300' : ''}"
						/>
						{#if form?.errors?.author}
							<p class="mt-1 text-xs text-red-600">{form.errors.author}</p>
						{/if}
					</div>

					<!-- Comment -->
					<div>
						<label for="review-comment" class="block text-xs font-medium text-gray-700">Your review</label>
						<textarea
							id="review-comment"
							name="comment"
							rows="4"
							placeholder="What did you think of the fit, quality, and material?"
							class="mt-1.5 w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-gray-900 {form?.errors?.comment ? 'border-red-300' : ''}"
						>{form?.values?.comment ?? ''}</textarea>
						{#if form?.errors?.comment}
							<p class="mt-1 text-xs text-red-600">{form.errors.comment}</p>
						{/if}
					</div>

					<button
						type="submit"
						class="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
					>
						Submit review
					</button>
				</form>
			{/if}
		</div>
	</section>
</div>

<!-- Size guide modal -->
{#if showSizeGuide}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center"
		onclick={() => (showSizeGuide = false)}
	>
		<div
			class="w-full max-w-sm overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
			aria-label="Size guide"
		>
			<div class="px-6 py-5">
				<div class="mb-5 flex items-center justify-between">
					<h2 class="font-semibold text-gray-900">Size guide — {data.product.name}</h2>
					<button
						onclick={() => (showSizeGuide = false)}
						class="rounded-lg p-1 text-gray-400 transition-colors hover:text-gray-700"
						aria-label="Close"
					>
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
						</svg>
					</button>
				</div>

				{#if sizeGuideType === 'clothing'}
					<table class="w-full text-left text-sm">
						<thead>
							<tr class="border-b border-gray-100">
								<th class="py-2 font-semibold text-gray-700">Size</th>
								<th class="py-2 font-semibold text-gray-700">Chest (cm)</th>
								<th class="py-2 font-semibold text-gray-700">Waist (cm)</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-50 text-gray-600">
							{#each [['XS','82–87','65–70'],['S','88–93','71–76'],['M','94–99','77–82'],['L','100–105','83–88'],['XL','106–111','89–94']] as [sz, chest, waist]}
								<tr class="{selectedSize === sz ? 'bg-gray-50 font-medium text-gray-900' : ''}">
									<td class="py-2.5">{sz}</td>
									<td class="py-2.5">{chest}</td>
									<td class="py-2.5">{waist}</td>
								</tr>
							{/each}
						</tbody>
					</table>
					<p class="mt-4 text-xs text-gray-400">Measure around the fullest part of your chest. If between sizes, size up.</p>

				{:else if sizeGuideType === 'waist'}
					<table class="w-full text-left text-sm">
						<thead>
							<tr class="border-b border-gray-100">
								<th class="py-2 font-semibold text-gray-700">Size</th>
								<th class="py-2 font-semibold text-gray-700">Waist (cm)</th>
								<th class="py-2 font-semibold text-gray-700">Hips (cm)</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-50 text-gray-600">
							{#each [['W24','61','86'],['W26','66','91'],['W28','71','96'],['W30','76','101'],['W32','81','106'],['W34','86','111'],['W36','91','116']] as [sz, w, h]}
								<tr class="{selectedSize === sz ? 'bg-gray-50 font-medium text-gray-900' : ''}">
									<td class="py-2.5">{sz}</td>
									<td class="py-2.5">{w}</td>
									<td class="py-2.5">{h}</td>
								</tr>
							{/each}
						</tbody>
					</table>
					<p class="mt-4 text-xs text-gray-400">Measure your natural waist. Size down for a slimmer fit.</p>

				{:else if sizeGuideType === 'shoes'}
					<table class="w-full text-left text-sm">
						<thead>
							<tr class="border-b border-gray-100">
								<th class="py-2 font-semibold text-gray-700">UK</th>
								<th class="py-2 font-semibold text-gray-700">EU</th>
								<th class="py-2 font-semibold text-gray-700">Foot (cm)</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-50 text-gray-600">
							{#each [['UK 5','38','23.5'],['UK 6','39','24.1'],['UK 7','41','25.4'],['UK 8','42','26.0'],['UK 9','43','26.7'],['UK 10','44','27.3'],['UK 11','45','28.0']] as [sz, eu, foot]}
								<tr class="{selectedSize === sz ? 'bg-gray-50 font-medium text-gray-900' : ''}">
									<td class="py-2.5">{sz}</td>
									<td class="py-2.5">{eu}</td>
									<td class="py-2.5">{foot}</td>
								</tr>
							{/each}
						</tbody>
					</table>
					<p class="mt-4 text-xs text-gray-400">These boots run true to size. If between sizes, go half a size up.</p>
				{/if}
			</div>
		</div>
	</div>
{/if}
