import type { PageServerLoad, Actions } from './$types';
import { supabase } from '$lib/supabase';
import { error, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	if (!Number.isFinite(id)) error(404, 'Not found');

	const [{ data: order }, { data: survey }] = await Promise.all([
		supabase.from('orders').select('*').eq('id', id).single(),
		supabase.from('satisfaction_surveys').select('rating, comment, created_at').eq('order_id', id).maybeSingle()
	]);

	if (!order) error(404, 'Order not found');

	return { order, survey };
};

export const actions: Actions = {
	survey: async ({ params, request }) => {
		const id = Number(params.id);
		if (!Number.isFinite(id)) return fail(400, { surveyError: 'Invalid order.' });

		const data = await request.formData();
		const rating = Number(data.get('rating'));
		const comment = String(data.get('comment') ?? '').trim();

		if (!rating || rating < 1 || rating > 5) {
			return fail(400, { surveyError: 'Please select a rating before submitting.' });
		}

		const { data: existing } = await supabase
			.from('satisfaction_surveys')
			.select('id')
			.eq('order_id', id)
			.maybeSingle();

		if (existing) {
			return fail(409, { surveyError: 'You have already submitted feedback for this order.' });
		}

		const { error: insertError } = await supabase.from('satisfaction_surveys').insert({
			order_id: id,
			rating,
			comment: comment || null
		});

		if (insertError) {
			return fail(500, { surveyError: 'Could not save your feedback. Please try again.' });
		}

		return { surveySuccess: true };
	}
};
