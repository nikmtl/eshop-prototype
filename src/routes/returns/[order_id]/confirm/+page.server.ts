import type { Actions } from './$types';
import { supabase } from '$lib/supabase';
import { fail } from '@sveltejs/kit';
import type { ReturnItem, ExchangeItem } from '$lib/types';

export const actions: Actions = {
	default: async ({ params, request }) => {
		const orderId = Number(params.order_id);
		if (!Number.isFinite(orderId)) return fail(400, { error: 'Invalid order.' });

		const data = await request.formData();

		let payload: {
			items: Array<{
				product_id: number;
				name: string;
				size: string;
				quantity: number;
				price: number;
				reason: string;
				wants_exchange: boolean;
				exchange_size: string;
			}>;
		};

		try {
			payload = JSON.parse(String(data.get('payload') ?? '{}'));
		} catch {
			return fail(400, { error: 'Invalid payload.' });
		}

		if (!payload.items?.length) {
			return fail(400, { error: 'No items to return.' });
		}

		const wants_exchange = payload.items.some((i) => i.wants_exchange && i.exchange_size);

		const returnItems: ReturnItem[] = payload.items.map((i) => ({
			product_id: i.product_id,
			name: i.name,
			size: i.size,
			quantity: i.quantity,
			return_reason: i.reason
		}));

		const exchangeItems: ExchangeItem[] = payload.items
			.filter((i) => i.wants_exchange && i.exchange_size)
			.map((i) => ({
				product_id: i.product_id,
				name: i.name,
				size: i.exchange_size,
				quantity: i.quantity
			}));

		const { data: ret, error: insertError } = await supabase
			.from('returns')
			.insert({
				order_id: orderId,
				items: returnItems,
				status: 'pending',
				wants_exchange,
				exchange_items: exchangeItems,
				label_downloaded: false
			})
			.select('id')
			.single();

		if (insertError || !ret) {
			return fail(500, { error: 'Could not save your return. Please try again.' });
		}

		return { returnId: ret.id };
	}
};
