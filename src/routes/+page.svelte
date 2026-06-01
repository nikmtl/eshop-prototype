<script lang="ts">
	import type { PageData } from './$types';
	import StarRating from '$lib/components/StarRating.svelte';

	const { data }: { data: PageData } = $props();

	function scrollToProducts() {
		document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
	}

	const trustItems = [
		{
			label: 'Free Returns',
			sub: '30 days, no questions asked',
			icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"/>`
		},
		{
			label: 'No Hidden Costs',
			sub: 'Price shown is price paid',
			icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>`
		},
		{
			label: 'Secure Checkout',
			sub: 'Your data is always protected',
			icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>`
		}
	];
</script>

<svelte:head>
	<title>FORM. — Clothing</title>
</svelte:head>

{#if !data.category}
	<!-- ── LANDING MODE ─────────────────────────────────────────────────────── -->

	<!-- Hero -->
	<section class="relative grid grid-cols-1 overflow-hidden lg:min-h-[85vh] lg:grid-cols-2">
		<!-- Text side -->
		<div class="flex flex-col justify-center px-6 py-10 sm:py-14 lg:px-16 lg:py-20 xl:px-24">
			<p class="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-400">
				New Drop — SS26
			</p>
			<h1 class="mt-4 text-4xl font-light leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
				Built to<br /><em class="not-italic font-semibold">last.</em>
			</h1>
			<p class="mt-5 max-w-xs text-base leading-relaxed text-gray-500">
				Heavy cotton, clean silhouettes, genderless cuts. Basics that earn their place in your rotation.
			</p>
			<div class="mt-8 flex items-center gap-4">
				<button
					onclick={scrollToProducts}
					class="rounded-xl bg-gray-900 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
				>
					Shop now
				</button>
				<a href="/?category=Hoodies" class="text-sm font-medium text-gray-500 underline-offset-2 hover:underline hover:text-gray-900 transition-colors">
					New hoodies →
				</a>
			</div>
		</div>

		<!-- Image side -->
		<div class="relative order-first h-56 sm:h-72 lg:order-last lg:h-auto">
			<img
				src="https://straight-outta-cotton.com/cdn/shop/files/oversize-hoodie-black-straight-outta-cotton-1378031.jpg"
				alt="Oversize Hoodie – Black"
				class="h-full w-full object-cover object-top"
			/>
			<div class="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-white/30 lg:bg-linear-to-l lg:to-white/10"></div>
		</div>
	</section>

	<!-- Trust bar -->
	<section class="border-y border-gray-100 bg-gray-50">
		<div class="mx-auto grid max-w-4xl grid-cols-1 divide-y divide-gray-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
			{#each trustItems as item}
				<div class="flex items-center gap-4 px-8 py-6">
					<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
						<svg class="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							{@html item.icon}
						</svg>
					</div>
					<div>
						<p class="text-sm font-semibold text-gray-900">{item.label}</p>
						<p class="text-xs text-gray-500">{item.sub}</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Featured products -->
	<section id="products" class="mx-auto max-w-6xl scroll-mt-32 px-6 py-16">
		<div class="mb-8">
			<h2 class="text-2xl font-semibold text-gray-900">Top picks</h2>
			<p class="mt-1 text-sm text-gray-500">Our highest-rated pieces this season</p>
		</div>

		<div class="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4">
			{#each data.featured as product}
				<a href="/products/{product.id}" class="group">
					<div class="aspect-3/4 overflow-hidden rounded-xl bg-gray-50">
						<img
							src={product.image_url}
							alt={product.name}
							class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
							loading="lazy"
						/>
					</div>
					<div class="mt-3 space-y-1.5">
						<p class="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{product.category}</p>
						<p class="text-sm font-medium text-gray-900 group-hover:underline">{product.name}</p>
						{#if product.reviewCount > 0}
							<StarRating rating={product.avgRating} count={product.reviewCount} />
						{/if}
						<p class="text-base font-semibold text-gray-900">€{product.price.toFixed(2)}</p>
					</div>
				</a>
			{/each}
		</div>
	</section>

	<!-- Category cards -->
	<section class="mx-auto max-w-6xl px-6 pb-20">
		<div class="mb-8">
			<h2 class="text-2xl font-semibold text-gray-900">Shop by category</h2>
			<p class="mt-1 text-sm text-gray-500">Find exactly what you're looking for</p>
		</div>

		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
			{#each data.categories as cat}
				{@const img = data.categoryImages[cat]}
				<a
					href="/?category={cat}"
					class="group relative aspect-3/4 overflow-hidden rounded-2xl bg-gray-100"
				>
					{#if img}
						<img
							src={img}
							alt={cat}
							class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
							loading="lazy"
						/>
					{/if}
					<div class="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent transition-opacity duration-300 group-hover:from-black/70"></div>
					<div class="absolute bottom-0 left-0 right-0 p-4">
						<p class="text-sm font-semibold text-white">{cat}</p>
						<p class="mt-0.5 text-xs text-white/70 transition-all group-hover:text-white">
							Explore →
						</p>
					</div>
				</a>
			{/each}
		</div>
	</section>

	<!-- Environmental notice -->
	<section class="mx-auto max-w-6xl px-6 pb-24" data-demo="demo-environmental">
		<div class="rounded-2xl bg-[#f4f7f2] px-8 py-10">
			<div class="flex items-start gap-3">
				<svg class="mt-0.5 h-5 w-5 shrink-0 text-[#4a7c59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 004 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
				</svg>
				<div>
					<p class="text-sm font-semibold text-[#2e5240]">Our commitment to the planet</p>
					<p class="mt-1 text-xs leading-relaxed text-[#4a7c59]">
						FORM. is a university research prototype — but the values are real. Every design decision we study considers material longevity, supply-chain transparency, and the true cost of fast fashion.
					</p>
				</div>
			</div>

			<div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
				<div class="flex gap-3">
					<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/70">
						<svg class="h-4 w-4 text-[#4a7c59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/>
						</svg>
					</div>
					<div>
						<p class="text-xs font-semibold text-[#2e5240]">Recycled packaging</p>
						<p class="mt-0.5 text-xs text-[#4a7c59]">All shipments use 100% recycled or FSC-certified materials. No unnecessary filler.</p>
					</div>
				</div>

				<div class="flex gap-3">
					<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/70">
						<svg class="h-4 w-4 text-[#4a7c59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
						</svg>
					</div>
					<div>
						<p class="text-xs font-semibold text-[#2e5240]">European manufacturing</p>
						<p class="mt-0.5 text-xs text-[#4a7c59]">Shorter supply chains mean lower emissions and full visibility into working conditions.</p>
					</div>
				</div>

				<div class="flex gap-3">
					<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/70">
						<svg class="h-4 w-4 text-[#4a7c59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
						</svg>
					</div>
					<div>
						<p class="text-xs font-semibold text-[#2e5240]">Built to last</p>
						<p class="mt-0.5 text-xs text-[#4a7c59]">We design for longevity, not trends. Fewer pieces, better made — the most sustainable item is one you keep.</p>
					</div>
				</div>
			</div>
		</div>
	</section>

{:else}
	<!-- ── CATEGORY BROWSE MODE ─────────────────────────────────────────────── -->
	<div class="mx-auto max-w-6xl px-6 py-12">
		<div class="mb-8">
			<h1 class="text-3xl font-light text-gray-900">{data.category}</h1>
			<p class="mt-1 text-sm text-gray-500">
				{data.products.length} item{data.products.length !== 1 ? 's' : ''}
			</p>
		</div>

		{#if data.products.length === 0}
			<p class="text-gray-400">No products in this category yet.</p>
		{:else}
			<div class="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
				{#each data.products as product}
					<a href="/products/{product.id}" class="group">
						<div class="aspect-3/4 overflow-hidden rounded-xl bg-gray-50">
							<img
								src={product.image_url}
								alt={product.name}
								class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
								loading="lazy"
							/>
						</div>
						<div class="mt-3 space-y-1.5">
							<p class="text-sm font-medium text-gray-900 group-hover:underline">{product.name}</p>
							{#if product.reviewCount > 0}
								<StarRating rating={product.avgRating} count={product.reviewCount} />
							{/if}
							<p class="text-base font-semibold text-gray-900">€{product.price.toFixed(2)}</p>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
{/if}
