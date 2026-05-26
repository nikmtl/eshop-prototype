export interface Product {
	id: number;
	name: string;
	description: string;
	price: number;
	image_url: string;
	category: string;
	sizes: string[];
	stock: number;
}

export interface Review {
	id: number;
	product_id: number;
	author: string;
	rating: number;
	comment: string;
	created_at: string;
}

// Stored in orders.items jsonb array
export interface OrderItem {
	product_id: number;
	name: string;
	size: string;
	price: number;
	quantity: number;
}

export interface Order {
	id: number;
	created_at: string;
	items: OrderItem[];
	total: number;
	email: string;
	status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

// Stored in returns.items jsonb array
export interface ReturnItem {
	product_id: number;
	name: string;
	size: string;
	quantity: number;
	return_reason: string;
}

// Stored in returns.exchange_items jsonb array
export interface ExchangeItem {
	product_id: number;
	name: string;
	size: string;
	quantity: number;
}

export interface Return {
	id: number;
	order_id: number;
	created_at: string;
	items: ReturnItem[];
	status: 'pending' | 'approved' | 'shipped_back' | 'refunded';
	wants_exchange: boolean;
	exchange_items: ExchangeItem[];
	label_downloaded: boolean;
}
