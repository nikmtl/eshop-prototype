# Features

## Product Discovery

**Home page (`/`)** loads the top 4 highest-rated products and displays a category tab bar. The category tabs filter the product grid client-side — no additional server request.

**Search (`/search`)** accepts a free-text query and optional filters:
- Category (multi-select checkboxes)
- Price range (min/max)
- In-stock only toggle
- Sort by: name, price ascending/descending, or average rating

The server runs `ilike` queries against `products.name`, `products.description`, and `products.category`. Reviews are fetched in parallel and average ratings are computed server-side before rendering.

---

## Shopping Cart

Client-side only — state lives in `CartStore` and is not persisted across sessions.

- Adding the same product+size combination increments quantity rather than creating a duplicate line.
- A free shipping progress bar is shown in the cart based on the subtotal vs. a threshold.
- Cart state is serialised to a hidden field in the checkout form and deserialised server-side when creating an order.

---

## Checkout

Two checkout paths are available:

| Path | Fields required |
|------|----------------|
| Express | Email only |
| Standard | Email, name, address, city, postcode, country |

Both paths validate server-side and insert a single row into `orders`. The cart snapshot (items, prices, sizes) is stored as JSONB so the order is self-contained — changing or deleting a product later does not affect historical order records.

After a successful insert the user is redirected to `/order/[id]`.

---

## Order Tracking

The order page (`/order/[id]`) shows:

- An itemised order summary.
- A 4-stage delivery timeline (pending → processing → shipped → delivered) with the current `status` highlighted.
- A link to start a return.
- A one-time satisfaction survey (1–5 stars + optional comment). The survey widget is hidden once submitted — enforced by a UNIQUE constraint on `satisfaction_surveys.order_id`.

---

## Self-Service Returns

A 4-step wizard at `/returns/[order_id]/*`. State is kept in `ReturnFlowStore` across all steps; only the final step writes to the database.

```
Step 1 /select   User picks which items to return
Step 2 /reason   User picks a return reason per item
Step 3 /confirm  User optionally selects exchange sizes; submits return
Step 4 /label    User downloads/prints the shipping label
```

The return record stored in `returns` includes:
- Items being returned with reasons.
- Whether the customer wants an exchange and, if so, which sizes.
- A `label_downloaded` flag updated when the customer reaches step 4.

Return statuses: `pending` → `approved` → `shipped_back` → `refunded`.

---

## Product Reviews

On the product detail page, customers can submit a review with:
- Display name
- Star rating (1–5)
- Comment (minimum 10 characters)

All reviews are shown publicly with no purchase verification. Average rating and review count are computed on page load.

---

## Interactive Demo Tour

A 16-step overlay (`DemoStore` + `DemoOverlay` component) guides users through the UX features of the shop. Each step:
- Identifies a `data-demo` selector on the page to highlight.
- Names the UX principle being demonstrated.
- Explains the business rationale (e.g. "transparent returns reduce purchase hesitation").

The tour is the research instrument — it ensures research participants are exposed to and reflect on each UX pattern.

---

## FAQ & Chat

`/faq` is a static content page answering common customer questions. The `ChatWidget` component provides a simulated live-chat interface.

---

## Data Flow Summaries

### Checkout

```
Client CartStore
  → POST /checkout (serialised cart in hidden field)
  → server validates + inserts orders row
  → redirect /order/[id]
```

### Product page load

```
GET /products/[id]
  → parallel: SELECT products WHERE id=X
             SELECT reviews WHERE product_id=X
  → compute avgRating, reviewCount
  → render page
```

### Search

```
GET /search?q=...&category=...&sort=...
  → Supabase query: ilike + filters + order
  → parallel: fetch reviews
  → compute per-product avgRating
  → render results
```

### Return flow

```
GET /returns/[id]/select
  → load order + product metadata
  → returnFlow.init(...)

(client navigates: select → reason → confirm)

POST /returns/[id]/confirm
  → insert returns row
  → returnFlow.returnId = newId
  → redirect /returns/[id]/label
```
