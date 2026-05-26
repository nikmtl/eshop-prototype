import type { PageServerLoad } from './$types';
import { supabase } from '$lib/supabase';
import { error } from '@sveltejs/kit';
import type { ReturnItem } from '$lib/types';

export const load: PageServerLoad = async ({ url, params }) => {
	const orderId = Number(params.order_id);
	if (!Number.isFinite(orderId)) error(404, 'Not found');

	const rid = Number(url.searchParams.get('rid'));

	let returnData;
	if (rid && Number.isFinite(rid)) {
		const { data } = await supabase.from('returns').select('*').eq('id', rid).single();
		returnData = data;
	} else {
		const { data } = await supabase
			.from('returns')
			.select('*')
			.eq('order_id', orderId)
			.order('created_at', { ascending: false })
			.limit(1)
			.maybeSingle();
		returnData = data;
	}

	if (!returnData) error(404, 'Return not found');

	const { data: order } = await supabase
		.from('orders')
		.select('id, email, created_at')
		.eq('id', orderId)
		.single();

	if (!order) error(404, 'Order not found');

	const items = returnData.items as ReturnItem[];

	return { ret: returnData, order, items };
};
