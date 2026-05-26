import type { PageServerLoad, Actions } from './$types';
import { supabase } from '$lib/supabase';
import { error, fail } from '@sveltejs/kit';

const B = 'https://straight-outta-cotton.com/cdn/shop/files/';

// Extra images per product, keyed by primary image_url (straight-outta-cotton.com, used with permission)
const EXTRA_IMAGES: Record<string, string[]> = {
  [B+'heavy-oversize-tee-black-schwarz-straight-outta-cotton-9773804.jpg']: [
    B+'heavy-oversize-tee-black-schwarz-straight-outta-cotton-1408672.jpg',
    B+'heavy-oversize-tee-black-schwarz-straight-outta-cotton-3811206.jpg',
    B+'heavy-oversize-tee-black-schwarz-straight-outta-cotton-5157193.jpg',
  ],
  [B+'heavy-oversize-tee-white-weiss-straight-outta-cotton-7693918.jpg']: [
    B+'heavy-oversize-tee-white-weiss-straight-outta-cotton-8686573.png',
    B+'heavy-oversize-tee-white-weiss-straight-outta-cotton-6431689.png',
    B+'heavy-oversize-tee-white-weiss-straight-outta-cotton-5772899.png',
  ],
  [B+'heavy-oversize-tee-slate-grey-grau-straight-outta-cotton-2730163.jpg']: [
    B+'heavy-oversize-tee-slate-grey-grau-straight-outta-cotton-5641587.jpg',
    B+'heavy-oversize-tee-slate-grey-grau-straight-outta-cotton-3145325.jpg',
    B+'heavy-oversize-tee-slate-grey-grau-straight-outta-cotton-2175424.jpg',
  ],
  [B+'oversize-hoodie-black-straight-outta-cotton-1378031.jpg']: [
    B+'oversize-hoodie-black-straight-outta-cotton-7555403.jpg',
    B+'oversize-hoodie-black-straight-outta-cotton-6358282.jpg',
    B+'oversize-hoodie-black-straight-outta-cotton-1913748.jpg',
    B+'oversize-hoodie-black-straight-outta-cotton-2715094.jpg',
    B+'oversize-hoodie-black-straight-outta-cotton-8601036.jpg',
    B+'oversize-hoodie-black-straight-outta-cotton-2593938.jpg',
  ],
  [B+'oversize-hoodie-melange-grey-straight-outta-cotton-9099801.jpg']: [
    B+'oversize-hoodie-melange-grey-straight-outta-cotton-3516112.jpg',
    B+'oversize-hoodie-melange-grey-straight-outta-cotton-1602041.jpg',
    B+'oversize-hoodie-melange-grey-straight-outta-cotton-5562829.jpg',
    B+'oversize-hoodie-melange-grey-straight-outta-cotton-1246115.jpg',
  ],
  [B+'oversize-hoodie-off-white-straight-outta-cotton-8036891.png']: [
    B+'oversize-hoodie-off-white-straight-outta-cotton-8881073.png',
    B+'oversize-hoodie-off-white-straight-outta-cotton-2590504.png',
    B+'oversize-hoodie-off-white-straight-outta-cotton-6779967.png',
  ],
  [B+'full-zip-oversize-hoodie-black-schwarz-straight-outta-cotton-5485514.jpg']: [
    B+'full-zip-oversize-hoodie-black-schwarz-straight-outta-cotton-9722896.jpg',
    B+'full-zip-oversize-hoodie-black-schwarz-straight-outta-cotton-9007375.jpg',
    B+'full-zip-oversize-hoodie-black-schwarz-straight-outta-cotton-3710032.jpg',
    B+'full-zip-oversize-hoodie-black-schwarz-straight-outta-cotton-3549921.jpg',
    B+'full-zip-oversize-hoodie-black-schwarz-straight-outta-cotton-2041825.jpg',
  ],
  [B+'basic-jogger-black-straight-outta-cotton-3665742.jpg']: [
    B+'basic-jogger-black-straight-outta-cotton-6959443.jpg',
    B+'basic-jogger-black-straight-outta-cotton-9436177.jpg',
    B+'basic-jogger-black-straight-outta-cotton-9350009.jpg',
    B+'basic-jogger-black-straight-outta-cotton-4828873.jpg',
  ],
  [B+'puffer-jacket-black-straight-outta-cotton-2768746.jpg']: [
    B+'puffer-jacket-black-straight-outta-cotton-4608874.jpg',
    B+'puffer-jacket-black-straight-outta-cotton-8877379.jpg',
    B+'puffer-jacket-black-straight-outta-cotton-3589431.jpg',
    B+'puffer-jacket-black-straight-outta-cotton-7167188.jpg',
    B+'puffer-jacket-black-straight-outta-cotton-5938204.jpg',
    B+'puffer-jacket-black-straight-outta-cotton-3694349.jpg',
    B+'puffer-jacket-black-straight-outta-cotton-9259450.jpg',
    B+'puffer-jacket-black-straight-outta-cotton-7376019.jpg',
    B+'puffer-jacket-black-straight-outta-cotton-4414188.jpg',
    B+'puffer-jacket-black-straight-outta-cotton-1783123.jpg',
  ],
  [B+'puffer-jacket-off-white-straight-outta-cotton-1836776.jpg']: [
    B+'puffer-jacket-off-white-straight-outta-cotton-8158357.jpg',
  ],
};

export const actions: Actions = {
	review: async ({ request, params }) => {
		const id = Number(params.id);
		const fd = await request.formData();

		const author = (fd.get('author') as string)?.trim();
		const rating = Number(fd.get('rating'));
		const comment = (fd.get('comment') as string)?.trim();

		const errors: Record<string, string> = {};
		if (!author || author.length < 2) errors.author = 'Please enter your name.';
		if (!rating || rating < 1 || rating > 5) errors.rating = 'Please select a star rating.';
		if (!comment || comment.length < 10) errors.comment = 'Review must be at least 10 characters.';

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, values: { author, comment, rating } });
		}

		const { error: dbError } = await supabase
			.from('reviews')
			.insert({ product_id: id, author, rating, comment });

		if (dbError) return fail(500, { errors: { form: 'Something went wrong. Please try again.' } });

		return { success: true };
	}
};

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	if (!Number.isFinite(id)) error(404, 'Not found');

	const [{ data: product }, { data: reviews }] = await Promise.all([
		supabase.from('products').select('*').eq('id', id).single(),
		supabase
			.from('reviews')
			.select('*')
			.eq('product_id', id)
			.order('created_at', { ascending: false })
	]);

	if (!product) error(404, 'Product not found');

	const avgRating = reviews?.length
		? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
		: 0;

	const images = [product.image_url, ...(EXTRA_IMAGES[product.image_url] ?? [])];

	return { product, reviews: reviews ?? [], avgRating, images };
};
