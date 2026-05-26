# Routes

SvelteKit file-based routing. Every directory under `src/routes/` maps to a URL path. `+page.server.ts` files run server-side (load functions and form actions). `+page.svelte` files are the rendered UI.

## Route Map

```
/                           Home — featured products + category browse
/products/[id]              Product detail — gallery, reviews, add to cart
/search                     Search results — filters, sorting
/cart                       Cart review + checkout gateway
/checkout                   Express and standard checkout forms
/order/[id]                 Order confirmation, tracking timeline, satisfaction survey
/returns/[order_id]/select  Return flow step 1 — select items to return
/returns/[order_id]/reason  Return flow step 2 — reason per item (client nav)
/returns/[order_id]/confirm Return flow step 3 — review + exchange selection
/returns/[order_id]/label   Return flow step 4 — shipping label download
/faq                        FAQ page + chat widget
```

---

## Route Details

### `/` — Home

**Files:** `+page.svelte`, `+page.server.ts`

**Load function:**
- Fetches the top 4 products by average rating (joins `reviews` to compute avg).
- Provides category counts for the nav tabs.

**UI:**
- Hero section with featured products.
- Category tab navigation (Home, Shirts, Hoodies, Bottoms, Jackets).
- When a category tab is active, filters product grid client-side.

---

### `/products/[id]` — Product Detail

**Files:** `+page.svelte`, `+page.server.ts`

**Load function:**
- Fetches product by ID from `products`.
- Fetches all reviews for the product from `reviews`.
- Computes average rating and review count.

**Form action (`default`):**
- Validates and inserts a new review into `reviews`.
- Required fields: author name, rating (1–5), comment (min 10 chars).

**UI:**
- Product image gallery.
- Size selector (driven by `product.sizes` array).
- Add to cart button (writes to the `CartStore`).
- Review list with star ratings.
- Review submission form.

---

### `/search` — Search

**Files:** `+page.svelte`, `+page.server.ts`

**Query params:** `q`, `category`, `min_price`, `max_price`, `in_stock`, `sort`

**Load function:**
- Builds a Supabase query with `ilike` on name/description/category.
- Applies category, price range, and stock filters.
- Orders by: `name`, `price_asc`, `price_desc`, `rating` (computed after fetch).
- Fetches reviews in parallel to compute per-product average ratings.

**UI:**
- Search bar (pre-filled from `q` param).
- Filter sidebar: category checkboxes, price range inputs, in-stock toggle.
- Sort dropdown.
- Product grid with rating badges.

---

### `/cart` — Cart

**Files:** `+page.svelte` only (no server file)

**State:** Reads directly from the `CartStore` (client-side only).

**UI:**
- Line items with quantity controls (increment, decrement, remove).
- Free shipping progress bar.
- Order subtotal.
- "Proceed to checkout" link → `/checkout`.

---

### `/checkout` — Checkout

**Files:** `+page.svelte`, `+page.server.ts`

**Form actions:**

| Action | Fields | Description |
|--------|--------|-------------|
| `express` | `email` | Minimal checkout — email only |
| `checkout` | `email`, `name`, `address`, `city`, `postcode`, `country` | Full shipping address |

Both actions:
1. Validate required fields and email format.
2. Deserialise cart items from the hidden form field.
3. Validate total > 0 and cart is non-empty.
4. Insert a row into `orders`.
5. Redirect to `/order/[id]`.

**UI:**
- Two tabs: Express Checkout / Standard Checkout.
- Cart summary sidebar.
- Security trust badges.

---

### `/order/[id]` — Order Confirmation & Tracking

**Files:** `+page.svelte`, `+page.server.ts`

**Load function:**
- Fetches order by ID.
- Fetches existing satisfaction survey for this order (if any).

**Form action (`survey`):**
- Validates rating (1–5) and optional comment.
- Inserts into `satisfaction_surveys` (one per order, enforced by DB unique constraint).

**UI:**
- Order summary (items, total, email).
- Delivery status timeline (pending → processing → shipped → delivered).
- "Start a return" link → `/returns/[id]/select`.
- One-time satisfaction survey widget (hidden once submitted).

---

### `/returns/[order_id]/*` — Return Flow

Four-step self-service return wizard. State is managed client-side in `ReturnFlowStore`.

#### `/returns/[order_id]/select`
**Files:** `+page.svelte`, `+page.server.ts`

Load function fetches order items and enriches them with current product metadata (available sizes for exchange). Initialises `ReturnFlowStore`.

#### `/returns/[order_id]/reason`
**Files:** `+page.svelte` only

Client-side navigation. User selects a reason for each selected item (e.g. wrong size, defective, changed mind). Reads/writes `ReturnFlowStore`.

#### `/returns/[order_id]/confirm`
**Files:** `+page.svelte`, `+page.server.ts`

Shows return summary. User optionally selects exchange sizes. Form action inserts a `returns` row and stores the new return ID in `ReturnFlowStore`.

#### `/returns/[order_id]/label`
**Files:** `+page.svelte`, `+page.server.ts`

Load function fetches the return record. Displays a simulated shipping label for the customer to download/print.

---

### `/faq` — FAQ

**Files:** `+page.svelte` only

Static content page. Includes the `ChatWidget` component.

---

## Layout

**`+layout.svelte`** wraps all routes and provides:

- Sticky header with logo, search bar (`SearchBar`), and cart icon.
- Category navigation tabs (hidden on `/returns/*`, `/order/*`, `/checkout`, `/cart`).
- `CartSlideover` panel (conditionally rendered).
- `DemoOverlay` component (global guided tour).
- Footer.

**`layout.css`** is imported in `+layout.svelte` and applies global styles including print and scrollbar rules.
