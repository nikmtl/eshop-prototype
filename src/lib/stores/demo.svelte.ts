export type DemoStep = {
	step: number;
	aspect: string;
	color: string;
	title: string;
	description: string;
	route: string | null;
	matchesPath: (path: string) => boolean;
	selector: string;
	needsOrderId?: boolean;
	buildRoute?: (ctx: { orderId: string | null; productId: string | null }) => string | null;
};

export const DEMO_STEPS: DemoStep[] = [
	// ── 1. Search ──────────────────────────────────────────────────────────────
	{
		step: 1,
		aspect: 'Navigation & Usability',
		color: 'bg-blue-100 text-blue-700',
		title: 'Persistent search bar',
		description:
			'A sticky header with instant search lets customers find products from any page without backtracking. Low-friction navigation is a cornerstone of a satisfying shopping experience.',
		route: '/',
		matchesPath: (p) => p === '/',
		selector: 'demo-search'
	},
	// ── 2. Category nav ────────────────────────────────────────────────────────
	{
		step: 2,
		aspect: 'Navigation & Usability',
		color: 'bg-blue-100 text-blue-700',
		title: 'Category navigation',
		description:
			"Top-level category tabs let shoppers browse by type without needing a search query. Clear taxonomy reduces cognitive load and helps customers discover products they didn't know they wanted.",
		route: '/',
		matchesPath: (p) => p === '/',
		selector: 'demo-categories'
	},
	// ── 3. Environmental ───────────────────────────────────────────────────────
	{
		step: 3,
		aspect: 'Sustainability & Trust',
		color: 'bg-emerald-100 text-emerald-700',
		title: 'Environmental commitment',
		description:
			'Transparent sustainability messaging builds brand trust before the purchase. Customers increasingly factor environmental values into buying decisions — and a visible commitment reduces post-purchase guilt.',
		route: '/',
		matchesPath: (p) => p === '/',
		selector: 'demo-environmental'
	},
	// ── 4. Search filters ──────────────────────────────────────────────────────
	{
		step: 4,
		aspect: 'Navigation & Usability',
		color: 'bg-blue-100 text-blue-700',
		title: 'Search filters & sorting',
		description:
			'Shoppers narrow results by category, price range, in-stock status, and sort by relevance or rating. Good filtering directly reduces the frustration of wading through irrelevant results.',
		route: '/search?q=jacket',
		matchesPath: (p) => p.startsWith('/search'),
		selector: 'demo-filters'
	},
	// ── 5. Product info ────────────────────────────────────────────────────────
	{
		step: 5,
		aspect: 'Informational Clarity',
		color: 'bg-amber-100 text-amber-700',
		title: 'Detailed product information',
		description:
			'Full descriptions, materials, sizing charts, and stock status reduce the gap between expectation and reality. Product disappointment after delivery is the #1 cause of returns and negative reviews.',
		route: null,
		matchesPath: (p) => p.startsWith('/products/'),
		selector: 'demo-product-info',
		buildRoute: ({ productId }) => productId ? `/products/${productId}` : null
	},
	// ── 6. Reviews ────────────────────────────────────────────────────────────
	{
		step: 6,
		aspect: 'Customer Reviews',
		color: 'bg-yellow-100 text-yellow-700',
		title: 'Verified customer reviews',
		description:
			'Star ratings and written reviews from verified buyers build social proof. Customers who read reviews have higher post-purchase satisfaction because their expectations were grounded in real feedback.',
		route: null,
		matchesPath: (p) => p.startsWith('/products/'),
		selector: 'demo-reviews',
		buildRoute: ({ productId }) => productId ? `/products/${productId}` : null
	},
	// ── 7. Clear pricing ──────────────────────────────────────────────────────
	{
		step: 7,
		aspect: 'Clear Pricing',
		color: 'bg-green-100 text-green-700',
		title: 'All-in transparent pricing',
		description:
			'The price shown includes VAT — no surprise fees at checkout. Price-shock at the payment screen is a major driver of abandoned carts and post-purchase regret. What you see is what you pay.',
		route: null,
		matchesPath: (p) => p.startsWith('/products/'),
		selector: 'demo-price',
		buildRoute: ({ productId }) => productId ? `/products/${productId}` : null
	},
	// ── 8. Free shipping ──────────────────────────────────────────────────────
	{
		step: 8,
		aspect: 'Clear Pricing',
		color: 'bg-green-100 text-green-700',
		title: 'Free shipping threshold',
		description:
			'A live progress bar shows how close the customer is to free shipping. This incentive both increases average order value and gives customers a clear, satisfying goal to reach.',
		route: '/cart',
		matchesPath: (p) => p.startsWith('/cart'),
		selector: 'demo-free-shipping'
	},
	// ── 9. Express checkout ───────────────────────────────────────────────────
	{
		step: 9,
		aspect: 'Security Awareness',
		color: 'bg-red-100 text-red-700',
		title: 'Express checkout options',
		description:
			'One-tap payment options (Apple Pay, Google Pay, PayPal, Shop Pay) let returning customers skip manual card entry entirely. Fewer steps and trusted payment brands significantly reduce checkout abandonment.',
		route: '/checkout',
		matchesPath: (p) => p.startsWith('/checkout'),
		selector: 'demo-express'
	},
	// ── 10. Order summary ─────────────────────────────────────────────────────
	{
		step: 10,
		aspect: 'Informational Clarity',
		color: 'bg-amber-100 text-amber-700',
		title: 'Live order summary',
		description:
			'A persistent order summary beside the checkout form lets customers verify their items, quantities, and final total without leaving the page. Clarity at this stage prevents regret-driven cancellations.',
		route: '/checkout',
		matchesPath: (p) => p.startsWith('/checkout'),
		selector: 'demo-order-summary'
	},
	// ── 11. Security ──────────────────────────────────────────────────────────
	{
		step: 11,
		aspect: 'Security Awareness',
		color: 'bg-red-100 text-red-700',
		title: 'Secure payment indicators',
		description:
			'Visible encryption notices and card security messaging reduce checkout anxiety. Many abandonment events are driven by distrust, not price — reassurance at the payment step directly lifts conversion.',
		route: '/checkout',
		matchesPath: (p) => p.startsWith('/checkout'),
		selector: 'demo-security'
	},
	// ── 12. Post-order comms ──────────────────────────────────────────────────
	{
		step: 12,
		aspect: 'Post-Order Communication',
		color: 'bg-purple-100 text-purple-700',
		title: 'Order status & delivery timeline',
		description:
			'A step-by-step delivery progress tracker with estimated dates eliminates "where is my order?" anxiety — consistently the leading source of post-purchase dissatisfaction.',
		route: null,
		matchesPath: (p) => p.startsWith('/order/'),
		selector: 'demo-timeline',
		needsOrderId: true,
		buildRoute: ({ orderId }) => orderId ? `/order/${orderId}` : null
	},
	// ── 13. Order sidebar ────────────────────────────────────────────────────
	{
		step: 13,
		aspect: 'Post-Order Communication',
		color: 'bg-purple-100 text-purple-700',
		title: 'What happens next, returns & help',
		description:
			'The confirmation sidebar proactively answers the three questions every customer has after ordering: when does it arrive, how do I return it, and who do I contact? Answering these upfront prevents anxiety and reduces support load.',
		route: null,
		matchesPath: (p) => p.startsWith('/order/'),
		selector: 'demo-order-sidebar',
		needsOrderId: true,
		buildRoute: ({ orderId }) => orderId ? `/order/${orderId}` : null
	},
	// ── 14. Returns ───────────────────────────────────────────────────────────
	{
		step: 14,
		aspect: 'Return System',
		color: 'bg-orange-100 text-orange-700',
		title: 'Self-service return flow',
		description:
			'A guided step-by-step return process gives customers confidence before and after purchase. Research shows a clear, easy return policy is strongly correlated with repeat purchase intent.',
		route: null,
		matchesPath: (p) => p.startsWith('/returns/'),
		selector: 'demo-returns',
		needsOrderId: true,
		buildRoute: ({ orderId }) => orderId ? `/returns/${orderId}/select` : null
	},
	// ── 15. FAQ ───────────────────────────────────────────────────────────────
	{
		step: 15,
		aspect: 'Support & FAQ',
		color: 'bg-teal-100 text-teal-700',
		title: 'FAQ & live chat support',
		description:
			'A well-structured FAQ proactively answers common questions before they become support tickets. The live chat widget provides a safety net for edge cases — meeting customers where they are.',
		route: '/faq',
		matchesPath: (p) => p.startsWith('/faq'),
		selector: 'demo-faq'
	},
	// ── 16. Satisfaction survey ───────────────────────────────────────────────
	{
		step: 16,
		aspect: 'Satisfaction Measurement',
		color: 'bg-pink-100 text-pink-700',
		title: 'Post-purchase satisfaction survey',
		description:
			'A short star-rating survey on the order confirmation page captures real data while the experience is fresh. Closing this feedback loop shows customers their voice matters — and gives operators actionable insights.',
		route: null,
		matchesPath: (p) => p.startsWith('/order/'),
		selector: 'demo-survey',
		needsOrderId: true,
		buildRoute: ({ orderId }) => orderId ? `/order/${orderId}` : null
	}
];

class DemoStore {
	active = $state(false);
	currentIndex = $state(0);

	get step(): DemoStep {
		return DEMO_STEPS[this.currentIndex];
	}

	get total(): number {
		return DEMO_STEPS.length;
	}

	open() {
		this.active = true;
		this.currentIndex = 0;
	}

	close() {
		this.active = false;
	}

	next() {
		if (this.currentIndex < DEMO_STEPS.length - 1) {
			this.currentIndex++;
		}
	}

	prev() {
		if (this.currentIndex > 0) {
			this.currentIndex--;
		}
	}
}

export const demo = new DemoStore();
