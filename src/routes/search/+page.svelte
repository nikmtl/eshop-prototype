<script lang="ts">
	import type { PageData } from './$types';
	import StarRating from '$lib/components/StarRating.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	const { data }: { data: PageData } = $props();

	const CATEGORIES = ['Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories'];
	const PRICE_PRESETS = [
		{ label: 'Any price', min: '', max: '' },
		{ label: 'Under €60', min: '', max: '60' },
		{ label: '€60–€100', min: '60', max: '100' },
		{ label: '€100–€150', min: '100', max: '150' },
		{ label: 'Over €150', min: '150', max: '' }
	];
	const SORT_OPTIONS = [
		{ value: '', label: 'Relevance' },
		{ value: 'price_asc', label: 'Price: low to high' },
		{ value: 'price_desc', label: 'Price: high to low' },
		{ value: 'rating', label: 'Highest rated' }
	];

	let showMobileFilters = $state(false);

	// Derive current filter state directly from URL
	let activeCategories = $derived($page.url.searchParams.getAll('category'));
	let activeSort = $derived($page.url.searchParams.get('sort') ?? '');
	let activeMinPrice = $derived($page.url.searchParams.get('minPrice') ?? '');
	let activeMaxPrice = $derived($page.url.searchParams.get('maxPrice') ?? '');
	let activeInStock = $derived($page.url.searchParams.get('inStock') === 'true');

	let activePricePreset = $derived(
		PRICE_PRESETS.find((p) => p.min === activeMinPrice && p.max === activeMaxPrice) ?? PRICE_PRESETS[0]
	);

	let activeFilterCount = $derived(
		activeCategories.length +
		(activePricePreset !== PRICE_PRESETS[0] ? 1 : 0) +
		(activeInStock ? 1 : 0)
	);

	function navigate(params: Record<string, string | string[] | null>) {
		const next = new URLSearchParams($page.url.searchParams);
		for (const [k, v] of Object.entries(params)) {
			next.delete(k);
			if (v !== null) {
				if (Array.isArray(v)) v.forEach((val) => next.append(k, val));
				else next.set(k, v);
			}
		}
		goto(`/search?${next}`, { replaceState: true, noScroll: true, keepFocus: true });
	}

	function toggleCategory(cat: string) {
		const next = activeCategories.includes(cat)
			? activeCategories.filter((c) => c !== cat)
			: [...activeCategories, cat];
		navigate({ category: next.length ? next : null });
	}

	function setPricePreset(preset: (typeof PRICE_PRESETS)[number]) {
		navigate({ minPrice: preset.min || null, maxPrice: preset.max || null });
	}

	function setSort(value: string) {
		navigate({ sort: value || null });
	}

	function toggleInStock() {
		navigate({ inStock: activeInStock ? null : 'true' });
	}

	function clearFilters() {
		navigate({ category: null, minPrice: null, maxPrice: null, inStock: null });
	}
</script>

<svelte:head>
	<title>{data.query ? `"${data.query}" — Search` : 'Search'} — FORM.</title>
</svelte:head>

<div class="mx-auto max-w-6xl px-6 py-12">
	{#if !data.query}
		<p class="text-gray-500">Enter a search term to find products.</p>
	{:else if data.products.length === 0 && activeFilterCount === 0}
		<!-- No results at all -->
		<div class="py-20 text-center">
			<svg class="mx-auto h-12 w-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
			</svg>
			<h1 class="mt-5 text-xl font-semibold text-gray-900">
				No results for "<span class="italic">{data.query}</span>"
			</h1>
			<p class="mt-2 text-sm text-gray-500">Check the spelling, try a broader term, or explore a category.</p>
			<div class="mt-8 flex flex-wrap justify-center gap-2">
				{#each CATEGORIES as cat}
					<a href="/?category={cat}" class="rounded-full border border-gray-200 px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-900">
						{cat}
					</a>
				{/each}
			</div>
			<a href="/" class="mt-6 inline-block text-sm text-gray-400 underline hover:text-gray-700">Browse all products</a>
		</div>
	{:else}
		<div class="flex gap-10">
			<!-- ── Filter sidebar ─────────────────────────────────────── -->
			<aside class="hidden w-48 shrink-0 lg:block" data-demo="demo-filters">
				<div class="sticky top-24 space-y-7">
					<div class="flex items-center justify-between">
						<p class="text-xs font-semibold uppercase tracking-widest text-gray-400">Filters</p>
						{#if activeFilterCount > 0}
							<button onclick={clearFilters} class="text-xs text-gray-400 underline hover:text-gray-700">Clear all</button>
						{/if}
					</div>

					<!-- Categories -->
					<div>
						<p class="mb-3 text-xs font-medium text-gray-600">Category</p>
						<div class="space-y-2">
							{#each CATEGORIES as cat}
								<label class="flex cursor-pointer items-center gap-2.5">
									<input
										type="checkbox"
										checked={activeCategories.includes(cat)}
										onchange={() => toggleCategory(cat)}
										class="h-4 w-4 cursor-pointer rounded border-gray-300 text-gray-900 accent-gray-900"
									/>
									<span class="text-sm text-gray-700 {activeCategories.includes(cat) ? 'font-medium' : ''}">{cat}</span>
								</label>
							{/each}
						</div>
					</div>

					<!-- Price -->
					<div>
						<p class="mb-3 text-xs font-medium text-gray-600">Price</p>
						<div class="space-y-1.5">
							{#each PRICE_PRESETS as preset}
								<button
									onclick={() => setPricePreset(preset)}
									class="block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors
										{activePricePreset === preset ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}"
								>
									{preset.label}
								</button>
							{/each}
						</div>
					</div>

					<!-- In stock -->
					<div>
						<label class="flex cursor-pointer items-center gap-2.5">
							<input
								type="checkbox"
								checked={activeInStock}
								onchange={toggleInStock}
								class="h-4 w-4 cursor-pointer rounded border-gray-300 accent-gray-900"
							/>
							<span class="text-sm text-gray-700 {activeInStock ? 'font-medium' : ''}">In stock only</span>
						</label>
					</div>
				</div>
			</aside>

			<!-- ── Results ────────────────────────────────────────────── -->
			<div class="flex-1 min-w-0">
				<!-- Header row -->
				<div class="mb-6 flex flex-wrap items-center justify-between gap-3">
					<div>
						<h1 class="text-xl font-semibold text-gray-900">
							"<span class="font-light italic">{data.query}</span>"
						</h1>
						<p class="mt-0.5 text-sm text-gray-500">
							{data.products.length} product{data.products.length !== 1 ? 's' : ''}
							{activeFilterCount > 0 ? ' (filtered)' : ''}
						</p>
					</div>

					<div class="flex items-center gap-3">
						<!-- Mobile filter toggle -->
						<button
							onclick={() => (showMobileFilters = !showMobileFilters)}
							class="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-gray-400 lg:hidden"
						>
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
							</svg>
							Filters
							{#if activeFilterCount > 0}
								<span class="flex h-4 w-4 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white">{activeFilterCount}</span>
							{/if}
						</button>

						<!-- Sort -->
						<select
							value={activeSort}
							onchange={(e) => setSort((e.currentTarget as HTMLSelectElement).value)}
							class="rounded-xl border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 outline-none focus:border-gray-400"
						>
							{#each SORT_OPTIONS as opt}
								<option value={opt.value}>{opt.label}</option>
							{/each}
						</select>
					</div>
				</div>

				<!-- Mobile filter panel -->
				{#if showMobileFilters}
					<div class="mb-6 rounded-2xl border border-gray-100 p-5 lg:hidden">
						<div class="grid grid-cols-2 gap-6">
							<!-- Categories -->
							<div>
								<p class="mb-3 text-xs font-medium text-gray-600">Category</p>
								<div class="space-y-2">
									{#each CATEGORIES as cat}
										<label class="flex cursor-pointer items-center gap-2">
											<input
												type="checkbox"
												checked={activeCategories.includes(cat)}
												onchange={() => toggleCategory(cat)}
												class="h-4 w-4 cursor-pointer accent-gray-900"
											/>
											<span class="text-sm text-gray-700">{cat}</span>
										</label>
									{/each}
								</div>
							</div>

							<!-- Price + In stock -->
							<div class="space-y-6">
								<div>
									<p class="mb-3 text-xs font-medium text-gray-600">Price</p>
									<div class="space-y-1.5">
										{#each PRICE_PRESETS as preset}
											<button
												onclick={() => setPricePreset(preset)}
												class="block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors
													{activePricePreset === preset ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}"
											>
												{preset.label}
											</button>
										{/each}
									</div>
								</div>
								<label class="flex cursor-pointer items-center gap-2">
									<input type="checkbox" checked={activeInStock} onchange={toggleInStock} class="h-4 w-4 cursor-pointer accent-gray-900" />
									<span class="text-sm text-gray-700">In stock only</span>
								</label>
							</div>
						</div>

						{#if activeFilterCount > 0}
							<button onclick={clearFilters} class="mt-5 text-xs text-gray-400 underline hover:text-gray-700">Clear all filters</button>
						{/if}
					</div>
				{/if}

				<!-- Active filter chips -->
				{#if activeFilterCount > 0}
					<div class="mb-5 flex flex-wrap gap-2">
						{#each activeCategories as cat}
							<button
								onclick={() => toggleCategory(cat)}
								class="flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white"
							>
								{cat}
								<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
								</svg>
							</button>
						{/each}
						{#if activePricePreset !== PRICE_PRESETS[0]}
							<button
								onclick={() => setPricePreset(PRICE_PRESETS[0])}
								class="flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white"
							>
								{activePricePreset.label}
								<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
								</svg>
							</button>
						{/if}
						{#if activeInStock}
							<button
								onclick={toggleInStock}
								class="flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white"
							>
								In stock
								<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
								</svg>
							</button>
						{/if}
					</div>
				{/if}

				<!-- Products or empty filtered state -->
				{#if data.products.length === 0}
					<div class="py-16 text-center">
						<p class="text-sm text-gray-500">No products match your current filters.</p>
						<button onclick={clearFilters} class="mt-3 text-sm font-medium text-gray-900 underline">
							Clear filters
						</button>
					</div>
				{:else}
					<div class="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
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
				{/if}
			</div>
		</div>
	{/if}
</div>
