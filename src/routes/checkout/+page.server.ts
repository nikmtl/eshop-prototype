import type { Actions } from './$types';
import { supabase } from '$lib/supabase';
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
	express: async ({ request }) => {
		const data = await request.formData();
		const email = String(data.get('email') ?? '').trim();
		const itemsRaw = String(data.get('items') ?? '[]');
		const totalRaw = String(data.get('total') ?? '0');

		if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return fail(400, { expressError: 'Please enter a valid email address.' });
		}

		let items: unknown;
		try { items = JSON.parse(itemsRaw); } catch {
			return fail(400, { expressError: 'Invalid cart data.' });
		}
		if (!Array.isArray(items) || items.length === 0) {
			return fail(400, { expressError: 'Your cart is empty.' });
		}

		const total = parseFloat(totalRaw);
		if (!isFinite(total) || total <= 0) {
			return fail(400, { expressError: 'Invalid order total.' });
		}

		const { data: order, error } = await supabase
			.from('orders')
			.insert({ email, items, total, status: 'pending' })
			.select('id')
			.single();

		if (error || !order) return fail(500, { expressError: 'Could not place your order. Please try again.' });

		return { success: true, orderId: order.id, email };
	},

	checkout: async ({ request }) => {
		const data = await request.formData();

		const email = String(data.get('email') ?? '').trim();
		const name = String(data.get('name') ?? '').trim();
		const address = String(data.get('address') ?? '').trim();
		const city = String(data.get('city') ?? '').trim();
		const postcode = String(data.get('postcode') ?? '').trim();
		const country = String(data.get('country') ?? '').trim();
		const itemsRaw = String(data.get('items') ?? '[]');
		const totalRaw = String(data.get('total') ?? '0');

		if (!email || !name || !address || !city || !postcode || !country) {
			return fail(400, { error: 'Please fill in all required fields.' });
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return fail(400, { error: 'Please enter a valid email address.' });
		}

		let items: unknown;
		try {
			items = JSON.parse(itemsRaw);
		} catch {
			return fail(400, { error: 'Invalid cart data. Please return to your cart.' });
		}

		if (!Array.isArray(items) || items.length === 0) {
			return fail(400, { error: 'Your cart is empty.' });
		}

		const total = parseFloat(totalRaw);
		if (!isFinite(total) || total <= 0) {
			return fail(400, { error: 'Invalid order total.' });
		}

		const { data: order, error } = await supabase
			.from('orders')
			.insert({ email, items, total, status: 'pending' })
			.select('id')
			.single();

		if (error || !order) {
			return fail(500, { error: 'Could not place your order. Please try again.' });
		}

		return { success: true, orderId: order.id, email };
	}
};
