<script lang="ts">
	let openIndex = $state<number | null>(null);

	const faqs = [
		{
			id: 'shipping',
			section: 'Orders & Shipping',
			items: [
				{
					q: 'How long does delivery take?',
					a: 'Standard delivery takes 3–5 business days. Express delivery (1–2 business days) is available at checkout for an additional fee.'
				},
				{
					q: 'Do you offer free shipping?',
					a: 'Yes — all orders over €100 ship free. Below that, we charge a flat €4.99 for standard delivery anywhere in the EU.'
				},
				{
					q: 'Can I track my order?',
					a: "Absolutely. Once your order ships you'll receive a confirmation email with a tracking link. You can also view your order status from your order confirmation page."
				},
				{
					q: 'Can I change or cancel my order?',
					a: "Orders can be amended or cancelled within 1 hour of being placed. After that, the order enters fulfilment and changes aren't possible. Contact our support chat immediately if you need to make a change."
				}
			]
		},
		{
			id: 'returns',
			section: 'Returns & Refunds',
			items: [
				{
					q: 'What is your return policy?',
					a: 'You have 30 days from the delivery date to return any unworn, unwashed item in its original packaging. Items marked as final sale are non-returnable.'
				},
				{
					q: 'How do I start a return?',
					a: "Head to your order confirmation page and click \"Start a return\". Select the items you'd like to return, choose a reason, and we'll generate a prepaid return label for you."
				},
				{
					q: 'When will I receive my refund?',
					a: 'Refunds are processed within 5–7 business days of us receiving the returned item. The money will be returned to your original payment method.'
				},
				{
					q: 'Do you offer exchanges?',
					a: "We don't do direct exchanges. The quickest way is to return the original item and place a new order — your refund will be processed as soon as we receive the return."
				}
			]
		},
		{
			id: 'payment',
			section: 'Payment',
			items: [
				{
					q: 'What payment methods do you accept?',
					a: 'We accept Visa, Mastercard, and American Express (credit & debit), Apple Pay, and 30-day invoice billing for verified business accounts.'
				},
				{
					q: 'Is my payment information secure?',
					a: 'Yes. All transactions are encrypted and processed securely. We never store your full card number — only a masked reference is kept for your records.'
				},
				{
					q: 'Are there any hidden fees or taxes?',
					a: 'None. Every price you see already includes VAT. The total shown at checkout is exactly what you pay — no surprises.'
				},
				{
					q: 'How does invoice payment work?',
					a: 'Invoice billing is available for verified business accounts. After your order is confirmed, an invoice is emailed to you with a 30-day payment term. Apply at checkout by selecting the Invoice option.'
				}
			]
		},
		{
			id: 'sizing',
			section: 'Products & Sizing',
			items: [
				{
					q: 'How do I find my size?',
					a: "Every product page includes a size guide — click \"Size guide\" next to the size selector. If you're between sizes, we recommend sizing up as our cuts tend to run slightly slim."
				},
				{
					q: 'How are your products made?',
					a: 'FORM. works with European manufacturers who meet our quality and ethical standards. Each product page lists the material composition and country of manufacture.'
				},
				{
					q: 'What does "One Size" mean?',
					a: '"One Size" items are designed to fit a wide range of body types — typically EU 36–42 / UK 8–14. Check the product description for exact measurements.'
				}
			]
		}
	];

	let flatIndex = 0;
	const indexed = faqs.map((section) => ({
		...section,
		items: section.items.map((item) => ({ ...item, index: flatIndex++ }))
	}));
</script>

<svelte:head>
	<title>FAQ — FORM.</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-6 py-16">
	<nav class="mb-10 flex items-center gap-2 text-xs text-gray-400">
		<a href="/" class="hover:text-gray-700">Home</a>
		<span>/</span>
		<span class="text-gray-600">FAQ</span>
	</nav>

	<h1 class="text-2xl font-semibold text-gray-900">Frequently asked questions</h1>
	<p class="mt-2 text-sm text-gray-500">
		Can't find your answer? Use the chat widget in the bottom right.
	</p>

	<div class="mt-10 space-y-12" data-demo="demo-faq">
		{#each indexed as { id, section, items }}
			<section {id}>
				<h2 class="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">{section}</h2>
				<div class="divide-y divide-gray-100 rounded-2xl border border-gray-100">
					{#each items as { q, a, index }}
						<div>
							<button
								onclick={() => (openIndex = openIndex === index ? null : index)}
								class="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-gray-900 transition-colors hover:text-gray-600"
								aria-expanded={openIndex === index}
							>
								<span>{q}</span>
								<svg
									class="h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 {openIndex === index ? 'rotate-45' : ''}"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
								</svg>
							</button>
							{#if openIndex === index}
								<div class="px-5 pb-4 text-sm leading-relaxed text-gray-500">{a}</div>
							{/if}
						</div>
					{/each}
				</div>
			</section>
		{/each}
	</div>
</div>
