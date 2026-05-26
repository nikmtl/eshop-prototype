<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';

	type Result = { id: number; name: string; category: string; price: number; image_url: string };

	let query = $state('');
	let results = $state<Result[]>([]);
	let noResults = $state(false);
	let loading = $state(false);
	let open = $state(false);
	let debounce: ReturnType<typeof setTimeout>;

	function onInput() {
		clearTimeout(debounce);
		const q = query.trim();
		if (q.length < 2) {
			results = [];
			noResults = false;
			open = false;
			return;
		}
		loading = true;
		debounce = setTimeout(async () => {
			const { data } = await supabase
				.from('products')
				.select('id, name, category, price, image_url')
				.or(`name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`)
				.limit(5);
			results = data ?? [];
			noResults = results.length === 0;
			open = true;
			loading = false;
		}, 280);
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') submit();
		if (e.key === 'Escape') { open = false; (e.target as HTMLElement).blur(); }
	}

	function submit() {
		const q = query.trim();
		if (!q) return;
		open = false;
		goto(`/search?q=${encodeURIComponent(q)}`);
	}

	function pick(id: number) {
		open = false;
		query = '';
		goto(`/products/${id}`);
	}
</script>

<div class="relative w-full">
	<!-- Input -->
	<div
		class="flex items-center gap-2 rounded-3xl border border-gray-200 bg-gray-50 px-3  transition-colors focus-within:border-gray-400 focus-within:bg-white"
	>
		<svg class="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
		</svg>
		<input
			type="search"
			bind:value={query}
			oninput={onInput}
			onkeydown={onKeydown}
			onfocus={() => { if (results.length > 0 || noResults) open = true; }}
			onblur={() => setTimeout(() => { open = false; }, 160)}
			placeholder="Search products…"
			autocomplete="off"
			class="flex-1 bg-transparent text-sm border-none outline-none ring-0 focus:outline-none focus:ring-0 placeholder:text-gray-400 [&::-webkit-search-cancel-button]:hidden"
		/>
		{#if loading}
			<div class="h-3.5 w-3.5 shrink-0 animate-spin rounded-full"></div>
		{:else if query}
			<button
				tabindex="-1"
				onclick={() => { query = ''; results = []; noResults = false; open = false; }}
				class="text-gray-300 transition-colors hover:text-gray-600"
				aria-label="Clear search"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
				</svg>
			</button>
		{/if}
	</div>

	<!-- Dropdown -->
	{#if open}
		<div class="absolute top-full left-0 right-0 z-50 mt-1.5 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
			{#if results.length > 0}
				<ul role="listbox">
					{#each results as r}
						<li role="option" aria-selected="false">
							<button
								onmousedown={() => pick(r.id)}
								class="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
							>
								<div class="h-10 w-8 shrink-0 overflow-hidden rounded-md bg-gray-100">
									<img src={r.image_url} alt="" class="h-full w-full object-cover" loading="lazy"/>
								</div>
								<div class="min-w-0 flex-1">
									<p class="truncate text-sm font-medium text-gray-900">{r.name}</p>
									<p class="text-xs text-gray-400">{r.category} · €{r.price.toFixed(2)}</p>
								</div>
								<svg class="h-3.5 w-3.5 shrink-0 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
								</svg>
							</button>
						</li>
					{/each}
				</ul>
				<div class="border-t border-gray-100 px-4 py-2.5">
					<button
						onmousedown={submit}
						class="text-xs text-gray-500 transition-colors hover:text-gray-900"
					>
						See all results for "<span class="font-medium">{query.trim()}</span>" →
					</button>
				</div>
			{:else if noResults}
				<div class="px-5 py-8 text-center">
					<p class="text-sm font-medium text-gray-700">No products found for "{query.trim()}"</p>
					<p class="mt-1 text-xs text-gray-400">Try a broader term, or browse by category below.</p>
				</div>
			{/if}
		</div>
	{/if}
</div>
