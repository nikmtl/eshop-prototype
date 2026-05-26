import type { Product } from '$lib/types';

export interface CartItem {
	product: Product;
	size: string;
	quantity: number;
}

class CartStore {
	items = $state<CartItem[]>([]);
	isOpen = $state(false);

	get count() {
		return this.items.reduce((s, i) => s + i.quantity, 0);
	}

	get subtotal() {
		return this.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
	}

	add(product: Product, size: string, qty = 1) {
		const existing = this.items.find(
			(i) => i.product.id === product.id && i.size === size
		);
		if (existing) {
			existing.quantity += qty;
		} else {
			this.items.push({ product, size, quantity: qty });
		}
		this.isOpen = true;
	}

	open() { this.isOpen = true; }
	close() { this.isOpen = false; }
	toggle() { this.isOpen = !this.isOpen; }

	remove(productId: number, size: string) {
		this.items = this.items.filter(
			(i) => !(i.product.id === productId && i.size === size)
		);
	}

	updateQuantity(productId: number, size: string, qty: number) {
		if (qty <= 0) {
			this.remove(productId, size);
			return;
		}
		const item = this.items.find(
			(i) => i.product.id === productId && i.size === size
		);
		if (item) item.quantity = qty;
	}

	clear() {
		this.items = [];
	}
}

export const cart = new CartStore();
