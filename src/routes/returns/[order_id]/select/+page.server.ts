import type { PageServerLoad } from './$types';
import { supabase } from '$lib/supabase';
import { error } from '@sveltejs/kit';
import type { OrderItem } from '$lib/types';

export const load: PageServerLoad = async ({ params }) => {
	const orderId = Number(params.order_id);
	if (!Number.isFinite(orderId)) error(404, 'Not found');

	const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single();
	if (!order) error(404, 'Order not found');

	const orderItems = order.items as OrderItem[];
	const productIds = orderItems.map((i) => i.product_id);

	const { data: products } = await supabase
		.from('products')
		.select('id, image_url, sizes')
		.in('id', productIds);

	const productMap = Object.fromEntries((products ?? []).map((p) => [p.id, p]));

	const items = orderItems.map((item) => ({
		...item,
		image_url: productMap[item.product_id]?.image_url ?? '',
		available_sizes: (productMap[item.product_id]?.sizes ?? []) as string[]
	}));

	return { order, items };
};
