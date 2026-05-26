import type { PageServerLoad } from './$types';
import { supabase } from '$lib/supabase';

export const load: PageServerLoad = async ({ url }) => {
	const category = url.searchParams.get('category');

	const [{ data: products }, { data: reviews }] = await Promise.all([
		supabase.from('products').select('*').order('id'),
		supabase.from('reviews').select('product_id, rating')
	]);

	const ratingMap: Record<number, { sum: number; count: number }> = {};
	for (const r of reviews ?? []) {
		if (!ratingMap[r.product_id]) ratingMap[r.product_id] = { sum: 0, count: 0 };
		ratingMap[r.product_id].sum += r.rating;
		ratingMap[r.product_id].count++;
	}

	const enriched = (products ?? []).map((p) => ({
		...p,
		avgRating: ratingMap[p.id] ? ratingMap[p.id].sum / ratingMap[p.id].count : 0,
		reviewCount: ratingMap[p.id]?.count ?? 0
	}));

	// Top 4 by rating for the featured section
	const featured = [...enriched].sort((a, b) => b.avgRating - a.avgRating).slice(0, 4);

	const CATEGORIES = ['Shirts', 'Hoodies', 'Bottoms', 'Jackets'];

	// Hardcoded editorial images for each category card (straight-outta-cotton.com, used with permission)
	const categoryImages: Record<string, string> = {
		Shirts:  'https://straight-outta-cotton.com/cdn/shop/files/heavy-oversize-tee-black-schwarz-straight-outta-cotton-9773804.jpg',
		Hoodies: 'https://straight-outta-cotton.com/cdn/shop/files/oversize-hoodie-melange-grey-straight-outta-cotton-9099801.jpg',
		Bottoms: 'https://straight-outta-cotton.com/cdn/shop/files/basic-jogger-grey-melange-straight-outta-cotton-4873891.jpg',
		Jackets: 'https://straight-outta-cotton.com/cdn/shop/files/puffer-jacket-black-straight-outta-cotton-2768746.jpg',
	};

	return {
		products: category ? enriched.filter((p) => p.category === category) : enriched,
		featured,
		categoryImages,
		categories: CATEGORIES,
		category
	};
};
