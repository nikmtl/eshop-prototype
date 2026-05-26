# State Management

Client-side state uses Svelte 5 runes (`$state`, `$derived`). Each store is a class instantiated as a module-level singleton and exported for use across components and pages.

Store files live in `src/lib/stores/`.

---

## `CartStore` — `cart.svelte.ts`

Manages the shopping cart. Not persisted to localStorage or the database — resets on page refresh.

### State

```ts
items: CartItem[]   // current line items
isOpen: boolean     // cart slideover visibility
```

### Derived

```ts
count: number       // total quantity across all items
subtotal: number    // sum of (price × quantity)
```

### Methods

| Method | Description |
|--------|-------------|
| `add(product, size, qty)` | Adds an item; increments quantity if product+size already in cart |
| `remove(productId, size)` | Removes a specific product+size combination |
| `updateQuantity(productId, size, qty)` | Sets quantity; removes item if qty ≤ 0 |
| `clear()` | Empties the cart |
| `open()` / `close()` / `toggle()` | Controls the slideover panel visibility |

### `CartItem` interface

```ts
interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}
```

### Usage

```ts
import { cart } from '$lib/stores/cart.svelte';

cart.add(product, 'M', 1);
cart.open();
console.log(cart.count, cart.subtotal);
```

---

## `DemoStore` — `demo.svelte.ts`

Manages the 16-step guided tour overlay. Each step highlights a specific UX feature and explains the underlying principle.

### State

```ts
active: boolean       // whether the overlay is visible
currentIndex: number  // current step (0-based)
```

### Methods

| Method | Description |
|--------|-------------|
| `start()` | Opens the overlay and resets to step 0 |
| `next()` | Advances to the next step |
| `prev()` | Goes back one step |
| `goTo(index)` | Jumps to a specific step |
| `stop()` | Hides the overlay |

### `DemoStep` interface

```ts
interface DemoStep {
  aspect: string;        // category label (e.g. "Trust & Safety")
  color: string;         // Tailwind color class
  title: string;
  description: string;
  route: string;         // target route for this step
  selector: string;      // data-demo attribute to highlight
}
```

### Tour Steps (16 total)

| # | Title | Aspect |
|---|-------|--------|
| 1 | Search bar | Navigation |
| 2 | Category navigation | Navigation |
| 3 | Environmental messaging | Sustainability |
| 4 | Search filters & sorting | Discovery |
| 5 | Product information | Transparency |
| 6 | Reviews & ratings | Social Proof |
| 7 | Transparent pricing | Trust |
| 8 | Free shipping threshold | Incentive |
| 9 | Express checkout | Conversion |
| 10 | Order summary | Clarity |
| 11 | Security indicators | Trust & Safety |
| 12 | Post-order timeline | Expectations |
| 13 | Order sidebar | Support |
| 14 | Self-service returns | Confidence |
| 15 | FAQ & chat | Support |
| 16 | Satisfaction survey | Research |

---

## `ReturnFlowStore` — `return-flow.svelte.ts`

Manages state across the multi-step return wizard (`/returns/[order_id]/*`). Persists across the four route navigations without hitting the server between steps.

### State

```ts
orderId: string
orderEmail: string
items: FlowItem[]
returnId: number | null   // set after DB insert on /confirm
```

### Derived

```ts
selected: FlowItem[]       // items where isSelected === true
hasSelection: boolean
reasonsComplete: boolean   // all selected items have a reason set
```

### `FlowItem` interface

```ts
interface FlowItem {
  product_id: number;
  name: string;
  size: string;
  quantity: number;
  price: number;
  image_url: string;
  available_sizes: string[];  // for exchange size picker
  isSelected: boolean;
  reason: string;
  wants_exchange: boolean;
  exchange_size: string;
}
```

### Methods

| Method | Description |
|--------|-------------|
| `init(orderId, email, items)` | Initialises store from order data; idempotent (no-op if orderId matches) |
| `toggle(product_id, size)` | Toggles `isSelected` for an item |
| `update(product_id, size, updates)` | Partial update — sets reason, exchange preference, or exchange size |

### Usage flow

```
/select  → returnFlow.init(orderId, email, items)
/select  → returnFlow.toggle(product_id, size)          // user checks item
/reason  → returnFlow.update(product_id, size, { reason }) // user picks reason
/confirm → reads returnFlow.selected to build DB payload
/confirm → form action → sets returnFlow.returnId
/label   → reads returnFlow.returnId to load return record
```
