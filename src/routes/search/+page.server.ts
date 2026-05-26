import type { PageServerLoad } from './$types';
import { supabase } from '$lib/supabase';

export const load: PageServerLoad = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim() ?? '';
	const categories = url.searchParams.getAll('category');
	const maxPrice = url.searchParams.get('maxPrice');
	const minPrice = url.searchParams.get('minPrice');
	const sort = url.searchParams.get('sort') ?? '';
	const inStockOnly = url.searchParams.get('inStock') === 'true';

	const filters = { categories, maxPrice, minPrice, sort, inStockOnly };

	if (!q) return { query: '', products: [], filters };

	let query = supabase
		.from('products')
		.select('*')
		.or(`name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`);

	if (categories.length > 0) query = query.in('category', categories);
	if (minPrice) query = query.gte('price', Number(minPrice));
	if (maxPrice) query = query.lte('price', Number(maxPrice));
	if (inStockOnly) query = query.gt('stock', 0);

	if (sort === 'price_asc') query = query.order('price', { ascending: true });
	else if (sort === 'price_desc') query = query.order('price', { ascending: false });
	else query = query.order('name');

	const [{ data: products }, { data: reviews }] = await Promise.all([
		query,
		supabase.from('reviews').select('product_id, rating')
	]);

	const ratingMap: Record<number, { sum: number; count: number }> = {};
	for (const r of reviews ?? []) {
		if (!ratingMap[r.product_id]) ratingMap[r.product_id] = { sum: 0, count: 0 };
		ratingMap[r.product_id].sum += r.rating;
		ratingMap[r.product_id].count++;
	}

	let result = (products ?? []).map((p) => ({
		...p,
		avgRating: ratingMap[p.id] ? ratingMap[p.id].sum / ratingMap[p.id].count : 0,
		reviewCount: ratingMap[p.id]?.count ?? 0
	}));

	if (sort === 'rating') {
		result = result.sort((a, b) => b.avgRating - a.avgRating);
	}

	return { query: q, products: result, filters };
};
