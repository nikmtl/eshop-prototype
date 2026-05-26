# Database

The app uses a Supabase-hosted PostgreSQL database. Schema and seed files are in `supabase/`.

## Tables

![Database Schema](./schema.svg)

### `products`

Catalogue of fashion items available in the shop.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `bigint` | PK, auto-increment |
| `name` | `text` | NOT NULL |
| `description` | `text` | NOT NULL |
| `price` | `numeric(10,2)` | NOT NULL, ≥ 0 |
| `image_url` | `text` | NOT NULL, default `''` |
| `category` | `text` | NOT NULL |
| `sizes` | `text[]` | NOT NULL (e.g. `['XS','S','M','L','XL']`) |
| `stock` | `integer` | NOT NULL, ≥ 0, default `0` |

**Indexes:** `products_category_idx` on `category`

---

### `reviews`

Customer reviews and star ratings per product.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `bigint` | PK, auto-increment |
| `product_id` | `bigint` | FK → `products.id` ON DELETE CASCADE |
| `author` | `text` | NOT NULL |
| `rating` | `smallint` | NOT NULL, 1–5 |
| `comment` | `text` | NOT NULL |
| `created_at` | `timestamptz` | default `now()` |

**Indexes:** `reviews_product_id_idx` on `product_id`

---

### `orders`

Customer orders. Cart contents are stored as a JSONB snapshot so the order record is self-contained regardless of future product changes.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `bigint` | PK, auto-increment |
| `created_at` | `timestamptz` | default `now()` |
| `items` | `jsonb` | default `'[]'` |
| `total` | `numeric(10,2)` | NOT NULL, ≥ 0 |
| `email` | `text` | NOT NULL |
| `status` | `text` | one of: `pending`, `processing`, `shipped`, `delivered`, `cancelled` |

**`items` JSONB shape:**
```json
[
  {
    "product_id": 1,
    "name": "Classic Tee",
    "size": "M",
    "quantity": 2,
    "price": 29.99
  }
]
```

**Indexes:** `orders_email_idx` on `email`

---

### `returns`

Return requests linked to orders. Supports both plain returns and exchange requests.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `bigint` | PK, auto-increment |
| `order_id` | `bigint` | FK → `orders.id` ON DELETE CASCADE |
| `created_at` | `timestamptz` | default `now()` |
| `items` | `jsonb` | default `'[]'` |
| `status` | `text` | one of: `pending`, `approved`, `shipped_back`, `refunded` |
| `wants_exchange` | `boolean` | default `false` |
| `exchange_items` | `jsonb` | default `'[]'` |
| `label_downloaded` | `boolean` | default `false` |

**`items` JSONB shape:**
```json
[
  {
    "product_id": 1,
    "name": "Classic Tee",
    "size": "M",
    "quantity": 1,
    "return_reason": "wrong_size"
  }
]
```

**`exchange_items` JSONB shape:**
```json
[
  {
    "product_id": 1,
    "name": "Classic Tee",
    "size": "L",
    "quantity": 1
  }
]
```

**Indexes:** `returns_order_id_idx` on `order_id`

---

### `satisfaction_surveys`

Post-purchase satisfaction ratings, one per order (enforced by unique constraint on `order_id`).

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `bigint` | PK, auto-increment |
| `order_id` | `bigint` | FK → `orders.id` ON DELETE CASCADE, UNIQUE |
| `rating` | `smallint` | NOT NULL, 1–5 |
| `comment` | `text` | nullable |
| `created_at` | `timestamptz` | default `now()` |

**Indexes:** `satisfaction_surveys_order_id_idx` on `order_id`

---

## Seed Data

`supabase/seed.sql` populates `products` with ~12 fashion items from **Straight Outta Cotton**:

- **Tops / Shirts** (category: `Shirts`)
- **Hoodies** (category: `Hoodies`)
- **Bottoms** (category: `Bottoms`)
- **Jackets** (category: `Jackets`)

Sizes use either clothing sizes (`XS S M L XL`) or shoe sizes (`UK 7 UK 8 UK 9`).

## Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor to create tables and indexes.
3. Run `supabase/seed.sql` to populate initial product data.
4. Copy the project URL and publishable key to `.env`.
