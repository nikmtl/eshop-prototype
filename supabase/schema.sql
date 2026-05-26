-- ─────────────────────────────────────────────────────────────────────────────
-- Products
-- items.sizes: text[] — e.g. ['XS','S','M','L','XL'] or ['UK 7','UK 8','UK 9']
--              Use ['One Size'] for accessories with no meaningful sizing.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists products (
  id          bigint primary key generated always as identity,
  name        text          not null,
  description text          not null,
  price       numeric(10,2) not null check (price >= 0),
  image_url   text          not null default '',
  category    text          not null,
  sizes       text[]        not null default '{}',
  stock       integer       not null default 0 check (stock >= 0)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Reviews
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists reviews (
  id          bigint primary key generated always as identity,
  product_id  bigint      not null references products(id) on delete cascade,
  author      text        not null,
  rating      smallint    not null check (rating between 1 and 5),
  comment     text        not null,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Orders
-- items shape: [{product_id, name, size, quantity, price}]
--   size mirrors the value selected at purchase time from products.sizes.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists orders (
  id          bigint primary key generated always as identity,
  created_at  timestamptz   not null default now(),
  items       jsonb         not null default '[]',
  total       numeric(10,2) not null check (total >= 0),
  email       text          not null,
  status      text          not null default 'pending'
               check (status in ('pending','processing','shipped','delivered','cancelled'))
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Returns
-- items shape:         [{product_id, name, size, quantity, return_reason}]
-- exchange_items shape: [{product_id, name, size, quantity}]
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists returns (
  id               bigint primary key generated always as identity,
  order_id         bigint      not null references orders(id) on delete cascade,
  created_at       timestamptz not null default now(),
  items            jsonb       not null default '[]',
  status           text        not null default 'pending'
                    check (status in ('pending','approved','shipped_back','refunded')),
  wants_exchange   boolean     not null default false,
  exchange_items   jsonb       not null default '[]',
  label_downloaded boolean     not null default false
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Satisfaction surveys (one per order)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists satisfaction_surveys (
  id         bigint primary key generated always as identity,
  order_id   bigint      not null references orders(id) on delete cascade,
  rating     smallint    not null check (rating between 1 and 5),
  comment    text,
  created_at timestamptz not null default now(),
  constraint satisfaction_surveys_order_id_unique unique (order_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────────────────────────────────────
create index if not exists reviews_product_id_idx              on reviews(product_id);
create index if not exists orders_email_idx                    on orders(email);
create index if not exists products_category_idx               on products(category);
create index if not exists returns_order_id_idx                on returns(order_id);
create index if not exists satisfaction_surveys_order_id_idx   on satisfaction_surveys(order_id);
