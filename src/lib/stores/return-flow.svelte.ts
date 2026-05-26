export interface FlowItem {
	product_id: number;
	name: string;
	size: string;
	quantity: number;
	price: number;
	image_url: string;
	available_sizes: string[];
	isSelected: boolean;
	reason: string;
	wants_exchange: boolean;
	exchange_size: string;
}

type FlowItemInit = Omit<FlowItem, 'isSelected' | 'reason' | 'wants_exchange' | 'exchange_size'>;

class ReturnFlowStore {
	orderId = $state('');
	orderEmail = $state('');
	items = $state<FlowItem[]>([]);
	returnId = $state<number | null>(null);

	get selected(): FlowItem[] {
		return this.items.filter((i) => i.isSelected);
	}

	get hasSelection(): boolean {
		return this.items.some((i) => i.isSelected);
	}

	get reasonsComplete(): boolean {
		return this.selected.length > 0 && this.selected.every((i) => i.reason !== '');
	}

	init(orderId: string, email: string, items: FlowItemInit[]) {
		if (this.orderId === orderId && this.items.length > 0) return;
		this.orderId = orderId;
		this.orderEmail = email;
		this.items = items.map((i) => ({
			...i,
			isSelected: false,
			reason: '',
			wants_exchange: false,
			exchange_size: ''
		}));
		this.returnId = null;
	}

	toggle(product_id: number, size: string) {
		const item = this.items.find((i) => i.product_id === product_id && i.size === size);
		if (item) item.isSelected = !item.isSelected;
	}

	update(product_id: number, size: string, updates: Partial<FlowItem>) {
		const item = this.items.find((i) => i.product_id === product_id && i.size === size);
		if (item) Object.assign(item, updates);
	}
}

export const returnFlow = new ReturnFlowStore();
